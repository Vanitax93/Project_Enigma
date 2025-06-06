// ui-manager.js
// Handles DOM manipulation, UI updates, effects, modals, and speech synthesis.

// --- State for Dynamic Audio ---
let dynamicAudio_currentlyPlaying = null;
let dynamicAudio_currentButton = null;
let dynamicAudio_currentIndicator = null;

// --- Helper Functions --- (Ensure escapeHtmlAttribute is defined if needed here, or globally)
// function escapeHtmlAttribute(text) { if (!text) return ''; return text.replace(/"/g, '&quot;').replace(/'/g, '&apos;'); }
// Assuming escapeHtmlAttribute is available globally (e.g., from game-logic.js or game-state.js if needed there)
// If not, define it here:
function escapeHtmlAttribute(text) {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}


// --- UI Element Visibility & Updates ---

/**
 * Updates the visibility of the final challenge buttons based on completion status.
 */
function updateFinalButtonsVisibility() {
    console.log("Updating final button visibility..."); // Log moved here
    const finalButtonsDiv = document.getElementById('finalChallengeButtons');
    const finalEasyBtn = document.getElementById('finalEasyButton');
    const finalHardBtn = document.getElementById('finalHardButton');

    if (!finalButtonsDiv || !finalEasyBtn || !finalHardBtn) {
        console.warn("Final challenge button elements not found in DOM.");
        return;
    }
    // Ensure completionStatus is available (defined in game-state.js)
    if (typeof completionStatus === 'undefined' || !completionStatus || !completionStatus.easy || !completionStatus.hard) {
        console.error("completionStatus object is malformed or unavailable for final buttons.", typeof completionStatus !== 'undefined' ? completionStatus : 'undefined');
        finalEasyBtn.style.display = 'none';
        finalHardBtn.style.display = 'none';
        finalButtonsDiv.style.display = 'none';
        return;
    }

    let showEasy = completionStatus.easy.frontend && completionStatus.easy.backend && completionStatus.easy.database;
    let showHard = completionStatus.hard.frontend && completionStatus.hard.backend && completionStatus.hard.database;

    console.log(`Setting final button visibility: Easy=${showEasy}, Hard=${showHard}`);
    finalEasyBtn.style.display = showEasy ? 'inline-block' : 'none';
    finalHardBtn.style.display = showHard ? 'inline-block' : 'none';
    finalButtonsDiv.style.display = (showEasy || showHard) ? 'block' : 'none';
}

/**
 * Updates the visibility of the Access Secure Terminal button.
 */
function updateAccessTerminalButtonVisibility() {
    console.log("Updating Access Terminal button visibility.");
    const terminalButton = document.getElementById('accessTerminalButton');
    if (!terminalButton) { console.warn("Access Terminal button not found in DOM."); return; }
    // Check localStorage for the completion flag
    const easyFinalComplete = localStorage.getItem('enigmaEasyFinalComplete') === 'true';
    console.log(`Easy final complete flag: ${easyFinalComplete}`);
    terminalButton.style.display = easyFinalComplete ? 'inline-block' : 'none';
}

/**
 * Updates the visibility of the Nightmare Protocol difficulty option.
 */
function updateNightmareVisibility() {
    console.log("Updating Nightmare Protocol visibility...");
    const nightmareLabel = document.getElementById('nightmareOptionLabel');
    if (!nightmareLabel) { console.warn("Nightmare option label not found in DOM."); return; }

    // Check if all HARD modes are complete using the global completionStatus object (from game-state.js)
    if (typeof completionStatus === 'undefined' || !completionStatus || !completionStatus.hard) {
         console.error("completionStatus object is malformed or unavailable for nightmare visibility.", typeof completionStatus !== 'undefined' ? completionStatus : 'undefined');
         nightmareLabel.style.display = 'none'; // Hide if status is missing
         return;
    }

    const hardComplete = completionStatus.hard.frontend === true &&
                         completionStatus.hard.backend === true &&
                         completionStatus.hard.database === true;

    if (hardComplete) {
        nightmareLabel.style.display = 'block'; // Show the label
        console.log("Nightmare Protocol UNLOCKED.");
        // Ensure the radio button itself is enabled if data loaded
        const nightmareRadio = nightmareLabel.querySelector('input[value="nightmare"]');
        // Check if nightmareRiddles is defined and has content (from nightmare-riddles.js)
        if (nightmareRadio && typeof nightmareRiddles !== 'undefined' && nightmareRiddles?.frontend?.length > 0) {
             nightmareRadio.disabled = false;
             nightmareLabel.title = ""; // Clear any error title
        } else if (nightmareRadio) {
             nightmareRadio.disabled = true; // Keep disabled if data failed
             nightmareLabel.title = "Nightmare Protocol data failed to load.";
             console.warn("Nightmare radio disabled - nightmareRiddles data missing or empty.");
        }

    } else {
        nightmareLabel.style.display = 'none'; // Hide the label
        console.log("Nightmare Protocol remains locked.");
        const nightmareRadio = nightmareLabel.querySelector('input[value="nightmare"]');
        if (nightmareRadio && nightmareRadio.checked) {
             const easyRadio = document.querySelector('input[value="easy"]');
             if(easyRadio) easyRadio.checked = true; // Default back to easy if locked while selected
        }
    }
}


