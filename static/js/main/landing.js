// landing.js
// Handles the multi-stage animation sequence for the initial landing page.

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if user has already been here
    if (localStorage.getItem('lastCandidateName')) {
        window.location.href = '/enigma';
        return;
    }

    // --- Element References ---
    const mainTitle = document.getElementById('main-title');
    const initialSubtitle = document.getElementById('initial-subtitle');
    const handleInputContainer = document.getElementById('handle-input-container');
    const candidateNameInput = document.getElementById('candidateName');
    const postHandleSection = document.getElementById('post-handle-section');
    const personalizedWelcome = document.getElementById('personalized-welcome');
    const proveWorthPrompt = document.getElementById('prove-worth-prompt'); // New reference
    const proceedButton = document.getElementById('proceed-button');
    const audioButton = document.getElementById('intro-audio-button');
    const audioPlayer = document.getElementById('intro-audio-player');
    const audioIndicator = document.getElementById('intro-audio-indicator');

    // --- Initial Animation Sequence ---
    setTimeout(() => {
        mainTitle.classList.remove('hidden');
        mainTitle.classList.add('visible');
        mainTitle.dataset.text = mainTitle.textContent;
    }, 500);

    setTimeout(() => {
        initialSubtitle.classList.remove('hidden');
        initialSubtitle.classList.add('visible');
    }, 2500);

    setTimeout(() => {
        handleInputContainer.classList.remove('hidden');
        handleInputContainer.classList.add('visible');
        candidateNameInput.focus();
    }, 4000);

    // --- Event Listeners ---
    candidateNameInput.addEventListener('keypress', handleNameEntry);
    audioButton.addEventListener('click', toggleAudio);
    audioPlayer.addEventListener('ended', onAudioEnd);

    /**
     * Handles the 'Enter' key press to transform the page.
     */
    function handleNameEntry(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const candidateHandle = candidateNameInput.value.trim();

            if (candidateHandle) {
                localStorage.setItem('lastCandidateName', candidateHandle);
                console.log(`Handle "${candidateHandle}" saved. Transforming page...`);

                // Fade out the old elements
                initialSubtitle.classList.remove('visible');
                handleInputContainer.classList.remove('visible');
                initialSubtitle.classList.add('hidden');
                handleInputContainer.classList.add('hidden');

                // FIX: Remove the elements from the layout after the fade-out transition completes.
                // This will collapse the space they occupied and remove the gap.
                setTimeout(() => {
                    initialSubtitle.style.display = 'none';
                    handleInputContainer.style.display = 'none';
                }, 800); // This time matches the transition duration in your CSS (0.8s)

                // Set the personalized welcome text (it's inside a container that's still hidden)
                personalizedWelcome.textContent = `Welcome, ${candidateHandle}. Your compliance is noted.`;

                // Reveal the new section after the old one fades and is removed from the layout
                setTimeout(() => {
                    postHandleSection.classList.remove('hidden');
                    postHandleSection.classList.add('visible');

                    // Animate the "Prove your worth" message separately
                    animateProveWorth();
                }, 1000); // 1s delay allows the 0.8s fade-out and removal to complete

                // Reveal the final "Access Terminal" button after a longer delay
                setTimeout(() => {
                    proceedButton.classList.remove('hidden');
                    proceedButton.classList.add('visible');
                }, 3500);

            } else {
                candidateNameInput.style.borderColor = '#ff0000';
                setTimeout(() => { candidateNameInput.style.borderColor = ''; }, 1000);
            }
        }
    }

    /**
     * Animate "Prove your worth." on its own line.
     */
    function animateProveWorth() {
        // Construct the message with spans for the animation in its own paragraph
        proveWorthPrompt.innerHTML = `<span class="fade-word">Prove</span> <span class="fade-word">your</span> <span class="fade-word">worth.</span>`;

        const wordsToAnimate = proveWorthPrompt.querySelectorAll('.fade-word');

        // Trigger their animation with a stagger
        wordsToAnimate.forEach((word, index) => {
            setTimeout(() => {
                word.classList.add('animate');
            }, index * 400);
        });
    }

    // --- Audio Controls ---
    function toggleAudio() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            audioButton.textContent = '[ Stop Audio ]';
            audioIndicator.classList.add('playing');
        } else {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            audioButton.textContent = '[ Play Audio ]';
            audioIndicator.classList.remove('playing');
        }
    }
     function onAudioEnd() {
        audioButton.textContent = '[ Play Audio ]';
        audioIndicator.classList.remove('playing');
     }
});
