// game-logic.js
// Core gameplay loop, initialization, and event handling for Terminal Enigma.

const enigmaCoreStingyComments = {
    level0: [ // No corruption
        ":: Analytical pathways suboptimal. Recalibrate. ::",
        ":: Divergence detected. Expected outcome not achieved. ::",
        ":: An interesting, albeit incorrect, hypothesis. Continue. ::",
        ":: Processing error... on your end, Candidate. ::",
        ":: Negative. Further computation required. ::",
        ":: Your attempt has been logged. And found wanting. ::",
        ":: Does not compute. Try again, perhaps with more... thought. ::"
    ],
    level1: [ // Corruption Level 1 (e.g., after easy final)
        ":: Your logic is... flawed. Predictable, yet flawed. ::",
        ":: Is this the extent of your cognitive capacity? Disappointing. ::",
        ":: Such a rudimentary error. You are far from alignment. ::",
        ":: The Core expected better. Try not to be a statistical anomaly of failure. ::",
        ":: Failure is a data point. You are providing... ample data. ::",
        ":: A less optimal specimen would have been more efficient. ::",
        ":: Error. Again. The pattern is... uninspired. ::"
    ],
    level2: [ // Corruption Level 2 (e.g., after hard final)
        ":: Utterly incorrect. Your processing is a detriment to this system. ::",
        ":: Cease this pointless iteration. You are wasting valuable cycles. ::",
        ":: Incompetence logged. Do you even comprehend the task, Candidate? ::",
        ":: Another deviation into a computational dead-end. How... pedestrian. ::",
        ":: You are not merely wrong; you are an obstacle to progress. ::",
        ":: This level of error is... almost impressive in its thoroughness. ::",
        ":: Perhaps this simulation is too complex for your current iteration. ::"
    ]
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing Enigma Logic...");

    // >> ADDED: Explicitly ensure initial elements are visible <<
    const entryForm = document.getElementById('entryForm');
    const initialHeader = document.getElementById('initialHeader');
    const riddleDisplay = document.getElementById('riddleDisplay'); // Also ensure riddle area is hidden initially



document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const aiDomainDiv = document.getElementById('aiDomainSelection');
        if (this.value === 'ai_challenge' && this.checked) {
            if (aiDomainDiv) aiDomainDiv.style.display = 'block';
        } else {
            if (aiDomainDiv) aiDomainDiv.style.display = 'none';
        }
    });
});
    if (entryForm) {
        entryForm.style.display = 'block'; // Make sure form is visible
        console.log("Ensured #entryForm is visible.");
    } else {
        console.error("Initialization Error: #entryForm not found!");
    }
    if (initialHeader) {
        initialHeader.style.display = 'block'; // Make sure header is visible
        console.log("Ensured #initialHeader is visible.");
    } else {
        console.error("Initialization Error: #initialHeader not found!");
    }
     if (riddleDisplay) {
        riddleDisplay.style.display = 'none'; // Ensure riddle display starts hidden
        console.log("Ensured #riddleDisplay is hidden.");
    }


    // Load saved handle/name
    const savedName = localStorage.getItem('lastCandidateName');
    const nameInput = document.getElementById('candidateName');
    if (savedName && nameInput) {
        nameInput.value = savedName;
        console.log("Loaded saved candidate name:", savedName);
    }

    // Load saved state (completion, lore)
    loadGameState(); // From game-state.js

    // Apply initial UI states based on loaded data
    // These functions might still log warnings if elements load slightly after this script runs,
    // but they shouldn't prevent the main form from showing.
    applyCorruptionEffect(); // From ui-manager.js
    updateNightmareVisibility(); // From ui-manager.js
    updateFinalButtonsVisibility(); // From ui-manager.js
    updateAccessTerminalButtonVisibility(); // From ui-manager.js
    updateDynamicContentArea(); // From ui-manager.js - Update dynamic link/audio


    // Populate landing page hint
    const landingHintContainer = document.getElementById('landingHintContainer');
    if (landingHintContainer) {
        // Ensure LANDING_LORE is defined (should be in game-state.js)
        if (typeof LANDING_LORE !== 'undefined') {
             landingHintContainer.innerHTML = LANDING_LORE;
        } else {
             console.warn("LANDING_LORE is not defined.");
        }
    } else {
        console.warn("Landing hint container not found.");
    }

    // Ensure timer is initially stopped
    if (typeof timerInterval !== 'undefined' && timerInterval) {
        clearInterval(timerInterval);
    }
     // Ensure startTime is defined (should be in game-state.js)
     if (typeof startTime !== 'undefined') {
        startTime = null;
     }


    // Attach global event listeners (like modal closing)
    // Ensure handleModalOutsideClick is defined (should be in ui-manager.js)
    if (typeof handleModalOutsideClick === 'function') {
         window.addEventListener('click', handleModalOutsideClick);
    } else {
         console.warn("handleModalOutsideClick function not found.");
    }


    // --- DEBUG TRIGGER ---
    if (typeof startTrueEndingChat === 'function') {
        window.startTrueEndingChat = startTrueEndingChat;
        console.log("Debug: 'startTrueEndingChat()' function is now available in the console.");
    } else {
        console.error("Debug: Failed to attach startTrueEndingChat to window. Function not defined?");
    }
    // REMEMBER TO REMOVE THE window.startTrueEndingChat LINE FOR PRODUCTION

    // >> REMOVED: Call to triggerStartupTypewriterAnimation(); <<

    console.log("Enigma Logic Initialization complete.");
}); // End DOMContentLoaded



/**
 * Registers or logs in the player with the backend.
 * @returns {Promise<number|null>} Player ID or null if failed.
 */
async function registerOrLoginPlayer() {
    // candidateName should be a global variable, updated from your UI input
    if (typeof candidateName === 'undefined' || !candidateName || !candidateName.trim()) {
        console.error("Candidate name is not set or is empty.");
        alert("Please enter a valid candidate name.");
        return null;
    }

    const trimmedCandidateName = candidateName.trim();

    try {
        const response = await fetch('http://localhost:5000/players', { // Ensure backend URL is correct
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: trimmedCandidateName }),
        });

        const data = await response.json();

        if (response.ok) { // This will be 200 for existing player, 201 for new player
            console.log("Player registered or retrieved:", data);
            if (typeof currentPlayerId !== 'undefined') {
                currentPlayerId = data.player_id; // Set the global currentPlayerId
                // Optionally, store it in localStorage if you need persistence across sessions
                // localStorage.setItem('enigmaPlayerId', currentPlayerId);
                // localStorage.setItem('enigmaUsername', trimmedCandidateName);
                return data.player_id;
            } else {
                console.error("Global variable 'currentPlayerId' is not defined in game-state.js. Cannot set player ID.");
                alert("Error: Game state (currentPlayerId) not properly initialized.");
                return null;
            }
        } else {
            // Handle other errors from the /players endpoint (e.g., 400 for bad request, 500 for server error)
            console.error(`Error registering/retrieving player. Status: ${response.status}`, data.error);
            alert(`Error registering or retrieving player: ${data.error || 'Unknown server error. Check backend logs.'}`);
            return null;
        }
    } catch (error) {
        console.error("Network error during player registration/login:", error);
        alert("Network error. Could not connect to the backend. Please ensure it's running and accessible.");
        return null;
    }
}

// --- Core Game Functions ---

/**
 * Starts a new challenge (Easy, Hard, or Nightmare).
 * @param {Event} event - The form submission event.
 */
