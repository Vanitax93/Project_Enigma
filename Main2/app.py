import os
from openai import (
    OpenAI,
    APIError,
    BadRequestError,
    AuthenticationError,
    RateLimitError,
)  # Import specific errors
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import logging
import json
import time
import re
from flask_cors import CORS
from datetime import datetime, timezone  # Ensured timezone is imported

# Pydantic for structured output validation
from pydantic import BaseModel, Field

from typing import List, Optional, Dict, Any, Union, Literal

# --- Configuration & Setup ---
load_dotenv()
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s",
)
app = Flask(__name__)
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
        ai_client = None
    except Exception as e:
        logging.exception(
            f"CRITICAL: Error configuring OpenAI client with model {OPENAI_MODEL_NAME}"
        )
        ai_client = None


# --- Pydantic Models for Structured AI Output ---
class MultipleChoiceCriteria(BaseModel):
    type: Literal["multiple_choice"] = "multiple_choice"
    correct_option: str = Field(
        ..., description="The correct option, e.g., 'A', 'B', 'C', or 'D'."
    )
    options: Optional[List[str]] = Field(
        None,
        description="List of option texts if they are not fully clear from the puzzle_description.",
    )


class ExactMatchCriteria(BaseModel):
    type: Literal["exact_match"] = "exact_match"
    expected: str = Field(
        ..., description="The exact string the user's answer should match."
    )


class KeywordMatchCriteria(BaseModel):
    type: Literal["keyword_match"] = "keyword_match"
    keywords: List[str] = Field(
        ..., description="A list of keywords the user's answer must contain."
    )
    match_all: Optional[bool] = Field(
        True, description="Whether all keywords must be present."
    )


class CodeContainsCriteria(BaseModel):
    type: Literal["code_contains"] = "code_contains"
    substrings: Optional[List[str]] = Field(
        None, description="List of substrings the code must contain. Be specific."
    )
    must_not_contain: Optional[List[str]] = Field(
        None,
        description="List of substrings the code must NOT contain (e.g., 'console.log').",
    )


ValidationCriteriaType = Union[
    MultipleChoiceCriteria,
    ExactMatchCriteria,
    KeywordMatchCriteria,
    CodeContainsCriteria,
]


class AIPuzzleResponse(BaseModel):
    puzzle_description: str = Field(
        ..., description="The concise, well-formatted, and novel puzzle using Markdown."
    )
    domain: Literal["Frontend", "Backend", "Database", "AI Engineering"]
    difficulty: Literal["Easy", "Medium", "Hard"]
    validation_criteria: Dict[str, Any]


class AIHintResponse(BaseModel):
    hint_text: str = Field(..., description="A single, concise, and subtle hint.")


# --- Database Models ---
class Player(db.Model):
    __tablename__ = "Players"
    player_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )  # Corrected default
    progress = db.relationship(
        "PlayerProgress", backref="player", lazy=True, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "player_id": self.player_id,
            "username": self.username,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Puzzle(db.Model):
    __tablename__ = "Puzzles"
    puzzle_id = db.Column(db.Integer, primary_key=True)
    domain = db.Column(db.String(50), nullable=False, index=True)
    difficulty = db.Column(db.String(50), nullable=False, index=True)
    puzzle_description = db.Column(db.Text, nullable=False)
    validation_criteria = db.Column(db.Text, nullable=False)
    is_ai_generated = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )  # Corrected default
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
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )  # Corrected default & onupdate
    solved_at = db.Column(db.DateTime, nullable=True)
    hint_text = db.Column(db.Text, nullable=True)
    hint_requested_at = db.Column(
        db.DateTime, nullable=True
    )  # Explicitly set, no default needed here
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
def parse_openai_response_content_to_pydantic(
    response_content: str, pydantic_model: BaseModel, context="puzzle"
):
    try:
        cleaned_text = response_content.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[len("```json") :].strip()
        elif cleaned_text.startswith("```"):
            cleaned_text = cleaned_text[len("```") :].strip()
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[: -len("```")].strip()
        json_data = json.loads(cleaned_text)
        model_instance = pydantic_model.model_validate(json_data)
        return model_instance
    except json.JSONDecodeError as e:
        logging.warning(
            f"JSONDecodeError parsing OpenAI {context} response content: {e}. Text: '{response_content[:300]}...'"
        )
        return None
    except Exception as e:
        logging.exception(
            f"Error parsing/validating OpenAI {context} response with Pydantic: {e}. Text: '{response_content[:300]}...'"
        )
        return None


