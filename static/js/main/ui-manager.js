// ui-manager.js
// Handles DOM manipulation, UI updates, effects, modals, and speech synthesis.

// --- Favicon Function ---
/**
 * Creates and updates the page's favicon based on the corruption level.
 * @param {number} level - The corruption level (0, 1, or 2).
 */
function updateFavicon(level = 0) {
    const favicon = document.getElementById('favicon');
    if (!favicon) {
        console.warn("Favicon element with ID 'favicon' not found.");
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');

    ctx.font = 'bold 28px VT323, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Clear canvas
    ctx.clearRect(0, 0, 32, 32);

    switch (level) {
        case 1: // Corruption Level 1
            ctx.fillStyle = '#9370DB'; // Purple
            ctx.fillText('E', 16, 16);
            // Glitch effect
            ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
            ctx.fillText('E', 18, 18);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.fillText('E', 14, 14);
            break;
        case 2: // Corruption Level 2
            ctx.fillStyle = '#FF6347'; // Tomato Red
            ctx.fillText('E', 16, 16);
            // Stronger glitch
            for (let i = 0; i < 5; i++) {
                ctx.fillStyle = `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 0.3)`;
                ctx.fillText('E', 16 + (Math.random() - 0.5) * 8, 16 + (Math.random() - 0.5) * 8);
            }
            break;
        default: // Level 0 (Normal)
            ctx.fillStyle = '#00FF00'; // Green
            ctx.fillText('E', 16, 16);
            break;
    }

    favicon.href = canvas.toDataURL('image/png');
}


// --- View Transition Functions ---
/**
 * Hides a view element with a smooth transition.
 * @param {HTMLElement} element - The element to hide.
 */
function hideView(element) {
    if (!element) return;
    element.classList.add('view-hidden');
    element.classList.remove('view-visible');
    // After transition, set display to none to remove from layout and prevent interference
    setTimeout(() => {
        element.style.display = 'none';
    }, 500); // This duration should match the CSS transition duration
}

/**
 * Shows a view element with a smooth transition.
 * @param {HTMLElement} element - The element to show.
 */
function showView(element) {
    if (!element) return;
    // Set display to block/flex before starting transition
    if (element.classList.contains('challenge-container')) {
         element.style.display = 'flex';
    } else {
         element.style.display = 'block';
    }
    // A tiny delay to allow the browser to register the display change before applying the transition class
    setTimeout(() => {
        element.classList.remove('view-hidden');
        element.classList.add('view-visible');
    }, 20);
}


// --- State for Dynamic Audio ---
let dynamicAudio_currentlyPlaying = null;
let dynamicAudio_currentButton = null;
let dynamicAudio_currentIndicator = null;

// --- Helper Functions ---
function escapeHtmlAttribute(text) {
    if (!text) return '';
    return text.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}


// --- UI Element Visibility & Updates ---

/**
 * Updates the visibility of the final challenge buttons based on completion status.
 */
function updateFinalButtonsVisibility() {
    const finalButtonsDiv = document.getElementById('finalChallengeButtons');
    const finalEasyBtn = document.getElementById('finalEasyButton');
    const finalHardBtn = document.getElementById('finalHardButton');

    if (!finalButtonsDiv || !finalEasyBtn || !finalHardBtn) {
        console.warn("Final challenge button elements not found in DOM.");
        return;
    }
    if (typeof completionStatus === 'undefined' || !completionStatus || !completionStatus.easy || !completionStatus.hard) {
        console.error("completionStatus object is malformed or unavailable for final buttons.", typeof completionStatus !== 'undefined' ? completionStatus : 'undefined');
        finalEasyBtn.style.display = 'none';
        finalHardBtn.style.display = 'none';
        finalButtonsDiv.style.display = 'none';
        return;
    }

    let showEasy = completionStatus.easy.frontend && completionStatus.easy.backend && completionStatus.easy.database;
    let showHard = completionStatus.hard.frontend && completionStatus.hard.backend && completionStatus.hard.database;

    finalEasyBtn.style.display = showEasy ? 'inline-block' : 'none';
    finalHardBtn.style.display = showHard ? 'inline-block' : 'none';
    finalButtonsDiv.style.display = (showEasy || showHard) ? 'block' : 'none';
}

/**
 * Updates the visibility of the Access Secure Terminal button.
 */
function updateAccessTerminalButtonVisibility() {
    const terminalButton = document.getElementById('accessTerminalButton');
    if (!terminalButton) {
        console.warn("Access Terminal button not found in DOM.");
        return;
    }
    terminalButton.style.display = 'inline-block';
}

/**
 * Updates the visibility of the Nightmare Protocol difficulty option.
 */
function updateNightmareVisibility() {
    const nightmareLabel = document.getElementById('nightmareOptionLabel');
    if (!nightmareLabel) { console.warn("Nightmare option label not found in DOM."); return; }

    if (typeof completionStatus === 'undefined' || !completionStatus || !completionStatus.hard) {
         console.error("completionStatus object is malformed or unavailable for nightmare visibility.", typeof completionStatus !== 'undefined' ? completionStatus : 'undefined');
         nightmareLabel.style.display = 'none';
         return;
    }

    const hardComplete = completionStatus.hard.frontend === true &&
                         completionStatus.hard.backend === true &&
                         completionStatus.hard.database === true;

    if (hardComplete) {
        nightmareLabel.style.display = 'block';
        const nightmareRadio = nightmareLabel.querySelector('input[value="nightmare"]');
        if (nightmareRadio && typeof nightmareRiddles !== 'undefined' && nightmareRiddles?.frontend?.length > 0) {
             nightmareRadio.disabled = false;
             nightmareLabel.title = "";
        } else if (nightmareRadio) {
             nightmareRadio.disabled = true;
             nightmareLabel.title = "Nightmare Protocol data failed to load.";
        }
    } else {
        nightmareLabel.style.display = 'none';
        const nightmareRadio = nightmareLabel.querySelector('input[value="nightmare"]');
        if (nightmareRadio && nightmareRadio.checked) {
             const easyRadio = document.querySelector('input[value="easy"]');
             if(easyRadio) easyRadio.checked = true;
        }
    }
}


// --- Timer ---
function updateTimerDisplay() {
    if (typeof startTime === 'undefined' || !startTime) return;
    const now = new Date();
    const elapsedMs = now - startTime;
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    const formattedTime = `:: Time Elapsed: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ::`;
    const timerDisplay = document.getElementById('timerDisplay');
    const riddleDisplayArea = document.getElementById('riddleDisplay');

    if (timerDisplay && riddleDisplayArea && riddleDisplayArea.style.display === 'block') {
        timerDisplay.textContent = formattedTime;
        timerDisplay.style.textAlign = timerDisplay.style.textAlign || 'right';
        timerDisplay.style.marginBottom = timerDisplay.style.marginBottom || '15px';
    } else if (timerDisplay) {
        timerDisplay.textContent = '';
    }
}

// --- Visual Effects ---
function applyCorruptionEffect() {
    let corruptionLevel = 0;
    const hardFinalDone = localStorage.getItem('enigmaHardFinalComplete') === 'true';
    const easyFinalDone = localStorage.getItem('enigmaEasyFinalComplete') === 'true';

    if (hardFinalDone) {
        corruptionLevel = 2;
    } else if (easyFinalDone) {
        corruptionLevel = 1;
    }

    // Call the new favicon updater function
    updateFavicon(corruptionLevel);

    const bodyElement = document.body;
    if (!bodyElement) {
        console.error("Cannot apply corruption effect: body element not found.");
        return;
    }
    bodyElement.classList.remove('corruption-level-1', 'corruption-level-2', 'corruption-level-3', 'corruption-severed');
    if (corruptionLevel === 1) {
        bodyElement.classList.add('corruption-level-1');
    } else if (corruptionLevel === 2) {
        bodyElement.classList.add('corruption-level-2');
    }
}

// --- Modals ---
function showLoreModal(loreText) {
    if (!loreText) { return; }
    const modal = document.getElementById('loreModal');
    const fragmentTextElement = document.getElementById('loreFragmentText');
    if (!modal || !fragmentTextElement) { console.error("Lore modal elements missing!"); return; }

    const displayLore = loreText.replace(/&quot;/g, '"').replace(/&apos;/g, "'");
    fragmentTextElement.innerHTML = displayLore;
    modal.style.display = "block";

    if (typeof trackLoreDiscovery === 'function') {
        trackLoreDiscovery(loreText);
    }

    if (typeof speechEnabled !== 'undefined' && speechEnabled && typeof speakText === 'function') {
        speakText("Log fragment: " + displayLore.replace(/<[^>]*>?/gm, ''), 0.85, 0.75);
    }
}

function closeLoreModal() {
    const modal = document.getElementById('loreModal');
    if(modal) modal.style.display = "none";
}

function showCollectedLore() {
    const modal = document.getElementById('collectedLoreModal');
    const contentArea = document.getElementById('collectedLoreContent');
    if (!modal || !contentArea) { return; }
    contentArea.innerHTML = '';

    if (typeof discoveredLore === 'undefined' || discoveredLore.length === 0) {
        contentArea.innerHTML = '<p>:: No log fragments collected ::</p>';
    } else {
        if (typeof LANDING_LORE === 'undefined' || typeof allRiddles === 'undefined') {
             console.error("Cannot display collected lore: LANDING_LORE or allRiddles not defined.");
             contentArea.innerHTML = '<p>:: Error loading lore data sources ::</p>';
             modal.style.display = "block";
             return;
        }

        const landingLoreTextMatch = LANDING_LORE.match(/data-lore="(.*?)"/);
        const landingLoreActualText = landingLoreTextMatch ? landingLoreTextMatch[1] : null;
        let entryIndex = 1;
        const displayedLore = new Set();

        const addLoreEntry = (text, source = "?") => {
            if (!text) return;
            const cleanedText = text.replace(/<[^>]*>?/gm, '');
            const checkText = escapeHtmlAttribute(text);

            if (!displayedLore.has(checkText)) {
                const p = document.createElement('p');
                const safeSource = source.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                p.innerHTML = `<strong>Entry ${entryIndex++} (${safeSource}):</strong> ${cleanedText}`;
                contentArea.appendChild(p);
                displayedLore.add(checkText);
            }
        };

        if (landingLoreActualText && discoveredLore.includes(escapeHtmlAttribute(landingLoreActualText))) {
            addLoreEntry(landingLoreActualText, "System Boot");
        }

        const processRiddleSet = (riddles, sourcePrefix) => {
            if (Array.isArray(riddles)) {
                riddles.forEach((riddle, index) => {
                    if (riddle && riddle.lore && discoveredLore.includes(escapeHtmlAttribute(riddle.lore))) {
                        addLoreEntry(riddle.lore, `${sourcePrefix} ${index + 1}`);
                    }
                });
            }
        };

        for (const diff in allRiddles) {
            if (diff === 'finalRiddles' || !allRiddles[diff] || (diff === 'nightmare' && typeof nightmareRiddles === 'undefined')) continue;
            for (const mode in allRiddles[diff]) {
                 if (allRiddles[diff][mode]) {
                    processRiddleSet(allRiddles[diff][mode], `${diff}/${mode}`);
                 }
            }
        }

        if (allRiddles.finalRiddles) {
            for (const diff in allRiddles.finalRiddles) {
                const riddle = allRiddles.finalRiddles[diff];
                if (riddle && riddle.lore && discoveredLore.includes(escapeHtmlAttribute(riddle.lore))) {
                    addLoreEntry(riddle.lore, `Final/${diff}`);
                }
            }
        }

        discoveredLore.forEach(lore => {
            if (!displayedLore.has(lore)) {
                addLoreEntry(lore.replace(/&quot;/g, '"').replace(/&apos;/g, "'"), "Unknown Source");
            }
        });

        if (contentArea.innerHTML === '') {
            contentArea.innerHTML = '<p>:: Log fragments corrupted or empty ::</p>';
        }
    }
    modal.style.display = "block";
}

function closeCollectedLoreModal() {
    const modal = document.getElementById('collectedLoreModal');
    if (modal) modal.style.display = "none";
}

function handleModalOutsideClick(event) {
    const loreModal = document.getElementById('loreModal');
    const collectedLoreModal = document.getElementById('collectedLoreModal');
    if (loreModal && event.target == loreModal) { closeLoreModal(); }
    if (collectedLoreModal && event.target == collectedLoreModal) { closeCollectedLoreModal(); }
}


// --- Dynamic Content Area Logic ---
function stopDynamicAudio() {
    if (dynamicAudio_currentlyPlaying) {
        dynamicAudio_currentlyPlaying.pause();
        dynamicAudio_currentlyPlaying.currentTime = 0;
        if (dynamicAudio_currentButton) {
            dynamicAudio_currentButton.textContent = '[ Play Audio ]';
            dynamicAudio_currentButton.classList.remove('playing');
        }
        if (dynamicAudio_currentIndicator) {
            dynamicAudio_currentIndicator.classList.remove('playing');
        }
        const errorDiv = document.getElementById('dynamic-audio-error');
        if (errorDiv) errorDiv.textContent = '';
        dynamicAudio_currentlyPlaying = null;
        dynamicAudio_currentButton = null;
        dynamicAudio_currentIndicator = null;
    }
}

function updateDynamicContentArea(animateTitle = false) {
    const contentArea = document.getElementById('dynamicContentArea');
    const linkButton = document.getElementById('dynamic-link-button');
    const audioPlayer = document.getElementById('dynamic-audio-player');
    const audioButton = document.getElementById('dynamic-audio-button');
    const audioIndicator = document.getElementById('dynamic-audio-indicator');
    const contentTitle = document.getElementById('dynamicContentTitle');
    const errorDiv = document.getElementById('dynamic-audio-error');

    if (!contentArea || !linkButton || !audioPlayer || !audioButton || !audioIndicator || !contentTitle || !errorDiv) {
        console.error("One or more dynamic content elements are missing from the DOM! Cannot update.");
        if(contentArea) contentArea.style.display = 'none';
        return;
    }

    errorDiv.textContent = '';

    const states = {
        introduction: { linkHref: '/introduction', audioSrc: '/static/assets/audio/Introduction.wav', linkText: '> View Introduction_', buttonTitle: 'Play Introduction Audio', areaTitle: ':: Incoming Transmission ::' },
        hard_motivation: { linkHref: '/hard_motivation', audioSrc: '/static/assets/audio/hard_motivation.wav', linkText: '> View Deep Scan Briefing_', buttonTitle: 'Play Deep Scan Briefing Audio', areaTitle: ':: COMMENDATION :: Standard Protocols Complete ::' },
        nightmare_motivation: { linkHref: '/nightmare_motivation', audioSrc: '/static/assets/audio/nightmare_motivation.wav', linkText: '> View Nightmare Protocol Briefing_', buttonTitle: 'Play Nightmare Briefing Audio', areaTitle: ':: ALERT :: Advanced Protocols Unlocked ::' }
    };

    let currentStateKey = 'introduction';

    if (typeof completionStatus !== 'undefined' && completionStatus?.easy && completionStatus?.hard) {
        const hardComplete = completionStatus.hard.frontend && completionStatus.hard.backend && completionStatus.hard.database;
        const easyComplete = completionStatus.easy.frontend && completionStatus.easy.backend && completionStatus.easy.database;

        if (hardComplete) {
            currentStateKey = 'nightmare_motivation';
        } else if (easyComplete) {
            currentStateKey = 'hard_motivation';
        }
    }

    const currentState = states[currentStateKey];
    linkButton.href = currentState.linkHref;
    linkButton.textContent = currentState.linkText;
    audioButton.title = currentState.buttonTitle;
    contentTitle.textContent = currentState.areaTitle;

    const newAudioFullSrc = new URL(currentState.audioSrc, window.location.href).href;
    const currentAudioFullSrc = audioPlayer.currentSrc ? new URL(audioPlayer.currentSrc, window.location.href).href : null;

    if ( (!currentAudioFullSrc || newAudioFullSrc !== currentAudioFullSrc) && dynamicAudio_currentlyPlaying !== audioPlayer ) {
         stopDynamicAudio();
         audioPlayer.src = currentState.audioSrc;
         audioPlayer.load();
    }

    contentArea.style.display = 'block';

    if (animateTitle) {
        contentTitle.classList.add('highlight-transmission-anim');
        contentTitle.addEventListener('animationend', () => {
            contentTitle.classList.remove('highlight-transmission-anim');
        }, { once: true });
    }

    if (!audioButton.dataset.listenerAttached) {
        audioButton.addEventListener('click', () => {
            if (dynamicAudio_currentlyPlaying === audioPlayer) {
                stopDynamicAudio();
            } else {
                stopDynamicAudio();
                audioPlayer.play().then(() => {
                    audioButton.textContent = '[ Stop Audio ]';
                    audioButton.classList.add('playing');
                    audioIndicator.classList.add('playing');
                    dynamicAudio_currentlyPlaying = audioPlayer;
                    dynamicAudio_currentButton = audioButton;
                    dynamicAudio_currentIndicator = audioIndicator;
                    errorDiv.textContent = '';
                }).catch(e => {
                    const displaySrc = audioPlayer.src.substring(audioPlayer.src.lastIndexOf('/') + 1);
                    errorDiv.textContent = `:: Error: Failed to play audio '${displaySrc}'. File missing or format unsupported? ::`;
                    stopDynamicAudio();
                });
            }
        });

        audioPlayer.addEventListener('ended', () => { if (dynamicAudio_currentlyPlaying === audioPlayer) stopDynamicAudio(); });
        audioPlayer.addEventListener('error', (e) => {
            const displaySrc = audioPlayer.src.substring(audioPlayer.src.lastIndexOf('/') + 1);
            if (!errorDiv.textContent.includes('Failed to play')) {
                 errorDiv.textContent = `:: Error: Failed to load audio file '${displaySrc}'. Check path/file. ::`;
            }
             if (dynamicAudio_currentButton === audioButton) stopDynamicAudio();
        });
        audioButton.dataset.listenerAttached = 'true';
    }
}


// --- Speech Synthesis Functions (Optional) ---
function speakText(text, rate = 0.9, pitch = 0.8) {
    if (typeof speechEnabled === 'undefined' || !speechEnabled || !text) return;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = 0.5;

        let voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        if (voices.length > 0) {
             selectedVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
             utterance.voice = selectedVoice;
             window.speechSynthesis.speak(utterance);
        } else {
            window.speechSynthesis.onvoiceschanged = () => {
                 voices = window.speechSynthesis.getVoices();
                 selectedVoice = voices.find(voice => voice.lang.startsWith('en') && voice.name.includes('Google')) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
                 utterance.voice = selectedVoice;
                 window.speechSynthesis.speak(utterance);
                 window.speechSynthesis.onvoiceschanged = null;
            };
             setTimeout(() => {
                 if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                     window.speechSynthesis.speak(utterance);
                 }
             }, 500);
        }
        utterance.onerror = (event) => { console.error('SpeechSynthesisUtterance.onerror', event); };
    } else {
        console.warn("Web Speech API not supported in this browser.");
        speechEnabled = false;
    }
}

function toggleSpeech(button = null) {
    if (typeof speechEnabled === 'undefined') { return; }
    speechEnabled = !speechEnabled;

    if (speechEnabled) {
        if (button) button.textContent = 'Speak: ON';
         if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
             window.speechSynthesis.getVoices();
         }
        speakText("Speech enabled.");
    } else {
        if (button) button.textContent = 'Speak: OFF';
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
}

console.log("UI Manager Initialized.");