// --- Timer ---

/**
 * Updates the timer display on the screen.
 */
function updateTimerDisplay() {
    // Requires global startTime from game-state.js
    if (typeof startTime === 'undefined' || !startTime) return;
    const now = new Date();
    const elapsedMs = now - startTime;
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    const formattedTime = `:: Time Elapsed: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ::`;
    const timerDisplay = document.getElementById('timerDisplay');
    const riddleDisplayArea = document.getElementById('riddleDisplay');

    // Only update if the timer element exists and the riddle area is visible
    if (timerDisplay && riddleDisplayArea && riddleDisplayArea.style.display === 'block') {
        timerDisplay.textContent = formattedTime;
        // Ensure styles are applied if not set by default
        timerDisplay.style.textAlign = timerDisplay.style.textAlign || 'right';
        timerDisplay.style.marginBottom = timerDisplay.style.marginBottom || '15px';
    } else if (timerDisplay) {
        timerDisplay.textContent = ''; // Clear if not in riddle view
    }
}

// --- Visual Effects ---

/**
 * Applies corruption effect CSS classes to the body based on completion status.
 */
function applyCorruptionEffect() {
    console.log("Applying corruption effect...");
    let corruptionLevel = 0;

    // Check final completion flags first from localStorage
    const hardFinalDone = localStorage.getItem('enigmaHardFinalComplete') === 'true';
    const easyFinalDone = localStorage.getItem('enigmaEasyFinalComplete') === 'true';

    // Determine level based on flags
    if (hardFinalDone) {
        corruptionLevel = 2;
        console.log("Corruption Level 2 triggered (Hard Final Complete).");
    } else if (easyFinalDone) {
        corruptionLevel = 1;
        console.log("Corruption Level 1 triggered (Easy Final Complete).");
    } else {
         console.log("No corruption applied (based on final flags).");
    }

    const bodyElement = document.body;
    if (!bodyElement) {
        console.error("Cannot apply corruption effect: body element not found.");
        return;
    }
    // Clear all potential levels first
    bodyElement.classList.remove('corruption-level-1', 'corruption-level-2', 'corruption-level-3', 'corruption-severed');
    // Apply the determined level
    if (corruptionLevel === 1) {
        bodyElement.classList.add('corruption-level-1');
    } else if (corruptionLevel === 2) {
        // Apply level 2 (CSS should handle inheriting/overriding level 1)
        bodyElement.classList.add('corruption-level-2');
    }
    // Level 3 / Severed are applied directly in chat sequences, so no need to handle them here.
}

// --- Modals ---

/**
 * Shows the lore fragment modal.
 * @param {string} loreText - The lore text to display.
 */
function showLoreModal(loreText) {
    if (!loreText) { console.log("Empty lore text passed to showLoreModal."); return; }
    const modal = document.getElementById('loreModal');
    const fragmentTextElement = document.getElementById('loreFragmentText');
    if (!modal || !fragmentTextElement) { console.error("Lore modal elements missing!"); return; }

    // Handle escaped quotes if loreText comes directly from data attributes
    const displayLore = loreText.replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    fragmentTextElement.innerHTML = displayLore; // Use innerHTML to render potential spans within lore
    modal.style.display = "block";

    // Track after showing (requires trackLoreDiscovery from game-state.js)
    if (typeof trackLoreDiscovery === 'function') {
        trackLoreDiscovery(loreText);
    } else {
        console.warn("trackLoreDiscovery function not found. Lore not tracked.");
    }


    // Optional speech (requires speechEnabled from game-state.js and speakText from this file)
    if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
        // Strip HTML tags for speech synthesis
        speakText("Log fragment: " + displayLore.replace(/<[^>]*>?/gm, ''), 0.85, 0.75);
    }
}

