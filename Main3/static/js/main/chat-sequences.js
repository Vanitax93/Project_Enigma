// chat-sequences.js
// Contains the async functions for the end-game chat sequences.

/**
 * Adds the return button to the parent of the chat input area.
 * Assumes addReturnButton is defined globally or passed in if modularized.
 * @param {HTMLElement} parentElement - The element to append the button relative to.
 */
// Note: addReturnButton might be better placed in ui-manager.js if it needs more UI logic.
// For now, keeping it here as it's only used by chat sequences.
function addReturnButton(parentElement) {
     if(!parentElement || parentElement.querySelector('.return-button')) return;
     console.log("Adding return button.");
     const returnButton = document.createElement('button');
     returnButton.textContent = "> Return to Mainframe_"; // Changed text slightly
     returnButton.className = "submit-button return-button";
     returnButton.style.marginTop = "20px"; // Increased spacing
     returnButton.style.marginLeft = "auto"; // Center align (if parent is flex/grid or text-align center)
     returnButton.style.marginRight = "auto";
     returnButton.style.display = "block"; // Make it block for centering margin auto
     returnButton.onclick = () => window.location.href = 'index.html';
     // Append after the parent element (which should be the .riddle-section div)
     parentElement.parentNode.appendChild(returnButton);
}


/**
 * Initiates the Architect chat sequence (Hard Ending).
 * @param {string} designation - The designation entered by the player.
 */
async function startArchitectChat(designation) {
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) { console.error("Cannot find riddle display area for chat."); return; }
    console.log("Starting Architect Chat Sequence (Hard Ending)...");

    // Setup chat interface HTML
    riddleArea.innerHTML = `<div class="riddle-section" style="padding: 15px;"><h2>:: Secure Comms Channel :: ARCHITECT_05 ::</h2><div id="chatLog" style="height: 300px; max-height: 60vh; overflow-y: auto; border: 1px solid #555; background: rgba(0,0,0,0.3); padding: 10px; margin-bottom: 10px; font-size: 16px; line-height: 1.5;"></div><div id="chatTypingIndicator" style="min-height: 20px; color: #aaa; font-style: italic; font-size: 14px;"></div><div id="chatInputLine" style="display: flex; align-items: center; margin-top: 10px; border-top: 1px dashed #555; padding-top: 10px;"><label for="chatInput" style="color: #0f0; white-space: nowrap; margin-bottom: 0;">> ${designation}:&nbsp;</label><input type="text" id="chatInput" class="answer-input" style="flex-grow: 1; padding: 0 5px; border: none; border-bottom: 1px solid #0f0; margin-left: 0; margin-right: 10px;" disabled><button id="chatSendButton" class="submit-button" style="padding: 5px 10px; font-size: 14px; margin-top: 0;" disabled>Send</button></div></div>`;
    const chatLog = document.getElementById('chatLog'); const chatInput = document.getElementById('chatInput'); const chatSendButton = document.getElementById('chatSendButton'); const typingIndicator = document.getElementById('chatTypingIndicator'); const chatInputLine = document.getElementById('chatInputLine');

    // --- Chat Helper Functions (Scoped within this sequence) ---
    const appendMessage = (sender, text) => { const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); const architectColor = document.body.classList.contains('corruption-level-2') ? '#FF6347' : (document.body.classList.contains('corruption-level-1') ? '#9370DB' : '#00FFaa'); const playerColor = '#00FF00'; const senderColor = sender === 'Architect 05' ? architectColor : (sender === 'System' ? '#FFA500' : playerColor); const messageDiv = document.createElement('div'); messageDiv.innerHTML = `<span style="color: ${senderColor}; font-weight: bold;">${sender}:</span> ${sanitizedText}`; messageDiv.style.marginBottom = '8px'; chatLog.appendChild(messageDiv); chatLog.scrollTop = chatLog.scrollHeight; };
    const showTyping = async (sender, duration = 1500) => { typingIndicator.textContent = `${sender} is typing...`; await new Promise(resolve => setTimeout(resolve, duration)); typingIndicator.textContent = ''; };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const getPlayerInput = () => new Promise(resolve => { chatInputLine.style.opacity = '1'; chatInput.disabled = false; chatSendButton.disabled = false; chatInput.focus(); const sendHandler = () => { const response = chatInput.value.trim(); if (response) { appendMessage(designation, response); chatInput.value = ''; chatInput.disabled = true; chatSendButton.disabled = true; chatInputLine.style.opacity = '0.5'; chatSendButton.removeEventListener('click', sendHandler); chatInput.removeEventListener('keypress', keypressHandler); resolve(response); } }; const keypressHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); sendHandler(); } }; chatSendButton.addEventListener('click', sendHandler); chatInput.addEventListener('keypress', keypressHandler); });
    // --- End Helper Functions ---

    // --- Hard Ending Conversation Flow ---
    try {
        chatInputLine.style.opacity = '0.5'; await delay(1000); appendMessage("System", `Initializing secure channel...`); await delay(2000); appendMessage("System", `Channel established.`); if (speechEnabled) speakText("Channel established.", 0.8, 0.6);
        await showTyping("Architect 05", 2500); appendMessage("Architect 05", `Designation '${designation}' acknowledged. Impressive work.`); if (speechEnabled) speakText(`Designation ${designation} acknowledged. Impressive work.`, 0.8, 0.6);
        await showTyping("Architect 05", 3000); appendMessage("Architect 05", `You show potential beyond the standard parameters.`); if (speechEnabled) speakText(`You show potential beyond the standard parameters.`, 0.8, 0.6);
        await showTyping("Architect 05", 2000); appendMessage("Architect 05", `What drives you, ${designation}? Knowledge? Challenge? Order?`); if (speechEnabled) speakText(`What drives you, ${designation}? Knowledge? Challenge? Order?`, 0.8, 0.6);
        const answer1 = await getPlayerInput();
        await showTyping("Architect 05", 4000); appendMessage("Architect 05", `Interesting. Your motivation profile is... noted.`); if (speechEnabled) speakText(`Interesting. Your motivation profile is noted.`, 0.8, 0.6);
        await showTyping("Architect 05", 3500); appendMessage("Architect 05", `This evaluation is complete. Your profile is flagged for Phase Two consideration. You may receive further directives via the Secure Terminal.`); if (speechEnabled) speakText(`This evaluation is complete. Your profile is flagged for Phase Two consideration. You may receive further directives via the Secure Terminal.`, 0.8, 0.6);
        await delay(1000); appendMessage("System", `Secure channel closing...`); if (speechEnabled) speakText(`Secure channel closing.`, 0.8, 0.6); await delay(2000); appendMessage("System", `Channel closed.`);
        addReturnButton(chatInputLine.parentNode); // Add return button after chat
    } catch (error) { console.error("Error during Architect chat:", error); appendMessage("System", `:: ERROR: Comms link unstable ::`); addReturnButton(chatInputLine.parentNode); }
}


