import os
from openai import OpenAI
from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import logging
import json
import time
import re
from flask_cors import CORS
from datetime import datetime
from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)  # For password hashing

# --- Configuration & Setup ---
# Point to the correct directories for static files and template
load_dotenv()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
)
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

# --- Constants ---
MAX_RETRIES = 3
HINT_GENERATION_RETRIES = 2
GENERATION_TEMPERATURE = 0.7
HINT_TEMPERATURE = 0.7
OPENAI_MODEL_NAME = "gpt-4o-mini"
DB_NAME = "enigma_progress.db"
VALID_DOMAINS = ["Frontend", "Backend", "Database", "AI Engineering"]
VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"]
HINT_REQUEST_THRESHOLD = 3

# --- Database Configuration ---
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# --- AI Setup (OpenAI) ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ai_client = None
if not OPENAI_API_KEY:
    logging.error("CRITICAL: OPENAI_API_KEY not found in environment variables.")
else:
    try:
        ai_client = OpenAI(api_key=OPENAI_API_KEY)
        logging.info(
            f"OpenAI client configured successfully for model: {OPENAI_MODEL_NAME}"
        )
    except NameError as ne:
        logging.exception(
            f"CRITICAL: NameError configuring OpenAI client - 'OpenAI' class likely not imported. Error: {ne}"
        )
    except Exception as e:
        logging.exception(
            f"CRITICAL: Error configuring OpenAI client with model {OPENAI_MODEL_NAME}"
        )


# --- Database Models ---
class Player(db.Model):
    __tablename__ = "Players"
    player_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    terminal_access_level = db.Column(db.String(50), nullable=True, default="unit734")

    progress = db.relationship(
        "PlayerProgress", backref="player", lazy=True, cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "player_id": self.player_id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "terminal_access_level": self.terminal_access_level,
        }