/** Closes the lore fragment modal. */
function closeLoreModal() {
    const modal = document.getElementById('loreModal');
    if(modal) modal.style.display = "none";
}

/** Shows the modal displaying all collected lore fragments. */
function showCollectedLore() {
    const modal = document.getElementById('collectedLoreModal');
    const contentArea = document.getElementById('collectedLoreContent');
    if (!modal || !contentArea) { console.error("Collected lore modal elements missing!"); return; }
    contentArea.innerHTML = ''; // Clear previous content

    // Requires global discoveredLore from game-state.js
    if (typeof discoveredLore === 'undefined' || discoveredLore.length === 0) {
        contentArea.innerHTML = '<p>:: No log fragments collected ::</p>';
    } else {
        // Requires LANDING_LORE from game-state.js and allRiddles from riddle-data.js
        if (typeof LANDING_LORE === 'undefined' || typeof allRiddles === 'undefined') {
             console.error("Cannot display collected lore: LANDING_LORE or allRiddles not defined.");
             contentArea.innerHTML = '<p>:: Error loading lore data sources ::</p>';
             modal.style.display = "block";
             return;
        }

        const landingLoreTextMatch = LANDING_LORE.match(/data-lore="(.*?)"/);
        const landingLoreActualText = landingLoreTextMatch ? landingLoreTextMatch[1] : null;
        let entryIndex = 1; // Start index at 1
        const displayedLore = new Set(); // Track displayed lore to avoid duplicates

        // Helper to add lore entry safely
        const addLoreEntry = (text, source = "?") => {
            if (!text) return; // Skip if text is empty
            const cleanedText = text.replace(/<[^>]*>?/gm, ''); // Strip tags for display list
            const checkText = escapeHtmlAttribute(text); // Use escaped version for tracking

            if (!displayedLore.has(checkText)) {
                const p = document.createElement('p');
                // Sanitize source before displaying
                const safeSource = source.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                p.innerHTML = `<strong>Entry ${entryIndex++} (${safeSource}):</strong> ${cleanedText}`;
                contentArea.appendChild(p);
                displayedLore.add(checkText);
            }
        };

        // Check landing page lore
        if (landingLoreActualText && discoveredLore.includes(escapeHtmlAttribute(landingLoreActualText))) {
            addLoreEntry(landingLoreActualText, "System Boot");
        }

        // Helper to process a set of riddles
        const processRiddleSet = (riddles, sourcePrefix) => {
            if (Array.isArray(riddles)) {
                riddles.forEach((riddle, index) => {
                    if (riddle && riddle.lore && discoveredLore.includes(escapeHtmlAttribute(riddle.lore))) {
                        addLoreEntry(riddle.lore, `${sourcePrefix} ${index + 1}`);
                    }
                });
            }
        };

        // Iterate through difficulties and modes
        for (const diff in allRiddles) {
            // Skip finalRiddles object and nightmare if not loaded properly
            if (diff === 'finalRiddles' || !allRiddles[diff] || (diff === 'nightmare' && typeof nightmareRiddles === 'undefined')) continue;

            for (const mode in allRiddles[diff]) {
                 if (allRiddles[diff][mode]) { // Check if mode exists
                    processRiddleSet(allRiddles[diff][mode], `${diff}/${mode}`);
                 }
            }
        }

        // Process Final riddles
        if (allRiddles.finalRiddles) {
            for (const diff in allRiddles.finalRiddles) {
                const riddle = allRiddles.finalRiddles[diff];
                if (riddle && riddle.lore && discoveredLore.includes(escapeHtmlAttribute(riddle.lore))) {
                    addLoreEntry(riddle.lore, `Final/${diff}`);
                }
            }
        }

        // Add any remaining discovered lore that wasn't matched to a specific riddle
        // This might happen if lore is added through other means
        discoveredLore.forEach(lore => {
            if (!displayedLore.has(lore)) {
                // Unescape for display, keep it simple
                addLoreEntry(lore.replace(/&quot;/g, '"').replace(/&apos;/g, "'"), "Unknown Source");
            }
        });

        // Fallback if, after all checks, nothing was added (e.g., discoveredLore had items not in riddles)
        if (contentArea.innerHTML === '') {
            contentArea.innerHTML = '<p>:: Log fragments corrupted or empty ::</p>';
        }
    }
    modal.style.display = "block";
}


