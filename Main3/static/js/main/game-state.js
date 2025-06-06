// game-state.js
// Defines and manages the global state for Terminal Enigma.

// --- Global State Variables ---
// Using 'var' for broader compatibility across potentially older script patterns,
// though 'let' would work if all modifications happen via functions or after declaration.
var currentDifficulty = null;
var currentMode = null;
var currentRiddleIndex = 0;
var currentPlayerId = null;
var candidateName = "Candidate"; // Default name
var startTime = null;
var timerInterval = null;
var finalTimeMs = 0;
var discoveredLore = [];
var speechEnabled = false; // Optional: For speech synthesis control

// Default completion status structure
const defaultCompletionStatus = {
    easy: { frontend: false, backend: false, database: false },
    hard: { frontend: false, backend: false, database: false },
    nightmare: { frontend: false, backend: false, database: false }
};
// Initialize completionStatus with a deep copy of the default
var completionStatus = JSON.parse(JSON.stringify(defaultCompletionStatus));

// Landing page lore hint text
const LANDING_LORE = "<span class='lore-hint' onclick='showLoreModal(this.dataset.lore)' data-lore=\"They watch. Every keystroke, every pause. Is this test... or assimilation?\">assimilation</span>?";


// --- State Management Functions ---

/**
 * Loads game state (completion status, lore) from localStorage.
 */
function loadGameState() {
    console.log("Loading game state from localStorage...");

    // Load Lore
    const storedLore = localStorage.getItem('enigmaLore');
    if (storedLore) {
        try {
            const parsedLore = JSON.parse(storedLore);
            if (Array.isArray(parsedLore)) {
                discoveredLore = parsedLore;
                console.log("Loaded discovered lore:", discoveredLore.length, "items");
            } else {
                 console.warn("Stored lore was not an array. Resetting.");
                 discoveredLore = [];
            }
        } catch (e) { console.error("Error parsing stored lore:", e); discoveredLore = []; }
    } else {
        discoveredLore = []; // Initialize if not found
    }

    // Load Completion Status
    const storedStatus = localStorage.getItem('enigmaCompletionStatus');
    if (storedStatus) {
        try {
            const parsedStatus = JSON.parse(storedStatus);
            // Merge loaded status with default structure to prevent errors if structure changes
            completionStatus.easy = { ...defaultCompletionStatus.easy, ...(parsedStatus.easy || {}) };
            completionStatus.hard = { ...defaultCompletionStatus.hard, ...(parsedStatus.hard || {}) };
            completionStatus.nightmare = { ...defaultCompletionStatus.nightmare, ...(parsedStatus.nightmare || {}) };
             // Validate boolean values after merging
            for(const diff in completionStatus) {
                if (!completionStatus[diff]) continue;
                for(const mode in completionStatus[diff]) {
                    if(typeof completionStatus[diff][mode] !== 'boolean') {
                        completionStatus[diff][mode] = false; // Reset invalid entries
                    }
                }
            }
            console.log("Loaded and validated completion status:", completionStatus);
        } catch (e) {
            console.error("Error parsing completion status, using defaults:", e);
            completionStatus = JSON.parse(JSON.stringify(defaultCompletionStatus));
            localStorage.removeItem('enigmaCompletionStatus'); // Clear corrupted data
        }
    } else {
         console.log("No stored completion status found. Using defaults.");
         completionStatus = JSON.parse(JSON.stringify(defaultCompletionStatus));
    }
}

/**
 * Saves the current completion status to localStorage.
 */
function saveCompletionStatus() {
    try {
        localStorage.setItem('enigmaCompletionStatus', JSON.stringify(completionStatus));
        console.log("Completion status saved:", completionStatus);
    } catch (e) {
        console.error("Error saving completion status to localStorage:", e);
    }
}

/**
 * Saves the discovered lore array to localStorage.
 */
function saveDiscoveredLore() {
     try {
         localStorage.setItem('enigmaLore', JSON.stringify(discoveredLore));
         // console.log("Discovered lore saved."); // Less verbose logging
     } catch (e) {
         console.error("Error saving lore to localStorage:", e);
     }
}

/**
 * Tracks a newly discovered lore fragment.
 * @param {string} loreText - The lore text discovered.
 */
function trackLoreDiscovery(loreText) {
    if (!loreText) return;
    // Use escaped text for storage/comparison if lore comes from HTML attributes
    const escapedLore = escapeHtmlAttribute(loreText); // Assumes escapeHtmlAttribute is available globally
    if (!discoveredLore.includes(escapedLore)) {
        discoveredLore.push(escapedLore);
        saveDiscoveredLore(); // Save immediately after discovery
        console.log(`Lore discovered and saved: ${loreText.substring(0, 30)}...`);
    }
}

console.log("Game State Manager Initialized."); // Log successful loading of this file


async function registerOrLoginPlayer() {
    // candidateName is a global variable from game-state.js
    if (typeof candidateName === 'undefined' || !candidateName) {
        console.error("Candidate name is not set.");
        return null;
    }

    try {
        const response = await fetch('http://localhost:5000/players', { // If backend runs on port 5000
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: candidateName }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Player registered/logged in:", data);
            // currentPlayerId is a new global variable in game-state.js
            if (typeof currentPlayerId !== 'undefined') {
                currentPlayerId = data.player_id;
                return data.player_id;
            } else {
                console.error("Global variable 'currentPlayerId' is not defined.");
                return null;
            }
        } else if (response.status === 409) { // Username already exists
            console.log("Player already exists, fetching ID.");
            // Need an endpoint to get player by username, or modify /players to return existing if POSTed again.
            // For now, let's assume we need to add a GET /players/username/:username endpoint to app.py
            // OR, we can simplify: if 409, try to login (which isn't explicitly there but /players POST is idempotent-like for creation)
            // For simplicity, let's assume the /players POST is sufficient or we add a GET route.
            // If the user exists, the create_player endpoint currently returns an error.
            // A robust solution would be to have a dedicated login or get_player_by_username endpoint.
            // For now, we'll rely on a successful creation or a new attempt if the game restarts.
            // To handle existing users properly, app.py's /players endpoint could be modified
            // to return the existing player's data if a 409 would occur.
            // Let's assume for now this part is handled or you'll adjust app.py to return existing user data on POST if exists.
            // A simple way for app.py:
            // existing_player = Player.query.filter_by(username=username).first()
            // if existing_player: return jsonify(existing_player.to_dict()), 200
            // ... else create new ...
            // This is a placeholder for robust login.
            alert(`Username ${candidateName} already taken or error. Try a different name or check backend.`);
            return null;
        } else {
            console.error("Error registering player:", data.error);
            alert(`Error registering player: ${data.error}`);
            return null;
        }
    } catch (error) {
        console.error("Network error registering player:", error);
        alert("Network error. Ensure backend is running and accessible.");
        return null;
    }
}