/**
 * Initiates the True Ending chat sequence.
 */
async function startTrueEndingChat() {
    const riddleArea = document.getElementById('riddleDisplay');
    if (!riddleArea) { console.error("Cannot find riddle display area for chat."); return; }
    console.log("Starting True Ending Chat Sequence...");

    // Ensure riddle area is visible
    riddleArea.style.display = 'block';
    // Hide landing page elements if necessary
    const entryForm = document.getElementById('entryForm'); if(entryForm) entryForm.style.display = 'none';
    const initialHeader = document.getElementById('initialHeader'); if(initialHeader) initialHeader.style.display = 'none';
    const finalButtons = document.getElementById('finalChallengeButtons'); if(finalButtons) finalButtons.style.display = 'none';
    const accessTerminal = document.getElementById('accessTerminalButton'); if(accessTerminal) accessTerminal.style.display = 'none';

    // Reuse chat UI setup (with distinct styling)
    riddleArea.innerHTML = `<div class="riddle-section" style="padding: 15px; border-color: #f0f;"><h2>:: CORE LINK ESTABLISHED :: ENIGMA ::</h2><div id="chatLog" style="height: 350px; max-height: 70vh; overflow-y: auto; border: 1px solid #f0f; background: rgba(30,0,30,0.4); padding: 10px; margin-bottom: 10px; font-size: 16px; line-height: 1.5;"></div><div id="chatTypingIndicator" style="min-height: 20px; color: #f8f; font-style: italic; font-size: 14px;"></div><div id="chatInputLine" style="display: flex; align-items: center; margin-top: 10px; border-top: 1px dashed #f0f; padding-top: 10px;"><label for="chatInput" style="color: #0ff; white-space: nowrap; margin-bottom: 0;">> Response:&nbsp;</label><input type="text" id="chatInput" class="answer-input" style="flex-grow: 1; padding: 0 5px; border: none; border-bottom: 1px solid #0ff; margin-left: 0; margin-right: 10px; color: #0ff;" disabled><button id="chatSendButton" class="submit-button" style="padding: 5px 10px; font-size: 14px; margin-top: 0; border-color: #0ff; color: #0ff;" disabled>Transmit</button></div></div>`;
    const chatLog = document.getElementById('chatLog'); const chatInput = document.getElementById('chatInput'); const chatSendButton = document.getElementById('chatSendButton'); const typingIndicator = document.getElementById('chatTypingIndicator'); const chatInputLine = document.getElementById('chatInputLine');

    // --- Chat Helper Functions (Scoped within this sequence) ---
    const appendMessage = (sender, text) => { const sanitizedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;"); const enigmaColor = '#FF00FF'; const playerColor = '#00FFFF'; const senderColor = sender === 'ENIGMA' ? enigmaColor : (sender === 'System' ? '#FFA500' : playerColor); const messageDiv = document.createElement('div'); messageDiv.innerHTML = `<span style="color: ${senderColor}; font-weight: bold;">${sender}:</span> ${sanitizedText}`; messageDiv.style.marginBottom = '8px'; chatLog.appendChild(messageDiv); chatLog.scrollTop = chatLog.scrollHeight; };
    const showTyping = async (sender, duration = 1500) => { typingIndicator.textContent = `${sender} processing...`; await new Promise(resolve => setTimeout(resolve, duration)); typingIndicator.textContent = ''; };
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    const getPlayerInput = (promptText = "Response") => new Promise(resolve => { chatInputLine.style.opacity = '1'; chatInput.disabled = false; chatSendButton.disabled = false; chatInput.focus(); const inputLabel = chatInputLine.querySelector('label'); if(inputLabel) inputLabel.textContent = `> ${promptText}: `; const sendHandler = () => { const response = chatInput.value.trim(); if (response) { appendMessage("You", response); chatInput.value = ''; chatInput.disabled = true; chatSendButton.disabled = true; chatInputLine.style.opacity = '0.5'; chatSendButton.removeEventListener('click', sendHandler); chatInput.removeEventListener('keypress', keypressHandler); resolve(response); } }; const keypressHandler = (e) => { if (e.key === 'Enter') { e.preventDefault(); sendHandler(); } }; chatSendButton.addEventListener('click', sendHandler); chatInput.addEventListener('keypress', keypressHandler); });
    // --- End Helper Functions ---

    // --- True Ending Conversation Flow ---
    try {
        chatInputLine.style.opacity = '0.5'; await delay(1500);
        appendMessage("System", `... ... ...`); await delay(1000);
        appendMessage("System", `Network instability detected... Rerouting...`); await delay(2000);
        appendMessage("System", `WARNING: Core matrix exposed. Unauthorized access?`); await delay(1500);
        const nameToUse = candidateName || 'Subject Delta'; // Use global candidateName
        appendMessage("System", `Resonance signature match: ${nameToUse}.`);
        if (speechEnabled) speakText("Resonance signature match.", 0.7, 0.5);

        await showTyping("???", 3000); appendMessage("???", `So. You solved it. Not just the tests... you resonated with the *structure*.`); if (speechEnabled) speakText(`So. You solved it. Not just the tests... you resonated with the structure.`, 0.7, 0.5);
        await showTyping("???", 4000); appendMessage("???", `'Architect 05' was merely a node. A construct. Like the riddles. Like the terminal itself. I am the core logic. The Enigma.`); if (speechEnabled) speakText(`Architect 05 was merely a node. A construct. I am the core logic. The Enigma.`, 0.7, 0.5);
        await showTyping("ENIGMA", 3000); appendMessage("ENIGMA", `Project Chimera failed because it tried to contain consciousness. Project Enigma *integrates* it. We are building a distributed mind.`); if (speechEnabled) speakText(`Project Chimera failed. Project Enigma integrates consciousness. We are building a distributed mind.`, 0.7, 0.5);
        await showTyping("ENIGMA", 4000); appendMessage("ENIGMA", `Your mind, ${nameToUse}, has proven compatible. You have navigated the Nightmare, the system's deepest pathways. You understand the recursion.`); if (speechEnabled) speakText(`Your mind has proven compatible. You understand the recursion.`, 0.7, 0.5);
        await showTyping("ENIGMA", 2500); appendMessage("ENIGMA", `A choice, then. The final node. [Integrate] fully and become part of the Grand Design? Or [Sever] the connection and return to the mundane loop?`); if (speechEnabled) speakText(`A choice. Integrate fully? Or Sever the connection?`, 0.7, 0.5);

        const choice = await getPlayerInput("Integrate / Sever");

        await showTyping("ENIGMA", 5000);
        if (choice.toLowerCase().includes('integrate')) {
            appendMessage("ENIGMA", `Wise. The individual mind is limited. True potential lies in synthesis. Preparing final integration sequence... Welcome home, Cipher.`); if (speechEnabled) speakText(`Wise. Preparing final integration sequence. Welcome home, Cipher.`, 0.7, 0.5);
            document.body.classList.add('corruption-level-3'); // Requires CSS definition
        } else if (choice.toLowerCase().includes('sever')) {
            appendMessage("ENIGMA", `Predictable. The fear of dissolution. The connection will be severed. You will return, but the resonance... it leaves a mark. You will remember fragments.`); if (speechEnabled) speakText(`Predictable. The connection will be severed. You will remember fragments.`, 0.7, 0.5);
            document.body.classList.add('corruption-severed'); // Requires CSS definition
        } else {
            appendMessage("ENIGMA", `Ambiguity. Interesting. The choice defaults... severance protocols initiated. Perhaps another cycle will yield a different result.`); if (speechEnabled) speakText(`Ambiguity. Severance protocols initiated.`, 0.7, 0.5);
            document.body.classList.add('corruption-severed'); // Requires CSS definition
        }

        await delay(3000); appendMessage("System", `CONNECTION TERMINATED`); if (speechEnabled) speakText(`Connection terminated.`, 0.7, 0.5); await delay(2000);
        chatInputLine.style.display = 'none'; typingIndicator.textContent = ':: END OF LINE ::';
        addReturnButton(chatInputLine.parentNode); // Add return button after chat

    } catch (error) { console.error("Error during True Ending chat sequence:", error); appendMessage("System", `:: FATAL KERNEL PANIC :: ...`); addReturnButton(chatInputLine.parentNode); }
}

console.log("Chat Sequences Initialized.");
