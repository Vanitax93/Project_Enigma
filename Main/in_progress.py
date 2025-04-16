@app.route('/validate_answer', methods=['POST'])
def validate_answer():
    """
    API endpoint to validate user's answer.
    Expects JSON payload with 'user_answer' and 'validation_criteria'.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON payload"}), 400

        user_answer = data.get('user_answer')
        validation_criteria = data.get('validation_criteria')

        if user_answer is None or validation_criteria is None: # Check for None explicitly
            return jsonify({"error": "Missing 'user_answer' or 'validation_criteria' in request body"}), 400

        logging.info(f"Received validation request. Criteria: '{validation_criteria[:100]}...'") # Log snippet
        logging.debug(f"User Answer: {user_answer}")

    except Exception as e:
        logging.error(f"Error parsing validation request JSON: {e}")
        return jsonify({"error": "Invalid JSON payload"}), 400

    # --- Validation Logic Implementation ---
    is_correct = False
    feedback = "Validation logic not implemented yet." # Default feedback

    try:
        # Strategy A: Exact String Match (Example)
        # needs more parsing of the criteria string
        if "must be exactly" in validation_criteria.lower():
            # Extract the expected answer
            # E.g: if criteria is "The answer must be exactly \"Hello World!\"."
            try:
                # VERY basic extraction - likely needs better parsing
                expected_answer = validation_criteria.split('"')[1]
                if user_answer.strip() == expected_answer:
                    is_correct = True
                    feedback = "Exact match found."
                else:
                    feedback = f"Incorrect. Expected '{expected_answer}'."
            except IndexError:
                feedback = "Could not parse expected answer from criteria for exact match."
                logging.warning(f"Could not parse exact answer from: {validation_criteria}")

        # Strategy B: Keyword Checking (Example)
        elif "must mention" in validation_criteria.lower():
            # Extract keywords (again, needs better parsing)
            try:
                 # Example: if criteria is "must mention 'concept Z'"
                keywords = [kw.strip("'\"") for kw in validation_criteria.split("mention")[1].split("and")]
                keywords = [kw.strip() for kw in keywords] # Clean up whitespace
                missing_keywords = [kw for kw in keywords if kw.lower() not in user_answer.lower()]
                if not missing_keywords:
                    is_correct = True
                    feedback = f"All required keywords found: {keywords}"
                else:
                    feedback = f"Incorrect. Missing required keywords: {missing_keywords}"
            except Exception as key_err:
                 feedback = "Could not parse keywords from criteria."
                 logging.warning(f"Could not parse keywords from: {validation_criteria} - {key_err}")


        # Strategy D: AI-Assisted Validation
        # elif "explanation must accurately define" in validation_criteria.lower() or some other complex case:
        #    logging.info("Attempting AI-Assisted Validation...")
        #    # TO DO: Implement call to LLM API here
        #    # Send puzzle_description (need to pass this from frontend too, or get via puzzle ID),
        #    # validation_criteria, and user_answer to the LLM.
        #    # Parse the correct/incorrect response.
        #    # is_correct = ... (based on LLM response)
        #    # feedback = ... (based on LLM explanation)
        #    feedback = "AI validation not implemented."
        #    pass

        else:
            # Default case if no specific strategy matches the criteria text
            logging.warning(f"No specific validation strategy matched for criteria: {validation_criteria}")
            # Optionally attempt AI validation as a fallback?
            feedback = "Could not determine validation method based on criteria."


        # --- Respond to Frontend ---
        logging.info(f"Validation result: {'Correct' if is_correct else 'Incorrect'}")
        return jsonify({
            "correct": is_correct,
            "feedback": feedback # Provide some feedback
            }), 200

    except Exception as e:
        logging.error(f"Error during validation logic: {e}")
        # logging.exception("Detailed validation error:") # Uncomment for detailed stack trace
        return jsonify({"error": "An internal error occurred during answer validation."}), 500


