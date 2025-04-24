import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy  # Import SQLAlchemy
from dotenv import load_dotenv
import logging
import json
import time
import re  # Import regular expressions for parsing criteria
from flask_cors import CORS
from datetime import datetime  # For timestamp defaults

# --- Configuration & Setup ---

# Load .env file
load_dotenv()

# Configure logging - Set level to DEBUG to capture everything,
# or INFO for less verbosity but still see errors/warnings
logging.basicConfig(
    level=logging.DEBUG,  # Changed to DEBUG for more detail
    format="%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",  # Added filename/lineno
)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Constants ---
MAX_RETRIES = 3
# Keep OUTPUT_FILE for now, remove if definitely not needed
OUTPUT_FILE = "generated_puzzles.jsonl"
GENERATION_TEMPERATURE = 0.5
# Define the stable model name here
STABLE_MODEL_NAME = "gemini-1.5-pro-latest"  # Using the stable 1.5 Pro model
DB_NAME = "enigma_progress.db"  # Database file name

# --- Database Configuration (Flask-SQLAlchemy) ---
# Set the database URI. 'sqlite:///' specifies a relative path from the app instance folder.
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
    False  # Disable modification tracking (recommended)
)

# Initialize the SQLAlchemy extension
db = SQLAlchemy(app)

# --- AI Setup ---

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    logging.error("GOOGLE_API_KEY not found in environment variables.")
    # Raising an exception is generally better than exit() in app code
    raise ValueError("GOOGLE_API_KEY not found in environment variables.")

model = None
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel(STABLE_MODEL_NAME)
    logging.info(
        f"Google Generative AI configured successfully with model: {STABLE_MODEL_NAME}"
    )
except Exception as e:
    logging.exception(
        f"CRITICAL: Error configuring Google Generative AI with {STABLE_MODEL_NAME}"
    )
    # model remains None, requests will fail with 503


# --- Database Models (Flask-SQLAlchemy) ---
# Define models AFTER initializing db = SQLAlchemy(app)


