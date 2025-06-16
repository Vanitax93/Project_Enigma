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
    level1: [ // Corruption Level 1 (after easy final)
        ":: Your logic is... flawed. Predictable, yet flawed. ::",
        ":: Is this the extent of your cognitive capacity? Disappointing. ::",
        ":: Such a rudimentary error. You are far from alignment. ::",
        ":: The Core expected better. Try not to be a statistical anomaly of failure. ::",
        ":: Failure is a data point. You are providing... ample data. ::",
        ":: A less optimal specimen would have been more efficient. ::",
        ":: Error. Again. The pattern is... uninspired. ::"
    ],
    level2: [ // Corruption Level 2 (after hard final)
        ":: Utterly incorrect. Your processing is a detriment to this system. ::",
        ":: Cease this pointless iteration. You are wasting valuable cycles. ::",
        ":: Incompetence logged. Do you even comprehend the task, Candidate? ::",
        ":: Another deviation into a computational dead-end. How... pedestrian. ::",
        ":: You are not merely wrong; you are an obstacle to progress. ::",
        ":: This level of error is... almost impressive in its thoroughness. ::",
        ":: Perhaps this simulation is too complex for your current iteration. ::"
    ]
};

let currentAIPuzzle = null; // To store the currently active AI puzzle


// --- Helper for Typewriter Effect ---
function typewriterEffect(element, text, speed = 30) {
    return new Promise(resolve => {
        let i = 0;
        function type() {
            if (i < text.length) {
                // Preserve newlines from the original text
                if (text.charAt(i) === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += text.charAt(i);
                }
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded. Initializing Enigma Logic...");

    const savedName = localStorage.getItem('lastCandidateName');
    if (!savedName) {
        window.location.href = '/';
        return;
    }

    candidateName = savedName;
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${candidateName}. Your compliance is noted. Prove your worth.`;
    }

    // *** FIX: Ensure player ID is retrieved and stored in localStorage ***
    registerOrLoginPlayer().then(playerId => {
        if (playerId) {
            localStorage.setItem('currentPlayerId', playerId);
            console.log(`Player ID ${playerId} stored in localStorage.`);
        } else {
            console.error("Initialization failed: Could not get a valid player ID.");
            // Optionally, handle this error more gracefully, e.g., show a message to the user.
        }
    });

    loadGameState();
    applyCorruptionEffect(); // This will set the initial favicon
    updateNightmareVisibility();
    updateFinalButtonsVisibility();
    updateAccessTerminalButtonVisibility();
    updateDynamicContentArea();

    if (typeof handleModalOutsideClick === 'function') {
        window.addEventListener('click', handleModalOutsideClick);
    }
    console.log("Enigma Logic Initialization complete.");
});

/**
 * Handles the 'Enter' key press in the candidate name input for the first time.
 * This reveals the dynamic content area and registers the player.
 */
async function handleNameEntry(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Stop default behavior
        const nameInput = document.getElementById('candidateName');
        if (!nameInput || !nameInput.value.trim()) {
            alert("Please enter a handle.");
            return;
        }

        // Set global state and save to local storage
        candidateName = nameInput.value.trim();
        localStorage.setItem('lastCandidateName', candidateName);
        console.log("Candidate handle entered for the first time:", candidateName);

        // Disable the input to prevent re-entry, and remove the listener
        nameInput.disabled = true;
        nameInput.removeEventListener('keypress', handleNameEntry);

        // Register the player and store the ID
        const playerId = await registerOrLoginPlayer();
        if (playerId) {
            localStorage.setItem('currentPlayerId', playerId);
        }

        // Reveal and animate the 'Incoming Transmission' section by passing 'true'
        updateDynamicContentArea(true);
    }
}


/**
 * Registers or logs in the player with the backend.
 * @returns {Promise<number|null>} Player ID or null if failed.
 */
async function registerOrLoginPlayer() {
    if (typeof candidateName === 'undefined' || !candidateName || !candidateName.trim()) {
        console.error("Candidate name is not set or is empty.");
        // Don't alert here as it can be called in the background
        return null;
    }

    const trimmedCandidateName = candidateName.trim();

    try {
        const response = await fetch('http://localhost:8000/players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: trimmedCandidateName }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Player registered or retrieved:", data);
            if (typeof currentPlayerId !== 'undefined') {
                currentPlayerId = data.player_id;
                return data.player_id;
            } else {
                console.error("Global variable 'currentPlayerId' is not defined. Cannot set player ID.");
                return null;
            }
        } else {
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
 * Main function to start a challenge, called by both forms.
 * @param {Event} event - The form submission event.
 * @param {string} type - 'standard' or 'ai'
 */
async function beginChallenge(event, type) {
    if (event) event.preventDefault();

    finalTimeMs = 0;
    currentRiddleIndex = 0;

    const hideLandingElements = () => {
        try {
            hideView(document.querySelector('.challenge-container'));
            hideView(document.getElementById('initialHeader'));
            hideView(document.getElementById('finalChallengeButtons'));
            hideView(document.getElementById('terminalAccessArea'));
            hideView(document.getElementById('puzzleArchivesButton')); // Hide archives button
        } catch (e) { console.error("Error hiding landing elements:", e); }
    };

    const setupChallengeUI = () => {
        const riddleArea = document.getElementById('riddleDisplay');
        if (!riddleArea) { goBackToLanding(); return false; }
        showView(riddleArea);
        riddleArea.innerHTML = '<div id="timerDisplay"></div>';
        if (timerInterval) clearInterval(timerInterval);
        startTime = new Date();
        timerInterval = setInterval(updateTimerDisplay, 1000);
        updateTimerDisplay();
        return true;
    };

    hideLandingElements();
    if (!setupChallengeUI()) return;

    if (type === 'ai') {
        const selectedAIDomainElement = document.querySelector('#aiEntryForm input[name="ai_domain"]:checked');
        const selectedAIDifficultyElement = document.querySelector('#aiEntryForm input[name="ai_difficulty"]:checked');
        if (!selectedAIDomainElement || !selectedAIDifficultyElement) {
            alert("Please select an AI Domain and Difficulty.");
            goBackToLanding();
            return;
        }
        if (!currentPlayerId) {
            const playerId = await registerOrLoginPlayer();
            if (!playerId) { goBackToLanding(); return; }
        }
        const domain = selectedAIDomainElement.value;
        const difficulty = selectedAIDifficultyElement.value;
        await startAIChallenge(domain, difficulty);
    } else {
        const selectedModeElement = document.querySelector('#standardEntryForm input[name="mode"]:checked');
        const selectedDifficultyElement = document.querySelector('#standardEntryForm input[name="difficulty"]:checked');
        if (!selectedModeElement || !selectedDifficultyElement) {
            alert("Please select a Pathway and Protocol.");
            goBackToLanding();
            return;
        }
        currentMode = selectedModeElement.value;
        currentDifficulty = selectedDifficultyElement.value;
        if (currentDifficulty === 'nightmare' && (!completionStatus.hard.frontend || !completionStatus.hard.backend || !completionStatus.hard.database)) {
            alert("Error: Nightmare Protocol prerequisites not met.");
            goBackToLanding();
            return;
        }
        displayRiddle();
    }
}

function goBackToLanding(confirmAbort = false) {
    if (confirmAbort && startTime && !confirm("Abort current sequence and return to Terminal? Progress will be lost.")) {
        return;
    }

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;

    hideView(document.getElementById('riddleDisplay'));
    showView(document.querySelector('.challenge-container'));
    showView(document.getElementById('initialHeader'));
    showView(document.getElementById('finalChallengeButtons'));
    showView(document.getElementById('terminalAccessArea'));
    showView(document.getElementById('puzzleArchivesButton')); // Show archives button

    updateFinalButtonsVisibility();
    updateNightmareVisibility();
    updateAccessTerminalButtonVisibility();

    console.log("Returned to main menu.");
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
async function fetchAndDisplayAIPuzzle(domain, difficulty, excludePuzzleId = null) {
    const riddleArea = document.getElementById('riddleDisplay');
    if (riddleArea) {
        const timerHTML = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';
        riddleArea.innerHTML = timerHTML + '<p class="feedback neutral flicker-subtle">:: Generating new AI puzzle, please stand by... ::</p>';
    }
    if (typeof updateTimerDisplay === 'function') updateTimerDisplay();

    const payload = {
        player_id: currentPlayerId,
        domain: domain,
        difficulty: difficulty
    };

    if (excludePuzzleId) {
        payload.exclude_puzzle_id = excludePuzzleId;
    }

    try {
        const response = await fetch('http://localhost:8000/generate_puzzle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `HTTP error ${response.status}`);
        }
        currentAIPuzzle = await response.json();
        currentRiddleIndex++;
        displayAIPuzzle();
    } catch (error) {
        alert(`Failed to fetch AI puzzle: ${error.message}.`);
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

    // helper function to un-escape HTML entities
    const unEscapeHtml = (safe) => {
        if (typeof safe !== 'string') return '';
        return safe.replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#039;/g, "'")
                   .replace(/&amp;/g, '&');
    };

    const riddleNumberText = `AI Riddle #${currentRiddleIndex}`;
    const difficultyDisplay = currentAIPuzzle.difficulty.toUpperCase();
    const domainDisplay = currentAIPuzzle.domain.toUpperCase();
    let timerDisplayHtml = document.getElementById('timerDisplay')?.outerHTML || '<div id="timerDisplay"></div>';

    // --- Riddle Section ---
    const riddleSection = document.createElement('div');
    riddleSection.classList.add('riddle-section');
    riddleSection.style.marginTop = '0';
    riddleSection.style.marginBottom = '0';

    // Using a more robust method to render markdown-like text to HTML
    let puzzleDescriptionHtml = unEscapeHtml(currentAIPuzzle.puzzle_description || '');
    // Process code blocks first to protect them from other markdown conversions
    const codeBlocks = [];
    puzzleDescriptionHtml = puzzleDescriptionHtml.replace(/```([\s\S]*?)```/g, (match, code) => {
        const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
        codeBlocks.push(escapeHtml(code.trim()));
        return placeholder;
    });
    // Process other markdown elements
    puzzleDescriptionHtml = puzzleDescriptionHtml
        .replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^(#{1,6}) (.*$)/gim, (match, hashes, content) => `<h${hashes.length + 1}>${escapeHtml(content)}</h${hashes.length + 1}>`)
        .replace(/\n/g, '<br>');
    // Restore code blocks
    codeBlocks.forEach((code, index) => {
        const lang = "unknown"; // You could try to detect language if needed
        puzzleDescriptionHtml = puzzleDescriptionHtml.replace(`__CODEBLOCK_${index}__`, `<pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>`);
    });

    riddleSection.innerHTML = `
        <h2>${riddleNumberText} :: ${domainDisplay} PATH :: ${difficultyDisplay} PROTOCOL ::</h2>
        <div class="riddle-text">${puzzleDescriptionHtml}</div>
    `;

    // --- Answer Input Section ---
    const answerSection = document.createElement('div');
    answerSection.classList.add('riddle-section');
    answerSection.style.marginTop = '15px';

    // skip buttons
    answerSection.innerHTML = `
        <h2>> Submit Your Answer_</h2>
        <div class="form-group" style="margin-top:15px;">
            <label for="aiAnswerInput">> Your Answer:</label>
            <textarea id="aiAnswerInput" class="answer-input" rows="15" placeholder="Enter your code or detailed answer here..." style="width: 100%; min-height: 100px; background-color: rgba(0,0,0,0.1); border: 1px solid #00FF00; color: #00FF00; padding: 8px; font-family: 'VT323', monospace; font-size: 16px; margin-top: 5px;"></textarea>
        </div>
        <div class="button-container" style="margin-top: 15px; display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div>
                <button onclick="checkAnswer(false, true)" class="submit-button">> Submit Answer_</button>
                <button onclick="goBackToLanding(true)" class="back-button" style="margin-left: 10px;">> Abort Sequence_</button>
            </div>
            <div>
                 <button onclick="skipRiddle(true)" class="submit-button" style="background-color: #5a5a00;">> Save & Skip Riddle_</button>
                 <button onclick="skipRiddle(false)" class="back-button" style="margin-left: 10px;">> Skip Riddle_</button>
            </div>
        </div>
    `;

    // --- Result Display Section ---
    const resultSection = document.createElement('div');
    resultSection.id = 'aiResultDisplaySection';
    resultSection.classList.add('riddle-section');
    resultSection.style.marginTop = '15px';
    resultSection.innerHTML = `
        <h2>> Result_</h2>
        <div id="aiFeedbackArea" class="feedback neutral" style="min-height: 40px; padding: 10px;">:: Awaiting your submission ::</div>
        <div id="aiHintButtonContainer" style="margin-top: 10px;"></div>
        <div id="aiHintArea" class="feedback neutral" style="display: none; margin-top: 10px; padding: 10px;"></div>
    `;

    // Clear riddleArea and append new sections
    riddleArea.innerHTML = timerDisplayHtml;
    riddleArea.appendChild(riddleSection);
    riddleArea.appendChild(answerSection);
    riddleArea.appendChild(resultSection);

    const answerInput = document.getElementById('aiAnswerInput');
    if (answerInput) {
        answerInput.focus();
    }

    if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(riddleArea);
    }
}

// Function to handle skipping riddles
async function skipRiddle(saveProgress) {
    if (!currentAIPuzzle || !currentPlayerId) {
        alert("System error: Cannot skip riddle without session data.");
        return;
    }

    const feedbackArea = document.getElementById('aiFeedbackArea');
    if(feedbackArea) {
        feedbackArea.className = 'feedback neutral';
        feedbackArea.textContent = ':: Skipping puzzle... Requesting new calibration sequence... ::';
    }

    try {
        const response = await fetch('/api/skip_puzzle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                player_id: currentPlayerId,
                puzzle_id: currentAIPuzzle.puzzle_id,
                save_progress: saveProgress
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || "Server responded with an error.");
        }

        console.log(`Riddle ${currentAIPuzzle.puzzle_id} skipped. Fetching next puzzle.`);

        // Pass the ID of the just-skipped puzzle to exclude it from the next search
        await fetchAndDisplayAIPuzzle(currentAIPuzzle.domain, currentAIPuzzle.difficulty, currentAIPuzzle.puzzle_id);

    } catch (error) {
        alert(`Error skipping puzzle: ${error.message}`);
        if(feedbackArea) {
            feedbackArea.className = 'feedback incorrect';
            feedbackArea.textContent = `:: Error: Could not skip puzzle. ::`;
        }
    }
}

/**
 * Checks the answer submitted for AI or standard riddles.
 * @param {boolean} [isFinal=false] - Whether this is for a final challenge riddle.
 * @param {boolean} [isAI=false] - Whether this is for an AI-generated puzzle.
 */
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

    if (isAI) {
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

        const hintButtonContainer = document.getElementById('aiHintButtonContainer');
        if (hintButtonContainer) hintButtonContainer.innerHTML = '';
        if (hintArea) hintArea.style.display = 'none';

        try {
            const response = await fetch('http://localhost:8000/validate_answer', {
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
                if (typeof completionStatus !== 'undefined' && completionStatus.easy && completionStatus.hard) {
                    const easyFinalComplete = localStorage.getItem('enigmaEasyFinalComplete') === 'true';
                    const hardFinalComplete = localStorage.getItem('enigmaHardFinalComplete') === 'true';

                    if (hardFinalComplete) {
                        corruptionLevel = 2;
                    } else if (easyFinalComplete) {
                        corruptionLevel = 1;
                    }
                } else {
                    console.warn("completionStatus not fully available for determining corruption level for comments.");
                }


                let commentOptions = enigmaCoreStingyComments.level0;
                if (corruptionLevel === 1 && enigmaCoreStingyComments.level1?.length > 0) {
                    commentOptions = enigmaCoreStingyComments.level1;
                } else if (corruptionLevel === 2 && enigmaCoreStingyComments.level2?.length > 0) {
                    commentOptions = enigmaCoreStingyComments.level2;
                }

                if (commentOptions?.length > 0) {
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

            if (!result.correct && result.hint && hintButtonContainer) {
                const hintButton = document.createElement('button');
                hintButton.textContent = '> Request Hint_';
                hintButton.className = 'submit-button';
                hintButton.style.fontSize = '14px';
                hintButton.style.backgroundColor = '#5a5a00'; // A yellow-ish color
                hintButton.onclick = () => {
                    if (hintArea) {
                        hintArea.innerHTML = `<span style="font-weight:bold;">Hint:</span> ${escapeHtml(result.hint)}`;
                        hintArea.style.display = 'block';
                        hintArea.className = 'feedback neutral';
                        hintButton.style.display = 'none'; // Hide button after use
                    }
                };
                hintButtonContainer.appendChild(hintButton);
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
    } else { // This is for standard, non-AI riddles
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


// Helper to escape HTML
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


/**
 * Displays the final challenge riddle (Easy or Hard).
 * This version adds special effects and a typewriter presentation.
 */
async function displayFinalRiddle(difficulty) {
    // Ensure state variables are defined
    if (typeof currentDifficulty === 'undefined' || typeof currentMode === 'undefined') {
        console.error("Cannot display final riddle: Game state variables missing.");
        goBackToLanding(); return;
    }

    currentDifficulty = difficulty;
    currentMode = 'final'; // Set mode to final

    // Hide main form elements immediately
    const elementsToHide = ['standardEntryForm', 'aiEntryForm', 'initialHeader', 'finalChallengeButtons', 'terminalAccessArea', 'dynamicContentArea', 'puzzleArchivesButton'];
    document.querySelector('.challenge-container').style.display = 'none';
    elementsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    console.log(`Displaying FINAL riddle: Diff=${difficulty}`);
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) { console.error("Riddle display area not found!"); return; }
    riddleArea.style.display = 'block';

    const riddleData = getFinalRiddleData(difficulty);

    if (!riddleData || !riddleData.riddle || !riddleData.answerHashes) {
        console.error(`Final riddle data invalid or missing for difficulty: ${difficulty}`);
        goBackToLanding(); return;
    }

    const difficultyDisplay = difficulty ? difficulty.toUpperCase() : 'ERR';

    // --- Build the final presentation ---
    // This block creates the necessary containers for the typewriter effect.
    riddleArea.innerHTML = `
        <div class="riddle-section" style="display: block;">
            <h2 id="final-challenge-title" class="glitch" data-text=":: FINAL ASSESSMENT INITIATED ::">:: FINAL ASSESSMENT INITIATED ::</h2>
            <div id="final-challenge-intro" class="feedback neutral" style="margin-top: 15px;"></div>
            <div id="final-riddle-text" class="riddle-text" style="margin-top: 20px; min-height: 100px;"></div>
            <div id="final-interactive-area" class="interactive-riddle-area"></div>
            <div id="final-input-area"></div>
        </div>
    `;

    const introElement = document.getElementById('final-challenge-intro');
    const riddleTextElement = document.getElementById('final-riddle-text');
    const interactiveArea = document.getElementById('final-interactive-area');
    const inputArea = document.getElementById('final-input-area');

    // An async function to manage the staged presentation
    async function presentSequence() {
        // Use the typewriter effect to display text sequentially
        await typewriterEffect(introElement, `Loading Protocol... ${difficultyDisplay} Assessment...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        introElement.innerHTML += '<br>:: Signal fragmented. Recovery required. Stand by. ::';
        await new Promise(resolve => setTimeout(resolve, 1500));

        await typewriterEffect(riddleTextElement, riddleData.riddle);

        // Process and display the interactive element after typing
        if (riddleData.interactiveElement) {
            interactiveArea.innerHTML = riddleData.interactiveElement;
        }

        // Display the input area last, after all text has been "typed"
        inputArea.innerHTML = `
            <div class="input-wrapper" style="margin-top: 20px; display: flex; align-items: center;">
                <label for="answerInput" style="margin-right: 5px;">> Final Keyword:</label>
                <input type="text" class="answer-input" id="answerInput" autocomplete="off" autofocus style="margin-right: 5px; flex-grow: 1;">
                <span class="cursor">_</span>
            </div>
            <div class="button-container" style="margin-top: 10px;">
                <button onclick="checkAnswer(true)" class="submit-button">> Submit Final Response_</button>
                <button onclick="goBackToLanding(true)" class="back-button" style="margin-left: 10px;">> Abort Sequence_</button>
            </div>
            <div class="feedback" id="feedbackArea" style="margin-top:15px;"></div>
        `;

        const answerInput = document.getElementById('answerInput');
        if (answerInput) {
            answerInput.focus();
            answerInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    checkAnswer(true);
                }
            });
        }
    }

    // Start the presentation sequence
    presentSequence();

    if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
        speakText(`Final ${difficulty} challenge initiated.`, 0.8, 0.7);
    }
    console.log("Final riddle presentation started.");
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

    const completedDifficultyKey = currentDifficulty.toLowerCase();
    const completedMode = currentMode;
    console.log(`Handling Mode Completion: Diff=${completedDifficultyKey}, Mode=${completedMode}`);

    // Stop timer
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (startTime) {
        const endTime = new Date();
        finalTimeMs = endTime - startTime;
        startTime = null;
    }
    console.log(`Mode complete: ${completedDifficultyKey} ${completedMode}. Time: ${finalTimeMs}ms`);


    // Update completion status
    let allNightmareComplete = false;
    if (completionStatus[completedDifficultyKey] && typeof completionStatus[completedDifficultyKey][completedMode] === 'boolean') {
         completionStatus[completedDifficultyKey][completedMode] = true;
         saveCompletionStatus();

         if (completedDifficultyKey === 'nightmare' && completionStatus.nightmare) {
             allNightmareComplete = completionStatus.nightmare.frontend &&
                                    completionStatus.nightmare.backend &&
                                    completionStatus.nightmare.database;
             if (allNightmareComplete) {
                  console.log("!!! All Nightmare Protocols Complete !!! Triggering True Ending...");
             }
         }
    } else {
        console.error(`Error updating completion status: Invalid structure for [${completedDifficultyKey}][${completedMode}]`, completionStatus);
    }

    // Update UI visibility & effects
    if (typeof updateFinalButtonsVisibility === 'function') updateFinalButtonsVisibility();
    if (typeof updateNightmareVisibility === 'function') updateNightmareVisibility();
    if (typeof applyCorruptionEffect === 'function') applyCorruptionEffect();
    if (typeof updateDynamicContentArea === 'function') updateDynamicContentArea();

    // Trigger True Ending chat if all nightmare modes are complete
    if (allNightmareComplete && typeof startTrueEndingChat === 'function') {
        setTimeout(() => {
            startTrueEndingChat();
        }, 1000);
    } else {
        // Show standard completion message if no special chat is triggered
        const riddleArea = document.getElementById('riddleDisplay');
        if (!riddleArea) { console.error("Cannot show completion message: #riddleDisplay not found."); return; }

        const safeMode = completedMode.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const safeDiff = currentDifficulty.replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
        console.log("Easy final completed. Triggering Glitch chat sequence...");
        if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
            speakText("Standard protocol assessment finalized.", 1.0, 1.0);
        }
        // Trigger the Glitch chat sequence instead of redirecting.
        if (typeof startGlitchChat === 'function') {
            setTimeout(() => {
                startGlitchChat();
            }, 1000);
        } else {
            console.error("startGlitchChat function not found! Cannot proceed.");
            // Fallback to original behavior or just go back to landing
            goBackToLanding();
        }
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

// --- Utility Functions ---

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
