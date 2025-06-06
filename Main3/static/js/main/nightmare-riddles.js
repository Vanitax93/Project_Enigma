// nightmare-riddles.js
// Contains the riddle data for the Nightmare Protocol difficulty.

// This object will be globally accessible after this script is loaded.
// Changed from const to var to make it a property of the window object,
// which is how game-logic.js checks for its existence.
var nightmareRiddles = {
    frontend: [
            {
            riddle: `RECOVERED CHIMERA FRAGMENT :: OSCILLATING CIPHER LOCK\nObjective: Align all five Input Nodes (1-5) to the Target Resonance (<span class="cipher-state-green">Δ</span>) simultaneously.\nOperational Parameters: Engaging Input Nodes cycles their state (Ψ → Ω → Δ → Ψ...) and triggers conditional, non-linear resonance cascades in adjacent nodes.\n<span style="color:#FF6347;">WARNING:</span> Cascade logic derived from unstable Chimera core dump. Feedback loops may be unpredictable. Precision required.`,
            interactiveElement: `
                <style>
                  .cipher-container {
                    position: relative; height: 200px; width: 95%; max-width: 400px; margin: 20px auto;
                    border: 1px dashed #555; background: #101010; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                  }
                  .cipher-target {
                    width: 50px; height: 50px; border-radius: 50%; background: #333;
                    border: 2px solid #888; color: #eee; font-size: 28px;
                    display: flex; align-items: center; justify-content: center;
                    font-family: serif; /* Use a font that has greek letters */
                  }
                  .cipher-node {
                    position: absolute; width: 45px; height: 45px; border-radius: 50%;
                    cursor: pointer; transition: all 0.3s ease-in-out;
                    border: 2px solid #666; color: #fff; font-size: 24px;
                    display: flex; align-items: center; justify-content: center;
                    font-family: serif; /* Use a font that has greek letters */
                    box-shadow: 0 0 5px rgba(255,255,255,0.1);
                  }
                  /* Positioning Nodes (Approximate Circle) */
                  #cipher-node-1 { top: 10px; left: 50%; transform: translateX(-50%); }
                  #cipher-node-2 { top: 50%; left: 10px; transform: translateY(-50%); }
                  #cipher-node-3 { top: 50%; right: 10px; transform: translateY(-50%); }
                  #cipher-node-4 { bottom: 10px; left: 30%; transform: translateX(-50%); }
                  #cipher-node-5 { bottom: 10px; right: 30%; transform: translateX(-50%); }

                  /* State Classes (Ψ=Red, Ω=Blue, Δ=Green) */
                  .cipher-state-red { background-color: #500000; border-color: #ff4444; box-shadow: 0 0 8px #ff0000; }
                  .cipher-state-blue { background-color: #000050; border-color: #4444ff; box-shadow: 0 0 8px #0000ff; }
                  .cipher-state-green { background-color: #005000; border-color: #44ff44; box-shadow: 0 0 8px #00ff00; }

                  /* Target Achieved State */
                  .cipher-container.unlocked .cipher-target {
                      background-color: #00ff00; border-color: #fff; color: #000;
                      box-shadow: 0 0 15px #0f0, 0 0 30px #fff;
                  }
                </style>
                <div id="cipher-lock-container" class="cipher-container">
                  <div id="cipher-target" class="cipher-target">Φ</div> <div id="cipher-node-1" class="cipher-node cipher-state-red">Ψ</div>
                  <div id="cipher-node-2" class="cipher-node cipher-state-blue">Ω</div>
                  <div id="cipher-node-3" class="cipher-node cipher-state-red">Ψ</div>
                  <div id="cipher-node-4" class="cipher-node cipher-state-blue">Ω</div>
                  <div id="cipher-node-5" class="cipher-node cipher-state-red">Ψ</div>
                </div>
                <p id="cipher-status" style="text-align: center; font-size: 14px; color: #888; min-height: 1.2em; margin-top: 10px;">STATUS: Cipher Lock Unstable</p>
            `,
            setupScript: `
                // Ensure handleInteractiveSuccess is available
                if (typeof handleInteractiveSuccess !== 'function') {
                    console.error("CRITICAL: handleInteractiveSuccess is not defined. Cannot initialize puzzle.");
                    const statusEl = document.getElementById('cipher-status');
                    if (statusEl) statusEl.textContent = 'ERROR: Initialization Failed - Handler Missing';
                    return;
                }

                const nodes = [
                    document.getElementById('cipher-node-1'),
                    document.getElementById('cipher-node-2'),
                    document.getElementById('cipher-node-3'),
                    document.getElementById('cipher-node-4'),
                    document.getElementById('cipher-node-5')
                ];
                const targetDisplay = document.getElementById('cipher-target');
                const container = document.getElementById('cipher-lock-container');
                const statusEl = document.getElementById('cipher-status');
                const feedback = document.getElementById('feedbackArea');

                // Check if elements exist
                if (nodes.some(n => !n) || !targetDisplay || !container || !statusEl) {
                    console.error("Error initializing Cipher Lock: One or more elements not found.");
                    if(statusEl) statusEl.textContent = 'ERROR: Cipher elements missing.';
                    if(feedback) { feedback.textContent = ':: Riddle Element Error ::'; feedback.className = 'feedback incorrect'; }
                    return;
                }

                const states = ['red', 'blue', 'green'];
                const symbols = { 'red': 'Ψ', 'blue': 'Ω', 'green': 'Δ' };
                const targetStateIndex = 2; // Index for 'green'
                const targetSymbol = symbols['green']; // 'Δ'
                targetDisplay.textContent = targetSymbol; // Set target display

                // Initial state indices (0=Red, 1=Blue, 2=Green)
                // Start in a mixed state, not solved.
                let nodeStates = [0, 1, 0, 1, 0]; // R, B, R, B, R

                // Function to cycle state index (forward)
                function cycleState(currentIndex) {
                    return (currentIndex + 1) % states.length;
                }

                // Function to cycle state index (backward)
                function cycleStateBackward(currentIndex) {
                    return (currentIndex - 1 + states.length) % states.length;
                }

                // Function to update node appearance
                function updateNode(index) {
                    const node = nodes[index];
                    const stateIndex = nodeStates[index];
                    const stateName = states[stateIndex];
                    node.textContent = symbols[stateName];
                    node.className = 'cipher-node'; // Reset classes
                    node.classList.add(\`cipher-state-\${stateName}\`);
                }

                 // Function to check for win condition
                function checkWinCondition() {
                    const allMatch = nodeStates.every(stateIndex => stateIndex === targetStateIndex);
                    if (allMatch) {
                        statusEl.textContent = 'STATUS: Cipher Lock Harmonized!';
                        statusEl.style.color = '#00FF00';
                        container.classList.add('unlocked'); // Style the container on win
                        if(feedback) { feedback.textContent = ':: Cipher Lock Sequence Accepted :: Resonance Stable ::'; feedback.className = 'feedback correct'; }
                        // Disable further clicks
                        nodes.forEach(node => node.style.pointerEvents = 'none');
                        // Call the success handler
                        handleInteractiveSuccess('cipher-unlocked');
                        return true;
                    }
                    return false;
                }

                // --- Define Node Interaction Rules ---
                function applyRules(clickedIndex) {
                    const originalStates = [...nodeStates]; // Copy state before applying rules

                    // Rule 1: Node 1 click -> Cycles 1. If Node 1 becomes Green (2), Node 3 also cycles.
                    if (clickedIndex === 0) {
                        nodeStates[0] = cycleState(originalStates[0]);
                        if (nodeStates[0] === 2) { // Became Green
                            nodeStates[2] = cycleState(originalStates[2]);
                        }
                    }
                    // Rule 2: Node 2 click -> Cycles 2. If Node 2 becomes Blue (1), Nodes 1 & 4 cycle *backward*.
                    else if (clickedIndex === 1) {
                        nodeStates[1] = cycleState(originalStates[1]);
                        if (nodeStates[1] === 1) { // Became Blue
                            nodeStates[0] = cycleStateBackward(originalStates[0]);
                            nodeStates[3] = cycleStateBackward(originalStates[3]);
                        }
                    }
                    // Rule 3: Node 3 click -> Cycles 3. If Node 5 is Red (0), Node 3 also cycles Node 5.
                    else if (clickedIndex === 2) {
                        nodeStates[2] = cycleState(originalStates[2]);
                        if (originalStates[4] === 0) { // If Node 5 was Red
                            nodeStates[4] = cycleState(originalStates[4]);
                        }
                    }
                    // Rule 4: Node 4 click -> Cycles 4. Cycles Node 2.
                    else if (clickedIndex === 3) {
                        nodeStates[3] = cycleState(originalStates[3]);
                        nodeStates[1] = cycleState(originalStates[1]);
                    }
                    // Rule 5: Node 5 click -> Cycles 5. If Node 1 is *not* Green (not 2), Node 5 also cycles Node 1.
                    else if (clickedIndex === 4) {
                        nodeStates[4] = cycleState(originalStates[4]);
                        if (originalStates[0] !== 2) { // If Node 1 was not Green
                            nodeStates[0] = cycleState(originalStates[0]);
                        }
                    }

                    // Update all node appearances after rules are applied
                    for (let i = 0; i < nodes.length; i++) {
                        updateNode(i);
                    }
                    statusEl.textContent = 'STATUS: Processing Resonance Cascade...'; // Feedback during interaction
                    // Check win condition after updating UI
                    checkWinCondition();
                }

                // --- Attach Event Listeners ---
                nodes.forEach((node, index) => {
                    // Initialize appearance
                    updateNode(index);
                    // Add click listener
                    node.addEventListener('click', () => {
                        console.log(\`Node \${index + 1} clicked. Current states: \${JSON.stringify(nodeStates)}\`);
                        applyRules(index);
                    });
                });

                console.log("Oscillating Cipher Lock puzzle initialized.");
            `,
            solutionCheckType: 'event',
            successValue: 'cipher-unlocked', // Unique value for this puzzle
            lore: "Chimera logic pathways... unstable, beautiful. Harmonize the oscillation, align the fragments, reveal the core resonance."
        },
        {
            riddle: "Below lies a simple structure, yet one element defies visibility despite having content. Use your browser's developer tools (Inspect Element) to find the CSS rule causing this and identify the *class name* of the hidden element. Submit the class name.",
            interactiveElement: `
                <style>
                  .container-nf1 { border: 1px dashed #555; padding: 10px; margin-top: 15px; }
                  .visible-nf1 { background-color: #222; padding: 5px; margin: 5px; color: #888; }
                  .problem-nf1 { background-color: #222; padding: 5px; margin: 5px; color: #888; opacity: 0; /* The culprit */ }
                </style>
                <div class="container-nf1">
                  <div class="visible-nf1">Element One (Visible)</div>
                  <div class="problem-nf1">Element Two (Hidden?)</div>
                  <div class="visible-nf1">Element Three (Visible)</div>
                </div>
            `,
            setupScript: null, // No setup script needed
            solutionCheckType: 'input',
            answerHashes: ['61407d24b3fe729fd428ac4411427b72'], // md5('problem-nf1')
            lore: "They hide things in plain sight. Obfuscation through simplicity. What else is unseen?"
        },
        {
            riddle: "Two CSS rules target the button below. One uses an ID, the other uses `!important`. Click the button. If it turns red, the `!important` rule won. If it turns blue, the ID won. Which property dictates this outcome? Submit the one-word answer.",
            interactiveElement: `
                <style>
                  #specific-button-nf2 { background-color: blue; /* ID selector */ }
                  .button-class-nf2 { background-color: red !important; /* Class with !important */ }
                </style>
                <button id="specific-button-nf2" class="button-class-nf2 submit-button" style="margin-top: 15px;">Test Specificity</button>
            `,
            setupScript: null, // Relies on CSS interpretation
            solutionCheckType: 'input',
            answerHashes: ['86039b0ddadc45f72bbdd69a8847e147'], // md5('specificity')
            lore: "Rules upon rules. Some override others with brute force. A lesson in hierarchy and control."
        },
        {
            riddle: "The button below *should* display a success message when clicked, but the event listener is incorrectly attached. Fix the JavaScript code snippet provided (you can edit it directly) so the button works, then click it.",
            interactiveElement: `
                <button id="debug-button-nf3" class="submit-button" style="margin-top: 15px;">Click Me</button>
                <textarea id="code-editor-nf3" spellcheck="false" style="width: 95%; height: 100px; background: #111; color: #0f0; border: 1px solid #333; font-family: monospace; font-size: 14px; margin-top: 10px; display: block;">
// Fix this code:
const button = document.getElementById('debug-button-nf3');
const feedback = document.getElementById('feedbackArea'); // Assuming feedbackArea exists

// Incorrect attachment:
document.addEventListener('click', () => {
  if (feedback) {
      feedback.textContent = ':: Signal Acquired :: Listener Fixed.';
      feedback.className = 'feedback correct';
      // Call the success handler for the riddle framework
      handleInteractiveSuccess('event-listener-fixed-nf3');
  }
});
                </textarea>
                <button onclick="runEditedCodeNF3()" class="submit-button" style="font-size: 14px; padding: 5px 10px; margin-top: 5px;">Run Edited Code</button>
            `,
            setupScript: `
                window.runEditedCodeNF3 = function() {
                  const code = document.getElementById('code-editor-nf3').value;
                  const feedback = document.getElementById('feedbackArea');
                  try {
                    // Clear previous listeners if any (simple approach)
                    const oldButton = document.getElementById('debug-button-nf3');
                    const newButton = oldButton.cloneNode(true);
                    oldButton.parentNode.replaceChild(newButton, oldButton);

                    // Run the user's edited code
                    new Function('handleInteractiveSuccess', code)(handleInteractiveSuccess); // Pass success handler
                    if(feedback) {
                         feedback.textContent = ':: Code executed. Try clicking the button. ::';
                         feedback.className = 'feedback neutral';
                    }
                  } catch (e) {
                    console.error("Error running edited code:", e);
                     if(feedback) {
                         feedback.textContent = ':: Syntax Error in Code :: Check console (F12).';
                         feedback.className = 'feedback incorrect';
                     }
                  }
                }
                // Initial dummy listener to ensure button exists for the code
                document.getElementById('debug-button-nf3').addEventListener('click', () => {
                    const feedback = document.getElementById('feedbackArea');
                    if(feedback) {
                         feedback.textContent = ':: Listener Not Correctly Attached :: Edit and run the code.';
                         feedback.className = 'feedback incorrect';
                    }
                });
            `,
            solutionCheckType: 'event',
            successValue: 'event-listener-fixed-nf3',
            lore: "Broken connections. Misdirected signals. The system requires precise instructions."
        },
        {
            riddle: "A sequence is hidden below. Use the browser console (F12 -> Console) to execute JavaScript. Find the container div with the ID `sequence-container-nf4`. Inside it, find the child element with the data attribute `data-target='true'`. Change its text content to `UNLOCKED`. If successful, the system will detect it.",
            interactiveElement: `
                <div id="sequence-container-nf4" style="border: 1px solid #444; padding: 10px; margin-top: 15px;">
                  <span style="color: #555;">Sequence Node 1</span>
                  <span style="color: #555;" data-target="false">Sequence Node 2</span>
                  <span style="color: #555;" data-target="true">LOCKED</span>
                  <span style="color: #555;">Sequence Node 4</span>
                </div>
            `,
            setupScript: `
                const targetNode = document.querySelector('#sequence-container-nf4 span[data-target="true"]');
                const feedback = document.getElementById('feedbackArea');

                if (targetNode) {
                  const observer = new MutationObserver((mutationsList, observer) => {
                    for(const mutation of mutationsList) {
                      if (mutation.type === 'characterData' || mutation.type === 'childList') {
                         if (targetNode.textContent.trim().toUpperCase() === 'UNLOCKED') {
                            if(feedback) {
                                 feedback.textContent = ':: Sequence Confirmed ::';
                                 feedback.className = 'feedback correct';
                            }
                            handleInteractiveSuccess('dom-manipulated-nf4'); // Ensure handleInteractiveSuccess is accessible
                            observer.disconnect();
                            return;
                         }
                      }
                    }
                  });
                  observer.observe(targetNode, { characterData: true, childList: true, subtree: true });
                  // console.log("MutationObserver attached to target node for riddle nf4.");
                } else {
                  console.error("Target node for MutationObserver not found (nf4).");
                   if(feedback) {
                       feedback.textContent = ':: ERROR :: Riddle element failed to initialize observer.';
                       feedback.className = 'feedback incorrect';
                   }
                }
            `,
            solutionCheckType: 'event',
            successValue: 'dom-manipulated-nf4',
            lore: "Direct manipulation is sometimes required. Reach into the structure, change its state."
        },
        {
            riddle: "Observe the pulsing light below. Click the 'Capture' button at the exact moment the light is at its brightest (fully green). Precision is key.",
            interactiveElement: `
                <style>
                  @keyframes pulse-nf5 {
                    0% { background-color: #030; box-shadow: none; }
                    50% { background-color: #0f0; box-shadow: 0 0 15px #0f0; } /* Brightest point */
                    100% { background-color: #030; box-shadow: none; }
                  }
                  #pulse-light-nf5 {
                    width: 50px; height: 50px; border-radius: 50%;
                    background-color: #030; margin: 20px auto;
                    animation: pulse-nf5 2s infinite linear;
                  }
                </style>
                <div id="pulse-light-nf5"></div>
                <button id="capture-button-nf5" class="submit-button">Capture Signal</button>
            `,
            setupScript: `
                const captureButton = document.getElementById('capture-button-nf5');
                const light = document.getElementById('pulse-light-nf5');
                const feedback = document.getElementById('feedbackArea');

                captureButton.addEventListener('click', () => {
                  const style = window.getComputedStyle(light);
                  const bgColor = style.backgroundColor;
                  let isBright = false;
                  try {
                      const rgbMatch = bgColor.match(/rgb\\((\\d+),\\s*(\\d+),\\s*(\\d+)\\)/);
                      if (rgbMatch) {
                          const r = parseInt(rgbMatch[1]);
                          const g = parseInt(rgbMatch[2]);
                          const b = parseInt(rgbMatch[3]);
                          if (g > 230 && r < 30 && b < 30) { isBright = true; }
                      }
                  } catch (e) { console.error("Error parsing background color:", e); }

                  if (isBright) {
                    if(feedback) {
                         feedback.textContent = ':: Synchronization Achieved ::';
                         feedback.className = 'feedback correct';
                    }
                    handleInteractiveSuccess('timing-capture-nf5'); // Ensure handleInteractiveSuccess is accessible
                    light.style.animationPlayState = 'paused';
                    captureButton.disabled = true;
                  } else {
                     if(feedback) {
                         feedback.textContent = ':: Signal Mismatch :: Timing Incorrect. Try again.';
                         feedback.className = 'feedback incorrect';
                     }
                  }
                });
            `,
            solutionCheckType: 'event',
            successValue: 'timing-capture-nf5',
            lore: "The system operates on cycles. Synchronization is essential for communication... or control."
        }
    ],
    backend: [
        {
            riddle: "An API endpoint `/api/status_check` returns vital system info. Click 'Ping API'. Analyze the JSON response shown below the button. Find the value associated with the `validation_key` field inside the `security` object. Submit this key.",
            interactiveElement: `
                <button id="ping-api-nb1" class="submit-button">Ping API</button>
                <pre id="api-response-nb1" style="background:#111; border:1px solid #333; padding:10px; margin-top:10px; min-height: 50px; white-space: pre-wrap; word-wrap: break-word; color:#ccc;"></pre>
            `,
            setupScript: `
                document.getElementById('ping-api-nb1').addEventListener('click', () => {
                  const responseArea = document.getElementById('api-response-nb1');
                  const feedback = document.getElementById('feedbackArea');
                  responseArea.textContent = 'Pinging...';
                  setTimeout(() => {
                    const mockResponse = {
                      system_id: "ENIGMA_CORE_7", status: "NOMINAL", timestamp: Date.now(),
                      security: { level: "OMEGA", validation_key: "zeta_gamma_4815", firewall: "ACTIVE" },
                      load_avg: [0.15, 0.18, 0.12]
                    };
                    responseArea.textContent = JSON.stringify(mockResponse, null, 2);
                    if(feedback) feedback.textContent = ':: Response Received :: Analyze the data.';
                  }, 800);
                });
            `,
            solutionCheckType: 'input',
            answerHashes: ['4f42141e52563e85d1834fe734f3920f'], // md5('zeta_gamma_4815')
            lore: "Data streams contain hidden truths. Learn to parse the signal from the noise."
        },
        {
            riddle: "Review the pseudo-code logic below describing two asynchronous operations trying to update a shared counter. What is the common term for the bug where the final counter value might be incorrect due to unpredictable execution order? Submit the two-word term.",
            interactiveElement: `
                <pre style="background:#111; border:1px solid #333; padding:10px; margin-top:10px; color:#ccc; font-family: monospace;">
shared_counter = 0

async function operationA() {
  current_value = read shared_counter
  // network delay...
  new_value = current_value + 1
  write shared_counter = new_value
}

async function operationB() {
  current_value = read shared_counter
  // network delay...
  new_value = current_value + 1
  write shared_counter = new_value
}

// Run operationA and operationB concurrently
                </pre>
            `,
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['d25ea07f9ff3164cde53a71999cd151a'], // md5('race condition')
            lore: "Order matters. Uncontrolled concurrency leads to chaos in the system's state."
        },
        {
            riddle: "Log File Analysis: A critical error occurred. Find the `transaction_id` associated with the 'FATAL_ERROR' entry in the simulated log below. Submit the ID.",
            interactiveElement: `
                <pre style="background:#111; border:1px solid #333; padding:10px; margin-top:10px; max-height: 200px; overflow-y: auto; color:#ccc; font-family: monospace; font-size: 13px;">
[2025-04-05T02:15:30Z] INFO: Service started. Process ID: 4512
[2025-04-05T02:15:33Z] DEBUG: Incoming connection from 192.168.1.105
[2025-04-05T02:15:34Z] INFO: User 'unit734' authenticated. Session: sess_abc123
[2025-04-05T02:15:36Z] WARN: Database connection pool nearing limit (9/10).
[2025-04-05T02:15:38Z] DEBUG: Processing request. Transaction ID: tx_fgh456
[2025-04-05T02:15:39Z] INFO: Request processed successfully. Transaction ID: tx_fgh456
[2025-04-05T02:15:41Z] DEBUG: Incoming connection from 10.0.0.5
[2025-04-05T02:15:42Z] INFO: Anonymous access attempted. Denied.
[2025-04-05T02:15:45Z] DEBUG: Processing request. Transaction ID: tx_klm789
[2025-04-05T02:15:46Z] FATAL_ERROR: Unhandled exception in core module. Crashing. Transaction ID: tx_klm789
[2025-04-05T02:15:47Z] INFO: Attempting graceful shutdown...
[2025-04-05T02:15:50Z] ERROR: Shutdown failed. Forcing termination.
                </pre>
            `,
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['9ea13c8bae55a3f55a361b4d2625f8e4'], // md5('tx_klm789')
            lore: "The system logs its failures. The diligent observer can trace the point of collapse."
        },
        {
            riddle: "Vulnerability Spotting: The following pseudo-code snippet for fetching user data is vulnerable. What specific type of common web security vulnerability is present? Submit the full name (two words).",
            interactiveElement: `
                <pre style="background:#111; border:1px solid #333; padding:10px; margin-top:10px; color:#ccc; font-family: monospace;">
function getUserProfile(userId) {
  // WARNING: User input used directly in query!
  query = "SELECT * FROM users WHERE id = '" + userId + "'"
  result = database.execute(query)
  return result.first()
}

// Example usage:
user_input = request.get_parameter('user_id') // e.g., '123' OR '123 OR 1=1'
profile = getUserProfile(user_input)
                </pre>
            `,
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['52a03125fca16c8734811181fafd12a4'], // md5('sql injection')
            lore: "Trusting external input is folly. The system's gates must be guarded against malicious payloads."
        },
        {
            riddle: "REST API Verb Usage: You need to completely replace an existing resource located at `/api/items/123` with new data provided below. Which HTTP verb is the most appropriate and standard choice for this 'replace' operation? Submit the verb in uppercase.",
            interactiveElement: `
                <pre style="background:#111; border:1px solid #333; padding:10px; margin-top:10px; color:#ccc; font-family: monospace;">
// New data to replace the resource at /api/items/123:
{
  "name": "Updated Item Name",
  "value": 999,
  "status": "active"
}
                </pre>
            `,
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['8e13ffc9fd9d6a6761231a764bdf106b'], // md5('put')
            lore: "Protocols define the language of interaction. Use the correct terms, or risk misunderstanding."
        }
    ],
    database: [
        {
            riddle: "SQL Query Builder: Select the correct SQL clauses below to construct a query that retrieves the `email` from the `users` table for users whose `status` is 'active' and orders the results by `creation_date` descending. Click 'Verify Query' when ready.",
            interactiveElement: `
                <div id="query-builder-nd1" style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">
                  <select id="select-clause-nd1" class="sql-select"><option value="">-- SELECT --</option><option value="SELECT email">SELECT email</option><option value="SELECT *">SELECT *</option><option value="SELECT id, name">SELECT id, name</option></select>
                  <select id="from-clause-nd1" class="sql-select"><option value="">-- FROM --</option><option value="FROM orders">FROM orders</option><option value="FROM users">FROM users</option><option value="FROM products">FROM products</option></select>
                  <select id="where-clause-nd1" class="sql-select"><option value="">-- WHERE (Optional) --</option><option value="WHERE status = 'active'">WHERE status = 'active'</option><option value="WHERE id > 100">WHERE id > 100</option><option value="WHERE name LIKE 'A%'">WHERE name LIKE 'A%'</option></select>
                  <select id="orderby-clause-nd1" class="sql-select"><option value="">-- ORDER BY (Optional) --</option><option value="ORDER BY name ASC">ORDER BY name ASC</option><option value="ORDER BY creation_date DESC">ORDER BY creation_date DESC</option><option value="ORDER BY status">ORDER BY status</option></select>
                </div>
                 <style>.sql-select { background: #222; color: #0f0; border: 1px solid #444; padding: 5px; font-family: monospace; margin-bottom: 5px; }</style>
                <button onclick="verifyQueryND1()" class="submit-button" style="margin-top: 10px;">Verify Query</button>
            `,
            setupScript: `
                window.verifyQueryND1 = function() {
                  const sel = document.getElementById('select-clause-nd1').value;
                  const frm = document.getElementById('from-clause-nd1').value;
                  const whr = document.getElementById('where-clause-nd1').value;
                  const ord = document.getElementById('orderby-clause-nd1').value;
                  const feedback = document.getElementById('feedbackArea');

                  const correct = sel === "SELECT email" && frm === "FROM users" && whr === "WHERE status = 'active'" && ord === "ORDER BY creation_date DESC";

                  if (correct) {
                     if(feedback) { feedback.textContent = ':: Query Structure Validated ::'; feedback.className = 'feedback correct'; }
                    handleInteractiveSuccess('query-built-nd1'); // Ensure handleInteractiveSuccess is accessible
                  } else {
                     if(feedback) { feedback.textContent = ':: Query Incorrect :: Re-evaluate clause selection.'; feedback.className = 'feedback incorrect'; }
                  }
                }
            `,
            solutionCheckType: 'event',
            successValue: 'query-built-nd1',
            lore: "Structure is everything in data retrieval. A misplaced clause yields only noise."
        },
        {
            riddle: "Index Selection: A table `products` has columns: `product_id` (PK), `category` (text), `price` (numeric), `stock_count` (integer). Which column would be the *least* useful to index if the most frequent query is `SELECT * FROM products WHERE price > ? AND price < ?`? Submit the column name.",
            interactiveElement: null, // Conceptual
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['2dec331b01489bc39dcd76381a890b6e', 'c4ef352f74e502ef5e7bc98e6f4e493d'], // md5('stock_count'), md5('category')
            lore: "Efficiency requires foresight. Index the paths most traveled, ignore the irrelevant."
        },
        {
            riddle: "JOIN Type Identification: Examine the SQL query result simulation below. It shows all customers, and their corresponding order details *if* they have placed an order. Customers without orders still appear, but with NULLs for order details. Which type of JOIN was used to produce this result? (e.g., INNER, LEFT, RIGHT, FULL OUTER). Submit the type (just the first word).",
            interactiveElement: `
                <pre style="background:#111; border:1px solid #333; padding:10px; margin-top:10px; color:#ccc; font-family: monospace; font-size: 13px;">
| customer_name | customer_id | order_id | order_date |
|---------------|-------------|----------|------------|
| Alice         | 1           | 101      | 2025-01-15 |
| Bob           | 2           | 102      | 2025-01-16 |
| Charlie       | 3           | NULL     | NULL       |
| Alice         | 1           | 103      | 2025-02-10 |
| David         | 4           | NULL     | NULL       |
                </pre>
            `,
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['811882fecd5c7618d7099ebbd39ea254'], // md5('left')
            lore: "Relationships define the data landscape. Understanding how tables connect reveals the full picture."
        },
        {
            riddle: "Transaction Anomaly: Transaction A reads data. Transaction B modifies the same data and commits. Transaction A reads the data *again* and sees a different value than the first time. What is the name of this specific transaction isolation anomaly? Submit the two-word name.",
            interactiveElement: null, // Conceptual
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['524ff22a5579ed20071ed51dbec6fd2e', "f170d228bc0267894c3473bb32d03341", 'b372674a1881c9dc3f73922880c0c5b4'], // md5('non-repeatable read'), md5('nonrepeatable read')
            lore: "Time flows, data changes. Isolation prevents paradoxes, but perfect isolation has a cost."
        },
        {
            riddle: "Data Type Mismatch: A database table stores product weights. Some weights are entered as '1.5 kg', others as '1500g', and some just '1.5'. This inconsistency makes comparisons difficult. What general term describes the process of cleaning and standardizing data like this to ensure consistency and usability? Submit the two-word term.",
            interactiveElement: null, // Conceptual
            setupScript: null,
            solutionCheckType: 'input',
            answerHashes: ['45417049b3dea66c0fcd4e1a0e9d2712', '4932a4bac96f181dea350a8ce60d3beb'], // md5('data cleansing'), md5('data cleaning')
            lore: "Raw data is chaotic. It must be refined, standardized, before its true value can be extracted."
        }
    ]
};

// Add this log to confirm execution and definition
console.log("nightmare-riddles.js executed. nightmareRiddles type:", typeof nightmareRiddles, nightmareRiddles);