def validate_structured_criteria(
    criteria_obj: Dict[str, Any], user_answer: str
) -> tuple[Optional[bool], str]:
    validation_type = criteria_obj.get("type", "").lower()
    logging.debug(
        f"Structured validation. Type: '{validation_type}', Criteria: {criteria_obj}"
    )
    if validation_type == "exact_match":
        expected_value = criteria_obj.get("expected")
        if expected_value is not None:
            if user_answer.strip() == expected_value:
                return True, f"Correct! Answer matched '{expected_value}' exactly."
            return False, f"Incorrect. Expected exact match: '{expected_value}'."
    elif validation_type == "multiple_choice":
        correct_option = criteria_obj.get("correct_option")
        if correct_option is not None:
            user_option = user_answer.strip().upper().rstrip(")")
            if user_option == correct_option.upper().rstrip(")"):
                return True, f"Correct! Option {correct_option} was the right answer."
            return False, "Incorrect. That's not the right option."
    elif validation_type == "keyword_match":
        keywords = criteria_obj.get("keywords")
        if keywords and isinstance(keywords, list):
            user_answer_lower = user_answer.lower()
            missing_keywords = [
                kw for kw in keywords if kw.lower() not in user_answer_lower
            ]
            if not missing_keywords:
                return (
                    True,
                    f"Correct! Answer included required keywords: {', '.join(keywords)}.",
                )
            return (
                False,
                f"Incorrect. Answer was missing keywords: {', '.join(missing_keywords)}.",
            )
    elif validation_type == "code_contains":
        substrings_to_find = criteria_obj.get("substrings")
        substrings_to_avoid = criteria_obj.get("must_not_contain")
        if not isinstance(user_answer, str):
            return False, "Invalid answer format for code check."
        if substrings_to_find and isinstance(substrings_to_find, list):
            for sub in substrings_to_find:
                if sub not in user_answer:
                    logging.debug(
                        f"Code validation failed: Missing required substring '{sub}'"
                    )
                    return (
                        False,
                        f"Incorrect. Your code is missing a required element or pattern (e.g., '{sub}').",
                    )
        if substrings_to_avoid and isinstance(substrings_to_avoid, list):
            for sub_avoid in substrings_to_avoid:
                if sub_avoid in user_answer:
                    logging.debug(
                        f"Code validation failed: Found forbidden substring '{sub_avoid}'"
                    )
                    return (
                        False,
                        f"Incorrect. Your code contains a forbidden element or pattern (e.g., '{sub_avoid}').",
                    )
        return True, "Correct! Your code meets the structural requirements."
    logging.warning(
        f"Unsupported structured validation type: '{validation_type}' or malformed criteria: {criteria_obj}"
    )
    return None, "Unsupported structured validation criteria."


def validate_legacy_criteria(criteria_text: str, user_answer: str) -> tuple[bool, str]:
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
                if (
                    idx + 1 < len(elements) and elements[idx + 1].startswith("```")
                ) or (idx + 3 < len(elements) and elements[idx + 3].startswith("```")):
                    if not found_example_heading:
                        example_parts.append("\n### Example Usage:\n")
                        found_example_heading = True
                    example_parts.append(element)
                else:
                    main_task_description_parts.append(element)
        idx += 1
    if not main_code_skeleton_block:
        logging.debug("Main skeleton not identified, returning original.")
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


