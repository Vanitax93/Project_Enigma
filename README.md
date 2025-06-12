# Project: Enigma - AI Infused Edition

## Overview

Project: Terminal Enigma is an interactive web-based puzzle game designed to challenge users with a variety of riddles across different technical domains. This version integrates AI-generated puzzles, offering a dynamic and ever-expanding challenge. Players navigate through different specializations (Frontend, Backend, Database) and difficulty levels, including a new "AI Generated Calibration" mode. The game features a retro terminal aesthetic, lore fragments, and progressive environmental effects based on player achievements.

## Features

* **Multiple Specializations:** Puzzles themed around Frontend, Backend, and Database concepts.
* **Static Riddle Paths:** Pre-defined riddles for Easy, Hard, and challenging Nightmare modes.
* **AI-Generated Puzzles:**
    * Dynamic puzzle generation via OpenAI's GPT-4o-mini model.
    * Covers domains: Frontend, Backend, Database, and AI Engineering.
    * Supports difficulties: Easy, Medium, Hard.
    * AI-generated hints for challenging puzzles.
* **Interactive Puzzles:** Some riddles include interactive elements directly in the UI.
* **Player Progress Tracking:** Backend stores player creation and puzzle attempts/solutions for AI challenges.
* **Lore System:** Discoverable log fragments that unveil a background narrative.
* **Dynamic UI:**
    * Retro terminal aesthetic.
    * Progressive "corruption" visual effects based on game completion.
    * Dynamic audio and informational content on the landing page.
* **Secure Terminal Simulation:** A separate terminal interface with simulated login, commands, and filesystem for advanced players to uncover more lore (accessed after certain game milestones).
* **Speech Synthesis (Optional):** For auditory feedback on riddle text and game events.

## Tech Stack

**Frontend:**

* HTML5
* CSS3 (custom styling for terminal aesthetic)
* JavaScript (ES6+)
    * Custom MD5 hashing for static riddle answer checking.
    * Showdown.js or Marked.js for Markdown rendering.
* VT323 Google Font

**Backend:**

* Python 3
* Flask (Web framework)
* Flask-SQLAlchemy (ORM for database interaction)
* Flask-CORS (Cross-Origin Resource Sharing)
* OpenAI Python Client (for GPT-4o-mini API interaction)
* SQLite (Default database for player progress and AI puzzles)
* python-dotenv (For managing environment variables)

## Project Structure (Key Files)
```bash
 app.py                     
Main32 Flask backend server, API endpoints|-- init_database.py           
Script to initialize the database schema|-- requirements.txt           
Python dependencies|-- .env                       
Environment variables (OpenAI API Key, DB URI - NOT COMMITTED)||-- static/                    
(Assumed location for CSS, JS, assets if not served directly)|   |-- style.css              
Main32 game styling|   |-- terminalstyle.css      
Styling for the secure terminal|   |-- game-logic.js          
Core frontend game logic|   |-- game-state.js          
Frontend global state management|   |-- ui-manager.js          
Frontend UI manipulation and effects|   |-- riddle-data.js         
Static riddle content|   |-- nightmare-riddles.js   
Nightmare mode riddles|   |-- terminalscript.js      
Logic for the secure terminal |-- terminal_filesystem.js |-- chat-sequences.js      
Chat dialogue logic|   |-- md5.min.js             
MD5 hashing library|   |-- (audio files .wav)     
Sound assets|   |-- (images) |-- templates/                 
           
Main32 game page| index.html |-- terminal.html          
Secure terminal page| -- (other HTML files for lore, intros, etc.)|-- enigma_progress.db         
SQLite database file (created by init_database.py)|-- README.md                  

```
## Setup and Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/Vanitax93/Project_Enigma
    cd Project_Enigma
    ```

2.  **Backend Setup:**
    1.  **Create a Python Virtual Environment:**
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        ```
    2.  **Install Dependencies:**
        ```bash
        pip install -r requirements.txt
        ```
    3.  **Set up Environment Variables:**
        Create a `.env` file in the root directory and add your OpenAI API key:
        ```
        OPENAI_API_KEY="your_openai_api_key_here"
        # Optional: FLASK_APP=app.py
        # Optional: FLASK_ENV=development
        ```
    4.  **Initialize the Database:**
        Run the database initialization script once:
        ```bash
        python init_database.py
        ```
        This will create the `enigma_progress.db` file with the necessary tables.

