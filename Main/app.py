import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import logging
import json
import time # for retries

# --- Configuration & Setup ---

# Load .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


app = Flask(__name__)

MAX_RETRIES = 3 #  if JSON parsing fails
OUTPUT_FILE = "generated_puzzles.jsonl" # (not needed?) JSON Lines format
GENERATION_TEMPERATURE = 0.75 # Controls randomness (0=deterministic, >1=more random)

# --- AI Setup ---

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')

if not GOOGLE_API_KEY:
    logging.error("GOOGLE_API_KEY not found in environment variables.")
    exit() # Or raise an exception

model = None # Initialize model as None
try:
    # Configure the generative AI library
    genai.configure(api_key=GOOGLE_API_KEY)

    # Attempt to initialize the desired Pro model (use known valid names)
    try:
        # Have to play around with 2.5 but 1.5 seems more stable for testing
        model_name = 'gemini-1.5-pro-latest'
        model = genai.GenerativeModel(model_name)
        logging.info(f"Google Generative AI configured successfully with model: {model_name}")
    except Exception as pro_model_error:
        logging.warning(f"Could not initialize {model_name}: {pro_model_error}. Falling back to gemini-1.5-flash.")
        try:
            model_name = 'gemini-1.5-flash' # Fallback model
            model = genai.GenerativeModel(model_name)
            logging.info(f"Google Generative AI configured successfully with fallback model: {model_name}")
        except Exception as flash_model_error:
             logging.error(f"Failed to initialize fallback model {model_name}: {flash_model_error}")
             raise flash_model_error # Re-raise if fallback also fails

except Exception as e:
    logging.error(f"Error configuring Google Generative AI: {e}")
    # model remains None if configuration fails

# --- Helper Function ---

def save_puzzle_to_file(puzzle_data, filename):
    """Appends a puzzle dictionary to a JSON Lines file."""
    try:
        # Open the file in append mode, creating it if it doesn't exist
        with open(filename, 'a', encoding='utf-8') as f:
            # Dump the dictionary as a JSON string on a new line
            json.dump(puzzle_data, f)
            f.write('\n') # Add a newline to separate JSON objects
        logging.info(f"Successfully saved puzzle to {filename}")
    except IOError as e:
        logging.error(f"Error saving puzzle to file {filename}: {e}")
    except Exception as e:
        logging.error(f"An unexpected error occurred while saving puzzle to file: {e}")


# --- API Endpoints ---

@app.route('/')
def home():
    """Basic route to check if the server is running."""
    return jsonify({"status": "Backend server is running!"}), 200

