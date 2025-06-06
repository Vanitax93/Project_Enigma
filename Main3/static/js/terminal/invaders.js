// invaders.js
// Space Invaders game logic with leaderboard and special message

// --- DOM Element References ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // Canvas rendering context

// UI Elements for displaying information
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const leaderboardMessageElement = document.getElementById('leaderboardMessage');
const leaderboardDisplayElement = document.getElementById('leaderboardDisplay');

// --- Game Constants ---
const PLAYER_WIDTH = 40;       // Width of the player ship
const PLAYER_HEIGHT = 20;      // Height of the player ship
const PLAYER_SPEED = 5;        // Pixels player moves per frame
const BULLET_WIDTH = 4;        // Width of bullets
const BULLET_HEIGHT = 15;      // Height of bullets
const BULLET_SPEED = 7;        // Pixels bullets move per frame
const ALIEN_ROWS = 5;          // Number of rows of aliens
const ALIEN_COLS = 11;         // Number of columns of aliens
const ALIEN_WIDTH = 30;        // Width of each alien
const ALIEN_HEIGHT = 20;       // Height of each alien
const ALIEN_PADDING = 15;      // Space between aliens
const ALIEN_OFFSET_TOP = 50;   // Top margin for the alien grid
const ALIEN_OFFSET_LEFT = 60;  // Left margin for the alien grid
const ALIEN_SPEED = 1;         // Initial horizontal speed of aliens
const ALIEN_DROP = 25;         // Pixels aliens drop down when hitting edge
const ALIEN_FIRE_RATE = 0.003; // Probability (per alien per frame) of firing

// --- Game State Variables ---
let playerX;                   // Player's current X position
let lives;                     // Player's remaining lives
let score;                     // Player's current score
let highScore = localStorage.getItem('invadersHighScore') || 0; // Load high score or default to 0
let bullets = [];              // Array to hold all active bullets {x, y, type: 'player'/'alien'}
let aliens = [];               // Array to hold all alien objects {x, y, width, height, alive: true/false}
let alienDirection = 1;        // Current horizontal direction of aliens (1 = right, -1 = left)
let alienMoveTimer = 0;        // Timer/counter for alien movement (can be used for stepped movement)
let alienCurrentSpeed = ALIEN_SPEED; // Current speed of aliens (increases over time)
let keys = {};                 // Object to track currently pressed keys
let gameOver = false;          // Flag indicating if the game is over
let gameRunning = false;       // Flag indicating if the game loop is active
let animationFrameId;          // ID for the requestAnimationFrame loop

// --- LEADERBOARD FUNCTIONS ---

/**
 * Retrieves the leaderboard from localStorage or returns default dummy data.
 * @returns {Array} The leaderboard array [{name, score}, ...]
 */
function getLeaderboard() {
    const boardString = localStorage.getItem('invadersLeaderboard');
    if (boardString) {
        try {
            // Attempt to parse the stored JSON string
            return JSON.parse(boardString);
        } catch (e) {
            console.error("Error parsing leaderboard from localStorage", e);
            // Fallback to default if parsing fails
        }
    }
    // Return default dummy data if no board exists or parsing failed
    return [
        { name: 'PILOT_X', score: 1950 }, { name: 'DELTA', score: 1800 },
        { name: 'NEMANJA', score: 1700 }, { name: 'ALI', score: 1600 },
        { name: 'UNIT_734', score: 1500 }, { name: 'STAVROS', score: 1400 },
        { name: 'ALPHA', score: 1300 }, { name: 'MAICON', score: 1200 },
        { name: 'HANNES', score: 1100 }, { name: 'NICOLAZ', score: 1000 }
    ];
}

/**
 * Saves the leaderboard array to localStorage after sorting and trimming to top 10.
 * @param {Array} board - The leaderboard array to save.
 */
function saveLeaderboard(board) {
    try {
        // Ensure board has max 10 entries before saving
        const sortedBoard = board.sort((a, b) => b.score - a.score); // Sort descending
        const top10 = sortedBoard.slice(0, 10); // Keep only the top 10
        localStorage.setItem('invadersLeaderboard', JSON.stringify(top10));
    } catch (e) {
        console.error("Error saving leaderboard to localStorage", e);
    }
}
// --- End LEADERBOARD FUNCTIONS ---