/** Closes the collected lore modal. */
function closeCollectedLoreModal() {
    const modal = document.getElementById('collectedLoreModal');
    if (modal) modal.style.display = "none";
}

/** Closes modals on outside click. Needs to be attached in init (e.g., game-logic.js). */
function handleModalOutsideClick(event) {
    const loreModal = document.getElementById('loreModal');
    const collectedLoreModal = document.getElementById('collectedLoreModal');
    // Close if the click target is the modal background itself
    if (loreModal && event.target == loreModal) { closeLoreModal(); }
    if (collectedLoreModal && event.target == collectedLoreModal) { closeCollectedLoreModal(); }
}


// --- Dynamic Content Area Logic ---

/**
 * Stops the currently playing dynamic audio track.
 */
function stopDynamicAudio() {
    if (dynamicAudio_currentlyPlaying) {
        dynamicAudio_currentlyPlaying.pause();
        dynamicAudio_currentlyPlaying.currentTime = 0; // Reset playback position
        if (dynamicAudio_currentButton) {
            dynamicAudio_currentButton.textContent = '[ Play Audio ]';
            dynamicAudio_currentButton.classList.remove('playing');
        }
        if (dynamicAudio_currentIndicator) {
            dynamicAudio_currentIndicator.classList.remove('playing');
        }
        // Clear error message when stopping
        const errorDiv = document.getElementById('dynamic-audio-error');
        if (errorDiv) errorDiv.textContent = '';

        // Reset state variables
        dynamicAudio_currentlyPlaying = null;
        dynamicAudio_currentButton = null;
        dynamicAudio_currentIndicator = null;
        console.log("Dynamic audio stopped.");
    }
}

/**
 * Updates the dynamic content area (link and audio) based on game progress.
 */
