document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('username-display');
    const memberSinceDisplay = document.getElementById('member-since');
    const hintsReceivedDisplay = document.getElementById('hints-received');
    const passwordsFoundDisplay = document.getElementById('passwords-found');
    const frontendSolvedDisplay = document.getElementById('frontend-solved');
    const backendSolvedDisplay = document.getElementById('backend-solved');
    const databaseSolvedDisplay = document.getElementById('database-solved');
    const aiSolvedDisplay = document.getElementById('ai-solved');
    const skippedAiPuzzlesDisplay = document.getElementById('skipped-ai-puzzles'); // ADDED
    const errorMessage = document.getElementById('error-message');
    const statsContent = document.getElementById('stats-content');

    const loggedInUsername = localStorage.getItem('terminalUsername');

    if (!loggedInUsername) {
        console.error("No logged-in user found in localStorage.");
        statsContent.style.display = 'none';
        errorMessage.textContent = ':: ERROR: No operative credentials found. Please log in via the terminal. ::';
        errorMessage.style.display = 'block';
        return;
    }

    fetch(`/api/statistics/${loggedInUsername}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Failed to fetch stats') });
            }
            return response.json();
        })
        .then(data => {
            console.log("Statistics data received:", data);

            usernameDisplay.textContent = data.username;
            hintsReceivedDisplay.textContent = data.hints_received;
            frontendSolvedDisplay.textContent = data.standard_puzzles_solved.frontend;
            backendSolvedDisplay.textContent = data.standard_puzzles_solved.backend;
            databaseSolvedDisplay.textContent = data.standard_puzzles_solved.database;
            aiSolvedDisplay.textContent = data.ai_puzzles_solved;
            skippedAiPuzzlesDisplay.textContent = data.skipped_ai_puzzles; // ADDED

            // Display found passwords
            passwordsFoundDisplay.textContent = `${data.passwords_found} / 6`;

            const registeredDate = new Date(data.member_since);
            const today = new Date();
            const timeDiff = Math.abs(today.getTime() - registeredDate.getTime());
            const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            memberSinceDisplay.textContent = `${registeredDate.toLocaleDateString()} (${diffDays} days ago)`;

        })
        .catch(error => {
            console.error("Error fetching statistics:", error);
            statsContent.style.display = 'none';
            errorMessage.textContent = `:: ERROR: ${error.message}. Could not retrieve dossier. ::`;
            errorMessage.style.display = 'block';
        });
});