// --- Setup Functions ---

/**
 * Initializes or resets the game state to start a new game.
 */
function initGame() {
    playerX = (canvas.width - PLAYER_WIDTH) / 2; // Center the player
    lives = 3;
    score = 0;
    bullets = [];
    aliens = [];
    alienDirection = 1;
    alienCurrentSpeed = ALIEN_SPEED;
    gameOver = false;
    gameRunning = true; // Start the game loop flag

    createAliens(); // Create the initial grid of aliens
    updateUI();     // Update score/lives display

    gameOverScreen.style.display = 'none'; // Hide game over screen
    startScreen.style.display = 'none';    // Hide start screen
    canvas.style.opacity = 1;              // Make canvas fully visible

    if(animationFrameId) cancelAnimationFrame(animationFrameId); // Cancel previous loop if any
    gameLoop(); // Start the main game loop
}

/**
 * Creates the grid of alien objects.
 */
function createAliens() {
    aliens = []; // Clear existing aliens
    for (let r = 0; r < ALIEN_ROWS; r++) {
        for (let c = 0; c < ALIEN_COLS; c++) {
            // Calculate position based on row, column, offsets, and padding
            let alienX = ALIEN_OFFSET_LEFT + c * (ALIEN_WIDTH + ALIEN_PADDING);
            let alienY = ALIEN_OFFSET_TOP + r * (ALIEN_HEIGHT + ALIEN_PADDING);
            aliens.push({ x: alienX, y: alienY, width: ALIEN_WIDTH, height: ALIEN_HEIGHT, alive: true });
        }
    }
}

/**
 * Updates the score, lives, and high score display in the HTML.
 */
function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    highScoreElement.textContent = highScore;
}

// --- Drawing Functions ---

/**
 * Helper function to draw a rectangle with a specific color and subtle glow.
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {string} color - Fill color (e.g., '#00FF00')
 */
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    // Add subtle glow effect for retro feel
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
}

/**
 * Draws the player ship.
 */
function drawPlayer() {
    drawRect(playerX, canvas.height - PLAYER_HEIGHT - 10, PLAYER_WIDTH, PLAYER_HEIGHT, '#00FF00');
}

/**
 * Draws all active bullets.
 */
function drawBullets() {
    bullets.forEach(bullet => {
        drawRect(bullet.x, bullet.y, BULLET_WIDTH, BULLET_HEIGHT, '#00FF00');
    });
}

/**
 * Draws all living aliens.
 */
function drawAliens() {
    aliens.forEach(alien => {
        if (alien.alive) {
            drawRect(alien.x, alien.y, alien.width, alien.height, '#00FF00');
        }
    });
}

// --- Update Functions (Game Logic) ---

/**
 * Updates the player's position based on keyboard input.
 */
function updatePlayer() {
    // Check for both arrow keys and A/D keys
    if ((keys['ArrowLeft'] || keys['a']) && playerX > 0) {
        playerX -= PLAYER_SPEED;
    }
    if ((keys['ArrowRight'] || keys['d']) && playerX < canvas.width - PLAYER_WIDTH) {
        playerX += PLAYER_SPEED;
    }
}

/**
 * Updates the position of all bullets and removes off-screen ones.
 */
function updateBullets() {
    // Move bullets and filter out those that went off-screen
    bullets = bullets.filter(bullet => bullet.y > 0 && bullet.y < canvas.height);
    bullets.forEach(bullet => {
        if(bullet.type === 'player') {
            bullet.y -= BULLET_SPEED; // Player bullets move up
        } else { // alien bullet
            bullet.y += BULLET_SPEED * 0.7; // Alien bullets move down (slower)
        }
    });
}

/**
 * Updates the position of the alien grid, handles edge collision, and alien firing.
 */