class Puzzle(db.Model):
    __tablename__ = "Puzzles"
    puzzle_id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(50), nullable=False, index=True)
    difficulty = db.Column(db.String(50), nullable=False, index=True)
    puzzle_description = db.Column(db.Text, nullable=False)
    validation_criteria = db.Column(db.Text, nullable=False)
    is_ai_generated = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    progress_entries = db.relationship(
        "PlayerProgress", backref="puzzle", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "puzzle_id": self.puzzle_id,
            "domain": self.domain,
            "difficulty": self.difficulty,
            "puzzle_description": self.puzzle_description,
            "is_ai_generated": self.is_ai_generated,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PlayerProgress(db.Model):
    __tablename__ = "PlayerProgress"
    progress_id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(
        db.Integer, db.ForeignKey("Players.player_id"), nullable=False, index=True
    )
    puzzle_id = db.Column(
        db.Integer, db.ForeignKey("Puzzles.puzzle_id"), nullable=False, index=True
    )
    status = db.Column(db.String(20), nullable=False, default="attempted")
    attempts = db.Column(db.Integer, default=0)
    last_attempted_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    solved_at = db.Column(db.DateTime, nullable=True)
    hint_text = db.Column(db.Text, nullable=True)
    hint_requested_at = db.Column(db.DateTime, nullable=True)
    __table_args__ = (
        db.UniqueConstraint("player_id", "puzzle_id", name="_player_puzzle_uc"),
    )

    def to_dict(self):
        return {
            "progress_id": self.progress_id,
            "player_id": self.player_id,
            "puzzle_id": self.puzzle_id,
            "status": self.status,
            "attempts": self.attempts,
            "last_attempted_at": (
                self.last_attempted_at.isoformat() if self.last_attempted_at else None
            ),
            "solved_at": self.solved_at.isoformat() if self.solved_at else None,
            "hint_available": bool(self.hint_text),
        }


# --- Helper Functions ---


# Parses OpenAI response content, extracting JSON from markdown or plain text
def parse_openai_response_content(response_content: str, context="puzzle"):
    try:
        cleaned_text = response_content.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[len("```json") :].strip()
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[len("```") :].strip()
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[: -len("```")].strip()
        return json.loads(cleaned_text)
    except json.JSONDecodeError as e:
        logging.warning(
            f"JSONDecodeError parsing OpenAI {context} response content: {e}. Text: '{response_content[:300]}...'"
        )
        return None
    except Exception as e:
        logging.exception(
            f"Unexpected error parsing OpenAI {context} response content: {e}"
        )
        return None


# Validates user answers against structured validation criteria
def validate_structured_criteria(criteria_obj, user_answer):
    validation_type = criteria_obj.get("type", "").lower()
    expected_value = criteria_obj.get("expected")
    keywords = criteria_obj.get("keywords")
    correct_option = criteria_obj.get("correct_option")
    if validation_type == "exact_match" and expected_value is not None:
        if user_answer.strip() == expected_value:
            return True, f"Correct! Answer matched '{expected_value}' exactly."
        return False, f"Incorrect. Expected exact match: '{expected_value}'."
    elif validation_type == "multiple_choice" and correct_option is not None:
        if user_answer.strip().upper().rstrip(")") == correct_option.upper().rstrip(
            ")"
        ):
            return True, f"Correct! Option {correct_option} was the right answer."
        return False, "Incorrect. That's not the right option."
    elif validation_type == "keyword_match" and keywords and isinstance(keywords, list):
        missing = [kw for kw in keywords if kw.lower() not in user_answer.lower()]
        if not missing:
            return (
                True,
                f"Correct! Answer included required keywords: {', '.join(keywords)}.",
            )
        return False, f"Incorrect. Answer was missing keywords: {', '.join(missing)}."
    logging.warning(
        f"Unsupported structured validation: {validation_type} or malformed: {criteria_obj}"
    )
    return None, "Unsupported structured validation criteria."


# Validates user answers against legacy (text-based) validation criteria
def validate_legacy_criteria(criteria_text, user_answer):
    mc_match = re.search(
        r"the correct option is\s+([A-D])\)?", criteria_text, re.IGNORECASE
    )
    if mc_match:
        correct_option = mc_match.group(1).upper()
        if user_answer.strip().upper().rstrip(")") == correct_option:
            return True, f"Correct! Option {correct_option} was the right answer."
        return False, "Incorrect. That's not the right option."
    exact_match = re.search(
        r"must be exactly\s+[\"'](.*?)[\"']", criteria_text, re.IGNORECASE | re.DOTALL
    )
    if exact_match:
        expected = exact_match.group(1)
        if user_answer.strip() == expected:
            return True, "Correct! Exact match found."
        return False, f"Incorrect. Expected exact match: '{expected}'."
    logging.warning(
        f"No specific legacy validation pattern matched: '{criteria_text[:100]}...'"
    )
    return False, "Could not determine validation method from criteria text."


# Restructures code puzzle descriptions to separate task, skeleton, and examples
def restructure_code_puzzle_description_if_needed(description: str) -> str:
    placeholder_patterns = [
        r"# Your code here",
        r"// Your code here",
        r"/\* Your code here \*/",
        r"# Implement .* here",
    ]
    code_block_regex = r"```(?:[a-zA-Z0-9_.-]*\n)?([\s\S]*?)\n```"
    all_code_in_description = "".join(re.findall(code_block_regex, description))
    has_placeholder = any(
        re.search(pattern, all_code_in_description, re.IGNORECASE)
        for pattern in placeholder_patterns
    )
    elements_for_keyword_check = re.split(r"(```[\s\S]*?```)", description)
    text_segments_for_keyword_check = [
        el for el in elements_for_keyword_check if not el.startswith("```")
    ]
    has_example_usage_keyword = any(
        re.search(
            r"\n###?\s*(Example Usage|Examples?|Test Cases?)\s*:",
            segment,
            re.IGNORECASE | re.MULTILINE,
        )
        for segment in text_segments_for_keyword_check
    ) or any(
        re.search(r"Example Usage:", segment, re.IGNORECASE | re.MULTILINE)
        for segment in text_segments_for_keyword_check
    )
    if not has_placeholder:
        logging.debug("No placeholder found, not restructuring.")
        return description
    if not has_example_usage_keyword:
        logging.debug(
            "No 'Example Usage' keyword found, not restructuring complex cases."
        )
        return description  # Keep original if no clear example heading
    logging.info(
        "Potential candidate for restructuring based on placeholder and 'Example Usage' keyword."
    )
    split_pattern = r"(```([a-zA-Z0-9_.-]*)\n[\s\S]*?\n```)"
    elements = re.split(split_pattern, description)
    main_task_description_parts, main_code_skeleton_block, example_parts = [], None, []
    found_main_skeleton, found_example_heading = False, False
    idx = 0
    while idx < len(elements):
        element = elements[idx]
        if not element:
            idx += 1
            continue
        is_code_block_match = (
            element.startswith("```")
            and element.endswith("```")
            and (idx + 1 < len(elements))
        )
        if not found_main_skeleton:
            if is_code_block_match and any(
                re.search(pattern, element, re.IGNORECASE)
                for pattern in placeholder_patterns
            ):
                main_code_skeleton_block, found_main_skeleton = element, True
                idx += 2
            else:
                main_task_description_parts.append(element)
        else:
            if not is_code_block_match and re.search(
                r"###?\s*(Example Usage|Examples?|Test Cases?)\s*:",
                element,
                re.IGNORECASE | re.MULTILINE,
            ):
                found_example_heading = True
                standardized_heading = "\n### Example Usage:\n"
                cleaned_element_text = re.sub(
                    r"###?\s*(Example Usage|Examples?|Test Cases?)\s*:",
                    "",
                    element.strip(),
                    flags=re.IGNORECASE,
                ).strip()
                example_parts.append(standardized_heading)
                if cleaned_element_text:
                    example_parts.append(cleaned_element_text + "\n")
            elif found_example_heading:
                example_parts.append(element)
                idx += 2 if is_code_block_match else 0
            elif is_code_block_match:
                if not found_example_heading:
                    example_parts.append("\n### Example Usage:\n")
                    found_example_heading = True
                example_parts.append(element)
                idx += 2
            else:
                # Heuristic: if it's text followed by a code block, assume it's part of examples
                if (
                    idx + 1 < len(elements) and elements[idx + 1].startswith("```")
                ) or (
                    idx + 3 < len(elements) and elements[idx + 3].startswith("```")
                ):  # Check further ahead for code blocks
                    if not found_example_heading:
                        example_parts.append("\n### Example Usage:\n")
                        found_example_heading = True
                    example_parts.append(element)
                else:  # Otherwise, probably still part of the main description
                    main_task_description_parts.append(element)
        idx += 1
    if not main_code_skeleton_block:
        logging.debug("Main32 skeleton not identified, returning original.")
        return description
    final_desc = (
        "".join(main_task_description_parts).strip()
        + "\n\n"
        + main_code_skeleton_block.strip()
    )
    if example_parts:
        final_desc += "\n" + "".join(example_parts).strip()
    if len(final_desc) > len(description) * 0.8 or found_example_heading:
        logging.info("Puzzle description restructured.")
        return final_desc.strip()
    logging.info("Restructuring not significant or failed, returning original.")
    return description


# Generates a prompt for OpenAI to create a puzzle based on domain and difficulty
def get_puzzle_generation_prompt(domain, difficulty):
    common_instructions = f"""
    **Output Format (Strictly Adhere):**
    Return ONLY a single, valid JSON object (no ```json markdown tags around the final JSON object itself) with these exact keys:
    - "puzzle_description": (string) The concise, well-formatted, and novel puzzle. Use Markdown for all text formatting (bold, italics, lists, code blocks). Ensure any emphasis like **bold text** is correctly and consistently applied using Markdown.
    - "domain": (string) '{domain}'.
    - "difficulty": (string) '{difficulty}'.
    - "validation_criteria": (string) EITHER a JSON string representing structured criteria OR clear free-text criteria.

    **Validation Criteria (Crucial):**
    Provide clear, specific validation criteria.
    * **Preference for Structured Criteria:** Whenever possible, return `validation_criteria` as a JSON **string**. This JSON string should contain an object with a `type` field and other relevant fields.
        * Examples:
            * Multiple Choice: `{{"type": "multiple_choice", "correct_option": "C", "options": ["Option A text", "Option B text", "Option C text", "Option D text"]}}`
            * Exact Match: `{{"type": "exact_match", "expected": "The precise expected string"}}`
            * Keyword Match: `{{"type": "keyword_match", "keywords": ["keyword1", "concept_A"], "match_all": true}}`
            * Code Check: `{{"type": "code_contains", "substrings": ["specific_function_call("], "must_not_contain": ["forbidden_pattern"]}}`
    * **Free-Text Criteria (Fallback):** If structured criteria are not suitable, provide clear, actionable free-text criteria.

    **General Puzzle Requirements:**
    * **Novelty & Variety:** Generate a puzzle that is distinct and avoids common, overused examples.
    * **Conciseness:** The puzzle description must be brief and to the point. The core task should be immediately understandable.
    * **Clarity:** The task must be unambiguous.
    * **Formatting (VERY IMPORTANT for Readability):**
        * Use Markdown for ALL text formatting: lists, bold (**text**), italics (*text*), headings (#, ##), etc.
        * Format ALL code (examples, snippets, function signatures to be completed) with Markdown code fences, specifying the language (e.g., ```python, ```javascript, ```sql, ```html).
        * **For Code Completion Puzzles:**
            1.  Start with a clear textual description of the task/problem.
            2.  Then, provide the code skeleton (e.g., function signature with a clear placeholder like `# Your code here` or `// Your code here`) in its OWN SEPARATE Markdown code block.
            3.  Any example usage, test cases, or expected I/O should be provided *AFTER* this main code block, clearly labeled (e.g., "### Example Usage:" or "### Expected Output:") and ideally within their *OWN SEPARATE* Markdown code block(s). Do NOT mix example usage comments inside the code block meant for user completion.
        * For multiple-choice questions, clearly label options: A), B), C), D). Each option on a new line.
    * **Minimalism:** Any provided code (skeletons, context) must be minimal and essential.
    """
    difficulty_guidance_map = {
        "easy": "Focus on a single, fundamental concept or a very simple task. Solvable with a short answer or a few lines of code.",
        "medium": "Present a well-defined, small-to-medium task applying a core concept or common pattern. Solvable in a few minutes. Description must be concise.",
        "hard": "Challenge with an intricate problem involving multiple concepts, edge cases, performance, or deeper architectural thinking. Problem statement must be clear and focused.",
    }
    difficulty_specific_guidance = difficulty_guidance_map.get(
        difficulty.lower(), "Standard difficulty."
    )
    domain_specific_content = ""
    if domain == "Frontend":
        domain_specific_content = f"""
        **Frontend Domain Focus ({difficulty}):** {difficulty_specific_guidance}
        * **Puzzle Styles to Emphasize:** Code Completion (JS function for DOM/event/utility), Bug Fixing (CSS/JS/HTML), Conceptual Question (MCQ on JS, CSS, HTML concepts), Output Prediction, Scenario.
        * **Code Completion Structure:** Separate task description, code skeleton, and example usage into distinct parts.
        """
    elif domain == "Backend":
        domain_specific_content = f"""
        **Backend Domain Focus ({difficulty}):** {difficulty_specific_guidance}
        * **Puzzle Styles to Emphasize:** Code Completion (Python/Java/Node.js function), Bug Fixing, Conceptual Question (MCQ on REST, ORM), Output Prediction, Scenario.
        * **Code Completion Structure:** Task description first, then clean code block for completion, then labeled examples.
        """
    elif domain == "Database":
        domain_specific_content = f"""
        **Database Domain Focus ({difficulty}):** {difficulty_specific_guidance}
        * **Puzzle Styles to Emphasize:** Query Writing (SQL), Bug Fixing (SQL), Conceptual Question (MCQ on keys, JOINs), Schema Snippet interpretation.
        * **Formatting Note:** SQL in ```sql blocks.
        """
    elif domain == "AI Engineering":
        domain_specific_content = f"""
        **AI Engineering Domain Focus ({difficulty}):** {difficulty_specific_guidance}
        * **Puzzle Styles to Emphasize:** Conceptual Question (MCQ on overfitting, SVM), Problem Formulation, Output/Metric Interpretation, Algorithm Step, Strategy Description (Hard - text).
        * **Formatting Note:** Clear terminology. Pseudo-code in ```plaintext.
        """
    prompt = f"""
    You are an expert puzzle creator. Your primary goal is to generate **diverse, novel, and impeccably formatted** puzzles.
    **Request:** Generate a **single, unique, and self-contained** puzzle for domain '{domain}' at '{difficulty}' difficulty.
    {domain_specific_content}
    {common_instructions}
    """
    return prompt.strip()


# --- API Endpoints ---


@app.route("/status")  # Changed from / to avoid conflict with index route
def home():
    return jsonify({"status": "Backend server is running!"}), 200


# Returns a simple status message indicating the server is running
@app.route("/")
def index():
    """Serves the main game page."""
    return render_template("index.html")


@app.route("/terminal")
def terminal():
    """Serves the terminal interface."""
    return render_template("terminal.html")


# Add routes for other HTML files if needed
@app.route("/final-easy-complete")
def final_easy_complete():
    # You would create a final-easy-complete.html in the templates folder
    return render_template("final-easy-complete.html")


@app.route("/final-hard-complete")
def final_hard_complete():
    return render_template("final-hard-complete.html")


@app.route("/personnel/dr-thorne")
def dr_thorne_route():
    return render_template("Dr. Thorne.html")


@app.route("/personnel/dr-lena")
def dr_lena_route():
    return render_template("Dr.Lena.html")


@app.route("/personnel/kappa-7")
def kappa_route():
    return render_template("Kappa.html")


@app.route("/personnel/sigma-3")
def sigma_route():
    return render_template("Sigma.html")


@app.route("/briefing/hard-motivation")
def hard_motivation_route():
    return render_template("hard_motivation.html")


@app.route("/introduction")
def introduction_route():
    return render_template("introduction.html")


@app.route("/nightmare-motivation")
def nightmare_motivation_route():
    return render_template("nightmare_motivation.html")


@app.route("/welcome-packet")
def welcome_packet_route():
    return render_template("Welcome Packet.html")


@app.route("/simulation/invaders")
def invaders_route():
    return render_template("invaders.html")


# Creates a player with a username and default credentials for the main game


@app.route("/players", methods=["POST"])
def create_player_simple():
    data = request.get_json()
    if not data or "username" not in data:
        return jsonify({"error": "Missing 'username'"}), 400
    username = data["username"].strip()
    if not username:
        return jsonify({"error": "'username' cannot be empty"}), 400

    existing_player = Player.query.filter_by(username=username).first()
    if existing_player:
        logging.info(
            f"Player '{username}' (simple creation) already exists. Returning existing player data."
        )
        if (
            not existing_player.email
        ):  # Ensure dummy data if created before fields existed
            existing_player.email = f"{username.lower().replace(' ', '_')}@enigma.local"
        if not existing_player.password_hash:
            existing_player.set_password("!DefaultPassword123!")  # Secure default
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logging.warning(
                f"Could not update dummy email/pass for existing simple player {username}: {e}"
            )
        return jsonify(existing_player.to_dict()), 200

    new_player = Player(
        username=username,
        email=f"{username.lower().replace(' ', '_')}@enigma.local",
    )
    new_player.set_password("!DefaultPassword123!")  # Secure default password
    try:
        db.session.add(new_player)
        db.session.commit()
        logging.info(
            f"Created simple player: {new_player.username} (ID: {new_player.player_id})"
        )
        return jsonify(new_player.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        logging.exception(f"Error creating simple player '{username}': {e}")
        return jsonify({"error": "Database error during simple player creation"}), 500


# Registers a new player with username, email, and password for terminal access and statistics
@app.route("/register", methods=["POST"])
def register_player():
    data = request.get_json()
    if not data or not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Missing username, email, or password"}), 400

    username = data["username"].strip()
    email = data["email"].strip().lower()
    password = data["password"]

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password cannot be empty"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400
    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Invalid email format"}), 400

    if Player.query.filter_by(username=username).first():
        return jsonify({"error": f"Username '{username}' is already taken"}), 409
    if Player.query.filter_by(email=email).first():
        return jsonify({"error": f"Email '{email}' is already registered"}), 409

    # Default terminal_access_level for new registered users
    new_player = Player(username=username, email=email, terminal_access_level="unit734")
    new_player.set_password(password)

    try:
        db.session.add(new_player)
        db.session.commit()
        logging.info(
            f"Registered new player: {new_player.username} (ID: {new_player.player_id}), Terminal Access: {new_player.terminal_access_level}"
        )
        return (
            jsonify(
                {
                    "message": "Player registered successfully!",
                    "player": new_player.to_dict(),
                }
            ),
            201,
        )
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.exception(f"Database error registering player '{username}': {e}")
        return jsonify({"error": "Database error during registration"}), 500
    except Exception as e:
        db.session.rollback()
        logging.exception(f"Unexpected error registering player '{username}': {e}")
        return jsonify({"error": "Internal server error during registration"}), 500


# Authenticates a player using username and password for terminal login
@app.route("/login", methods=["POST"])
def login_player():
    data = request.get_json()
    if not data or not data.get("username") or not data.get("password"):
        return jsonify({"error": "Missing username or password"}), 400

    username = data["username"].strip()
    password = data["password"]

    player = Player.query.filter_by(username=username).first()

    if player and player.check_password(password):
        logging.info(f"Player '{username}' logged in successfully.")
        return (
            jsonify(
                {
                    "message": "Login successful!",
                    "username": player.username,
                    "player_id": player.player_id,
                    "terminal_access_level": player.terminal_access_level
                    or "unit734",  # Fallback if somehow null
                }
            ),
            200,
        )
    else:
        logging.warning(f"Login failed for username '{username}'.")
        return jsonify({"error": "Invalid username or password"}), 401


# Retrieves player data by player ID
@app.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    try:
        player = db.session.get(Player, player_id)
        if not player:
            return jsonify({"error": "Player not found"}), 404
        player_data = player.to_dict()
        return jsonify(player_data), 200
    except Exception as e:
        logging.exception(f"Error fetching player {player_id}: {e}")
        return (
            jsonify(
                {
                    "error": (
                        "Database error"
                        if isinstance(e, SQLAlchemyError)
                        else "Internal server error"
                    )
                }
            ),
            500,
        )


# Retrieves player data by username
@app.route("/player/username/<string:username>", methods=["GET"])
def get_player_by_username(username):
    try:
        if not username:
            return jsonify({"error": "'username' parameter cannot be empty"}), 400
        player = Player.query.filter_by(username=username).first()
        if not player:
            return (
                jsonify({"error": f"Player with username '{username}' not found"}),
                404,
            )
        logging.info(
            f"Fetched player by username: {player.username} (ID: {player.player_id})"
        )
        return jsonify(player.to_dict()), 200
    except Exception as e:
        logging.exception(f"Error fetching player by username '{username}': {e}")
        return (
            jsonify(
                {
                    "error": (
                        "Database error"
                        if isinstance(e, SQLAlchemyError)
                        else "Internal server error"
                    )
                }
            ),
            500,
        )


# Generates a new AI-generated puzzle for a given domain and difficulty
@app.route("/generate_puzzle", methods=["POST"])
def generate_puzzle():
    if ai_client is None:
        logging.error("AI client (OpenAI) not initialized.")
        return jsonify({"error": "AI service is unavailable"}), 503
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400
        domain, difficulty = data.get("domain"), data.get("difficulty")
        if domain not in VALID_DOMAINS or difficulty not in VALID_DIFFICULTIES:
            return jsonify({"error": "Invalid domain or difficulty"}), 400
    except Exception as e:
        logging.exception("Error parsing generate_puzzle request.")
        return jsonify({"error": "Invalid JSON payload"}), 400

    prompt_content = get_puzzle_generation_prompt(domain, difficulty)
    logging.debug(
        f"--- Sending Puzzle Prompt to OpenAI (Model: {OPENAI_MODEL_NAME}, Temp: {GENERATION_TEMPERATURE}) ---:\nUser Message: {prompt_content[:800]}...\n---"
    )
    puzzle_data_dict, last_error = None, "No attempts."

    for attempt in range(MAX_RETRIES):
        logging.info(
            f"Attempt {attempt + 1}/{MAX_RETRIES} to call OpenAI for puzzle..."
        )
        try:
            response = ai_client.chat.completions.create(
                model=OPENAI_MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert puzzle creator. Generate puzzles based on the user's detailed instructions, ensuring the output is a single valid JSON object as specified.",
                    },
                    {"role": "user", "content": prompt_content},
                ],
                temperature=GENERATION_TEMPERATURE,
                response_format={"type": "json_object"},
            )
            raw_response_content = (
                response.choices[0].message.content
                if response.choices and response.choices[0].message
                else ""
            )
            logging.debug(
                f"Raw OpenAI Puzzle Response Content (Att {attempt + 1}): >>>\n{raw_response_content[:300]}...\n<<<"
            )
            finish_reason = (
                response.choices[0].finish_reason if response.choices else "unknown"
            )
            if finish_reason != "stop":
                logging.warning(
                    f"OpenAI Puzzle Gen Finish Reason (Att {attempt + 1}): {finish_reason}"
                )
                last_error = f"AI response incomplete or filtered (Reason: {finish_reason}) on attempt {attempt + 1}."
                if attempt < MAX_RETRIES - 1:
                    time.sleep(1.5**attempt)
                    continue
                else:
                    break
            parsed_data = parse_openai_response_content(
                raw_response_content, context="puzzle"
            )
            if (
                parsed_data
                and all(
                    k in parsed_data
                    for k in ["puzzle_description", "validation_criteria"]
                )
                and isinstance(parsed_data["puzzle_description"], str)
                and parsed_data["puzzle_description"].strip()
                and isinstance(parsed_data["validation_criteria"], str)
                and parsed_data["validation_criteria"].strip()
            ):
                original_description = parsed_data["puzzle_description"]
                restructured_description = (
                    restructure_code_puzzle_description_if_needed(original_description)
                )
                parsed_data["puzzle_description"] = restructured_description
                if restructured_description != original_description:
                    logging.info("Puzzle description restructured by wrapper.")
                else:
                    logging.info(
                        "Puzzle description not significantly changed by wrapper."
                    )
                parsed_domain = parsed_data.get("domain", domain)
                parsed_difficulty = parsed_data.get("difficulty", difficulty)
                if parsed_domain != domain or parsed_difficulty != difficulty:
                    logging.warning(
                        f"AI returned domain/difficulty ({parsed_domain}/{parsed_difficulty}) different from request ({domain}/{difficulty}). Using requested."
                    )
                puzzle_data_dict = parsed_data
                puzzle_data_dict["domain"] = domain
                puzzle_data_dict["difficulty"] = difficulty
                logging.info(f"Parsed valid JSON from OpenAI (Att {attempt + 1}).")
                break
            else:
                last_error = f"Bad puzzle format/empty from OpenAI (Att {attempt + 1}). Content: '{raw_response_content[:200]}...'"
            logging.warning(last_error)
            if attempt < MAX_RETRIES - 1:
                time.sleep(1.5**attempt)
        except Exception as e:
            last_error = f"OpenAI API call error (Att {attempt + 1}): {e}"
            logging.exception(last_error)
        if attempt < MAX_RETRIES - 1:
            time.sleep(1.5**attempt)

    if not puzzle_data_dict:
        logging.error(
            f"Failed to get valid puzzle from OpenAI. Last error: {last_error}"
        )
        detail = "AI service failed to return valid data."
        if "filter" in last_error.lower() or "blocked" in last_error.lower():
            detail = "AI response blocked or filtered."
        elif (
            "parse" in last_error.lower()
            or "keys" in last_error.lower()
            or "format" in last_error.lower()
        ):
            detail = "AI returned unexpected format."
        return (
            jsonify(
                {"error": "AI service failed to generate puzzle.", "details": detail}
            ),
            500,
        )
    logging.debug(
        f"Data for new Puzzle object: {json.dumps(puzzle_data_dict, indent=2)}"
    )
    try:
        new_puzzle = Puzzle(
            domain=puzzle_data_dict["domain"],
            difficulty=puzzle_data_dict["difficulty"],
            puzzle_description=puzzle_data_dict["puzzle_description"],
            validation_criteria=puzzle_data_dict["validation_criteria"],
            is_ai_generated=True,
        )
        db.session.add(new_puzzle)
        db.session.commit()
        logging.info(f"Saved puzzle ID {new_puzzle.puzzle_id} to DB.")
        res_payload = new_puzzle.to_dict()
        return jsonify(res_payload), 200
    except Exception as e:
        db.session.rollback()
        logging.exception("Error saving puzzle to DB")
        return jsonify({"error": "Failed to save puzzle."}), 500


