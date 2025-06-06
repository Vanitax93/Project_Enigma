// terminalscript.js
// Handles login, commands, and simulated file system for the secure terminal.

document.addEventListener('DOMContentLoaded', () => {
    console.log("Terminal DOM Loaded. Initializing...");

    // --- Element References ---
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const loginFeedback = document.getElementById('loginFeedback');
    const loginScreen = document.getElementById('loginScreen');
    const terminalOutputContainer = document.getElementById('terminalOutput');
    const outputArea = document.getElementById('outputArea');
    const commandInput = document.getElementById('commandInput');
    const promptSpan = document.getElementById('prompt');
    const inputLineDiv = document.querySelector('.input-line');

    // Registration Form Elements
    const loginTabButton = document.getElementById('loginTabButton');
    const registerTabButton = document.getElementById('registerTabButton');
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    const regUsernameInput = document.getElementById('regUsername');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');
    const regConfirmPasswordInput = document.getElementById('regConfirmPassword');
    const registerButton = document.getElementById('registerButton');
    const registrationFeedback = document.getElementById('registrationFeedback');
    if (!usernameInput || !passwordInput || !loginButton || !loginFeedback || !loginScreen || !terminalOutputContainer || !outputArea || !commandInput || !promptSpan || !inputLineDiv) {
        console.error("Terminal Boot Error: One or more critical DOM elements are missing! Check terminal.html IDs.");
        alert("Terminal Error: Interface failed to load. Critical element missing.");
        return;
    }

    if (!usernameInput || !passwordInput || !loginButton || !loginFeedback || !loginScreen ||
        !terminalOutputContainer || !outputArea || !commandInput || !promptSpan || !inputLineDiv ||
        !loginTabButton || !registerTabButton || !loginForm || !registrationForm ||
        !regUsernameInput || !regEmailInput || !regPasswordInput || !regConfirmPasswordInput ||
        !registerButton || !registrationFeedback
        ) {
        console.error("Terminal Boot Error: One or more critical DOM elements are missing! Check terminal.html IDs.");
        // Avoid alert in production, handle gracefully
        const body = document.querySelector('body');
        if(body) body.innerHTML = '<p style="color:red; font-family:monospace; text-align:center; padding-top:50px;">TERMINAL INTERFACE CRITICAL ERROR: UI FAILED TO LOAD.</p>';
        return;
    }

    // --- Credentials ---
    const credentials = {
        guest:           { user: 'guest',           pass: 'enigma1',       level: 'guest' },
        unit734:         { user: 'unit734',         pass: 'titanic',       level: 'unit734' }, // Base level
        architect:       { user: 'architect_node',  pass: 'chimera_rsa',   level: 'architect' },
        dr_lena_petrova: { user: 'lpetrova',        pass: 'channel7G',     level: 'dr_lena_petrova' },
        dr_aris_thorne:  { user: 'athorne',         pass: 'AX4',           level: 'dr_aris_thorne' },
        masterschool:    { user: 'master_student',  pass: 'egg_hunt',      level: 'masterschool' },
        gl1tch:          { user: 'gl1tch',          pass: 'cake?',         level: 'gl1tch' }
    };



    // --- State Variables ---
    let currentAccessLevel = null;
    let currentUsername = null;
    let currentPath = '/';
    let currentlyPlayingAudio = null;
    let currentAudioButton = null;
    let currentAudioIndicator = null;
    let commandHistory = [];
    let historyIndex = -1;

    // API URL
    const API_BASE_URL = 'http://127.0.0.1:5000'; // Adjust if backend runs elsewhere

    // --- Utility Functions ---
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    function appendOutputLine(text = "", isCommand = false, allowHtml = false) {
        if (!outputArea) return;
        const currentHTML = outputArea.innerHTML;
        if (currentHTML.length > 0 && !currentHTML.endsWith('<br>')) {
            outputArea.innerHTML += '<br>';
        }

        let outputText = text;
        // Sanitize if not explicitly allowing HTML
        if (!allowHtml) {
             outputText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        if (isCommand && currentUsername && promptSpan) {
             promptSpan.style.display = 'inline';
             const promptSymbol = (currentAccessLevel === 'architect') ? '#' : '$';
             // Command text is already sanitized if allowHtml is false
             outputArea.innerHTML += `<span class="command-echo">${currentUsername}@enigma:${currentPath}${promptSymbol} ${outputText}</span>`;
        } else {
             // Use innerHTML to render allowed HTML (like links or styled spans from ls)
             outputArea.innerHTML += outputText;
        }
        terminalOutputContainer.scrollTop = terminalOutputContainer.scrollHeight;
    }

     function appendOutputElement(element) {
         if (!outputArea) return;
          const currentHTML = outputArea.innerHTML;
          if (currentHTML.length > 0 && !currentHTML.endsWith('<br>')) {
             outputArea.innerHTML += '<br>';
          }
          outputArea.appendChild(element);
          outputArea.innerHTML += '<br>'; // Add line break after the element
          terminalOutputContainer.scrollTop = terminalOutputContainer.scrollHeight;
     }


    function clearOutput() {
        if (outputArea) outputArea.innerHTML = '';
        stopCurrentAudio(); // Stop audio if screen is cleared
    }

    function enableInput() {
        if (commandInput && promptSpan && inputLineDiv) {
            inputLineDiv.style.display = 'flex';
            commandInput.disabled = false;
            promptSpan.style.display = 'inline';
            const promptSymbol = (currentAccessLevel === 'architect') ? '#' : '$';
            promptSpan.textContent = `${currentUsername}@enigma:${currentPath}${promptSymbol} `;
            commandInput.focus();
            terminalOutputContainer.scrollTop = terminalOutputContainer.scrollHeight;
        }
    }

    function disableInput() {
        if (commandInput && promptSpan && inputLineDiv) {
            commandInput.disabled = true;
        }
    }

     function stopCurrentAudio() {
         if (currentlyPlayingAudio) {
             currentlyPlayingAudio.pause();
             currentlyPlayingAudio.currentTime = 0;
             if (currentAudioButton) {
                 currentAudioButton.textContent = '[ Play Audio ]';
                 currentAudioButton.classList.remove('playing');
             }
             if (currentAudioIndicator) {
                 currentAudioIndicator.classList.remove('playing');
             }
             currentlyPlayingAudio = null;
             currentAudioButton = null;
             currentAudioIndicator = null;
         }
     }

    function resolvePath(targetPath, basePath) {
        let absoluteBase = `file://${basePath}`;
        if (!basePath.endsWith('/')) {
            absoluteBase += '/';
        }

        let resolvedUrl;
        try {
            if (targetPath.startsWith('/')) {
                resolvedUrl = new URL(targetPath, 'file://');
            } else {
                resolvedUrl = new URL(targetPath, absoluteBase);
            }
        } catch (e) {
             console.error("URL parsing error in resolvePath:", e);
             return basePath;
        }

        let resolvedPathname = resolvedUrl.pathname;
        const parts = resolvedPathname.split('/').filter(p => p.length > 0);
        const finalParts = [];
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                finalParts.pop();
            } else {
                finalParts.push(part);
            }
        }

        let normalizedPath = '/' + finalParts.join('/');
        if (finalParts.length === 0) normalizedPath = '/';

        // Add trailing slash if the original target likely intended a directory
        // AND if the normalized path isn't just the root '/'
        if (targetPath.endsWith('/') && normalizedPath !== '/') {
             if (!normalizedPath.endsWith('/')) normalizedPath += '/';
        }

        return normalizedPath;
    }


    function getAccessiblePaths() {
        const accessible = new Set();

        // 1. Always add guest files first
        if (fileSourceContent.guest) {
            for (const path in fileSourceContent.guest) {
                accessible.add(path);
            }
        }

        // 2. Add files specific to the current access level (if not guest)
        if (currentAccessLevel && currentAccessLevel !== 'guest' && fileSourceContent[currentAccessLevel]) {
            for (const path in fileSourceContent[currentAccessLevel]) {
                accessible.add(path);
            }
        }
        return accessible;
    }


    // --- Core Logic Functions ---

    function showLoginForm() {
        loginForm.classList.add('active');
        registrationForm.classList.remove('active');
        loginTabButton.classList.add('active');
        registerTabButton.classList.remove('active');
        loginFeedback.textContent = ''; // Clear feedback
        registrationFeedback.textContent = '';
        if (usernameInput) usernameInput.focus();
    }

    function showRegistrationForm() {
        loginForm.classList.remove('active');
        registrationForm.classList.add('active');
        loginTabButton.classList.remove('active');
        registerTabButton.classList.add('active');
        loginFeedback.textContent = '';
        registrationFeedback.textContent = '';
        if (regUsernameInput) regUsernameInput.focus();
    }

    // --- Core Logic Functions ---
    async function handleLogin() { // Made async
        const usernameVal = usernameInput.value.trim();
        const passwordVal = passwordInput.value;

        if (!usernameVal || !passwordVal) {
            loginFeedback.textContent = ':: Username and Password Required ::';
            loginFeedback.className = 'feedback incorrect';
            return;
        }
        loginFeedback.textContent = 'Authenticating...';
        loginFeedback.className = 'feedback neutral';
        if (loginButton) loginButton.disabled = true;

        let loginSuccess = false;
        let terminalLevelForUser = null;
        let loggedInUsername = null;

        // Step 1: Try hardcoded credentials
        for (const key in credentials) {
            if (usernameVal === credentials[key].user && passwordVal === credentials[key].pass) {
                terminalLevelForUser = credentials[key].level;
                loggedInUsername = usernameVal;
                loginSuccess = true;
                // Special handling for unit734 'approved' status
                if (usernameVal === 'unit734') {
                    const easyFinalDone = localStorage.getItem('enigmaEasyFinalComplete') === 'true';
                    const approvedUser = localStorage.getItem('enigmaApprovedTerminalUser');
                    if (easyFinalDone && approvedUser && usernameVal === approvedUser) {
                        terminalLevelForUser = 'approved'; // Elevate level
                        console.log("Unit734 prerequisites met. Elevating level to 'approved'.");
                    } else {
                        terminalLevelForUser = 'unit734'; // Default if not approved
                        console.log("Unit734 logged in, but 'approved' prerequisites not met or username mismatch.");
                    }
                }
                console.log(`Hardcoded login for ${loggedInUsername}, Terminal Level: ${terminalLevelForUser}`);
                break;
            }
        }

        // Step 2: If hardcoded login failed, try database login
        if (!loginSuccess) {
            console.log(`Hardcoded login failed for ${usernameVal}. Attempting database login...`);
            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: usernameVal, password: passwordVal }),
                });
                const data = await response.json();

                if (response.ok) { // Backend login successful (status 200)
                    loginSuccess = true;
                    loggedInUsername = data.username;
                    // Use terminal_access_level from DB, defaulting to 'unit734' if null/undefined
                    terminalLevelForUser = data.terminal_access_level || 'unit734';
                    console.log(`DB Login Success for ${loggedInUsername}, Terminal Level: ${terminalLevelForUser}`);
                } else { // Login failed (e.g., 401 Unauthorized)
                    loginFeedback.textContent = `:: Auth Failed: ${data.error || 'Invalid credentials'} ::`;
                    loginFeedback.className = 'feedback incorrect';
                    console.log(`DB Login Failed for ${usernameVal}: ${data.error}`);
                }
            } catch (error) {
                console.error('Database login error:', error);
                loginFeedback.textContent = ':: Network Error during login. Please try again. ::';
                loginFeedback.className = 'feedback incorrect';
            }
        }

        if (loginButton) loginButton.disabled = false;

        if (loginSuccess && terminalLevelForUser && loggedInUsername) {
            grantAccess(terminalLevelForUser, loggedInUsername);
        } else {
            // Only show default "Auth Failed" if a more specific one wasn't set by DB login attempt
            if (!loginFeedback.textContent.toLowerCase().includes("failed") && !loginFeedback.textContent.toLowerCase().includes("error")) {
                loginFeedback.textContent = 'Authentication Failed. Access Denied.';
                loginFeedback.className = 'feedback incorrect';
            }
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
            if (usernameInput) usernameInput.focus();
        }
    }

    async function handleRegistration() {
        const username = regUsernameInput.value.trim();
        const email = regEmailInput.value.trim();
        const password = regPasswordInput.value;
        const confirmPassword = regConfirmPasswordInput.value;

        registrationFeedback.className = 'feedback neutral';

        if (!username || !email || !password || !confirmPassword) {
            registrationFeedback.textContent = ':: All fields are required ::';
            registrationFeedback.className = 'feedback incorrect';
            return;
        }
        if (password !== confirmPassword) {
            registrationFeedback.textContent = ':: Passwords do not match ::';
            registrationFeedback.className = 'feedback incorrect';
            regPasswordInput.value = '';
            regConfirmPasswordInput.value = '';
            regPasswordInput.focus();
            return;
        }
        if (password.length < 6) {
             registrationFeedback.textContent = ':: Password too short (min. 6 characters) ::';
             registrationFeedback.className = 'feedback incorrect';
             return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            registrationFeedback.textContent = ':: Invalid email format ::';
            registrationFeedback.className = 'feedback incorrect';
            return;
        }

        registrationFeedback.textContent = 'Processing registration...';
        if (registerButton) registerButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();

            if (response.ok) {
                registrationFeedback.textContent = `:: ${data.message} Welcome, ${data.player.username}! You can now log in. ::`;
                registrationFeedback.className = 'feedback correct';
                setTimeout(() => {
                    showLoginForm();
                    if (registrationForm) registrationForm.reset();
                }, 2000);
            } else {
                registrationFeedback.textContent = `:: Registration Failed: ${data.error || 'Unknown error'} ::`;
                registrationFeedback.className = 'feedback incorrect';
            }
        } catch (error) {
            console.error('Registration error:', error);
            registrationFeedback.textContent = ':: Network Error. Registration failed. Please try again later. ::';
            registrationFeedback.className = 'feedback incorrect';
        } finally {
            if (registerButton) registerButton.disabled = false;
        }
    }

    async function grantAccess(level, username) {
        currentAccessLevel = level;
        currentUsername = username;
        currentPath = '/';
        commandHistory = [];
        historyIndex = -1;
        if(loginScreen) loginScreen.style.display = 'none';
        if(terminalOutputContainer) {
            terminalOutputContainer.style.display = 'flex';
            terminalOutputContainer.style.flexDirection = 'column';
            terminalOutputContainer.innerHTML = '';
            if (outputArea) outputArea.innerHTML = '';
            terminalOutputContainer.appendChild(outputArea);
            terminalOutputContainer.appendChild(inputLineDiv);
        }

        clearOutput();
        disableInput();
        await playStartupAnimation(username, level);
        enableInput();
    }

    async function playStartupAnimation(username, level) {
        const outputArea = document.getElementById('outputArea'); // Ensure outputArea is accessible
        if (!outputArea) return; // Exit if output area isn't found

        // --- Standard Initial Messages ---
        const initialMessages = [
            { text: "Establishing secure connection to ENIGMA network...", delay: 100 },
            { text: "...", delay: 400 },
            { text: "Connection established.", delay: 200 },
            { text: "Authenticating credentials...", delay: 500 },
            { text: `User '${username}' verified.`, delay: 150 },
            { text: `Security Clearance Level Granted: ${level.toUpperCase()}`, delay: 250 },
            { text: "\n", delay: 100 } // Add a blank line
        ];

        for (const msg of initialMessages) {
            appendOutputLine(msg.text, false, msg.allowHtml || false);
            await delay(msg.delay);
        }

        // --- Special Gl1tch Login ---
        if (level === 'gl1tch') {
            const clownAscii = `
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣶⡎⠉⠀⠙⢧⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠿⠉⠀⠀⠀⠀⠀⠈⢳⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡤⣿⠛⠶⠤⠀⠀⠀⠀⠀⠀⠀⠀⠈⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣥⣈⠉⠒⠦⣄⠀⣀⠀⠀⠀⠀⠀⠀⠸⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⠛⠓⠲⣄⠈⠳⡌⠳⡀⠀⠀⠀⢸⣷⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⣿⡇⠀⠀⠈⠳⡀⠈⢦⡹⡀⠀⠀⢸⠃⢧⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠟⢳⣤⠀⢻⡿⣆⠀⢳⡗⠀⠀⡼⠀⢸⡆⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣿⣿⣷⣤⡟⠀⠀⠈⠛⣆⠀⢷⠀⠀⡇⠀⠨⢧⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣧⣠⠀⠀⠀⠘⣆⠈⠃⣰⠁⠀⠄⠸⣦⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣷⡄⠀⠀⠀⠸⡅⢀⡏⠀⠀⠀⢠⠏⠱⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⣿⣷⣤⣠⠖⢻⠁⡼⠀⠀⢀⡴⠋⠀⠀⠈⢦⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡟⠉⢻⡻⣿⣿⣿⢧⣠⢏⣾⣡⠤⠚⣏⠀⠀⠀⠀⠀⠀⠉⠣⡄⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡞⡿⠁⢠⢿⣿⢿⣿⡿⠋⣿⡏⠉⠀⠀⠀⣹⡞⠁⠀⠀⠀⠀⠀⠀⢸⡀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡇⣆⡴⡟⢸⢸⢰⡄⠀⠀⣹⢱⠀⠀⠀⢰⢿⡄⠀⠀⠀⠀⠀⠀⠀⠀⢧
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣽⠃⣿⠀⠃⢸⢸⠘⡇⠀⠀⣿⢸⠀⠀⠀⠃⠀⢧⡄⢀⡴⠃⠀⠀⠀⠀⠘
⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⢿⡧⣿⠀⠀⡸⣾⠀⡇⠀⠀⣯⡏⠀⠀⠀⠀⠀⣸⡷⣫⣴⠀⠀⠀⢀⠂⢀
⠘⣿⣦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⣇⠀⠀⣿⠀⠀⡇⣿⠰⠇⠀⣸⢻⠇⠀⠀⠀⠀⢰⠿⠞⣫⢞⡠⠀⢀⠂⠀⢸
⠀⠘⣿⣿⣿⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡾⣏⠻⣦⣤⣿⠀⠀⢧⡇⠀⠀⠀⢹⣾⠀⠀⠀⠀⢠⡏⣠⣼⣋⣉⣀⣴⣁⣀⣀⡎
⠀⠀⠈⢿⣿⣿⣿⣿⣦⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⣷⡌⠙⠺⢭⡿⠀⠀⠸⠆⠀⠀⠀⢸⣿⡀⠀⠀⠀⡟⢀⡧⣄⣠⣠⣤⣤⣤⣀⣈⡇
⠀⠀⠀⠈⢿⣿⣿⣿⣿⣿⣷⣦⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠿⠃⠀⠈⠢⠐⢤⣧⠀⠀⠀⠀⠀⠀⠀⢸⡿⠀⠀⠀⣼⠁⡼⠉⠛⠒⠒⠒⠒⠶⠶⢿⠁
⠀⠀⠀⠀⠀⢿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⢀⣤⣛⡛⠛⢢⠀⠀⢠⠈⢪⣻⡇⠀⠀⠀⠀⠀⠀⠐⠃⠀⠀⢰⠏⢸⡧⠤⠤⠤⢤⣀⣀⡀⠀⡾⠀
⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⣀⣀⠤⠴⠒⠚⣩⠽⣿⠖⠋⠉⠀⠀⣦⠈⣧⠀⠈⣳⣼⡿⠛⠀⠀⠀⠀⠀⠀⠀⢀⡤⠴⠞⠀⣿⠓⠢⠤⠤⠤⠤⣌⣉⣻⡇⠀
⠀⠀⠀⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣭⣭⣶⣦⣤⣶⠋⢡⣴⠇⢀⣴⡦⠀⣠⢿⣤⣿⡴⠒⢹⣏⣀⠀⠀⢀⣀⣀⠀⠀⢀⣠⣄⢀⣤⣾⡯⡀⠀⠉⠒⠒⠤⢤⣭⣽⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠁⢠⣻⠃⡴⠛⢁⣴⡯⠇⠀⠀⠈⠉⠉⠉⢹⡍⠉⠉⠙⣷⠈⢻⠉⠻⠀⠘⣟⠻⠀⡉⠁⠀⠀⠀⠀⠀⠀⣠⣿⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣮⣵⢰⣧⣞⣶⡿⢋⣡⠔⠚⣀⡀⠀⠀⠀⠀⢨⠇⠀⠀⠀⢹⠀⠈⠁⠀⠀⠀⠿⠀⠀⠈⠓⠶⠄⠀⠐⣲⡾⠋⡿⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣾⡿⢿⣿⢎⢠⠟⡠⣾⠟⢋⡠⠤⠤⢤⠤⠾⠤⠤⣤⢤⡼⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡴⠞⠁⢀⣴⠇⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⢿⣿⣿⣿⣿⡙⠻⣿⣿⣿⣿⣝⡋⣮⣴⣞⣥⡄⠀⠀⢀⣀⡤⠴⠚⠛⠪⣟⡧⢤⣄⣠⣄⡐⠦⣤⣤⣤⠴⠚⠉⠀⠀⠀⣾⠁⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠻⣿⣿⣿⡄⠈⠙⢿⣿⣿⣿⣿⠟⠋⣁⣤⠴⠚⠉⠁⠀⠀⠀⠀⠀⠀⠉⠲⢤⡀⠉⠉⠉⠉⠁⠀⠀⠀⠀⠀⠀⢀⣿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⢿⣿⡄⠀⠀⢙⣹⣷⠶⠟⠋⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⠦⣄⠀⠀⠀⠀⠀⠀⠀⠰⢚⡇⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠿⡾⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠂⠀⠀⠀⠀⠀⠈⠛⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    `;

            // Create a <pre> element to preserve ASCII formatting
            const preElement = document.createElement('pre');
            // Apply a class if you want specific CSS for the ASCII art
            preElement.className = 'ascii-art-login';
            // Add the <pre> element to the output area *once*
            outputArea.appendChild(preElement);
            outputArea.appendChild(document.createElement('br')); // Add space after
            terminalOutputContainer.scrollTop = terminalOutputContainer.scrollHeight; // Scroll down

            // Typewriter effect for ASCII art
            // Split into lines first to handle line breaks correctly
            const lines = clownAscii.split('\n');
            for (const line of lines) {
                for (let i = 0; i < line.length; i++) {
                    preElement.textContent += line[i];
                    terminalOutputContainer.scrollTop = terminalOutputContainer.scrollHeight; // Keep scrolling
                    await delay(1); // Very short delay for fast typing effect
                }
                preElement.textContent += '\n'; // Add the newline back
                await delay(5); // Slightly longer pause between lines
            }

        } else {
            // --- Standard Non-Glitch Login Messages ---
            const standardBootMessages = [
                { text: "Loading core system modules:", delay: 300 },
                { text: "  [ Cognitive_Resonance_Monitor ] ... OK", delay: 450 },
                { text: "  [ Deep_Scan_Interface_v3.1 ] .... OK", delay: 400 },
                { text: "  [ Calibration_Engine ] .......... OK", delay: 550 },
                { text: "  [ Heuristic_Filter ] ............ OK", delay: 350 },
                { text: "  [ FileSystem_Simulator ] ........ OK", delay: 400 },
                { text: "\nRunning system integrity checks...", delay: 600 },
                { text: "  Memory Allocation .............. OK", delay: 300 },
                { text: "  Process Queue ................ OK", delay: 300 },
                { text: "  Network Interface ............ OK", delay: 300 },
                { text: "  Core Logic Matrix .......... <span class=\"terminal-warning\">WARNING: Minor instability detected.</span>", delay: 700, allowHtml: true },
                { text: "  Anomaly Detection Subsystem .. <span class=\"terminal-warning\">ALERT: Resonance spike signature match - Gamma-9.</span>", delay: 800, allowHtml: true },
                { text: "\nInitialization complete.", delay: 500 }
            ];

            for (const msg of standardBootMessages) {
                appendOutputLine(msg.text, false, msg.allowHtml || false);
                await delay(msg.delay);
            }
        }

        // --- Standard Final Messages (for ALL users) ---
        const finalMessages = [
            { text: `Welcome, ${username}.`, delay: 300 },
            { text: `Current directory: ${currentPath}`, delay: 150 },
            { text: `Type 'help' for available commands.`, delay: 150 }
        ];

        for (const msg of finalMessages) {
            appendOutputLine(msg.text, false, msg.allowHtml || false);
            await delay(msg.delay);
        }
    }

    function handleCommand() {
        // ... (handleCommand function preamble remains the same) ...
         const commandLine = commandInput.value.trim();
         // Don't echo empty commands
         if (!commandLine) {
             enableInput();
             return;
         }

         // Add to history (if different from last command)
         if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== commandLine) {
              commandHistory.push(commandLine);
         }
         historyIndex = commandHistory.length; // Reset history index

         // Escape command line for echoing *unless* allowHtml is true later
         const escapedCommandLine = commandLine.replace(/</g, "&lt;").replace(/>/g, "&gt;");
         appendOutputLine(escapedCommandLine, true); // Echo user typed command (escaped by default)
         commandInput.value = ''; // Clear input field immediately

         disableInput(); // Disable input while processing

        // Process command after a short delay
        setTimeout(() => {
            const parts = commandLine.split(' ').filter(part => part.length > 0);
            const command = parts[0].toLowerCase();
            const arg = parts.slice(1).join(' ');

            let reEnable = true;
            const allowedCommands = getAllowedCommands(currentAccessLevel);

            if (!allowedCommands.has(command)) {
                 appendOutputLine(`Command not found: ${command.replace(/</g, "&lt;").replace(/>/g, "&gt;")}. Type 'help'.`);
            } else {
                switch (command) {
                    case 'logout':
                        logout();
                        reEnable = false;
                        break;
                    case 'clear':
                        clearOutput();
                        break;
                    case 'ls':
                    case 'list':
                        listFiles(arg); // Pass arg for potential future use
                        break;
                    case 'cat':
                    case 'view':
                        displayFileContent(arg);
                        break;
                    case 'help':
                        showHelp();
                        break;
                    case 'cd':
                        handleCd(arg);
                        break;
                    case 'pwd':
                        handlePwd();
                        break;
                    case 'home':
                        currentPath = '/';
                        break;
                    case 'run_simulation':
                        if (arg.toLowerCase() === 'invader_defense') {
                             appendOutputLine("\n:: Initiating Invader Defense Simulation... Launching module... ::");
                             window.open('invaders.html', '_blank');
                        } else {
                             appendOutputLine(`Error: Unknown simulation module '${arg.replace(/</g, "&lt;").replace(/>/g, "&gt;")}'.`);
                        }
                        break;
                    default:
                         appendOutputLine(`Command not recognized: ${command.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`);
                         break;

                }
            }

            if (reEnable) {
                enableInput();
            }
        }, 100 + Math.random() * 100);
    }


    // --- listFiles Function ---
    function listFiles(targetPathArg = '') {
        if (!currentAccessLevel) { appendOutputLine("Error: Access level undefined."); return; }

        const listPath = currentPath;
        const accessiblePaths = getAccessiblePaths();
        const itemsInPath = { dirs: new Set(), files: new Set() };
        const relativeCurrentPathPrefix = listPath === '/' ? '' : listPath.substring(1);

        accessiblePaths.forEach(path => {
            if (path.startsWith(relativeCurrentPathPrefix)) {
                const remainder = path.substring(relativeCurrentPathPrefix.length);
                if (remainder.includes('/')) {
                    const dirName = remainder.split('/')[0];
                    if (dirName) {
                        itemsInPath.dirs.add(dirName);
                    }
                } else if (remainder.length > 0) {
                    itemsInPath.files.add(remainder);
                }
            }
        });

        // Display the results
        appendOutputLine(`Contents of ${listPath}:`); // Use the absolute path for display

        // Sort and display directories
        const sortedDirs = [...itemsInPath.dirs].sort();
        sortedDirs.forEach(dir => {
            const safeDirName = dir.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // Use allowHtml=true for directory spans
            appendOutputLine(`  <span class="terminal-directory">${safeDirName}/</span>`, false, true);
        });

        // Sort and display files
        const sortedFiles = [...itemsInPath.files].sort();
        sortedFiles.forEach(file => {
            const safeFileName = file.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // Construct full relative path for href if needed
            const fullRelativePath = (relativeCurrentPathPrefix + file);

            // Check if the file should be a link (e.g., ends with .html)
            if (file.toLowerCase().endsWith('.html')) {
                // Output as a clickable link, using allowHtml=true
                const linkHtml = `  <a href="${fullRelativePath}" target="_blank" class="terminal-link terminal-file-html">${safeFileName}</a>`;
                appendOutputLine(linkHtml, false, true); // Pass true for allowHtml
            } else {
                // Output as a styled span, using allowHtml=true
                let className = 'terminal-file-txt'; // Default class
                if (file.endsWith('.log') || file.endsWith('.err')) className = "terminal-file-log";
                else if (file.endsWith('.ogg.txt')) className = "terminal-file-audio";
                else if (file.endsWith('.rec')) className = "terminal-file-rec";
                else if (file.endsWith('.pdf.txt')) className = "terminal-file-pdf"; // Example for simulated PDF
                else if (file.endsWith('.txt')) className = "terminal-file-txt"; // Ensure .txt gets styled

                const spanHtml = `  <span class="${className}">${safeFileName}</span>`;
                appendOutputLine(spanHtml, false, true); // Pass true for allowHtml
            }
        });

        // Display empty message if nothing was found
        if (sortedDirs.length === 0 && sortedFiles.length === 0) {
            appendOutputLine("  (Directory is empty)");
        }
    }


    // --- displayFileContent Function ---
    function displayFileContent(filePathArg) {
        if (!currentAccessLevel) {
            appendOutputLine("Error: Access level undefined.");
            return;
        }
        if (!filePathArg) {
            appendOutputLine("Usage: view [path/to/filename]");
            return;
        }

        const targetPath = filePathArg.trim();
        // Resolve the path relative to the current directory
        const resolvedPath = resolvePath(targetPath, currentPath);

        // Prevent trying to 'cat' a directory
        if (resolvedPath.endsWith('/') && resolvedPath !== '/') {
             appendOutputLine(`Error: '${targetPath.replace(/</g, "&lt;").replace(/>/g, "&gt;")}' is likely a directory.`);
             return;
        }

        // Create the key to look up in fileSourceContent (remove leading '/')
        const lookupKey = resolvedPath.startsWith('/') ? resolvedPath.substring(1) : resolvedPath;

        let fileContent = undefined;
        let found = false;

        // --- Corrected Content Lookup Logic ---
        // 1. Check the user's specific access level first
        if (currentAccessLevel && fileSourceContent[currentAccessLevel] && fileSourceContent[currentAccessLevel][lookupKey] !== undefined) {
            fileContent = fileSourceContent[currentAccessLevel][lookupKey];
            found = true;
            // console.log(`Found content for '${lookupKey}' in level '${currentAccessLevel}'`); // Debug log
        }
        // 2. If not found in specific level, check the 'guest' level (unless user is guest)
        else if (currentAccessLevel !== 'guest' && fileSourceContent.guest && fileSourceContent.guest[lookupKey] !== undefined) {
            fileContent = fileSourceContent.guest[lookupKey];
            found = true;
            // console.log(`Found content for '${lookupKey}' in level 'guest'`); // Debug log
        }
        // --- End Corrected Logic ---

        if (found && fileContent !== undefined) {
            // Existing logic to display content (including audio handling)
            const isAudioLog = lookupKey.toLowerCase().endsWith('.ogg.txt');
            const safeLookupKey = lookupKey.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            appendOutputLine(`\n--- Displaying Source: ${safeLookupKey} ---`);

            if (isAudioLog) {
                stopCurrentAudio(); // Stop any previous audio
                const audioEntryDiv = document.createElement('div');
                audioEntryDiv.className = 'output-entry audio-log-entry';

                const audioElement = document.createElement('audio');
                const audioFileName = lookupKey.substring(lookupKey.lastIndexOf('/') + 1).slice(0, -4); // Get filename part
                const audioSrc = lookupKey.slice(0, -4); // Assumes audio file has same path/name minus .txt
                audioElement.src = audioSrc;
                audioElement.preload = 'metadata';
                audioElement.style.display = 'none'; // Hide the default player
                audioEntryDiv.appendChild(audioElement);

                const playButton = document.createElement('button');
                playButton.className = 'audio-control-button';
                playButton.textContent = '[ Play Audio ]';
                playButton.title = `Play/Stop ${audioFileName}`;
                audioEntryDiv.appendChild(playButton);

                const playingIndicator = document.createElement('span');
                playingIndicator.className = 'audio-playing-indicator';
                // Add spans for the visualizer bars
                playingIndicator.innerHTML = `<span></span><span></span><span></span><span></span>`;
                audioEntryDiv.appendChild(playingIndicator);

                // Display the transcript below the button/indicator
                const transcriptPre = document.createElement('pre');
                transcriptPre.className = 'audio-transcript';
                transcriptPre.textContent = fileContent; // Use textContent for safety
                audioEntryDiv.appendChild(transcriptPre);

                // --- Event Listeners for Audio ---
                playButton.addEventListener('click', () => {
                    if (currentlyPlayingAudio === audioElement) {
                        stopCurrentAudio(); // Stop if it's already playing
                    } else {
                        stopCurrentAudio(); // Stop any other audio first
                        audioElement.play().then(() => {
                             playButton.textContent = '[ Stop Audio ]';
                             playButton.classList.add('playing');
                             playingIndicator.classList.add('playing');
                             currentlyPlayingAudio = audioElement;
                             currentAudioButton = playButton;
                             currentAudioIndicator = playingIndicator;
                        }).catch(e => {
                             console.error(`Audio playback error for ${audioSrc}:`, e);
                             const errorMsg = document.createElement('div');
                             errorMsg.style.color = 'red';
                             errorMsg.textContent = `:: Error: Failed to play audio file ${audioFileName}. Check console. ::`;
                             // Insert error message before the indicator
                             audioEntryDiv.insertBefore(errorMsg, playingIndicator);
                             playButton.disabled = true;
                             playButton.textContent = '[ Playback Error ]';
                             stopCurrentAudio(); // Ensure state is reset
                        });
                    }
                 });

                audioElement.addEventListener('ended', () => {
                    // Only reset if this specific audio was the one playing
                    if (currentlyPlayingAudio === audioElement) {
                         stopCurrentAudio();
                    }
                 });

                 audioElement.addEventListener('error', (e) => {
                     console.error(`Error loading audio: ${audioSrc}`, e);
                     const errorMsg = document.createElement('div');
                     errorMsg.style.color = 'red';
                     errorMsg.textContent = `:: Error: Failed to load audio file ${audioFileName}. Check path/file. ::`;
                     // Insert error message before the indicator
                     if(playingIndicator) audioEntryDiv.insertBefore(errorMsg, playingIndicator);
                     else audioEntryDiv.appendChild(errorMsg);
                     playButton.disabled = true;
                     playButton.textContent = '[ Load Error ]';
                     // Ensure state is reset if it was the current one
                     if (currentAudioButton === playButton) {
                         stopCurrentAudio();
                     }
                 });
                 // --- End Event Listeners ---

                appendOutputElement(audioEntryDiv); // Append the whole div
            } else {
                // Handle Regular Text File - use appendOutputLine without allowing HTML
                appendOutputLine(fileContent); // Let appendOutputLine handle sanitization
            }
            appendOutputLine(`--- End of Source: ${safeLookupKey} ---\n`);
        } else {
            // File not found in accessible levels
            const safeTargetPath = targetPath.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // Check if the path *should* be accessible to differentiate errors
            const accessiblePaths = getAccessiblePaths();
            if (accessiblePaths.has(lookupKey)) {
                 // Path is accessible, but content wasn't found in expected levels (shouldn't happen with correct logic)
                 appendOutputLine(`Error: Content retrieval failed for accessible file: ${safeTargetPath}. Check fileSourceContent definition.`);
                 console.error(`Content missing for accessible path: ${lookupKey} for level ${currentAccessLevel}`);
            } else {
                 // Path is genuinely not accessible or doesn't exist
                 appendOutputLine(`Error: File not found or access denied: ${safeTargetPath}`);
            }
        }
    }


    // --- handleCd Function ---
    // ... (handleCd function remains the same) ...
    function handleCd(targetDirArg) {
        if (!currentAccessLevel) {
            appendOutputLine("Error: Access level undefined.");
            return;
        }

        if (!targetDirArg || targetDirArg === '~' || targetDirArg === '/') {
            currentPath = '/';
            return;
        }

        const targetDir = targetDirArg.trim();
        let resolvedAbsolutePath = resolvePath(targetDir, currentPath);

        const accessiblePaths = getAccessiblePaths();
        let dirExists = false;
        let isFile = false;

        const relativePathCheck = resolvedAbsolutePath.startsWith('/') ? resolvedAbsolutePath.substring(1) : resolvedAbsolutePath;
        if (accessiblePaths.has(relativePathCheck)) {
            isFile = true;
        }

        let dirPathCheck = resolvedAbsolutePath;
        if (dirPathCheck !== '/' && !dirPathCheck.endsWith('/')) {
            dirPathCheck += '/';
        }
        const relativeDirPrefix = dirPathCheck === '/' ? '' : dirPathCheck.substring(1);

        if (!isFile) {
             if (dirPathCheck === '/') {
                 dirExists = true;
             } else {
                 for (const accessiblePath of accessiblePaths) {
                     if (accessiblePath.startsWith(relativeDirPrefix)) {
                         dirExists = true;
                         break;
                     }
                 }
             }
        }

        if (dirExists) {
            currentPath = dirPathCheck;
        } else if (isFile) {
            appendOutputLine(`Error: '${targetDir.replace(/</g, "&lt;").replace(/>/g, "&gt;")}' is not a directory.`);
        }
         else {
            appendOutputLine(`Error: Directory not found: ${targetDir.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`);
        }
    }


    // --- pwd Function ---
    // ... (handlePwd function remains the same) ...
     function handlePwd() {
        if (!currentAccessLevel) { appendOutputLine("Error: Access level undefined."); return; }
        appendOutputLine(currentPath);
    }

    // --- getAllowedCommands Helper ---
    // ... (getAllowedCommands function remains the same) ...
     function getAllowedCommands(level) {
        const baseCommands = new Set(['help', 'clear', 'logout', 'ls', 'list', 'cd', 'pwd', 'cat', 'view', 'home']);
        const gameCommands = new Set(['run_simulation', 'decrypt_signal']);

        if (!level) return new Set();

        switch (level) {
            case 'masterschool':
                return baseCommands;
            case 'architect':
                gameCommands.forEach(cmd => baseCommands.add(cmd));
                return baseCommands;
            case 'unit734':
                 gameCommands.forEach(cmd => baseCommands.add(cmd));
                 return baseCommands;
            case 'approved':
                 baseCommands.add('run_simulation');
                 return baseCommands;
            case 'guest':
            default:
                return baseCommands;
        }
    }


    // --- showHelp Function ---
    // ... (showHelp function remains the same) ...
     function showHelp() {
        appendOutputLine("Available commands:");
        const allowed = getAllowedCommands(currentAccessLevel);
        const descriptions = {
            ls: "  ls / list [path] - List directory contents.",
            cd: "  cd [path]        - Change current directory (use '..' to go up, '/' or '~' or 'home' for root).",
            pwd: "  pwd              - Print current directory path.",
            view: "  view / cat [path] - Display file content.",
            home: "  home             - Return to the root directory (/).",
            run_simulation: "  run_simulation [module] - Launch a simulation module (e.g., 'invader_defense').",
            help: "  help             - Show this help message.",
            clear: "  clear            - Clear the terminal screen.",
            logout: "  logout           - Log out from the terminal."
        };

        const sortedCommands = [...allowed].sort();

        sortedCommands.forEach(cmd => {
            if (cmd === 'list' || cmd === 'cat') return;
            if (descriptions[cmd]) {
                 // Use allowHtml=true for help text spans if needed, otherwise false
                 appendOutputLine(descriptions[cmd], false, false); // Assuming no HTML in descriptions
            } else {
                appendOutputLine(`  ${cmd}`);
            }
        });
    }


    // --- logout Function ---
    function logout() {
        stopCurrentAudio();
        appendOutputLine("Logging out...");
        disableInput();
        setTimeout(() => {
            currentAccessLevel = null;
            currentUsername = null;
            currentPath = '/';
            commandHistory = [];
            historyIndex = -1;
            if(outputArea) outputArea.textContent = '';
            if(commandInput) commandInput.value = '';
            terminalOutputContainer.style.display = 'none';
            loginScreen.style.display = 'block';
            showLoginForm(); // Default to login form on logout
            loginFeedback.textContent = 'Session terminated.';
            if(usernameInput) usernameInput.focus();
        }, 500);
    }

    // --- Event Listener Setup ---
    const handleCommandEnter = function(event) {
        if (event.key === 'Enter' && !commandInput.disabled) {
            event.preventDefault();
            handleCommand();
        }
    };

    // --- ADDED: Command History Listener ---
    const handleCommandHistory = function(event) {
         if (commandInput.disabled) return; // Don't handle history if input is disabled

         if (event.key === 'ArrowUp') {
              event.preventDefault();
              if (commandHistory.length > 0 && historyIndex > 0) {
                   historyIndex--;
                   commandInput.value = commandHistory[historyIndex];
                   commandInput.setSelectionRange(commandInput.value.length, commandInput.value.length); // Move cursor to end
              } else if (commandHistory.length > 0 && historyIndex <= 0) {
                   // Allow cycling back to the first command if already at the beginning
                   historyIndex = 0;
                   commandInput.value = commandHistory[historyIndex];
                   commandInput.setSelectionRange(commandInput.value.length, commandInput.value.length);
              }
         } else if (event.key === 'ArrowDown') {
              event.preventDefault();
              if (historyIndex < commandHistory.length - 1) {
                   historyIndex++;
                   commandInput.value = commandHistory[historyIndex];
                   commandInput.setSelectionRange(commandInput.value.length, commandInput.value.length);
              } else {
                   // If at the end of history, clear the input
                   historyIndex = commandHistory.length;
                   commandInput.value = '';
              }
         }
    };

    // Initial Setup
    if(terminalOutputContainer) terminalOutputContainer.style.display = 'none';
    if(loginScreen) loginScreen.style.display = 'block';
    showLoginForm();
    disableInput();

    // Event Listeners
    loginTabButton.addEventListener('click', showLoginForm);
    registerTabButton.addEventListener('click', showRegistrationForm);

    loginButton.addEventListener('click', handleLogin);
    if(passwordInput) passwordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') { event.preventDefault(); handleLogin(); }
    });
    if(usernameInput) usernameInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') { event.preventDefault(); if(passwordInput) passwordInput.focus(); }
    });

    registerButton.addEventListener('click', handleRegistration);
    if(regConfirmPasswordInput) regConfirmPasswordInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') { event.preventDefault(); handleRegistration(); }
    });

    if(commandInput) {
        commandInput.addEventListener('keypress', handleCommandEnter);
        commandInput.addEventListener('keydown', handleCommandHistory);
    }

    console.log("Terminal script initialized with registration form logic and DB login attempt.");

    // --- Decryption Game Functions (Example) ---
    function runDecryptionGame() {
        const encrypted = "URYYB JBEYQ // ERFREAPGUR PBER PYNPX // RKGEPNG QRYGN";
        const decrypted = "HELLO WORLD // RESEATTHE CORE CLACK // EXTRACT DELTA";
        const keyword = "recursion_unwound";
        appendOutputLine("\n:: Incoming Encrypted Transmission Fragment ::");
        appendOutputLine("---------------------------------------------");
        appendOutputLine(`DATA: ${encrypted}`);
        appendOutputLine("---------------------------------------------");
        appendOutputLine("Attempt decryption protocol. Enter cipher keyword or guess shift:");
        commandInput.removeEventListener('keypress', handleCommandEnter);
        commandInput.removeEventListener('keydown', handleCommandHistory); // Temporarily remove history
        commandInput.addEventListener('keypress', handleDecryptionInput);
        enableInput();
    }
    function handleDecryptionInput(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const guess = commandInput.value.trim().toLowerCase();
            appendOutputLine(guess.replace(/</g, "&lt;").replace(/>/g, "&gt;"), true); // Escape user guess
            commandInput.value = '';
            disableInput();
            let success = false;
            if (guess === keyword) { appendOutputLine("\n:: Keyword Accepted :: Decryption Matrix Applied ::"); success = true; }
            else if (guess === "rot13" || guess === "13") { appendOutputLine("\n:: Shift Detected :: Applying ROT13 Algorithm ::"); success = true; }
            else { appendOutputLine("\n:: Decryption Failed :: Signal Remains Obfuscated ::"); }
            if (success) {
                 appendOutputLine("---------------------------------------------");
                 appendOutputLine(`DECRYPTED: ${decrypted}`); // Decrypted text is safe
                 appendOutputLine("---------------------------------------------");
                 appendOutputLine("Signal fragment secured.");
            }
            commandInput.removeEventListener('keypress', handleDecryptionInput);
            commandInput.addEventListener('keypress', handleCommandEnter); // Re-attach command listener
            commandInput.addEventListener('keydown', handleCommandHistory); // Re-attach history listener
            enableInput();
        }
    }

}); // End DOMContentLoaded