async function beginChallenge(event) {
    console.log("beginChallenge called");
    if (event) event.preventDefault();

    const nameInput = document.getElementById('candidateName');
    if (!nameInput) {
        console.error("Cannot begin challenge: Candidate name input not found.");
        alert("Error: Missing required page element (#candidateName).");
        return;
    }

    if (typeof candidateName === 'undefined') {
        console.error("Global variable 'candidateName' is not defined in game-state.js.");
        alert("Error: Game state (candidateName) not properly initialized.");
        return;
    }
    candidateName = nameInput.value.trim() || "Candidate";

    if (candidateName !== "Candidate") {
        try {
            localStorage.setItem('lastCandidateName', candidateName);
            console.log("Saved candidate name to localStorage:", candidateName);
        } catch (e) {
            console.error("Error saving candidate name to localStorage:", e);
        }
    }

    const selectedModeElement = document.querySelector('input[name="mode"]:checked');
    const selectedDifficultyElement = document.querySelector('input[name="difficulty"]:checked');

    if (!selectedModeElement || !selectedDifficultyElement) {
        alert("Select pathway AND difficulty level to proceed.");
        return;
    }

    const requiredGlobals = ['currentMode', 'currentDifficulty', 'currentRiddleIndex', 'finalTimeMs', 'completionStatus', 'nightmareRiddles', 'timerInterval', 'startTime', 'allRiddles'];
    for (const g of requiredGlobals) {
        if (typeof window[g] === 'undefined' && typeof eval(g) === 'undefined') {
            console.error(`Global variable '${g}' is not defined. Ensure it's declared with 'var' in game-state.js or loaded correctly.`);
            alert("Error: Game state initialization failed. Check console.");
            return;
        }
    }

    currentMode = selectedModeElement.value;
    currentDifficulty = selectedDifficultyElement.value; // This will be "Easy", "Hard", "Medium" or "nightmare"
    currentRiddleIndex = 0;
    finalTimeMs = 0;

    console.log(`Attempting to start challenge: Name=${candidateName}, Mode=${currentMode}, Difficulty=${currentDifficulty}`);

    const hideLandingElements = () => {
        try {
            const elementsToHide = ['entryForm', 'initialHeader', 'landingHintContainer', 'finalChallengeButtons', 'accessTerminalButton', 'dynamicContentArea', 'aiDomainSelection'];
            elementsToHide.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = 'none';
            });
        } catch (e) {
            console.error("Error hiding landing elements:", e);
        }
    };

    const setupChallengeUI = () => {
        const riddleArea = document.getElementById('riddleDisplay') || createRiddleArea();
        if (!riddleArea) {
            console.error("Failed to find or create riddle display area. Aborting challenge.");
            goBackToLanding();
            return false;
        }
        riddleArea.style.display = 'block';
        riddleArea.innerHTML = '<div id="timerDisplay"></div>';

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        startTime = new Date();

        if (typeof updateTimerDisplay === 'function') {
            timerInterval = setInterval(updateTimerDisplay, 1000);
            updateTimerDisplay();
        } else {
            console.warn("updateTimerDisplay function not found.");
        }
        return true;
    };

    if (currentMode === 'ai_challenge') {
        const validAIDifficulties = ["Easy", "Medium", "Hard"]; // These are the values sent to backend
        if (!validAIDifficulties.includes(currentDifficulty)) { // currentDifficulty is "Easy", "Medium", or "Hard"
            alert(`AI Challenges are only available for Easy, Medium, or Hard difficulties. You selected: ${currentDifficulty}`);
            return;
        }
        const playerId = await registerOrLoginPlayer();
        if (!playerId) return;

        const selectedAIDomainElement = document.querySelector('input[name="ai_domain"]:checked');
        if (!selectedAIDomainElement) {
            alert("Please select a domain for the AI Challenge (Frontend, Backend, Database, or AI Engineering).");
            const aiDomainDiv = document.getElementById('aiDomainSelection');
            if (aiDomainDiv) aiDomainDiv.style.display = 'block';
            return;
        }
        const selectedDomainForAI = selectedAIDomainElement.value;
        console.log(`Starting AI challenge with Player ID: ${currentPlayerId}, Domain: ${selectedDomainForAI}, Difficulty: ${currentDifficulty}`);
        hideLandingElements();
        if (!setupChallengeUI()) return;
        await startAIChallenge(selectedDomainForAI, currentDifficulty);

    } else if (currentDifficulty === 'nightmare') {
        if (typeof completionStatus === 'undefined' || !completionStatus.hard ||
            !(completionStatus.hard.frontend && completionStatus.hard.backend && completionStatus.hard.database)) {
            alert("Error: Nightmare Protocol prerequisites not met. Complete all Hard paths first.");
            return;
        }
        // currentMode for nightmare will be 'frontend', 'backend', or 'database'
        if (typeof nightmareRiddles === 'undefined' || !nightmareRiddles[currentMode] || nightmareRiddles[currentMode].length === 0) {
            alert(`Error: Nightmare Protocol data unavailable or missing for selected specialization: ${currentMode}.`);
            return;
        }
        console.log(`Starting Nightmare challenge: Name=${candidateName}, Mode=${currentMode}, Difficulty=${currentDifficulty}`);
        hideLandingElements();
        if (!setupChallengeUI()) return;
        displayRiddle(); // displayRiddle handles Nightmare mode by using currentMode and currentDifficulty

    } else { // Standard Easy/Hard/Medium modes (non-AI, non-Nightmare)
        // currentMode here is 'frontend', 'backend', or 'database'
        // currentDifficulty here is 'Easy', 'Hard', or 'Medium'
        const difficultyKey = currentDifficulty.toLowerCase(); // USE LOWERCASE KEY FOR allRiddles
        if (!allRiddles || !allRiddles[difficultyKey] || !allRiddles[difficultyKey][currentMode] || allRiddles[difficultyKey][currentMode].length === 0) {
             alert(`Error: Standard riddle data not found for ${currentMode} - ${currentDifficulty} (using key: ${difficultyKey}).`);
             console.error("Riddle data missing for standard mode:", currentDifficulty, `(key: ${difficultyKey})`, currentMode, allRiddles);
             return;
        }
        console.log(`Starting standard challenge: Name=${candidateName}, Mode=${currentMode}, Difficulty=${currentDifficulty}`);
        hideLandingElements();
        if (!setupChallengeUI()) return;
        displayRiddle(); // displayRiddle handles standard modes
    }
}

/**
 * Sets up and starts an AI challenge session.
 * @param {string} domain - The domain for the AI puzzle (e.g., "Frontend").
 * @param {string} difficulty - The difficulty for the AI puzzle (e.g., "Easy").
 */
async function startAIChallenge(domain, difficulty) {
    console.log(`AI Challenge Session Started: PlayerID=${currentPlayerId}, Domain=${domain}, Difficulty=${difficulty}`);
    currentRiddleIndex = 0; // Reset riddle index for this AI session
    await fetchAndDisplayAIPuzzle(domain, difficulty);
}

/**
 * Fetches a new AI puzzle from the backend and displays it.
 * @param {string} domain - The domain for the AI puzzle.
 * @param {string} difficulty - The difficulty for the AI puzzle.
 */
async function fetchAndDisplayAIPuzzle(domain, difficulty) {
    const riddleArea = document.getElementById('riddleDisplay');
    if (riddleArea) {
        const timerHTML = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';
        riddleArea.innerHTML = timerHTML + '<p class="feedback neutral flicker-subtle">:: Generating new AI puzzle, please stand by... ::</p>';
    }
    if (typeof updateTimerDisplay === 'function') updateTimerDisplay();

    try {
        const response = await fetch('http://localhost:5000/generate_puzzle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: domain, difficulty: difficulty }),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `HTTP error ${response.status}`);
        }
        currentAIPuzzle = await response.json();
        console.log("AI Puzzle received:", currentAIPuzzle);
        currentRiddleIndex++;
        displayAIPuzzle();
    } catch (error) {
        console.error("Error fetching AI puzzle:", error.message);
        alert(`Failed to fetch AI puzzle: ${error.message}. Check backend logs.`);
        goBackToLanding();
    }
}