3.  **Frontend Setup:**
    * Ensure all HTML, CSS, and JavaScript files are in their correct locations (e.g., a `static` folder or served appropriately).
    * If you decide to use a local Markdown library, download it and update the script tags in `index.html`.

4.  **Running the Application:**
    1.  **Start the Flask Backend Server:**
        ```bash
        flask run
        # Or: python app.py
        ```
        The backend will typically run on `http://127.0.0.1:5000/`.
    2.  **Open the Frontend:**
        Open the `index.html` file in your web browser. You might need to serve it through a local web server if you encounter CORS issues with direct file access, or ensure Flask is configured to serve it. For development, live server extensions in code editors are also useful.

## How to Play / Use

1.  **Launch:** Open `index.html` in your browser after starting the backend server.
2.  **Enter Handle:** Provide a username/handle.
3.  **Select Pathway & Difficulty:**
    * **Standard Paths:** Choose a specialization (Frontend, Backend, Database) and a difficulty (Easy, Hard).
    * **Nightmare Protocol:** Unlocked after completing all Hard paths.
    * **AI Generated Calibration:** Select this pathway, then choose a specific AI Domain (Frontend, Backend, Database, AI Engineering) and a difficulty (Easy, Medium, Hard).
4.  **Solve Riddles:**
    * Read the riddle text carefully.
    * For AI puzzles, the description might include Markdown formatting (code blocks, lists, etc.).
    * Input your answer. For code-based AI puzzles, this might be a code snippet or a textual explanation.
    * Submit your answer.
5.  **Progression:**
    * Correct answers allow you to proceed.
    * For AI puzzles, incorrect answers might provide hints after several attempts.
    * Discover lore fragments and observe changes in the game's environment.
6.  **Secure Terminal:** Access the terminal after meeting certain game criteria (e.g., completing the Easy Final challenge) for more lore and challenges.

## Future Enhancements / Ideas

* **Advanced Frontend:**
    * Implement a robust Markdown rendering library (e.g., Showdown.js, Marked.js) for AI puzzle descriptions.
    * More sophisticated UI for AI domain/difficulty selection, perhaps with visual cues or descriptions for each domain.
    * Visual loading indicators (spinners, progress bars) during API calls to the backend (puzzle generation, validation).
    * More user-friendly error messages and handling on the frontend.
* **Backend Improvements:**
    * Asynchronous task handling (e.g., using Celery with Redis/RabbitMQ) for OpenAI API calls, especially if puzzle generation or hint generation becomes time-consuming. This would prevent the main Flask thread from blocking.
    * More diverse and context-aware puzzle generation prompts for the AI.
    * User authentication (e.g., Flask-Login, JWT) to allow players to save progress across devices/sessions securely.
    * Expand database models to store more detailed analytics or user preferences.
* **Gameplay & Content:**
    * **Leaderboards:** For AI challenge scores or completion times.
    * **Varied AI Puzzle Types:** Beyond text/code, explore image-based puzzles (if using a multimodal AI), logic puzzles, or scenario-based problems.
    * **Adaptive Difficulty:** AI could adjust puzzle difficulty based on player performance.
    * **Interactive Lore:** Make lore fragments more interactive, perhaps unlocking new game areas or functionalities.
    * **AI Puzzle Persistence:** Allow users to save their progress on a specific AI-generated puzzle and return to it later.
    * **Multiplayer/Collaborative Puzzles:** (Ambitious) Allow players to tackle complex AI puzzles together.
* **Technical & Deployment:**
    * **Containerization:** Use Docker and Docker Compose for easier setup and deployment.
    * **Cloud Deployment:** Deploy to platforms like Heroku, AWS, Google Cloud, or Azure.
    * **Testing:** Implement unit tests for the backend and potentially end-to-end tests for the frontend.

---

Thank you for reading!