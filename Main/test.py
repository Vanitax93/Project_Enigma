import requests
import json

# --- Configuration ---
# URL of running Flask server's endpoint
API_URL = "http://127.0.0.1:5000/generate_puzzle"

# Data to send in the request body
payload = {
    "domain": "Backend",
    "difficulty": "Easy"
}

headers = {
    "Content-Type": "application/json"
}

# --- Send the Request ---
print(f"Sending POST request to {API_URL} with data:")
print(json.dumps(payload, indent=2)) # Pretty print the JSON payload

try:
    # Make the POST request
    response = requests.post(API_URL, headers=headers, json=payload)

    # --- Process the Response ---
    print(f"\nStatus Code: {response.status_code}")

    try:
        # Attempt to parse the JSON response
        response_data = response.json()
        print("\nResponse JSON:")
        print(json.dumps(response_data, indent=2)) # Pretty print the response JSON
    except json.JSONDecodeError:
        # If response is not valid JSON, print the raw text
        print("\nResponse Text (Not valid JSON):")
        print(response.text)

except requests.exceptions.RequestException as e:
    print(f"\nAn error occurred during the request: {e}")