function updateAliens() {
    let moveDown = false; // Flag to check if aliens should move down
    let hitEdge = false; // Flag to check if any alien hit the edge

    // Move aliens horizontally
    aliens.forEach(alien => {
        if (alien.alive) {
            alien.x += alienCurrentSpeed * alienDirection;
            // Check if alien hit left or right edge
            if (alien.x <= 0 || alien.x + alien.width >= canvas.width) {
                hitEdge = true;
            }
             // Check if aliens reached player level (game over condition)
            if (alien.y + alien.height >= canvas.height - PLAYER_HEIGHT - 10) {
                 gameOver = true;
            }
        }
    });

    // If any alien hit the edge, reverse direction and move all down
    if (hitEdge) {
        alienDirection *= -1; // Change direction
        moveDown = true;
        alienCurrentSpeed += 0.1; // Increase speed slightly each time they drop
    }

    // Move aliens down if flag is set
    if (moveDown) {
        aliens.forEach(alien => {
            if (alien.alive) {
                alien.y += ALIEN_DROP;
            }
        });
    }

    // Alien firing logic
     aliens.forEach(alien => {
          // Check if alien is alive and random chance allows firing
          if (alien.alive && Math.random() < ALIEN_FIRE_RATE) {
              // --- Find potential shooters (bottom-most in each column) ---
              let livingAliens = aliens.filter(a => a.alive);
              let bottomAliensInColumns = {}; // Track lowest y for each approximate column start

              livingAliens.forEach(s => {
                   // Group aliens roughly by their starting column position
                   let colStart = Math.floor((s.x - ALIEN_OFFSET_LEFT + (ALIEN_WIDTH + ALIEN_PADDING)/2) / (ALIEN_WIDTH + ALIEN_PADDING));
                   if (!bottomAliensInColumns[colStart] || s.y > bottomAliensInColumns[colStart].y) {
                       bottomAliensInColumns[colStart] = s; // Keep track of the lowest alien in this column
                   }
              });

               // Get an array of the aliens at the bottom of each column
               let potentialShooters = Object.values(bottomAliensInColumns);

               // If there are aliens left to shoot
               if (potentialShooters.length > 0) {
                   // Pick a random one from the bottom row to shoot
                   let shooter = potentialShooters[Math.floor(Math.random() * potentialShooters.length)];
                     // Create a new alien bullet
                     bullets.push({
                          x: shooter.x + shooter.width / 2 - BULLET_WIDTH / 2, // Center of the alien
                          y: shooter.y + shooter.height, // Bottom of the alien
                          type: 'alien'
                     });
               }
               // --- End finding potential shooters ---
          }
     });
}


/**
 * Checks for collisions between bullets and game objects.
 */
function checkCollisions() {
    // Player bullets vs Aliens
    bullets.forEach((bullet, bulletIndex) => {
        if(bullet.type === 'player') { // Only check player bullets against aliens
            aliens.forEach((alien, alienIndex) => {
                // Check if alien is alive and bullet overlaps with alien
                if (alien.alive &&
                    bullet.x < alien.x + alien.width &&
                    bullet.x + BULLET_WIDTH > alien.x &&
                    bullet.y < alien.y + alien.height &&
                    bullet.y + BULLET_HEIGHT > alien.y)
                {
                    alien.alive = false; // Alien is hit
                    bullets.splice(bulletIndex, 1); // Remove the bullet
                    score += 10; // Increase score
                    // Note: Using splice while iterating requires care, but here it should be okay
                    // because we only remove one bullet per outer loop iteration.
                    // A safer approach might be to mark bullets for removal and filter later.
                }
            });
        }
    });

     // Alien bullets vs Player
     bullets.forEach((bullet, bulletIndex) => {
          // Check if it's an alien bullet and overlaps with player
          if (bullet.type === 'alien' &&
               bullet.x < playerX + PLAYER_WIDTH &&
               bullet.x + BULLET_WIDTH > playerX &&
               bullet.y < canvas.height - 10 && // Bottom of player approx
               bullet.y + BULLET_HEIGHT > canvas.height - PLAYER_HEIGHT - 10) // Top of player approx
          {
               bullets.splice(bulletIndex, 1); // Remove the bullet
               lives--; // Player loses a life
               console.log("Player Hit! Lives:", lives);
               if (lives <= 0) {
                    gameOver = true; // Set game over flag if no lives left
               }
               // Could add a brief invincibility period or visual effect here
          }
     });
}