# Generates a hint for a puzzle based on the puzzle and user's last answer
def generate_hint_for_puzzle(puzzle, user_answer=""):
    if ai_client is None:
        logging.error("Hint: OpenAI client not initialized.")
        return None
    hint_prompt_content = f"""
    You are a helpful assistant providing subtle hints for technical puzzles.
    Puzzle: Domain: {puzzle.domain}, Difficulty: {puzzle.difficulty}
    Description: {puzzle.puzzle_description}
    User's last incorrect answer: {user_answer}
    Generate a single, concise, subtle hint. Do NOT give the answer. Guide the user.
    Return ONLY JSON: {{"hint_text": "The generated hint."}}
    """
    logging.debug(
        f"--- Sending Hint Prompt to OpenAI (Model: {OPENAI_MODEL_NAME}, Temp: {HINT_TEMPERATURE}) ---:\nUser Message: {hint_prompt_content[:500]}...\n---"
    )
    hint_text_val = None
    last_error = "No attempts for hint."
    for attempt in range(HINT_GENERATION_RETRIES):
        logging.info(
            f"Attempt {attempt + 1}/{HINT_GENERATION_RETRIES} for hint from OpenAI..."
        )
        try:
            response = ai_client.chat.completions.create(
                model=OPENAI_MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful hint generation assistant. Provide hints in JSON format as specified.",
                    },
                    {"role": "user", "content": hint_prompt_content},
                ],
                temperature=HINT_TEMPERATURE,
                response_format={"type": "json_object"},
            )
            raw_response_content = (
                response.choices[0].message.content
                if response.choices and response.choices[0].message
                else ""
            )
            logging.debug(
                f"Raw OpenAI Hint Response Content (Att {attempt + 1}): >>>\n{raw_response_content[:300]}...\n<<<"
            )
            finish_reason = (
                response.choices[0].finish_reason if response.choices else "unknown"
            )
            if finish_reason != "stop":
                logging.warning(
                    f"OpenAI Hint Gen Finish Reason (Att {attempt + 1}): {finish_reason}"
                )
                last_error = f"AI hint response incomplete or filtered (Reason: {finish_reason}) on attempt {attempt + 1}."
                if attempt < HINT_GENERATION_RETRIES - 1:
                    time.sleep(1)
                    continue
                else:
                    break
            parsed = parse_openai_response_content(raw_response_content, context="hint")
            if (
                parsed
                and "hint_text" in parsed
                and isinstance(parsed["hint_text"], str)
                and parsed["hint_text"].strip()
            ):
                hint_text_val = parsed["hint_text"]
                logging.info(f"Hint generated by OpenAI (Att {attempt + 1}).")
                break
            else:
                last_error = f"Bad hint format/empty from OpenAI (Att {attempt + 1}). Content: '{raw_response_content[:200]}...'"
            logging.warning(last_error)
            if attempt < HINT_GENERATION_RETRIES - 1:
                time.sleep(1)
        except Exception as e:
            last_error = f"OpenAI Hint API call error (Att {attempt + 1}): {e}"
            logging.exception(last_error)
        if attempt < HINT_GENERATION_RETRIES - 1:
            time.sleep(1)
    if not hint_text_val:
        logging.error(f"Failed to get hint from OpenAI. Last error: {last_error}")
    return hint_text_val