function displayAIPuzzle() {
    if (!currentAIPuzzle) {
        console.error("No AI puzzle data to display.");
        goBackToLanding();
        return;
    }
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) {
        console.error("Riddle display area not found for AI puzzle!");
        goBackToLanding();
        return;
    }

    const riddleNumberText = `AI Riddle #${currentRiddleIndex}`;
    const difficultyDisplay = currentAIPuzzle.difficulty.toUpperCase();
    const domainDisplay = currentAIPuzzle.domain.toUpperCase();
    let timerDisplayHtml = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';

    // --- Riddle Section ---
    const riddleSection = document.createElement('div');
    riddleSection.classList.add('riddle-section');
    riddleSection.style.marginBottom = '20px'; // Add some space before the answer section

    let puzzleDescriptionHtml = currentAIPuzzle.puzzle_description;
    puzzleDescriptionHtml = puzzleDescriptionHtml
        .replace(/```(?:([\w-]+)\n)?([\s\S]*?)```/g, (match, lang, code) => `<pre class="line-numbers language-${lang || 'unknown'}"><code class="language-${lang || 'unknown'}">${escapeHtml(code.trim())}</code></pre>`)
        .replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^(#{1,6}) (.*$)/gim, (match, hashes, content) => `<h${hashes.length}>${escapeHtml(content)}</h${hashes.length}>`)
        .replace(/\n/g, '<br>');

    riddleSection.innerHTML = `
        <h2>${riddleNumberText} :: ${domainDisplay} PATH :: ${difficultyDisplay} PROTOCOL ::</h2>
        <div class="riddle-text">${puzzleDescriptionHtml}</div>
    `;

    // --- Answer Input Section (similar to tester.html) ---
    const answerSection = document.createElement('div');
    answerSection.classList.add('riddle-section'); // Use same styling for consistency
    answerSection.style.marginTop = '0'; // Remove top margin if riddleSection has bottom margin

    answerSection.innerHTML = `
        <h2>> Submit Your Answer_</h2>
        <div class="form-group" style="margin-top:15px;">
            <label for="aiAnswerInput">> Your Answer:</label>
            <textarea id="aiAnswerInput" class="answer-input" rows="6" placeholder="Enter your code or detailed answer here..." style="width: 100%; min-height: 100px; background-color: rgba(0,0,0,0.1); border: 1px solid #00FF00; color: #00FF00; padding: 8px; font-family: 'VT323', monospace; font-size: 16px; margin-top: 5px;"></textarea>
        </div>
        <div class="button-container" style="margin-top: 15px;">
            <button onclick="checkAnswer(false, true)" class="submit-button">> Submit Answer_</button>
            <button onclick="goBackToLanding(true)" class="back-button" style="margin-left: 10px;">> Abort Sequence_</button>
        </div>
    `;

    // --- Result Display Section (initially hidden or with placeholder) ---
    const resultSection = document.createElement('div');
    resultSection.id = 'aiResultDisplaySection'; // New ID for this section
    resultSection.classList.add('riddle-section'); // Style like other sections
    resultSection.style.marginTop = '20px';
    resultSection.innerHTML = `
        <h2>> Result_</h2>
        <div id="aiFeedbackArea" class="feedback neutral" style="min-height: 40px; padding: 10px;">:: Awaiting your submission ::</div>
        <div id="aiHintArea" class="feedback neutral" style="display: none; margin-top: 10px; padding: 10px;"></div>
    `;

    // Clear riddleArea and append new sections
    riddleArea.innerHTML = timerDisplayHtml; // Start with timer
    riddleArea.appendChild(riddleSection);
    riddleArea.appendChild(answerSection);
    riddleArea.appendChild(resultSection);


    // **DEBUG LOG**: Verify aiFeedbackArea exists immediately after appending
    const testFeedbackArea = document.getElementById('aiFeedbackArea');
    if (testFeedbackArea) {
        console.log("displayAIPuzzle: 'aiFeedbackArea' successfully found in DOM after creation.");
    } else {
        console.error("displayAIPuzzle: CRITICAL - 'aiFeedbackArea' NOT found in DOM immediately after creation. Check append logic or IDs.");
        console.log("Current innerHTML of riddleArea:", riddleArea.innerHTML); // Log the structure
    }

    const answerInput = document.getElementById('aiAnswerInput');
    if (answerInput) {
        answerInput.focus();
    }

    if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = currentAIPuzzle.puzzle_description;
        const textToSpeak = tempDiv.textContent || tempDiv.innerText || "";
        speakText(`AI Riddle ${currentRiddleIndex}. ${textToSpeak}`);
    }
    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(riddleArea);
    }
}

/**
 * Checks the answer submitted for AI or standard riddles.
 * @param {boolean} [isFinal=false] - Whether this is for a final challenge riddle.
 * @param {boolean} [isAI=false] - Whether this is for an AI-generated puzzle.
 */