function updateDynamicContentArea() {
    console.log("Updating dynamic content area...");
    const contentArea = document.getElementById('dynamicContentArea');
    const linkButton = document.getElementById('dynamic-link-button');
    const audioPlayer = document.getElementById('dynamic-audio-player');
    const audioButton = document.getElementById('dynamic-audio-button');
    const audioIndicator = document.getElementById('dynamic-audio-indicator');
    const contentTitle = document.getElementById('dynamicContentTitle');
    const errorDiv = document.getElementById('dynamic-audio-error');

    // Check if all required elements exist
    if (!contentArea || !linkButton || !audioPlayer || !audioButton || !audioIndicator || !contentTitle || !errorDiv) {
        console.error("One or more dynamic content elements are missing from the DOM! Cannot update.");
        // Optionally hide the area if elements are missing
        if(contentArea) contentArea.style.display = 'none';
        return;
    }

    // Clear previous error messages
    errorDiv.textContent = '';

    // Define content states
    const states = {
        introduction: {
            linkHref: '/introduction',
            audioSrc: '/static/assets/audio/introduction.wav',
            linkText: '> View Introduction_',
            buttonTitle: 'Play Introduction Audio',
            areaTitle: ':: Incoming Transmission ::'
        },
        hard_motivation: {
            linkHref: '/hard_motivation',
            audioSrc: '/static/assets/audio/hard_motivation.wav',
            linkText: '> View Deep Scan Briefing_',
            buttonTitle: 'Play Deep Scan Briefing Audio',
            areaTitle: ':: COMMENDATION :: Standard Protocols Complete ::'
        },
        nightmare_motivation: {
            linkHref: '/nightmare_motivation',
            audioSrc: '/static/assets/audio/nightmare_motivation.wav',
            linkText: '> View Nightmare Protocol Briefing_',
            buttonTitle: 'Play Nightmare Briefing Audio',
            areaTitle: ':: ALERT :: Advanced Protocols Unlocked ::'
        }
    };

    let currentStateKey = 'introduction'; // Default state

    // Check game completion status (requires global completionStatus from game-state.js)
    if (typeof completionStatus === 'undefined' || !completionStatus || !completionStatus.easy || !completionStatus.hard) {
        console.warn("completionStatus not fully available for dynamic content update. Using default.");
    } else {
        // Determine completion status
        const hardComplete = completionStatus.hard.frontend && completionStatus.hard.backend && completionStatus.hard.database;
        const easyComplete = completionStatus.easy.frontend && completionStatus.easy.backend && completionStatus.easy.database;

        // Determine the correct state key based on progress
        if (hardComplete) {
            currentStateKey = 'nightmare_motivation';
        } else if (easyComplete) {
            currentStateKey = 'hard_motivation';
        }
        // Otherwise, it remains 'introduction'
    }

    const currentState = states[currentStateKey];
    console.log("Dynamic content state set to:", currentStateKey);

    // Update the DOM elements with data from the current state
    linkButton.href = currentState.linkHref;
    linkButton.textContent = currentState.linkText;
    audioButton.title = currentState.buttonTitle;
    contentTitle.textContent = currentState.areaTitle;

    // --- Audio Source Handling ---
    // Construct the full URL for comparison to avoid issues with relative paths
    const newAudioFullSrc = new URL(currentState.audioSrc, window.location.href).href;
    const currentAudioFullSrc = audioPlayer.currentSrc ? new URL(audioPlayer.currentSrc, window.location.href).href : null;

    // Only change src if it's different AND audio is not currently playing
    // Or if the src is currently empty/not set
    if ( (!currentAudioFullSrc || newAudioFullSrc !== currentAudioFullSrc) && dynamicAudio_currentlyPlaying !== audioPlayer ) {
         console.log(`Updating audio source from "${currentAudioFullSrc || 'none'}" to "${newAudioFullSrc}"`);
         stopDynamicAudio(); // Stop any playback before changing source
         audioPlayer.src = currentState.audioSrc; // Set the relative path
         audioPlayer.load(); // Important: load the new source
    } else {
         console.log("Audio source unchanged or currently playing.");
    }
    // --- End Audio Source Handling ---


    // Make the content area visible now that it's populated
    contentArea.style.display = 'block';

    // --- Event Listener Attachment (Ensure Once) ---
    if (!audioButton.dataset.listenerAttached) {
        console.log("Attaching event listeners for dynamic audio button.");
        audioButton.addEventListener('click', () => {
            // Check if this specific audio player instance is the one currently playing
            if (dynamicAudio_currentlyPlaying === audioPlayer) {
                stopDynamicAudio(); // If clicking the button for the audio that's playing, stop it
            } else {
                stopDynamicAudio(); // Stop any *other* dynamic audio first

                // Play the audio associated with this button
                audioPlayer.play().then(() => {
                    console.log("Audio playback started:", audioPlayer.src);
                    audioButton.textContent = '[ Stop Audio ]';
                    audioButton.classList.add('playing');
                    audioIndicator.classList.add('playing');
                    // Update state variables
                    dynamicAudio_currentlyPlaying = audioPlayer;
                    dynamicAudio_currentButton = audioButton;
                    dynamicAudio_currentIndicator = audioIndicator;
                    errorDiv.textContent = ''; // Clear errors on successful play
                }).catch(e => {
                    // Handle playback errors (e.g., file not found, format unsupported)
                    console.error(`Audio playback error for ${audioPlayer.src}:`, e);
                    const displaySrc = audioPlayer.src.substring(audioPlayer.src.lastIndexOf('/') + 1); // Show filename only
                    errorDiv.textContent = `:: Error: Failed to play audio '${displaySrc}'. File missing or format unsupported? ::`;
                    stopDynamicAudio(); // Reset state on error
                });
            }
        });

        // Listener for when audio finishes playing naturally
        audioPlayer.addEventListener('ended', () => {
            console.log("Audio playback ended:", audioPlayer.src);
            // Only reset state if this audio player was the one marked as playing
            if (dynamicAudio_currentlyPlaying === audioPlayer) {
                 stopDynamicAudio();
            }
        });

        // Listener for errors loading the audio file
        audioPlayer.addEventListener('error', (e) => {
            console.error(`Error loading audio file: ${audioPlayer.src}`, e);
            const displaySrc = audioPlayer.src.substring(audioPlayer.src.lastIndexOf('/') + 1); // Show filename only
            // Display error message near the button only if it's not already showing a playback error
            if (!errorDiv.textContent.includes('Failed to play')) {
                 errorDiv.textContent = `:: Error: Failed to load audio file '${displaySrc}'. Check path/file. ::`;
            }
            // Ensure button state is reset if it was the current one trying to load/play
             if (dynamicAudio_currentButton === audioButton) {
                 stopDynamicAudio();
             }
        });

        // Mark listener as attached to prevent duplicates
        audioButton.dataset.listenerAttached = 'true';
    } else {
         console.log("Dynamic audio button listener already attached.");
    }
}