# Validates a player's answer for a puzzle and provides feedback
@app.route("/validate_answer", methods=["POST"])
def validate_answer():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON"}), 400
        user_answer, p_id_str, plr_id_str = (
            data.get("user_answer"),
            data.get("puzzle_id"),
            data.get("player_id"),
        )
        if user_answer is None or p_id_str is None or plr_id_str is None:
            return jsonify({"error": "Missing fields"}), 400
        puzzle_id, player_id = int(p_id_str), int(plr_id_str)
    except Exception:
        return jsonify({"error": "Invalid payload"}), 400

    logging.info(
        f"Validation: P{player_id}, Q{puzzle_id}. Ans: '{str(user_answer)[:50]}...'"
    )
    try:
        puzzle, player = db.session.get(Puzzle, puzzle_id), db.session.get(
            Player, player_id
        )
        if not puzzle:
            return jsonify({"error": f"Puzzle with ID {puzzle_id} not found"}), 404
        if not player:
            return jsonify({"error": f"Player with ID {player_id} not found"}), 404

        progress = PlayerProgress.query.filter_by(
            player_id=player_id, puzzle_id=puzzle_id
        ).first()
        if not progress:
            progress = PlayerProgress(
                player_id=player_id, puzzle_id=puzzle_id, attempts=0
            )
            db.session.add(progress)

        is_correct, feedback = False, "Incorrect."
        crit_str = puzzle.validation_criteria
        struct_crit = None
        if crit_str and crit_str.strip().startswith("{"):
            try:
                struct_crit = json.loads(crit_str)
            except json.JSONDecodeError:
                logging.warning(
                    f"Bad structured criteria Q{puzzle_id}: {crit_str[:100]}"
                )

        if struct_crit and isinstance(struct_crit, dict):
            val_res, fb_eval = validate_structured_criteria(struct_crit, user_answer)
            if val_res is not None:
                is_correct, feedback = val_res, fb_eval
            else:
                feedback = fb_eval
                logging.warning(
                    f"Structured validation for Q{puzzle_id} was unsupported or malformed. Feedback: {feedback}"
                )
        else:
            is_correct, feedback = validate_legacy_criteria(crit_str, user_answer)

        if progress.status != "solved":
            progress.attempts += 1

        progress.last_attempted_at = datetime.utcnow()
        current_hint = progress.hint_text

        if is_correct:
            if progress.status != "solved":
                progress.status, progress.solved_at = "solved", datetime.utcnow()
            logging.info(
                f"P{player_id} solved Q{puzzle_id} (Total Attempts for this puzzle: {progress.attempts})."
            )
        else:
            logging.info(
                f"P{player_id} incorrect for Q{puzzle_id} (Total Attempts for this puzzle: {progress.attempts})."
            )
            if (
                progress.status != "solved"
                and progress.attempts >= HINT_REQUEST_THRESHOLD
                and not progress.hint_text
            ):
                logging.info(
                    f"Attempting to generate hint for P{player_id}, Q{puzzle_id} after {progress.attempts} attempts."
                )
                gen_hint = generate_hint_for_puzzle(puzzle, str(user_answer))
                if gen_hint:
                    progress.hint_text, progress.hint_requested_at = (
                        gen_hint,
                        datetime.utcnow(),
                    )
                    current_hint = gen_hint
                    feedback = f"{feedback} A hint is now available."
                    logging.info(
                        f"Hint for P{player_id}, Q{puzzle_id}: '{gen_hint[:50]}...'"
                    )
                else:
                    logging.warning(f"Failed to get hint P{player_id}, Q{puzzle_id}.")

        db.session.commit()

        res_payload = {"correct": is_correct, "feedback": feedback}
        if current_hint:
            res_payload["hint"] = current_hint

        return jsonify(res_payload), 200
    except Exception as e:
        db.session.rollback()
        logging.exception(
            f"Error in validate_answer P:{player_id if 'player_id' in locals() else 'Unknown'} Q:{puzzle_id if 'puzzle_id' in locals() else 'Unknown'}"
        )
        return jsonify({"error": "Internal error during validation."}), 500


# Runs the Flask application with database table validation
if __name__ == "__main__":
    with app.app_context():
        try:
            from sqlalchemy import inspect as sa_inspect

            inspector = sa_inspect(db.engine)
            if not all(
                inspector.has_table(t.__tablename__)
                for t in [Player, Puzzle, PlayerProgress]
            ):
                logging.warning(
                    "One or more database tables might not exist. Run init_database.py first. "
                    "If you've changed models (e.g., added email/password to Player), "
                    "you may need to delete the old enigma_progress.db file and re-run init_database.py "
                    "for the changes to take effect without migration errors."
                )
        except Exception as e:
            logging.error(
                f"Error checking database tables: {e}. Ensure DB file exists and is accessible."
            )
    app.run(host="0.0.0.0", port=8000, debug=True)