def get_puzzle_generation_prompt(domain, difficulty):
    common_instructions = f"""
    **Output Format (Strictly Adhere):**
    You MUST return ONLY a single, valid JSON object. 
    The main keys expected are "puzzle_description", "domain", "difficulty", and "validation_criteria".

    **Key Field: "validation_criteria" (VERY IMPORTANT):**
    This field MUST be a JSON object, NOT a string containing JSON.
    The structure of this `validation_criteria` object MUST match one of the following schemas based on the `type` field you provide:
    * If `type` is "multiple_choice": `{{"type": "multiple_choice", "correct_option": "A", "options": ["Option A", ...]}}`
    * If `type` is "exact_match": `{{"type": "exact_match", "expected": "some exact string"}}`
    * If `type` is "keyword_match": `{{"type": "keyword_match", "keywords": ["key1", "key2"], "match_all": true}}`
    * If `type` is "code_contains": `{{"type": "code_contains", "substrings": ["must_have_this()"], "must_not_contain": ["forbidden_thing"]}}`
    Choose the most appropriate `type` for the puzzle you generate and provide the corresponding fields.

    **"puzzle_description" Field:**
    * This should be a string containing the concise, well-formatted, and novel puzzle.
    * Use Markdown for ALL text formatting (bold **text**, italics *text*, lists, code blocks).
    * Format ALL code (examples, snippets, function signatures to be completed) with Markdown code fences, specifying the language (e.g., ```python, ```javascript).
    * **For Code Completion Puzzles:**
        1.  Clear textual task description.
        2.  Code skeleton in its OWN SEPARATE Markdown code block (e.g., with `# Your code here`).
        3.  Example usage/tests AFTER the skeleton, clearly labeled (e.g., "### Example Usage:") and in their OWN SEPARATE Markdown code block(s).

    **General Requirements:**
    * **Novelty & Variety:** Generate a distinct puzzle.
    * **Conciseness & Clarity:** Brief, to the point, unambiguous.
    * **Minimalism:** Essential code/context only.
    * **Single Question for MCQs:** If generating a multiple-choice or conceptual question, it must be ONE SINGLE question.
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
        * **Puzzle Styles to Emphasize:** Code Completion (JS function), Bug Fixing (CSS/JS/HTML), Conceptual Question (MCQ - **ONE question only**), Output Prediction, Scenario.
        * **Code Completion Structure:** Separate task description, code skeleton, and example usage.
        """
    elif domain == "Backend":
        domain_specific_content = f"""
        **Backend Domain Focus ({difficulty}):** {difficulty_specific_guidance}
        * **Puzzle Styles to Emphasize:** Code Completion (Python/Java/Node.js function), Bug Fixing, Conceptual Question (MCQ - **ONE question only**), Output Prediction, Scenario.
        * **Code Completion Structure:** Task description first, then clean code block for completion, then labeled examples.
        """
    elif domain == "Database":
        domain_specific_content = f"""
        **Database Domain Focus ({difficulty}):** {difficulty_specific_guidance}
        * **Puzzle Styles to Emphasize:** Query Writing (SQL), Bug Fixing (SQL), Conceptual Question (MCQ - **ONE question only**), Schema Snippet interpretation.
        * **Formatting Note:** SQL in ```sql blocks.
        """
    elif domain == "AI Engineering":
        domain_specific_content = f"""
        **AI Engineering Domain Focus ({difficulty}):** {difficulty_specific_guidance}
        * **Puzzle Styles to Emphasize:** Conceptual Question (MCQ - **ONE question only**), Problem Formulation, Output/Metric Interpretation, Algorithm Step, Strategy Description (Hard - text).
        * **Formatting Note:** Clear terminology. Pseudo-code in ```plaintext.
        """
    prompt = f"""
    You are an expert puzzle creator. Your primary goal is to generate **diverse, novel, and impeccably formatted** puzzles that strictly adhere to the JSON structure I expect.
    The overall JSON structure you must produce should have top-level keys: "puzzle_description", "domain", "difficulty", and "validation_criteria".
    The "validation_criteria" itself MUST be a JSON object with a "type" field indicating its structure.

    **Request:** Generate a **single, unique, and self-contained** puzzle for domain '{domain}' at '{difficulty}' difficulty.
    {domain_specific_content}
    {common_instructions}
    """
    return prompt.strip()


# --- API Endpoints ---
@app.route("/")
def home():
    return jsonify({"status": "Backend server is running!"}), 200


