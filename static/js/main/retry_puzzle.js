document.addEventListener('DOMContentLoaded', () => {
    const puzzleList = document.getElementById('puzzle-list');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');

    // Get the player's ID to fetch their saved puzzles.
    // Assumes the ID is stored in localStorage when the player logs in or registers.
    const playerId = localStorage.getItem('currentPlayerId');
    const candidateName = localStorage.getItem('lastCandidateName');

    if (!playerId || !candidateName) {
        loadingMessage.style.display = 'none';
        errorMessage.textContent = ':: ERROR: Operative ID not found. Cannot retrieve archives. Please return to the main terminal. ::';
        errorMessage.style.display = 'block';
        return;
    }

    fetch(`/api/skipped_puzzles/${playerId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Failed to fetch archived puzzles.') });
            }
            return response.json();
        })
        .then(data => {
            loadingMessage.style.display = 'none';
            if (data.length === 0) {
                errorMessage.textContent = ':: No puzzles found in the archives. ::';
                errorMessage.style.display = 'block';
                return;
            }

            // Clear any existing content
            puzzleList.innerHTML = '';

            data.forEach(puzzle => {
                const listItem = document.createElement('li');
                listItem.className = 'puzzle-item';

                const detailsDiv = document.createElement('div');
                detailsDiv.className = 'puzzle-details';
                detailsDiv.innerHTML = `
                    <span><strong>Domain:</strong> ${puzzle.domain}</span>
                    <span><strong>Difficulty:</strong> ${puzzle.difficulty}</span>
                    <span><strong>Description:</strong> ${puzzle.puzzle_description.substring(0, 100)}...</span>
                `;

                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'puzzle-actions';

                const retryButton = document.createElement('button');
                retryButton.className = 'submit-button';
                retryButton.textContent = '> Retry Puzzle';
                retryButton.onclick = () => {
                    alert(`To retry this puzzle, please go to the AI Calibration section and select the ${puzzle.domain} domain with ${puzzle.difficulty} difficulty.`);
                    window.location.href = '/enigma';
                };

                actionsDiv.appendChild(retryButton);

                listItem.appendChild(detailsDiv);
                listItem.appendChild(actionsDiv);
                puzzleList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error("Error fetching archived puzzles:", error);
            loadingMessage.style.display = 'none';
            errorMessage.textContent = `:: ERROR: ${error.message} ::`;
            errorMessage.style.display = 'block';
        });
});