class Player(db.Model):
    __tablename__ = "Players"  # Explicit table name (optional but good practice)
    player_id = db.Column(db.Integer, primary_key=True)  # Auto-incrementing by default
    username = db.Column(db.String(80), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Relationship to PlayerProgress (one-to-many)
    progress = db.relationship(
        "PlayerProgress", backref="player", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Player {self.username}>"


class Puzzle(db.Model):
    __tablename__ = "Puzzles"
    puzzle_id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(50), nullable=False)
    difficulty = db.Column(db.String(50), nullable=False)
    puzzle_description = db.Column(db.Text, nullable=False)
    validation_criteria = db.Column(db.Text, nullable=False)
    is_ai_generated = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Relationship to PlayerProgress (one-to-many)
    progress_entries = db.relationship(
        "PlayerProgress", backref="puzzle", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Puzzle {self.puzzle_id} ({self.domain}/{self.difficulty})>"


class PlayerProgress(db.Model):
    __tablename__ = "PlayerProgress"
    progress_id = db.Column(db.Integer, primary_key=True)
    player_id = db.Column(
        db.Integer, db.ForeignKey("Players.player_id"), nullable=False
    )
    puzzle_id = db.Column(
        db.Integer, db.ForeignKey("Puzzles.puzzle_id"), nullable=False
    )
    status = db.Column(
        db.String(20), nullable=False, default="attempted"
    )  # e.g., 'attempted', 'solved', 'skipped'
    attempts = db.Column(db.Integer, default=0)
    last_attempted_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    solved_at = db.Column(db.DateTime, nullable=True)  # Null if not solved

    # Ensure unique combination of player and puzzle
    __table_args__ = (
        db.UniqueConstraint("player_id", "puzzle_id", name="_player_puzzle_uc"),
    )

    def __repr__(self):
        return f"<PlayerProgress Player:{self.player_id} Puzzle:{self.puzzle_id} Status:{self.status}>"


# --- Helper Function (Keep or remove based on need) ---


def save_puzzle_to_file(puzzle_data, filename):
    """Appends a puzzle dictionary to a JSON Lines file."""
    try:
        # Ensure puzzle_data is serializable (it should be if it came from JSON)
        serializable_data = json.loads(json.dumps(puzzle_data))
        with open(filename, "a", encoding="utf-8") as f:
            json.dump(serializable_data, f)  # Use the serializable version
            f.write("\n")
        logging.info(f"Successfully saved puzzle to {filename}")
    except TypeError as te:
        logging.error(f"Data is not JSON serializable when saving to file: {te}")
    except IOError as e:
        logging.error(f"Error saving puzzle to file {filename}: {e}")
    except Exception as e:
        logging.exception(
            f"An unexpected error occurred while saving puzzle to file: {e}"
        )


# --- API Endpoints ---


@app.route("/")
def home():
    """Basic route to check if the server is running."""
    return jsonify({"status": "Backend server is running!"}), 200


@app.route("/generate_puzzle", methods=["POST"])
def generate_puzzle():
    """
    API endpoint to generate a new puzzle using Gemini.
    Expects JSON payload with 'domain' and 'difficulty'.
    Saves the generated puzzle to the database using SQLAlchemy.
    Returns a structured JSON puzzle object. Retries on JSON parsing failure.
    Saves successful generations to a file (if enabled).
    """
    if model is None:
        logging.error("Attempted to generate puzzle, but AI model is not initialized.")
        return (
            jsonify({"error": "Generative AI model not initialized"}),
            503,
        )  # Service Unavailable

    # Get data from the incoming JSON request
    try:
        data = request.get_json()
        if not data:
            logging.warning("Received request with missing JSON payload.")
            return jsonify({"error": "Missing JSON payload"}), 400

        domain = data.get("domain")
        difficulty = data.get("difficulty")

        valid_domains = ["Frontend", "Backend", "Database", "AI Engineering"]
        if domain not in valid_domains:
            logging.warning(f"Received request with invalid domain: {domain}")
            return (
                jsonify(
                    {
                        "error": f"Invalid domain specified. Must be one of: {valid_domains}"
                    }
                ),
                400,
            )

        if not domain or not difficulty:
            logging.warning(
                f"Received request missing domain or difficulty. Data: {data}"
            )
            return (
                jsonify({"error": "Missing 'domain' or 'difficulty' in request body"}),
                400,
            )

        logging.info(
            f"Received request to generate puzzle: Domain='{domain}', Difficulty='{difficulty}'"
        )

    except Exception as e:
        logging.exception("Error parsing request JSON.")  # Log full traceback
        return jsonify({"error": "Invalid JSON payload"}), 400

    # --- Prompt Construction (Using your adjusted prompt) ---
    difficulty_guidance = ""
    if difficulty.lower() == "easy":
        difficulty_guidance = (
            "Focus on very basic syntax, common built-in functions, simple 'what does this code do?' questions, "
            "or fundamental concepts."
        )
    elif difficulty.lower() == "medium":
        difficulty_guidance = (
            "Ask for implementation of a slightly more complex function, application of a common pattern "
            "(like event handling, basic API routing, simple JOINs), "
            "explanation of a core concept with a small code example, or identifying a bug in a short snippet."
        )
    elif difficulty.lower() == "hard":
        difficulty_guidance = (
            "Delve into more complex algorithms, handling edge cases, performance considerations, "
            "security aspects (like SQL injection prevention), asynchronous operations, "
            "or deeper conceptual understanding."
        )

    prompt = f"""
    You are an expert creator of coding puzzles and technical questions designed to test a developer's knowledge in specific domains.
    Your goal is to provide a variety of puzzle types over time.

    For this request, generate a single, self-contained puzzle for the domain '{domain}' at a '{difficulty}' difficulty level.
    The puzzle should be **EITHER** a coding-related task **OR** a question-and-answer/multiple-choice style question about a concept. 
    Choose one format for this specific puzzle.

    **Difficulty Context:** {difficulty_guidance}

    The puzzle should be practical and test knowledge relevant to the specified domain and difficulty.
    Possible formats include:
    - Writing a small code snippet.
    - Completing provided code.
    - Identifying a bug in code.
    - Explaining a concept (possibly with code examples).
    - Answering a specific technical question (potentially multiple-choice format like A, B, C, D).

    Provide the puzzle description clearly, including any necessary code context or setup. Format code examples clearly using standard markdown code fences (```) where appropriate. For multiple-choice questions, clearly label the options (e.g., A), B), C), D)).

    Crucially, also provide clear and specific validation_criteria that can be used by a separate system to check if a user's submitted answer or code snippet is correct.
    - For coding tasks: Focus on expected outputs, specific function behaviors, key concepts that must be implemented, or exact code syntax if applicable.
    - For Q&A/Multiple Choice: Specify the correct answer/option (e.g., "The correct option is C.", "The explanation must accurately define 'term Z'.").
    Do NOT include criteria that require executing arbitrary user code directly.

    Return the result ONLY as a single, valid JSON object (do not include ```json markdown tags around the final JSON object itself) with the following exact keys:
    - "puzzle_description": (string) The text of the puzzle/question, including any setup or context needed (and options A, B, C, D if applicable).
    - "domain": (string) The domain provided: '{domain}'.
    - "difficulty": (string) The difficulty provided: '{difficulty}'.
    - "validation_criteria": (string) A clear description of how to validate the answer 
    (e.g., "The submitted code must produce the output 'X' for input 'Y'.", "The correct option is C.", 
    "The explanation must accurately define 'term Z'.", "The CSS selector must target only the specified elements.").
    """
    # --- MODIFICATION END ---

    # --- Log the prompt being sent ---
    logging.debug(
        f"--- Sending Prompt to Gemini ---:\n{prompt}\n-----------------------------"
    )

    # --- Call the LLM API with Retries ---
    puzzle_data = None
    last_error = (
        "No attempts made or unknown error."  # Default error if loop doesn't run
    )

    generation_config = genai.types.GenerationConfig(temperature=GENERATION_TEMPERATURE)

    for attempt in range(MAX_RETRIES):
        logging.info(
            f"Attempt {attempt + 1}/{MAX_RETRIES} to call Google Generative AI (Temp: {GENERATION_TEMPERATURE})..."
        )
        try:
            response = model.generate_content(
                prompt, generation_config=generation_config
            )
            logging.warning(
                f"Raw AI Response Text (Attempt {attempt + 1}): >>>\n{response.text}\n<<<"
            )
            if hasattr(response, "prompt_feedback") and response.prompt_feedback:
                logging.warning(
                    f"Prompt Feedback (Attempt {attempt + 1}): {response.prompt_feedback}"
                )
            else:
                logging.debug(f"No prompt_feedback received (Attempt {attempt + 1}).")

            # --- Process the Response as JSON ---
            try:
                cleaned_text = response.text.strip().strip("`")
                if cleaned_text.startswith("json"):
                    cleaned_text = cleaned_text[4:].strip()
                parsed_data = json.loads(cleaned_text)
                required_keys = [
                    "puzzle_description",
                    "domain",
                    "difficulty",
                    "validation_criteria",
                ]
                if not all(key in parsed_data for key in required_keys):
                    logging.warning(
                        f"LLM response missing required keys. Parsed: {parsed_data}"
                    )
                    last_error = f"LLM response JSON missing required keys on attempt {attempt + 1}. Parsed: {parsed_data}"
                    raise ValueError("LLM response JSON missing required keys.")
                puzzle_data = parsed_data
                logging.info(
                    f"Successfully parsed JSON response from AI on attempt {attempt + 1}."
                )
                break
            except (json.JSONDecodeError, ValueError) as parse_err:
                last_error = f"Failed to parse/validate JSON on attempt {attempt + 1}: {parse_err}. Snippet: '{response.text[:300]}...'"
                logging.warning(last_error)
                if attempt < MAX_RETRIES - 1:
                    time.sleep(1)
        except Exception as api_err:
            last_error = f"Error during Google Generative AI call on attempt {attempt + 1}: {api_err}"
            logging.exception(last_error)
            if attempt < MAX_RETRIES - 1:
                time.sleep(1)

    # --- Handle Final Result ---
    if puzzle_data:
        # --- Save successful puzzle data to DATABASE ---
        try:
            new_puzzle = Puzzle(
                domain=puzzle_data["domain"],
                difficulty=puzzle_data["difficulty"],
                puzzle_description=puzzle_data["puzzle_description"],
                validation_criteria=puzzle_data["validation_criteria"],
                is_ai_generated=True,
            )
            db.session.add(new_puzzle)
            db.session.commit()
            logging.info(
                f"Successfully saved puzzle ID {new_puzzle.puzzle_id} to database."
            )
            save_puzzle_to_file(puzzle_data, OUTPUT_FILE)  # Optional file log
            response_payload = puzzle_data.copy()
            response_payload["puzzle_id"] = (
                new_puzzle.puzzle_id
            )  # Add new ID to response
            return jsonify(response_payload), 200
        except Exception as db_err:
            db.session.rollback()
            logging.exception(f"Database error saving puzzle")
            return (
                jsonify({"error": "Failed to save generated puzzle to database."}),
                500,
            )
    else:
        logging.error(
            f"Failed to get valid puzzle data after {MAX_RETRIES} attempts. Last error: {last_error}"
        )
        client_error = "AI service failed to return valid data after multiple attempts."
        if last_error and (
            "JSONDecodeError" in last_error or "ValueError" in last_error
        ):
            client_error = (
                "AI service returned invalid JSON format after multiple attempts."
            )
        elif last_error and ("Error during Google Generative AI call" in last_error):
            client_error = "AI service encountered an error during generation."
        return (
            jsonify({"error": client_error, "details": last_error}),
            500,
        )


# --- Validation Endpoint ---
@app.route("/validate_answer", methods=["POST"])
def validate_answer():
    """
    API endpoint to validate a user's submitted answer against the puzzle's criteria.
    Expects JSON payload with 'user_answer', 'puzzle_id', and 'player_id'.
    Updates PlayerProgress in the database.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400

        user_answer = data.get("user_answer")
        puzzle_id = data.get("puzzle_id")
        player_id = data.get("player_id")  # Assuming player ID is sent

        # --- Input Validation ---
        if user_answer is None or puzzle_id is None or player_id is None:
            missing = [
                k
                for k, v in {
                    "user_answer": user_answer,
                    "puzzle_id": puzzle_id,
                    "player_id": player_id,
                }.items()
                if v is None
            ]
            return (
                jsonify({"error": f"Missing required fields: {', '.join(missing)}"}),
                400,
            )
        try:
            puzzle_id = int(puzzle_id)
            player_id = int(player_id)
        except ValueError:
            return jsonify({"error": "puzzle_id and player_id must be integers"}), 400

        logging.info(
            f"Received validation request for puzzle {puzzle_id} from player {player_id}."
        )
        logging.debug(f"User Answer: {user_answer}")

    except Exception as e:
        logging.exception("Error parsing validation request JSON.")
        return jsonify({"error": "Invalid JSON payload"}), 400

    # --- Fetch Puzzle from DB ---
    try:
        puzzle = db.session.get(
            Puzzle, puzzle_id
        )  # Use db.session.get for primary key lookup
        if not puzzle:
            logging.warning(
                f"Validation attempt failed: Puzzle ID {puzzle_id} not found."
            )
            return jsonify({"error": "Puzzle not found"}), 404
        validation_criteria = puzzle.validation_criteria
        logging.debug(f"Fetched validation criteria: {validation_criteria}")

    except Exception as e:
        logging.exception(f"Error fetching puzzle {puzzle_id} from database.")
        return jsonify({"error": "Database error fetching puzzle."}), 500

    # --- Validation Logic Implementation ---
    is_correct = False
    feedback = "Incorrect."  # Default feedback

    try:
        # Strategy for Multiple Choice (Checking "The correct option is X.")
        mc_match = re.search(
            r"the correct option is\s+([A-D])", validation_criteria, re.IGNORECASE
        )
        if mc_match:
            correct_option = mc_match.group(1).upper()  # Extract 'A', 'B', 'C', or 'D'
            user_option = user_answer.strip().upper()
            logging.info(
                f"Multiple choice validation: User chose '{user_option}', Correct is '{correct_option}'"
            )
            if user_option == correct_option:
                is_correct = True
                feedback = f"Correct! Option {correct_option} was the right answer."
            else:
                feedback = f"Incorrect. The correct option was {correct_option}."

        # Strategy for Exact String Match (Checking "must be exactly '...'")
        # Use regex to be more robust in finding the quoted string
        exact_match = re.search(
            r"must be exactly\s+[\"'](.*?)[\"']",
            validation_criteria,
            re.IGNORECASE | re.DOTALL,
        )
        if not is_correct and exact_match:  # Only check if not already correct
            expected_answer = exact_match.group(1)  # Extract the text within quotes
            logging.info(
                f"Exact match validation: User answer '{user_answer.strip()}', Expected '{expected_answer}'"
            )
            # Compare stripped user answer with expected answer
            if user_answer.strip() == expected_answer:
                is_correct = True
                feedback = "Correct! Exact match found."
            else:
                feedback = f"Incorrect. Expected exact match: '{expected_answer}'."

        # --- Add more strategies here as needed (Keyword, AI-assisted, etc.) ---
        # elif "must mention" in validation_criteria.lower(): ...
        # elif "explanation must accurately define" in validation_criteria.lower(): ... (Consider AI validation)

        else:
            # If no specific strategy matched or validation failed
            if not mc_match and not exact_match:
                logging.warning(
                    f"No specific validation strategy matched for puzzle {puzzle_id}. Criteria: {validation_criteria}"
                )
                feedback = "Could not determine validation method based on criteria. Manual review might be needed."
                # Consider falling back to AI validation here?

        # --- Update PlayerProgress in DB ---
        if player_id and puzzle_id:
            # Check if player exists (optional, depends on your user flow)
            player = db.session.get(Player, player_id)
            if not player:
                logging.warning(f"Player ID {player_id} not found during validation.")
                # Handle appropriately - maybe return error or create player?
                # For now, we'll proceed assuming player exists if ID is provided

            # Find or create progress record
            progress = PlayerProgress.query.filter_by(
                player_id=player_id, puzzle_id=puzzle_id
            ).first()

            if not progress:  # First attempt
                progress = PlayerProgress(
                    player_id=player_id, puzzle_id=puzzle_id, attempts=1
                )
                db.session.add(progress)
                logging.info(
                    f"Creating new PlayerProgress for player {player_id}, puzzle {puzzle_id}."
                )
            else:  # Subsequent attempt
                progress.attempts += 1
                logging.info(
                    f"Incrementing attempts for player {player_id}, puzzle {puzzle_id} to {progress.attempts}."
                )

            progress.last_attempted_at = datetime.utcnow()  # Update last attempt time
            if is_correct:
                progress.status = "solved"
                progress.solved_at = datetime.utcnow()
                logging.info(
                    f"Marking puzzle {puzzle_id} as solved for player {player_id}."
                )
            else:
                # Keep status as 'attempted' or potentially add other statuses
                pass

            try:
                db.session.commit()  # Commit the progress update
                logging.info(f"PlayerProgress updated successfully.")
            except Exception as prog_err:
                db.session.rollback()
                logging.exception("Failed to update PlayerProgress")
                # Don't necessarily fail the whole request, but log it
                feedback += " (Error updating progress)"

        logging.info(
            f"Validation result for puzzle {puzzle_id}: {'Correct' if is_correct else 'Incorrect'}"
        )
        return jsonify({"correct": is_correct, "feedback": feedback}), 200

    except Exception as e:
        logging.exception("Error during validation")  # Log full traceback
        return (
            jsonify({"error": "An internal error occurred during answer validation."}),
            500,
        )


# --- Main Execution ---

if __name__ == "__main__":
    # IMPORTANT: Do NOT run db.create_all() here automatically.
    # Use the init_database.py for setup.
    app.run(host="0.0.0.0", port=5000, debug=True)