@app.route("/players", methods=["POST"])
def create_player():
    data = request.get_json()
    if not data or "username" not in data:
        return jsonify({"error": "Missing 'username'"}), 400
    username = data["username"].strip()
    if not username:
        return jsonify({"error": "'username' cannot be empty"}), 400
    if Player.query.filter_by(username=username).first():
        return jsonify({"error": f"Username '{username}' already exists"}), 409
    new_player = Player(username=username)
    try:
        db.session.add(new_player)
        db.session.commit()
        logging.info(
            f"Created player: {new_player.username} (ID: {new_player.player_id})"
        )
        return jsonify(new_player.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        logging.exception(f"Error creating player '{username}': {e}")
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


@app.route("/players/<int:player_id>", methods=["GET"])
def get_player(player_id):
    try:
        player = db.session.get(Player, player_id)
        if not player:
            return jsonify({"error": "Player not found"}), 404
        progress_records = PlayerProgress.query.filter_by(player_id=player_id).all()
        player_data = player.to_dict()
        player_data["progress"] = [p.to_dict() for p in progress_records]
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
    ai_puzzle_pydantic: Optional[AIPuzzleResponse] = None
    last_error = "No attempts."

    for attempt in range(MAX_RETRIES):
        logging.info(f"Attempt {attempt + 1}/{MAX_RETRIES} for puzzle...")
        try:
            response = ai_client.chat.completions.create(
                model=OPENAI_MODEL_NAME,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert puzzle creator. Generate puzzles based on the user's detailed instructions. Your output MUST be a single valid JSON object. The 'validation_criteria' field within this JSON object must itself be a JSON object matching one of the described schemas.",
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

            parsed_json_data = json.loads(raw_response_content)
            ai_puzzle_pydantic = AIPuzzleResponse.model_validate(parsed_json_data)

            if (
                ai_puzzle_pydantic.puzzle_description.strip()
                and ai_puzzle_pydantic.validation_criteria
            ):
                logging.info(
                    f"Successfully received and validated structured JSON from OpenAI (Att {attempt + 1})."
                )
                break
            else:
                last_error = f"AI response has empty essential fields after Pydantic validation (Att {attempt + 1})."
                ai_puzzle_pydantic = None
            logging.warning(last_error)
            if attempt < MAX_RETRIES - 1:
                time.sleep(1.5**attempt)

        except json.JSONDecodeError as json_err:
            last_error = f"OpenAI output was not valid JSON (Att {attempt + 1}): {json_err}. Content: '{raw_response_content[:200]}...'"
            logging.error(last_error)
        except Exception as e:
            last_error = f"Error processing OpenAI response (Att {attempt + 1}): {e}"
            logging.exception(last_error)
            if isinstance(e, BadRequestError) and e.body and "message" in e.body:
                logging.error(f"OpenAI BadRequestError details: {e.body['message']}")
        if attempt < MAX_RETRIES - 1:
            time.sleep(1.5**attempt)

    if not ai_puzzle_pydantic:
        logging.error(
            f"Failed to get valid structured puzzle from OpenAI. Last error: {last_error}"
        )
        return (
            jsonify(
                {
                    "error": "AI service failed to generate puzzle.",
                    "details": last_error,
                }
            ),
            500,
        )

    original_description = ai_puzzle_pydantic.puzzle_description
    restructured_description = restructure_code_puzzle_description_if_needed(
        original_description
    )
    final_puzzle_description = restructured_description
    if restructured_description != original_description:
        logging.info("Puzzle description restructured by wrapper.")
    else:
        logging.info("Puzzle description not significantly changed by wrapper.")

    validation_criteria_json_str = json.dumps(ai_puzzle_pydantic.validation_criteria)

    logging.debug(
        f"Data for new Puzzle object: Domain={ai_puzzle_pydantic.domain}, Diff={ai_puzzle_pydantic.difficulty}, Desc='{final_puzzle_description[:100]}...', Criteria='{validation_criteria_json_str}'"
    )

    try:
        new_puzzle = Puzzle(
            domain=ai_puzzle_pydantic.domain,
            difficulty=ai_puzzle_pydantic.difficulty,
            puzzle_description=final_puzzle_description,
            validation_criteria=validation_criteria_json_str,
            is_ai_generated=True,
        )
        db.session.add(new_puzzle)
        db.session.commit()
        logging.info(f"Saved puzzle ID {new_puzzle.puzzle_id} to DB.")
        client_response_payload = {
            "puzzle_id": new_puzzle.puzzle_id,
            "domain": new_puzzle.domain,
            "difficulty": new_puzzle.difficulty,
            "puzzle_description": new_puzzle.puzzle_description,
            "is_ai_generated": new_puzzle.is_ai_generated,
            "created_at": (
                new_puzzle.created_at.isoformat() if new_puzzle.created_at else None
            ),
        }
        return jsonify(client_response_payload), 200
    except Exception as e:
        db.session.rollback()
        logging.exception("Error saving puzzle to DB")
        return jsonify({"error": "Failed to save puzzle."}), 500


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
    Your output MUST be a JSON object conforming to the schema: {{"hint_text": "string"}}
    """
    logging.debug(
        f"--- Sending Hint Prompt to OpenAI (Model: {OPENAI_MODEL_NAME}, Temp: {HINT_TEMPERATURE}) ---:\nUser Message: {hint_prompt_content[:500]}...\n---"
    )
    ai_hint_pydantic: Optional[AIHintResponse] = None
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
                        "content": "You are a helpful hint generation assistant. Your output MUST be a JSON object with a single key 'hint_text'.",
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

            parsed_json_data = json.loads(raw_response_content)
            ai_hint_pydantic = AIHintResponse.model_validate(parsed_json_data)

            if ai_hint_pydantic.hint_text.strip():
                logging.info(f"Hint generated by OpenAI (Att {attempt + 1}).")
                return ai_hint_pydantic.hint_text
            else:
                last_error = f"AI returned empty hint_text (Att {attempt + 1})."
                ai_hint_pydantic = None
            logging.warning(last_error)
            if attempt < HINT_GENERATION_RETRIES - 1:
                time.sleep(1)
        except json.JSONDecodeError as json_err:
            last_error = f"OpenAI hint output was not valid JSON (Att {attempt + 1}): {json_err}. Content: '{raw_response_content[:200]}...'"
            logging.error(last_error)
        except Exception as e:
            last_error = (
                f"Error processing OpenAI hint response (Att {attempt + 1}): {e}"
            )
            logging.exception(last_error)
        if attempt < HINT_GENERATION_RETRIES - 1:
            time.sleep(1)
    if not ai_hint_pydantic:
        logging.error(f"Failed to get hint from OpenAI. Last error: {last_error}")
    return None


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
        if not puzzle or not player:
            return jsonify({"error": "Puzzle/Player not found"}), 404
        progress = PlayerProgress.query.filter_by(
            player_id=player_id, puzzle_id=puzzle_id
        ).first()
        if not progress:
            progress = PlayerProgress(
                player_id=player_id, puzzle_id=puzzle_id, attempts=0
            )
            db.session.add(progress)
            db.session.commit()

        is_correct, feedback = False, "Incorrect."
        validation_criteria_dict: Optional[Dict[str, Any]] = None
        if puzzle.validation_criteria:
            try:
                validation_criteria_dict = json.loads(puzzle.validation_criteria)
            except json.JSONDecodeError:
                logging.warning(
                    f"Failed to parse validation_criteria JSON from DB for Q{puzzle_id}: '{puzzle.validation_criteria[:100]}...'"
                )

        if validation_criteria_dict and isinstance(validation_criteria_dict, dict):
            val_res, fb_eval = validate_structured_criteria(
                validation_criteria_dict, user_answer
            )
            if val_res is not None:
                is_correct, feedback = val_res, fb_eval
            else:
                feedback = fb_eval
        else:
            logging.warning(
                f"Falling back to legacy validation for Q{puzzle_id} as structured criteria was not a valid dict."
            )
            is_correct, feedback = validate_legacy_criteria(
                puzzle.validation_criteria, user_answer
            )

        if progress.status != "solved":
            progress.attempts += 1
        progress.last_attempted_at = datetime.now(timezone.utc)  # Corrected
        current_hint = progress.hint_text
        if is_correct:
            if progress.status != "solved":
                progress.status = "solved"
                progress.solved_at = datetime.now(timezone.utc)  # Corrected
            logging.info(f"P{player_id} solved Q{puzzle_id} (Att {progress.attempts}).")
        else:
            logging.info(
                f"P{player_id} incorrect Q{puzzle_id} (Atts: {progress.attempts})."
            )
            if (
                progress.status != "solved"
                and progress.attempts >= HINT_REQUEST_THRESHOLD
                and not progress.hint_text
            ):
                gen_hint = generate_hint_for_puzzle(puzzle, str(user_answer))
                if gen_hint:
                    progress.hint_text = gen_hint
                    progress.hint_requested_at = datetime.now(timezone.utc)  # Corrected
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
            f"Error in validate_answer P:{player_id} Q:{puzzle_id if 'puzzle_id' in locals() else 'Unknown'}"
        )
        return jsonify({"error": "Internal error during validation."}), 500


if __name__ == "__main__":
    with app.app_context():
        try:
            from sqlalchemy import inspect as sa_inspect

            inspector = sa_inspect(db.engine)
            if not all(
                [
                    inspector.has_table(t.__tablename__)
                    for t in [Player, Puzzle, PlayerProgress]
                ]
            ):
                logging.warning(
                    "One or more database tables might not exist. Run init_database.py first."
                )
        except Exception as e:
            logging.error(
                f"Error checking database tables: {e}. Ensure DB file exists and is accessible."
            )
    app.run(host="0.0.0.0", port=5000, debug=True)