@app.route('/generate_puzzle', methods=['POST'])
def generate_puzzle():
    """
    API endpoint to generate a new puzzle Gemini.
    Expects JSON payload with 'domain' and 'difficulty'.
    Returns a structured JSON puzzle object. Retries on JSON parsing failure.
    Saves successful generations to a file.
    Example Request Body: {"domain": "AI Engineering", "difficulty": "Hard"}
    """
    if model is None:
         return jsonify({"error": "Generative AI model not initialized"}), 503 # Service Unavailable

    # Get data from the incoming JSON request
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400

        domain = data.get('domain')
        difficulty = data.get('difficulty')

        # Validate input domains if necessary
        valid_domains = ["Frontend", "Backend", "Database", "AI Engineering"]
        if domain not in valid_domains:
             return jsonify({"error": f"Invalid domain specified. Must be one of: {valid_domains}"}), 400

        if not domain or not difficulty:
            return jsonify({"error": "Missing 'domain' or 'difficulty' in request body"}), 400

        logging.info(f"Received request to generate puzzle: Domain='{domain}', Difficulty='{difficulty}'")

    except Exception as e:
        logging.error(f"Error parsing request JSON: {e}")
        return jsonify({"error": "Invalid JSON payload"}), 400

    # --- Prompt Construction ---

    difficulty_guidance = ""
    if difficulty.lower() == 'easy':
        difficulty_guidance = "Focus on very basic syntax, common built-in functions, or simple 'what does this code do?' questions. For example, asking how to print to console, declare a variable, identify the purpose of a simple loop, or basic HTML structure/CSS selectors. Provide variety and avoid simple 'Hello World' examples if possible."
    elif difficulty.lower() == 'medium':
        difficulty_guidance = "Ask for implementation of a slightly more complex function, application of a common pattern (like event handling in Frontend, basic API routing in Backend, simple JOIN in Database), or explanation of a core concept with a small code example. Ensure variety in the concepts tested."
    elif difficulty.lower() == 'hard':
        difficulty_guidance = "Delve into more complex algorithms, handling edge cases, performance considerations, security aspects (like SQL injection prevention for Database/Backend), asynchronous operations, or deeper conceptual understanding related to the domain. Provide diverse and challenging scenarios."

    prompt = f"""
    You are an expert creator of coding puzzles and technical questions designed to test a developer's knowledge in specific domains.
    Generate a single, self-contained, and VARIED puzzle for the domain '{domain}' at a '{difficulty}' difficulty level. Avoid repeating the exact same puzzle concept if possible, especially simple ones like basic console output.

    {difficulty_guidance}

    The puzzle should be practical and test knowledge relevant to the specified domain and difficulty. It might involve writing a small code snippet, completing code, identifying a bug, explaining a concept with code, or answering a specific technical question.

    Provide the puzzle description clearly, including any necessary code context or setup. Format code examples clearly using standard markdown code fences (```) where appropriate.

    Crucially, also provide clear and specific validation_criteria that can be used by a separate system to check if a user's submitted answer or code snippet is correct.
    The criteria should focus on expected outputs, specific function behaviors, key concepts that must be mentioned, or exact code syntax if applicable.
    Do NOT include criteria that require executing arbitrary user code directly.

    Return the result ONLY as a single, valid JSON object (do not include ```json markdown tags around the final JSON object itself) with the following exact keys:
    - "puzzle_description": (string) The text of the puzzle/question, including any setup or context needed.
    - "domain": (string) The domain provided: '{domain}'.
    - "difficulty": (string) The difficulty provided: '{difficulty}'.
    - "validation_criteria": (string) A clear description of how to validate the answer (e.g., "The submitted code must produce the output 'X' for input 'Y'.", "The explanation must accurately define 'term Z'.", "The CSS selector must target only the specified elements.").
    """

    # --- Call the LLM API with Retries ---
    puzzle_data = None
    last_error = None

    # Define generation config, including temperature
    generation_config = genai.types.GenerationConfig(
        temperature=GENERATION_TEMPERATURE
        # Maybe add other parameters here, e.g: max_output_tokens
    )

    for attempt in range(MAX_RETRIES):
        logging.info(f"Attempt {attempt + 1}/{MAX_RETRIES} to call Google Generative AI (Temp: {GENERATION_TEMPERATURE})...")
        try:
            # Makes the API call
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )
            logging.debug(f"Raw AI Response Text (Attempt {attempt + 1}): {response.text}") # Log raw response

            # --- Process the Response as JSON ---
            try:
                # Attempt to parse the response text as JSON
                parsed_data = json.loads(response.text)

                # Basic validation
                required_keys = ["puzzle_description", "domain", "difficulty", "validation_criteria"]
                if not all(key in parsed_data for key in required_keys):
                    # Log the problematic data before raising error
                    logging.warning(f"LLM response missing required keys. Response: {parsed_data}")
                    raise ValueError("LLM response JSON missing required keys.")

                # If parsing and validation succeed, store data and break the loop
                puzzle_data = parsed_data
                logging.info(f"Successfully parsed JSON response from AI on attempt {attempt + 1}.")
                break # Exit on success

            except (json.JSONDecodeError, ValueError) as parse_err:
                # Log parsing/validation errors
                last_error = f"Failed to parse/validate JSON on attempt {attempt + 1}: {parse_err}. Raw response: '{response.text[:200]}...'" # Log snippet of raw response
                logging.warning(last_error)
                # Add a small delay before retrying (not needed?)
                if attempt < MAX_RETRIES - 1:
                    time.sleep(1)

        except Exception as api_err:
            # Catch errors during the API call itself
            last_error = f"Error during Google Generative AI call on attempt {attempt + 1}: {api_err}"
            logging.error(last_error)
            # Optional: Add a small delay before retrying
            if attempt < MAX_RETRIES - 1:
                time.sleep(1)

    # --- Handle Final Result ---
    if puzzle_data:
        # --- Save successful puzzle data to file ---
        save_puzzle_to_file(puzzle_data, OUTPUT_FILE)
        logging.info("Returning successfully generated puzzle data.")
        return jsonify(puzzle_data), 200
    else:
        # If all retries failed, log the final error and return a server error
        logging.error(f"Failed to get valid puzzle data after {MAX_RETRIES} attempts. Last error: {last_error}")
        # error message for the client
        client_error = "AI service failed to return valid data after multiple attempts."
        if last_error and ("JSONDecodeError" in last_error or "ValueError" in last_error):
             client_error = "AI service returned invalid JSON format after multiple attempts."

        # Return a server error to the client, but log the details
        return jsonify({"error": client_error}), 500

# --- Main Execution ---

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