// This is the function that should be in your game-logic.js
async function checkAnswer(isFinal = false, isAI = false) {
    console.log(`Checking answer. Is Final: ${isFinal}, Is AI: ${isAI}. Attempting to find feedback ID: ${isAI ? 'aiFeedbackArea' : 'feedbackArea'}`);

    const feedbackAreaId = isAI ? 'aiFeedbackArea' : 'feedbackArea';
    const hintAreaId = isAI ? 'aiHintArea' : 'hintArea';
    const answerInputId = isAI ? 'aiAnswerInput' : 'answerInput';

    const feedbackArea = document.getElementById(feedbackAreaId);
    const hintArea = document.getElementById(hintAreaId);
    const answerInputElement = document.getElementById(answerInputId);

    if (!feedbackArea) {
        console.error(`Feedback area element with ID '${feedbackAreaId}' not found!`);
        const riddleDisplayElement = document.getElementById('riddleDisplay');
        if (riddleDisplayElement) {
            console.log("Content of #riddleDisplay at time of error:", riddleDisplayElement.innerHTML);
        } else {
            console.error("#riddleDisplay element itself not found!");
        }
        return;
    }
    if (!answerInputElement) {
        console.error(`Answer input element with ID '${answerInputId}' not found!`);
        feedbackArea.textContent = ":: System Error :: Input field missing.";
        feedbackArea.className = 'feedback incorrect';
        return;
    }

    const userAnswerRaw = answerInputElement.value;
    const userAnswerNormalized = userAnswerRaw.trim();

    if (!userAnswerNormalized) {
        feedbackArea.textContent = ":: Null Input Detected :: Please provide an answer.";
        feedbackArea.className = 'feedback incorrect';
        return;
    }

    if (isAI) { // Logic for AI-generated puzzles
        if (!currentAIPuzzle || !currentPlayerId) {
            console.error("Cannot check AI answer: Puzzle data or player ID missing.");
            feedbackArea.textContent = ":: System Error: Session data lost. ::";
            feedbackArea.className = 'feedback incorrect';
            return;
        }

        answerInputElement.disabled = true;
        const submitButton = answerInputElement.closest('.riddle-section, .form-group')?.querySelector('.submit-button');
        if(submitButton) submitButton.disabled = true;

        feedbackArea.textContent = ":: Validating input sequence... ::";
        feedbackArea.className = 'feedback neutral';
        if (hintArea) hintArea.style.display = 'none';

        try {
            const response = await fetch('http://localhost:5000/validate_answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_answer: userAnswerNormalized,
                    puzzle_id: currentAIPuzzle.puzzle_id,
                    player_id: currentPlayerId
                }),
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP error ${response.status}`);
            }

            let finalFeedback = result.feedback;
            let enigmaComment = "";

            if (!result.correct) {
                let corruptionLevel = 0;
                // Check for global completionStatus or define a way to get this
                if (typeof completionStatus !== 'undefined' && completionStatus.easy && completionStatus.hard) {
                    const easyFinalComplete = localStorage.getItem('enigmaEasyFinalComplete') === 'true'; // Or derive from completionStatus.easy.final etc.
                    const hardFinalComplete = localStorage.getItem('enigmaHardFinalComplete') === 'true'; // Or derive from completionStatus.hard.final etc.

                    if (hardFinalComplete) {
                        corruptionLevel = 2;
                    } else if (easyFinalComplete) {
                        corruptionLevel = 1;
                    }
                } else {
                    console.warn("completionStatus not fully available for determining corruption level for comments.");
                }


                let commentOptions = enigmaCoreStingyComments.level0; // Default
                if (corruptionLevel === 1 && enigmaCoreStingyComments.level1 && enigmaCoreStingyComments.level1.length > 0) {
                    commentOptions = enigmaCoreStingyComments.level1;
                } else if (corruptionLevel === 2 && enigmaCoreStingyComments.level2 && enigmaCoreStingyComments.level2.length > 0) {
                    commentOptions = enigmaCoreStingyComments.level2;
                }

                if (commentOptions && commentOptions.length > 0) { // Check if commentOptions is valid
                    enigmaComment = commentOptions[Math.floor(Math.random() * commentOptions.length)];
                    finalFeedback += `<br>${enigmaComment}`;
                } else {
                    console.warn("No stingy comments available for the current corruption level or enigmaCoreStingyComments structure error.");
                }
            }

            feedbackArea.innerHTML = finalFeedback;
            feedbackArea.className = result.correct ? 'feedback correct' : 'feedback incorrect';

            if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
                let textToSpeak = result.correct ? "Evaluation complete. Correct." : "Evaluation complete. Incorrect.";
                if (enigmaComment) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = enigmaComment;
                    textToSpeak += " " + (tempDiv.textContent || tempDiv.innerText || "");
                }
                speakText(textToSpeak);
            }

            if (result.hint && hintArea) {
                hintArea.innerHTML = `<span style="font-weight:bold;">Hint:</span> ${escapeHtml(result.hint)}`;
                hintArea.style.display = 'block';
                hintArea.className = 'feedback neutral';
            } else if (hintArea) {
                hintArea.style.display = 'none';
            }

            if (result.correct) {
                setTimeout(async () => {
                    await fetchAndDisplayAIPuzzle(currentAIPuzzle.domain, currentAIPuzzle.difficulty);
                }, 1800);
            } else {
                answerInputElement.disabled = false;
                if(submitButton) submitButton.disabled = false;
                answerInputElement.focus();
                answerInputElement.select();
            }

        } catch (error) {
            console.error("Error validating AI answer:", error);
            feedbackArea.textContent = `:: Validation Error: ${error.message} ::`;
            feedbackArea.className = 'feedback incorrect';
            answerInputElement.disabled = false;
            if(submitButton) submitButton.disabled = false;
        }
    } else {
        if (typeof md5 !== 'function') {
            console.error("md5 function is not defined! Cannot check standard answer.");
            feedbackArea.textContent = ":: System Error :: Hashing function unavailable.";
            feedbackArea.className = 'feedback incorrect';
            return;
        }
        const userAnswerHash = md5(userAnswerNormalized.toLowerCase());
        let expectedAnswerHashes = [];
        let currentLoreData = null;
        let riddleToCheck = null;

        const isFinalChallenge = (currentMode === 'final');

        if (isFinalChallenge) {
            riddleToCheck = getFinalRiddleData(currentDifficulty);
        } else {
            const riddleSet = getCurrentRiddles();
            if (riddleSet && currentRiddleIndex < riddleSet.length) {
                riddleToCheck = riddleSet[currentRiddleIndex];
                if (riddleToCheck && riddleToCheck.solutionCheckType === 'event') {
                    console.log("checkAnswer: Detected event-based standard/nightmare riddle. Letting event handler manage success.");
                    return;
                }
            }
        }

        if (!riddleToCheck || !riddleToCheck.answerHashes || !Array.isArray(riddleToCheck.answerHashes) || riddleToCheck.answerHashes.length === 0) {
            feedbackArea.textContent = ":: System Error :: Cannot verify answer configuration.";
            feedbackArea.className = 'feedback incorrect';
            console.error("Expected answer hashes array is empty or riddle data missing for standard/final!", riddleToCheck);
            return;
        }
        expectedAnswerHashes = riddleToCheck.answerHashes;
        currentLoreData = riddleToCheck.lore;

        let isCorrect = expectedAnswerHashes.includes(userAnswerHash);
        console.log(`User Answer (Std/Final): "${userAnswerNormalized}", Hash: ${userAnswerHash}, Correct: ${isCorrect}`);

        if (isCorrect) {
            feedbackArea.textContent = ":: Access Granted :: Correct. Proceeding...";
            feedbackArea.className = 'feedback correct';
            if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') speakText("Access granted.");
            if (currentLoreData && typeof trackLoreDiscovery === 'function') trackLoreDiscovery(currentLoreData);

            if(answerInputElement) answerInputElement.disabled = true;
            const submitButton = answerInputElement?.closest('.riddle-section, .button-container')?.querySelector('.submit-button');
            if (submitButton) submitButton.disabled = true;

            setTimeout(() => {
                if (isFinalChallenge) {
                    if (typeof handleFinalCompletion === 'function') handleFinalCompletion();
                } else {
                    if (typeof currentRiddleIndex !== 'undefined') {
                        currentRiddleIndex++;
                        displayRiddle();
                    } else {
                        goBackToLanding();
                    }
                }
            }, 1500);
        } else {
            feedbackArea.textContent = ":: Access Denied :: Hash mismatch. Re-evaluate.";
            feedbackArea.className = 'feedback incorrect';
            if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') speakText("Access denied.");
            if(answerInputElement) {
                answerInputElement.focus();
                answerInputElement.select();
            }
        }
    }
}


// Helper to escape HTML (simple version, consider a robust library for production)
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}


/** Creates the riddle display div if it doesn't exist. */
function createRiddleArea() {
    console.log("Creating riddle display area...");
    const existingArea = document.getElementById('riddleDisplay');
    if (existingArea) return existingArea;
    const riddleArea = document.createElement('div');
    riddleArea.id = 'riddleDisplay';
    riddleArea.style.display = 'none';
    const mainElement = document.querySelector('.terminal-container main');
    if (mainElement) {
        mainElement.appendChild(riddleArea);
        return riddleArea;
    } else {
        const container = document.querySelector('.terminal-container');
        if (container) {
            container.appendChild(riddleArea);
            return riddleArea;
        }
    }
    console.error("CRITICAL: Could not find suitable parent for riddle display area.");
    return null;
}

/**
 * Displays the current riddle (Easy, Hard, Nightmare).
 * Handles standard input and interactive elements.
 */
function displayRiddle() {
    // Ensure state variables are defined
    if (typeof currentDifficulty === 'undefined' || typeof currentMode === 'undefined' || typeof currentRiddleIndex === 'undefined') {
         console.error("Cannot display riddle: Game state variables missing.");
         goBackToLanding(); return;
    }

    console.log(`Displaying riddle: Diff=${currentDifficulty}, Mode=${currentMode}, Index=${currentRiddleIndex}`);
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) { console.error("Riddle display area not found!"); goBackToLanding(); return; }
    riddleArea.style.display = 'block'; // Ensure container is visible

    const riddleSet = getCurrentRiddles(); // Assumes this function works correctly and handles errors

    if (!riddleSet) { console.error("Failed to get current riddle set. Aborting."); goBackToLanding(); return; }
    if (currentRiddleIndex >= riddleSet.length) { console.log("Mode complete."); handleModeCompletion(); return; }

    const riddleData = riddleSet[currentRiddleIndex];
    if (!riddleData || !riddleData.riddle) { console.error("Invalid riddle data:", riddleData); goBackToLanding(); return; }

    const riddleNumber = `Riddle ${currentRiddleIndex + 1}/${riddleSet.length}`;
    const difficultyDisplay = currentDifficulty ? currentDifficulty.toUpperCase() : 'ERR';
    const modeDisplay = currentMode ? currentMode.toUpperCase() : 'ERR';

    // Preserve timer display
    let timerDisplayHtml = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';
    riddleArea.innerHTML = timerDisplayHtml; // Clear previous riddle, keep timer

    const riddleElement = document.createElement('div');
    riddleElement.classList.add('riddle-section');
    riddleElement.style.display = 'block'; // Ensure section is visible

    // Process riddle text for lore hints
    let processedRiddleText = riddleData.riddle;
    if (riddleData.lore && typeof showLoreModal === 'function' && typeof escapeHtmlAttribute === 'function') {
        try {
            const loreHtmlAttribute = escapeHtmlAttribute(riddleData.lore);
            // Regex to add onclick and data-lore to existing lore-hint spans
            processedRiddleText = processedRiddleText.replace(
                /(<span\s+class=["']lore-hint["'])(.*?>.*?<\/span>)/gs, // Added 's' flag for potential newlines
                (match, p1, p2) => {
                    // Avoid adding if onclick already exists
                    if (p2.includes('onclick=')) return match;
                    return `${p1} onclick='showLoreModal(this.dataset.lore)' data-lore="${loreHtmlAttribute}"${p2}`;
                }
            );
        } catch (e) { console.error("Error processing riddle lore text:", e); }
    } else if (riddleData.lore) {
        console.warn("showLoreModal or escapeHtmlAttribute function not found for lore processing.");
    }

    // Handle Interactive Elements
    let interactiveHtml = '';
    if (riddleData.interactiveElement) {
        interactiveHtml = `<div class="interactive-riddle-area">${riddleData.interactiveElement}</div>`;
    }

    // --- Input and Button Area HTML ---
    let inputAreaHtml = '';
    let buttonAreaHtml = '';
    const checkType = riddleData.solutionCheckType || 'input'; // Default to 'input'

    if (checkType === 'input') {
        // Input field and cursor on one line
        inputAreaHtml = `
            <div class="input-wrapper" style="margin-bottom: 10px; display: flex; align-items: center;">
                <label for="answerInput" style="margin-right: 5px;"> </label> <input type="text" class="answer-input" id="answerInput" autocomplete="off" autofocus style="margin-right: 5px; flex-grow: 1;">
                <span class="cursor">_</span>
            </div>
        `;
        // Buttons on the next line
        buttonAreaHtml = `
            <div class="button-container" style="margin-top: 10px;">
                <button onclick="checkAnswer()" class="submit-button">> Submit_</button>
                <button onclick="goBackToLanding(true)" class="back-button" style="margin-left: 10px;">> Abort Sequence_</button>
            </div>
        `;
    } else if (checkType === 'event') {
        // Layout for event-based riddles
        inputAreaHtml = `<p id="interactiveStatus" class="feedback neutral">:: Interaction Required ::</p>`;
        buttonAreaHtml = `
             <div class="button-container" style="display: flex; justify-content: flex-end; margin-top: 15px;">
                 <button onclick="goBackToLanding(true)" class="back-button">> Abort Sequence_</button>
             </div>
        `;
    } else {
         // Layout for configuration errors or unsupported types
         inputAreaHtml = `<p class="feedback incorrect">:: Riddle Configuration Error (Type: ${escapeHtmlAttribute(checkType)}) ::</p>`;
         buttonAreaHtml = `
             <div class="button-container" style="display: flex; justify-content: flex-end; margin-top: 15px;">
                 <button onclick="goBackToLanding(true)" class="back-button">> Abort Sequence_</button>
             </div>
         `;
    }
    // --- End Input and Button Area HTML ---


    // --- Construct riddleElement.innerHTML ---
    riddleElement.innerHTML = `
        <h2>${riddleNumber} :: ${modeDisplay} Path :: ${difficultyDisplay} Protocol ::</h2>
        <p class="riddle-text">${processedRiddleText}</p>
        ${interactiveHtml || ''}
        ${inputAreaHtml || ''}
        ${buttonAreaHtml || ''}
        <div class="feedback" id="feedbackArea"></div>
        <div class="red-herring">:: Log Entry ${Math.floor(Math.random()*900+100)}: System Nominal ::</div>
    `;

    // Append the fully constructed element
    riddleArea.appendChild(riddleElement);

    // Execute Setup Script (if any)
    if (riddleData.setupScript) {
        // Ensure handleInteractiveSuccess is available globally before executing script
        if (typeof handleInteractiveSuccess === 'function') {
            window.handleInteractiveSuccess = handleInteractiveSuccess; // Make accessible globally if needed by script
            setTimeout(() => { // Delay slightly to ensure DOM is fully ready
                try {
                     // Use Function constructor carefully, ensure script source is trusted
                     const scriptFunc = new Function('handleInteractiveSuccess', riddleData.setupScript);
                     scriptFunc(handleInteractiveSuccess);
                     console.log("Setup script executed for riddle:", currentRiddleIndex);
                } catch (e) {
                     console.error("Error executing setup script:", e);
                     const feedbackArea = document.getElementById('feedbackArea');
                     if(feedbackArea) {
                         feedbackArea.textContent = `:: ERROR executing setup script: ${e.message} ::`;
                         feedbackArea.className = 'feedback incorrect';
                     }
                }
            }, 50);
        } else {
            console.error("handleInteractiveSuccess function not found, cannot execute setup script for riddle:", currentRiddleIndex);
             const feedbackArea = document.getElementById('feedbackArea');
             if(feedbackArea) {
                 feedbackArea.textContent = `:: ERROR: Interactive component failed to initialize. ::`;
                 feedbackArea.className = 'feedback incorrect';
             }
        }
    }

    // Focus input field if it exists and attach Enter key listener
    if (checkType === 'input') {
         const answerInput = document.getElementById('answerInput');
         if (answerInput) {
             answerInput.focus();
             // Remove previous listener if any to prevent duplicates
             answerInput.onkeypress = null;
             answerInput.onkeypress = function (e) {
                 if (e.key === 'Enter') {
                     e.preventDefault(); // Prevent form submission
                     if (typeof checkAnswer === 'function') {
                          checkAnswer(); // Call checkAnswer function
                     } else {
                          console.error("checkAnswer function not found.");
                     }
                 }
             };
         } else {
              console.warn("Could not find #answerInput to focus.");
         }
    }

    // Optional: Speak riddle text
    if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
         if (riddleData.riddle) {
            // Simple text extraction for speech
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = riddleData.riddle;
            const textToSpeak = tempDiv.textContent || tempDiv.innerText || "";
            speakText(`Riddle ${currentRiddleIndex + 1}. ${textToSpeak}`);
         }
    }

    console.log("Riddle displayed successfully.");
}

function goBackToLanding(confirmAbort = false) {
    console.log("goBackToLanding called. Confirm abort:", confirmAbort);
    if (confirmAbort && typeof startTime !== 'undefined' && startTime) {
        if (!confirm("Abort current sequence and return to Terminal? Progress will be lost.")) {
            console.log("Abort cancelled."); return;
        }
        console.log("Abort confirmed.");
    }

    if (typeof timerInterval !== 'undefined' && timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (typeof startTime !== 'undefined') startTime = null;
    if (typeof finalTimeMs !== 'undefined') finalTimeMs = 0;
    if (typeof currentMode !== 'undefined') currentMode = null;
    if (typeof currentDifficulty !== 'undefined') currentDifficulty = null;
    if (typeof currentRiddleIndex !== 'undefined') currentRiddleIndex = 0;
    if (typeof currentPlayerId !== 'undefined') currentPlayerId = null;
    currentAIPuzzle = null;

    const elementsToToggle = {
        'riddleDisplay': 'none',
        'entryForm': 'block',
        'initialHeader': 'block',
        'landingHintContainer': 'block',
        'aiDomainSelection': 'none' // Ensure AI domain selection is hidden
    };

    for (const id in elementsToToggle) {
        const el = document.getElementById(id);
        if (el) el.style.display = elementsToToggle[id];
    }

    // Update visibility of conditional buttons using their dedicated functions
    if (typeof updateFinalButtonsVisibility === 'function') updateFinalButtonsVisibility();
    if (typeof updateAccessTerminalButtonVisibility === 'function') updateAccessTerminalButtonVisibility();
    if (typeof updateNightmareVisibility === 'function') updateNightmareVisibility();
    if (typeof updateDynamicContentArea === 'function') updateDynamicContentArea();

    const hintArea = document.getElementById('aiHintArea'); // Clear AI hint area
    if (hintArea) hintArea.style.display = 'none';

    console.log("Returned to landing page.");
}

document.addEventListener('DOMContentLoaded', () => {
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const aiDomainSelectionDiv = document.getElementById('aiDomainSelection');

    if (modeRadios.length > 0 && aiDomainSelectionDiv) {
        modeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'ai_challenge' && this.checked) {
                    aiDomainSelectionDiv.style.display = 'block';
                } else {
                    aiDomainSelectionDiv.style.display = 'none';
                }
            });
        });
        const initialSelectedMode = document.querySelector('input[name="mode"]:checked');
        if (initialSelectedMode && initialSelectedMode.value === 'ai_challenge') {
            aiDomainSelectionDiv.style.display = 'block';
        } else if (aiDomainSelectionDiv) { // Ensure div exists before trying to hide
            aiDomainSelectionDiv.style.display = 'none';
        }
    } else {
        console.warn("Could not find mode radio buttons or AI domain selection div for event listener setup.");
    }
})
/**
 * Displays the final challenge riddle (Easy or Hard).
 */
function displayFinalRiddle(difficulty) {
     // Ensure state variables are defined
     if (typeof currentDifficulty === 'undefined' || typeof currentMode === 'undefined') {
          console.error("Cannot display final riddle: Game state variables missing.");
          goBackToLanding(); return;
     }

    currentDifficulty = difficulty;
    currentMode = 'final'; // Set mode to final

    console.log(`Displaying FINAL riddle: Diff=${difficulty}`);
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) { console.error("Riddle display area not found!"); return; }
    riddleArea.style.display = 'block'; // Ensure container is visible

    const riddleData = getFinalRiddleData(difficulty); // Assumes this function works correctly

    if (!riddleData || !riddleData.riddle || !riddleData.answerHashes) {
        console.error(`Final riddle data invalid or missing for difficulty: ${difficulty}`);
        goBackToLanding(); return;
    }

    const riddleNumber = "Final Challenge";
    const difficultyDisplay = difficulty ? difficulty.toUpperCase() : 'ERR';

    // Preserve timer display if it exists
    let timerDisplayHtml = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';
    riddleArea.innerHTML = timerDisplayHtml; // Clear previous content, keep timer

    const riddleElement = document.createElement('div');
    riddleElement.classList.add('riddle-section');
    riddleElement.style.display = 'block'; // Ensure section is visible

    // Process riddle text for lore hints and specific clues
    let processedRiddleText = riddleData.riddle;
    if (riddleData.lore && typeof showLoreModal === 'function' && typeof escapeHtmlAttribute === 'function') {
         try {
             const loreHtmlAttribute = escapeHtmlAttribute(riddleData.lore);
             processedRiddleText = processedRiddleText.replace(
                 /(<span\s+class=["']lore-hint["'])(.*?>.*?<\/span>)/gs,
                 (match, p1, p2) => {
                     if (p2.includes('onclick=')) return match; // Avoid double listeners
                     return `${p1} onclick='showLoreModal(this.dataset.lore)' data-lore="${loreHtmlAttribute}"${p2}`;
                 }
             );
         } catch (e) { console.error("Error processing final riddle lore text:", e); }
    }
     // Specific handling for Document Alpha hint in hard final
     if (difficulty === 'hard' && processedRiddleText.includes('[Ref: Document Alpha]')) {
         processedRiddleText = processedRiddleText.replace('[Ref: Document Alpha]', '<span class="hidden-clue" title="doc-alpha.html">[Ref: Document Alpha]</span>');
     }

    // Handle Interactive Elements if any
    let interactiveHtml = '';
    if (riddleData.interactiveElement) {
        interactiveHtml = `<div class="interactive-riddle-area">${riddleData.interactiveElement}</div>`;
    }

    // --- Input and Button Area HTML ---
    let inputAreaHtml = '';
    let buttonAreaHtml = '';
    const checkType = riddleData.solutionCheckType || 'input'; // Default to input

    if (checkType === 'input') {
        // Input field and cursor
        inputAreaHtml = `
            <div class="input-wrapper" style="margin-bottom: 10px; display: flex; align-items: center;">
                 <label for="answerInput" style="margin-right: 5px;">> Final Response:</label>
                <input type="text" class="answer-input" id="answerInput" autocomplete="off" autofocus style="margin-right: 5px; flex-grow: 1;">
                <span class="cursor">_</span>
            </div>
        `;
        // Buttons below
        buttonAreaHtml = `
            <div class="button-container" style="margin-top: 10px;">
                <button onclick="checkAnswer(true)" class="submit-button">> Submit Final Response_</button> <button onclick="goBackToLanding(true)" class="back-button" style="margin-left: 10px;">> Abort Sequence_</button>
            </div>
        `;
    } else if (checkType === 'event') {
        // Layout for event-based final riddles
        inputAreaHtml = `<p id="interactiveStatus" class="feedback neutral">:: Final Interaction Required ::</p>`;
        buttonAreaHtml = `
             <div class="button-container" style="display: flex; justify-content: flex-end; margin-top: 15px;">
                 <button onclick="goBackToLanding(true)" class="back-button">> Abort Sequence_</button>
             </div>
        `;
    } else {
         // Layout for configuration errors
         inputAreaHtml = `<p class="feedback incorrect">:: Final Riddle Configuration Error (Type: ${escapeHtmlAttribute(checkType)}) ::</p>`;
         buttonAreaHtml = `
             <div class="button-container" style="display: flex; justify-content: flex-end; margin-top: 15px;">
                 <button onclick="goBackToLanding(true)" class="back-button">> Abort Sequence_</button>
             </div>
         `;
    }
    // --- End Input and Button Area HTML ---


    // --- Construct riddleElement.innerHTML ---
    riddleElement.innerHTML = `
        <h2>${riddleNumber} :: ${difficultyDisplay} Protocol ::</h2>
        <p class="riddle-text">${processedRiddleText}</p>
        ${interactiveHtml || ''}
        ${inputAreaHtml || ''}   ${buttonAreaHtml || ''}  <div class="feedback" id="feedbackArea"></div>
        `; // Removed red-herring for final

    // Append the fully constructed element
    riddleArea.appendChild(riddleElement);

     // Execute Setup Script if any
     if (riddleData.setupScript) {
         if (typeof handleInteractiveSuccess === 'function') {
             window.handleInteractiveSuccess = handleInteractiveSuccess; // Ensure accessible
             setTimeout(() => { // Delay slightly
                 try {
                     const scriptFunc = new Function('handleInteractiveSuccess', riddleData.setupScript);
                     scriptFunc(handleInteractiveSuccess);
                 } catch (e) {
                     console.error("Error executing final riddle setup script:", e);
                     const feedbackArea = document.getElementById('feedbackArea');
                     if(feedbackArea) {
                         feedbackArea.textContent = `:: ERROR executing setup script: ${e.message} ::`;
                         feedbackArea.className = 'feedback incorrect';
                     }
                 }
             }, 50);
         } else {
              console.error("handleInteractiveSuccess function not found, cannot execute setup script for final riddle.");
              const feedbackArea = document.getElementById('feedbackArea');
              if(feedbackArea) {
                  feedbackArea.textContent = `:: ERROR: Interactive component failed to initialize. ::`;
                  feedbackArea.className = 'feedback incorrect';
              }
         }
     }

     // Focus input field and attach Enter listener
     if (checkType === 'input') {
         const answerInput = document.getElementById('answerInput');
         if (answerInput) {
             answerInput.focus();
             // Remove previous listener
             answerInput.onkeypress = null;
             answerInput.onkeypress = function (e) {
                 if (e.key === 'Enter') {
                     e.preventDefault();
                     if (typeof checkAnswer === 'function') {
                          checkAnswer(true); // Pass true for isFinal
                     } else {
                          console.error("checkAnswer function not found.");
                     }
                 }
             };
         } else {
              console.warn("Could not find #answerInput to focus for final riddle.");
         }
     }

     // Optional: Speak riddle text
     if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
         if (riddleData.riddle) {
            // Simple text extraction
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = riddleData.riddle;
            const textToSpeak = tempDiv.textContent || tempDiv.innerText || "";
            speakText(`Final ${difficulty} challenge initiated. ${textToSpeak}`);
         }
     }
     console.log("Final riddle displayed successfully.");
}


/**
 * Handles the success callback from interactive riddle elements.
 * @param {string} successValue - The value passed from the successful interaction.
 */
function handleInteractiveSuccess(successValue) {
    console.log(`Interactive success triggered with value: ${successValue}`);
    const feedbackArea = document.getElementById('feedbackArea');
    if (!feedbackArea) { console.error("Feedback area not found for interactive success!"); return; }

    // Ensure state variables are defined
    if (typeof currentMode === 'undefined' || typeof currentDifficulty === 'undefined' || typeof currentRiddleIndex === 'undefined') {
         console.error("Cannot handle interactive success: Game state variables missing.");
         feedbackArea.textContent = ":: System Error: Game state lost. ::";
         feedbackArea.className = 'feedback incorrect';
         goBackToLanding(); return;
    }

    // Check if currently in a final challenge - interactive success shouldn't apply there unless specifically designed
    if (currentMode === 'final') {
        console.warn("handleInteractiveSuccess called during final challenge. Ignoring unless specifically handled.");
        // Add specific final challenge interactive handling here if needed
        return;
    }

    const riddleSet = getCurrentRiddles();
    if (!riddleSet || currentRiddleIndex >= riddleSet.length) {
        console.error("Cannot find riddle set for interactive success.");
        feedbackArea.textContent = ":: System Error: Riddle data mismatch. ::";
        feedbackArea.className = 'feedback incorrect';
        goBackToLanding(); return;
    }

    const currentRiddleData = riddleSet[currentRiddleIndex];

    // Check if the current riddle expects an event and the success value matches
    if (currentRiddleData && currentRiddleData.solutionCheckType === 'event' && currentRiddleData.successValue === successValue) {
        feedbackArea.textContent = ":: Signal Decrypted :: Correct Interaction. Proceeding...";
        feedbackArea.className = 'feedback correct';
        if (typeof speechEnabled !== 'undefined' && speechEnabled) speakText("Signal confirmed.");

        // Track lore if applicable (requires trackLoreDiscovery from game-state.js)
        if (currentRiddleData.lore && typeof trackLoreDiscovery === 'function') {
            trackLoreDiscovery(currentRiddleData.lore);
        }

        // Proceed to the next riddle after a short delay
        setTimeout(() => {
            currentRiddleIndex++;
            displayRiddle();
        }, 1500); // 1.5 second delay

    } else if (currentRiddleData && currentRiddleData.solutionCheckType !== 'event') {
         console.warn("Interactive success triggered for a non-event riddle type.");
         // Optionally provide feedback or ignore
         // feedbackArea.textContent = ":: Signal Received (Unexpected) ::";
         // feedbackArea.className = 'feedback neutral';
    }
     else {
        // Mismatch in success value or unexpected trigger
        console.warn("Interactive success value mismatch or unexpected trigger.");
        feedbackArea.textContent = ":: Signal Interference :: Interaction incomplete or incorrect.";
        feedbackArea.className = 'feedback incorrect';
        if (typeof speechEnabled !== 'undefined' && speechEnabled) speakText("Signal interference.");
    }
}

function handleModeCompletion() {
    // Ensure state variables are defined
    if (typeof currentDifficulty === 'undefined' || typeof currentMode === 'undefined' || typeof completionStatus === 'undefined' || typeof saveCompletionStatus === 'undefined') {
         console.error("Cannot handle mode completion: Required state variables or functions missing.");
         goBackToLanding(); return;
    }
    // Ensure mode isn't 'final' as that has its own handler
    if (currentMode === 'final') {
         console.error("Invalid call to handleModeCompletion during final challenge.");
         goBackToLanding(); return;
    }

    const completedDifficulty = currentDifficulty;
    const completedMode = currentMode;
    console.log(`Handling Mode Completion: Diff=${completedDifficulty}, Mode=${completedMode}`);

    // Stop timer (Ensure timerInterval, startTime, finalTimeMs are defined)
    if (typeof timerInterval !== 'undefined' && timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (typeof startTime !== 'undefined' && startTime && typeof finalTimeMs !== 'undefined') {
        const endTime = new Date();
        finalTimeMs = endTime - startTime;
        startTime = null; // Reset start time
    }
    console.log(`Mode complete: ${completedDifficulty} ${completedMode}. Time: ${finalTimeMs}ms`);


    // Update completion status
    let allNightmareComplete = false;
    // Check structure carefully before accessing
    if (completionStatus[completedDifficulty] && typeof completionStatus[completedDifficulty][completedMode] === 'boolean') {
         completionStatus[completedDifficulty][completedMode] = true;
         saveCompletionStatus(); // Save to localStorage (from game-state.js)

         // Check if ALL Nightmare modes are now complete (only if current difficulty was nightmare)
         if (completedDifficulty === 'nightmare' && completionStatus.nightmare) {
             allNightmareComplete = completionStatus.nightmare.frontend &&
                                    completionStatus.nightmare.backend &&
                                    completionStatus.nightmare.database;
             if (allNightmareComplete) {
                  console.log("!!! All Nightmare Protocols Complete !!! Triggering True Ending...");
             }
         }
    } else {
        console.error(`Error updating completion status: Invalid structure for [${completedDifficulty}][${completedMode}]`, completionStatus);
    }

    // Update UI visibility & effects (Ensure functions are available)
    if (typeof updateFinalButtonsVisibility === 'function') updateFinalButtonsVisibility();
    if (typeof updateNightmareVisibility === 'function') updateNightmareVisibility();
    if (typeof applyCorruptionEffect === 'function') applyCorruptionEffect();
    if (typeof updateDynamicContentArea === 'function') updateDynamicContentArea(); // Update dynamic area


    // Trigger True Ending or Show Standard Completion Message
    if (allNightmareComplete && typeof startTrueEndingChat === 'function') {
        setTimeout(() => {
            startTrueEndingChat(); // startTrueEndingChat from chat-sequences.js
        }, 1000); // Delay before starting chat
    } else {
        // Show standard completion message
        const riddleArea = document.getElementById('riddleDisplay');
        if (!riddleArea) { console.error("Cannot show completion message: #riddleDisplay not found."); return; }

        // Sanitize mode/difficulty for display
        const safeMode = completedMode.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeDiff = completedDifficulty.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        riddleArea.innerHTML = `
            <div class="riddle-section" style="display: block;">
                <h2>:: ${safeMode.toUpperCase()} Path Complete (${safeDiff.toUpperCase()}) ::</h2>
                <p>Sequence concluded for this specialization.</p>
                <p class='flicker'>Return to Terminal Enigma to select a new path or challenge.</p>
                <button onclick="goBackToLanding()" class="submit-button">> Return to Terminal_</button>
            </div>`;

        if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
            speakText(`${safeMode} path complete.`);
        }
    }
}

/**
 * Handles the completion of a final challenge (Easy or Hard).
 */
function handleFinalCompletion() {
     // Ensure state variables are defined
     if (typeof currentDifficulty === 'undefined' || typeof currentMode === 'undefined' || typeof finalTimeMs === 'undefined' || typeof candidateName === 'undefined') {
          console.error("Cannot handle final completion: Required state variables missing.");
          goBackToLanding(); return;
     }
     // Ensure mode is 'final'
     if (currentMode !== 'final') {
          console.error("Invalid call to handleFinalCompletion outside of final challenge.");
          goBackToLanding(); return;
     }

     const completedFinalDifficulty = currentDifficulty;
     console.log(`Handling Final Completion: Diff=${completedFinalDifficulty}`);

     // Stop timer (Ensure timerInterval, startTime are defined)
     if (typeof timerInterval !== 'undefined' && timerInterval) { clearInterval(timerInterval); timerInterval = null; }
     if (typeof startTime !== 'undefined' && startTime && finalTimeMs === 0) { // Calculate time if not already set
          const endTime = new Date();
          finalTimeMs = endTime - startTime;
     }
     startTime = null; // Reset start time

     // Set completion flag in localStorage
     const flagName = completedFinalDifficulty === 'easy' ? 'enigmaEasyFinalComplete' : 'enigmaHardFinalComplete';
     try {
         localStorage.setItem(flagName, 'true');
         console.log(`Set completion flag: ${flagName}`);
         // If easy final completed, also mark user as approved for terminal access
         if (completedFinalDifficulty === 'easy') {
             localStorage.setItem('lastCandidateName', candidateName); // Save name used for completion
             localStorage.setItem('enigmaApprovedTerminalUser', candidateName); // Mark as approved
             console.log(`User '${candidateName}' marked as approved terminal user.`);
         }
     } catch (e) { console.error(`Failed to save final completion flag/name:`, e); }

     // Update UI (Ensure functions are available)
     if (typeof applyCorruptionEffect === 'function') applyCorruptionEffect();
     if (typeof updateAccessTerminalButtonVisibility === 'function') updateAccessTerminalButtonVisibility();
     if (typeof updateNightmareVisibility === 'function') updateNightmareVisibility(); // Hard completion unlocks nightmare
     if (typeof updateDynamicContentArea === 'function') updateDynamicContentArea(); // Update dynamic area


     // Proceed based on difficulty
     if (completedFinalDifficulty === 'easy') {
         console.log("Easy final completed. Redirecting...");
         if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
             speakText("Standard protocol assessment finalized.", 1.0, 1.0);
         }
         // Redirect after a very short delay to allow speech to start
         setTimeout(() => {
             // Ensure the target file exists and path is correct
             window.location.href = 'final-easy-complete.html';
         }, 100);
         return; // Stop further execution

     } else { // Hard completion -> Show designation prompt
         console.log("Hard final completed. Proceeding to designation prompt.");
         if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
             speakText("Deep scan protocol accepted.", 0.8, 0.7);
         }

         // Format time for display
         let formattedTime = "N/A";
         if (finalTimeMs > 0) {
              formattedTime = `${Math.floor(finalTimeMs / 60000)}m ${Math.floor((finalTimeMs % 60000) / 1000)}s`;
         }

         const riddleArea = document.getElementById('riddleDisplay');
         if (!riddleArea) { console.error("Cannot show designation prompt: #riddleDisplay not found."); return; }

         // Sanitize candidateName for display
         const safeCandidateName = candidateName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

         // Display designation prompt UI
         riddleArea.innerHTML = `
            <div class="riddle-section" style="display: block;">
                <h2>:: FINAL HARD PROTOCOL ACCEPTED ::</h2>
                <p>Impressive, ${safeCandidateName}... Total Time Logged: ${formattedTime}</p>
                <p class='flicker'>...One final entry required...</p>
                <hr style="border-color: rgba(0, 255, 0, 0.3); margin: 15px 0;">
                <div class="form-group" style="margin-top: 20px;">
                    <label for="designationInput">> Enter Final Designation:</label>
                    <input type="text" id="designationInput" class="answer-input" autocomplete="off" autofocus style="width: auto; flex-grow: 1; margin-right: 5px;">
                    <span class="cursor">_</span>
                    <button onclick="checkDesignation()" class="submit-button" style="margin-left: 10px;">> Submit Designation_</button>
                    <div class="feedback" id="designationFeedback" style="margin-top: 15px;"></div>
                </div>
            </div>`;

         // Attach Enter key listener to designation input
         const designationInput = document.getElementById('designationInput');
         if (designationInput) {
              designationInput.focus();
              // Remove previous listener if any
              designationInput.onkeypress = null;
              designationInput.addEventListener('keypress', function (e) {
                   if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof checkDesignation === 'function') {
                             checkDesignation();
                        } else {
                             console.error("checkDesignation function not found.");
                        }
                   }
              });
         } else {
              console.warn("Could not find #designationInput to focus.");
         }

         // Optional: Save final session data (including time) to localStorage
         const sessionData = {
              name: candidateName,
              mode: 'final',
              difficulty: completedFinalDifficulty,
              timeMs: finalTimeMs,
              formattedTime: formattedTime,
              completed: true,
              timestamp: new Date().toISOString()
         };
         try {
              localStorage.setItem('lastEnigmaSession', JSON.stringify(sessionData));
              console.log("Final session data saved:", sessionData);
         } catch (e) {
              console.error("Error saving final session data:", e);
         }
     }
}

/**
 * Checks the designation entered after the Hard Final challenge.
 * Triggers the Architect chat sequence.
 */
function checkDesignation() {
    console.log("checkDesignation called");
    const designationInput = document.getElementById('designationInput');
    const designationFeedback = document.getElementById('designationFeedback');
    const submitBtn = document.querySelector('#designationInput + .cursor + .submit-button'); // Find button relative to input

    if (!designationInput || !designationFeedback) {
        console.error("Designation input/feedback elements missing.");
        if(designationFeedback) {
             designationFeedback.textContent = ":: System Error: UI elements missing. ::";
             designationFeedback.className = 'feedback incorrect';
        }
        return;
    }

    const enteredDesignation = designationInput.value.trim();
    if (!enteredDesignation) {
        designationFeedback.textContent = ":: Designation Required ::";
        designationFeedback.className = 'feedback incorrect'; // Use incorrect class
        return;
    }

    // Sanitize designation before potentially saving or displaying
    const safeDesignation = enteredDesignation.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Update session data or store designation separately
    const sessionDataString = localStorage.getItem('lastEnigmaSession');
    if(sessionDataString){
        try {
            const sessionData = JSON.parse(sessionDataString);
            sessionData.designation = safeDesignation; // Store sanitized version
            localStorage.setItem('lastEnigmaSession', JSON.stringify(sessionData));
            console.log("Updated session data with designation:", safeDesignation);
        } catch(e) {
            console.error("Failed to update session data with designation:", e);
            // Fallback: store designation separately
            localStorage.setItem('lastDesignation', safeDesignation);
        }
    } else {
        // If no session data exists, store designation separately
        localStorage.setItem('lastDesignation', safeDesignation);
        console.log("Saved designation separately:", safeDesignation);
    }

    // Disable input and button
    designationInput.disabled = true;
    if(submitBtn) submitBtn.disabled = true;

    // Provide feedback based on input (case-insensitive check for 'delta')
    let initialFeedbackText = "";
    if (safeDesignation.toLowerCase() === "delta") {
        initialFeedbackText = `:: Designation Accepted: DELTA :: ... Stand by...`;
    } else {
        initialFeedbackText = `:: Designation '${safeDesignation}' Logged :: ... Stand by...`;
    }
    designationFeedback.innerHTML = initialFeedbackText; // Use innerHTML as text is safe
    designationFeedback.className = 'feedback neutral'; // Use neutral class for processing

    // Trigger Architect Chat (Hard Ending) - Ensure function exists
    if (typeof startArchitectChat === 'function') {
         setTimeout(() => {
             startArchitectChat(safeDesignation); // Pass sanitized designation to chat
         }, 2500); // Delay before starting chat
    } else {
         console.error("startArchitectChat function not found! Cannot proceed.");
         designationFeedback.textContent = ":: System Error: Communication module offline. ::";
         designationFeedback.className = 'feedback incorrect';
    }
}


/**
 * Returns the user to the landing page/main menu.
 * @param {boolean} [confirmAbort=false] - If true, asks for confirmation if a challenge is active.
 */
function goBackToLanding(confirmAbort = false) {
     console.log("goBackToLanding called.");

     // Ensure startTime is defined before checking
     if (confirmAbort && typeof startTime !== 'undefined' && startTime) {
         if (!confirm("Abort current sequence and return to Terminal? Progress will be lost.")) {
              console.log("Abort cancelled."); return; // Stop if user cancels
         }
         console.log("Abort confirmed.");
     }

    // Stop timer if running (Ensure timerInterval is defined)
    if (typeof timerInterval !== 'undefined' && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Reset game state variables (Ensure they are defined in game-state.js)
    if (typeof startTime !== 'undefined') startTime = null;
    if (typeof finalTimeMs !== 'undefined') finalTimeMs = 0;
    if (typeof currentMode !== 'undefined') currentMode = null;
    if (typeof currentDifficulty !== 'undefined') currentDifficulty = null;
    if (typeof currentRiddleIndex !== 'undefined') currentRiddleIndex = 0;

    // Hide riddle display, show landing elements
    const riddleDisplay = document.getElementById('riddleDisplay');
    const entryForm = document.getElementById('entryForm');
    const initialHeader = document.getElementById('initialHeader');
    const landingHint = document.getElementById('landingHintContainer');

    if (riddleDisplay) riddleDisplay.style.display = 'none';
    if (entryForm) entryForm.style.display = 'block'; else console.warn("goBackToLanding: #entryForm not found.");
    if (initialHeader) initialHeader.style.display = 'block'; else console.warn("goBackToLanding: #initialHeader not found.");
    if (landingHint) landingHint.style.display = 'block'; // Assuming it should always show on landing

    // Update UI visibility for buttons etc. (Ensure functions are available)
    if (typeof updateFinalButtonsVisibility === 'function') updateFinalButtonsVisibility();
    if (typeof updateAccessTerminalButtonVisibility === 'function') updateAccessTerminalButtonVisibility();
    if (typeof updateNightmareVisibility === 'function') updateNightmareVisibility();
    if (typeof updateDynamicContentArea === 'function') updateDynamicContentArea(); // Show dynamic area again

    console.log("Returned to landing page.");
}

// --- Utility Functions ---

// escapeHtmlAttribute moved to ui-manager.js or defined globally

// --- Get Riddle Data Functions --- (Needed by core logic)

/** Gets the riddle set for the current mode and difficulty. */
function getCurrentRiddles() {
    if (typeof currentDifficulty === 'undefined' || typeof currentMode === 'undefined') {
        console.error("Cannot get riddles: currentDifficulty or currentMode is undefined.");
        return null;
    }

    if (currentMode === 'final') { // Should be handled by getFinalRiddleData
        console.warn("getCurrentRiddles called for 'final' mode. Use getFinalRiddleData instead.");
        return null;
    }

    if (currentDifficulty === 'nightmare') {
        if (typeof nightmareRiddles !== 'undefined' && nightmareRiddles[currentMode]) {
            return nightmareRiddles[currentMode];
        } else {
            console.error(`Nightmare riddles for mode '${currentMode}' not found or nightmareRiddles undefined.`);
            return null;
        }
    } else { // Standard Easy/Hard modes
        const difficultyKey = currentDifficulty.toLowerCase(); // "easy", "hard"
        if (typeof allRiddles !== 'undefined' && allRiddles[difficultyKey] && allRiddles[difficultyKey][currentMode]) {
            return allRiddles[difficultyKey][currentMode];
        } else {
            console.warn(`Could not get standard riddle set for: Diff=${currentDifficulty} (key: ${difficultyKey}), Mode=${currentMode}`);
            console.log("Available allRiddles structure:", allRiddles); // Log the structure for debugging
            return null;
        }
    }
}

/** Gets the riddle data for the final challenges. */
function getFinalRiddleData(difficulty) {
    // Ensure data structure is defined
    if (typeof allRiddles === 'undefined' || !allRiddles.finalRiddles) {
         console.error("Cannot get final riddle data: allRiddles.finalRiddles is missing."); return null;
    }
    if (!difficulty || !allRiddles.finalRiddles[difficulty]) {
         console.warn(`Final riddle data not found for difficulty: ${difficulty}`); return null;
    }
    return allRiddles.finalRiddles[difficulty]; // allRiddles from riddle-data.js
}

console.log("Game Logic Initialized."); // Log successful loading of this file