// --- Speech Synthesis Functions (Optional) ---

/**
 * Speaks the provided text using the Web Speech API.
 * @param {string} text - The text to speak.
 * @param {number} [rate=0.9] - Speech rate (0.1-10).
 * @param {number} [pitch=0.8] - Speech pitch (0-2).
 */
function speakText(text, rate = 0.9, pitch = 0.8) {
    // Requires global speechEnabled from game-state.js
    if (typeof speechEnabled === 'undefined' || !speechEnabled || !text) return;

    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech immediately
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 0.8; // Adjust volume as needed

        // Attempt to find a preferred voice
        let voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        if (voices.length > 0) {
             // Prioritize Google voices, then standard English voices
             selectedVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) ||
                             voices.find(voice => voice.lang.startsWith('en')) ||
                             voices[0]; // Fallback to the first available voice
             utterance.voice = selectedVoice;
             // console.log("Using voice:", selectedVoice.name); // Debug voice selection
             window.speechSynthesis.speak(utterance);
        } else {
            // If voices aren't loaded yet (common browser behavior)
            window.speechSynthesis.onvoiceschanged = () => {
                 voices = window.speechSynthesis.getVoices();
                 selectedVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) ||
                                 voices.find(voice => voice.lang.startsWith('en')) ||
                                 voices[0];
                 utterance.voice = selectedVoice;
                 // console.log("Using voice (loaded late):", selectedVoice.name); // Debug voice selection
                 window.speechSynthesis.speak(utterance);
                 // Remove the listener after it fires once
                 window.speechSynthesis.onvoiceschanged = null;
            };
            // Attempt to trigger voice loading if needed (might not be necessary)
            // window.speechSynthesis.getVoices();
             console.warn("Speech voices not immediately available. Waiting for onvoiceschanged event.");
             // Fallback: Speak with default voice if event doesn't fire quickly
             setTimeout(() => {
                 if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                     console.warn("Speaking with default voice due to timeout waiting for voices.");
                     window.speechSynthesis.speak(utterance);
                 }
             }, 500);
        }

        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
        };

    } else {
        console.warn("Web Speech API not supported in this browser.");
        speechEnabled = false; // Disable speech feature if API is unavailable
    }
}

/**
 * Toggles speech synthesis on/off. (Assumes a button calls this)
 * @param {HTMLButtonElement} button - The button element used for toggling (optional).
 */
function toggleSpeech(button = null) {
    // Requires global speechEnabled from game-state.js
    if (typeof speechEnabled === 'undefined') {
        console.error("Cannot toggle speech: 'speechEnabled' global variable not found.");
        return;
    }

    speechEnabled = !speechEnabled; // Toggle the global state

    if (speechEnabled) {
        if (button) button.textContent = 'Speak: ON'; // Update button text if provided
        // Pre-load voices if needed
         if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
             console.log("Pre-loading speech voices...");
             window.speechSynthesis.getVoices();
         }
        speakText("Speech enabled."); // Announce the change
    } else {
        if (button) button.textContent = 'Speak: OFF'; // Update button text
        // Stop any currently playing speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        console.log("Speech disabled."); // Log status, don't speak "disabled"
    }
    console.log("Speech enabled state:", speechEnabled);
    // Optional: Save preference to localStorage
    // try { localStorage.setItem('enigmaSpeechEnabled', speechEnabled); } catch(e) {}
}

console.log("UI Manager Initialized.");