/**
 * Checks if all aliens are defeated to potentially start a new wave.
 */
function checkWinCondition() {
    // Count how many aliens are still alive
    const livingAliens = aliens.filter(alien => alien.alive).length;
    if (livingAliens === 0 && gameRunning) { // Check gameRunning to prevent multiple triggers
        console.log("All aliens defeated! Spawning new wave.");
        // For simplicity, spawn a new wave immediately and increase speed/score
        alienCurrentSpeed += 0.5; // Increase speed significantly for next wave
        createAliens();        // Create new aliens
        score += 100;          // Bonus score for clearing the wave
    }
}

// --- Game Loop ---

/**
 * The main game loop, called repeatedly using requestAnimationFrame.
 */
function gameLoop() {
    // If game over flag is set, handle game over and stop the loop
    if (gameOver) {
        handleGameOver();
        return;
    }
    // If game is paused or stopped, don't continue
     if (!gameRunning) {
          return;
     }

    // --- Clear Canvas ---
    ctx.shadowBlur = 0; // Reset shadow blur before clearing for performance
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

    // --- Update Game State ---
    updatePlayer();
    updateBullets();
    updateAliens();
    checkCollisions();
    checkWinCondition(); // Check if wave is cleared

    // --- Draw Game Elements ---
    drawPlayer();
    drawBullets();
    drawAliens();

    // Update score/lives display in HTML
    updateUI();

    // Request the next frame
    animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Handles the game over sequence: stops the loop, updates leaderboard, shows screen.
 */
function handleGameOver() {
    console.log("handleGameOver called.");
    gameRunning = false; // Stop game logic
    if (animationFrameId) { // Stop the animation loop
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    let message = ""; // Initialize message string - only set if score >= 2000

    // Clear previous messages from the game over screen
    leaderboardMessageElement.textContent = '';
    leaderboardDisplayElement.innerHTML = '';

    // --- Leaderboard Logic (Retrieve and Update) ---
    let leaderboard = getLeaderboard(); // Get current board (dummy or from storage)
    console.log("Initial leaderboard from getLeaderboard():", JSON.stringify(leaderboard));

    // Safety check: Ensure leaderboard is an array
    if (!Array.isArray(leaderboard)) {
        console.error("Leaderboard data is not an array! Resetting to default.");
        leaderboard = getLeaderboard(); // Re-get default
        if (!Array.isArray(leaderboard)) { leaderboard = []; } // Final fallback
    }

    // Determine lowest score for comparison (or 0 if board not full)
    let lowestScoreOnBoard = leaderboard.length < 10 ? 0 : (leaderboard[leaderboard.length - 1]?.score || 0);
    let boardUpdated = false; // Flag to track if the board needs saving

    // --- Check scoring conditions ---
    if (score >= 1500) { // Special condition met
        message = "Use it wisely. Here is your key: Master08%";
        leaderboard.push({ name: 'PLAYER', score: score }); // Add player score
        boardUpdated = true;
        if (score > highScore) { // Also update overall high score if needed
            highScore = score;
            localStorage.setItem('invadersHighScore', highScore);
        }
        console.log("Score >= 2000 condition met.");
    } else if (score > highScore) { // New overall high score (but less than 2000)
        highScore = score;
        localStorage.setItem('invadersHighScore', highScore);
        console.log("New High Score achieved!");
        // Check if it also makes the top 10 leaderboard
        if (score > lowestScoreOnBoard || leaderboard.length < 10) {
             leaderboard.push({ name: 'PLAYER', score: score });
             boardUpdated = true;
             console.log("New High Score added to board.");
        }
    } else if (score > lowestScoreOnBoard || leaderboard.length < 10) { // Makes top 10 (not overall high score)
         leaderboard.push({ name: 'PLAYER', score: score });
         boardUpdated = true;
         console.log("Score added to board (not high score).");
    } else { // Score didn't make the board or beat high score
         console.log("Score did not make leaderboard.");
    }
    // --- End Score Checking ---

    // If the board was updated, sort, trim to top 10, and save
    if (boardUpdated) {
        // Filter out any potentially invalid entries before sorting (safety check)
        leaderboard = leaderboard.filter(entry => entry && typeof entry.score === 'number');
        leaderboard.sort((a, b) => b.score - a.score); // Sort descending by score
        leaderboard = leaderboard.slice(0, 10); // Keep only the top 10 entries
        console.log("Board updated, sorted, and sliced:", JSON.stringify(leaderboard));
        saveLeaderboard(leaderboard); // Save the updated board to localStorage
    }
    // --- End Leaderboard Update Logic ---


    // --- Display Leaderboard ---
    console.log("Attempting to display leaderboard. Final board data:", JSON.stringify(leaderboard));
    leaderboardDisplayElement.innerHTML = '<strong>-- Top Scores --</strong><br>'; // Set title
    try {
        if (Array.isArray(leaderboard) && leaderboard.length > 0) {
             leaderboard.forEach((entry, index) => {
                  const rank = index + 1;
                  // Safely access properties and escape name
                  const name = entry?.name ? entry.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'N/A';
                  const entryScore = typeof entry?.score !== 'undefined' ? entry.score : 'N/A';
                  console.log(`Looping to display rank ${rank}: ${name} - ${entryScore}`);
                  // Append HTML string for each entry
                  leaderboardDisplayElement.innerHTML += `${rank}. ${name} - ${entryScore}<br>`;
             });
             console.log("Finished display loop.");
        } else {
             console.error("Leaderboard data for display is empty or not an array:", leaderboard);
             leaderboardDisplayElement.innerHTML += "No scores available.<br>"; // Display message if empty
        }
    } catch (error) {
         console.error("Error occurred during leaderboard display loop:", error);
         leaderboardDisplayElement.innerHTML += "Error rendering leaderboard.<br>"; // Display error message
    }
    console.log("Final leaderboardDisplayElement HTML:", leaderboardDisplayElement.innerHTML);
    // --- End Display Leaderboard ---

    // --- Display results on Game Over Screen ---
    finalScoreElement.textContent = score; // Show final score
    highScoreElement.textContent = highScore; // Show potentially updated high score
    leaderboardMessageElement.textContent = message; // Show the special message (if any)
    gameOverScreen.style.display = 'block'; // Show the game over screen
    canvas.style.opacity = 0.3; // Dim the game canvas
    console.log("handleGameOver finished.");
}


// --- Event Listeners ---

// Track key presses
window.addEventListener('keydown', (e) => {
    keys[e.key] = true; // Mark key as pressed

    // Player shooting logic
    if (e.key === ' ' && gameRunning) { // Spacebar pressed and game is running
         // Optional: Limit number of player bullets on screen
         const playerBullets = bullets.filter(b => b.type === 'player').length;
         if(playerBullets < 3) { // Limit to 3 player shots on screen at once
              // Create a new player bullet
              bullets.push({
                   x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, // Center of player ship
                   y: canvas.height - PLAYER_HEIGHT - 10 - BULLET_HEIGHT, // Just above player ship
                   type: 'player'
              });
         }
         e.preventDefault(); // Prevent spacebar from scrolling the page
    }
});

// Track key releases
window.addEventListener('keyup', (e) => {
    keys[e.key] = false; // Mark key as released
});

// Restart button functionality
restartButton.addEventListener('click', () => {
    initGame(); // Re-initialize the game
});

// Start button functionality
startButton.addEventListener('click', () => {
     initGame(); // Initialize the game
});

// --- Initial Load ---
updateUI(); // Show initial scores/lives/high score from localStorage
gameOverScreen.style.display = 'none'; // Ensure game over screen is hidden initially
startScreen.style.display = 'block'; // Show the start screen initially
canvas.style.opacity = 0.3; // Dim the canvas initially until game starts

