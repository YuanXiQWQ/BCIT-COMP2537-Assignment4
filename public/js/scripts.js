document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const resetButton = document.getElementById('reset-button');
    const powerUpButton = document.getElementById('power-up-button');
    const difficultySelect = document.getElementById('difficulty-select');
    const themeSelect = document.getElementById('theme-select');
    const clickCountSpan = document.getElementById('click-count');
    const pairsLeftSpan = document.getElementById('pairs-left');
    const pairsMatchedSpan = document.getElementById('pairs-matched');
    const totalPairsSpan = document.getElementById('total-pairs');
    const timerSpan = document.getElementById('timer');
    const gameBoard = document.getElementById('game-board');

    let clickCount = 0;
    let pairsLeft = 0;
    let pairsMatched = 0;
    let totalPairs = 0;
    let timer = 0;
    let timerInterval;
    let selectedCards = [];
    let cardElements = [];
    let difficulty = 'easy';
    let theme = 'light';

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    const fetchPokemonData = async () => {
        try {
            const response = await fetch('/data');
            const data = await response.json();
            return data.pokemonList;
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        }
    };

    const createCardElement = (pokemon) => {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
            <div class="pokemon-card-inner">
                <div class="pokemon-card-front">
                    <img src="${pokemon.image}" alt="${pokemon.name}">
                </div>
                <div class="pokemon-card-back"></div>
            </div>
        `;
        card.dataset.name = pokemon.name;
        return card;
    };

    const handleCardClick = (card) => {
        if (selectedCards.length === 2 || card.classList.contains('flipped')) return;
        card.classList.add('flipped');
        selectedCards.push(card);

        if (selectedCards.length === 2) {
            checkForMatch();
        }
    };

    const checkForMatch = () => {
        const [card1, card2] = selectedCards;
        if (card1.dataset.name === card2.dataset.name) {
            pairsMatched++;
            pairsMatchedSpan.textContent = pairsMatched;
            pairsLeft--;
            pairsLeftSpan.textContent = pairsLeft;
            selectedCards = [];
            card1.classList.add('matched');
            card2.classList.add('matched');
            if (pairsLeft === 0) {
                setTimeout(() => {
                    clearInterval(timerInterval);
                    alert('You win!');
                }, 1000);
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                selectedCards = [];
            }, 1000);
        }
        clickCount++;
        clickCountSpan.textContent = clickCount;
    };

    const adjustCardWidth = (numCards) => {
        const cardsPerRow = Math.ceil(Math.sqrt(numCards));
        const cardWidth = `calc(${100 / cardsPerRow}% - 10px)`;
        document.querySelectorAll('.pokemon-card').forEach(card => {
            card.style.width = cardWidth;
        });
    };

    const startGame = async () => {
        clickCount = 0;
        pairsMatched = 0;
        pairsMatchedSpan.textContent = pairsMatched;
        clickCountSpan.textContent = clickCount;
        timer = 0;
        timerSpan.textContent = '0:00';
        clearInterval(timerInterval);

        let timeLimit;
        if (difficulty === 'easy') {
            timeLimit = 300;
        } else if (difficulty === 'medium') {
            timeLimit = 180;
        } else {
            timeLimit = 120;
        }

        timerInterval = setInterval(() => {
            timer++;
            const minutes = Math.floor(timer / 60);
            const seconds = timer % 60;
            timerSpan.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timer >= timeLimit) {
                clearInterval(timerInterval);
                alert('Time\'s up! You lose!');
                startGame();
            }
        }, 1000);

        const pokemonData = await fetchPokemonData();
        if (!pokemonData || pokemonData.length === 0) {
            alert('Failed to load Pokémon data. Please try again.');
            return;
        }

        const cardData = pokemonData.slice(0, difficulty === 'easy' ? 6 : difficulty === 'medium' ? 12 : 18);
        const cardPairs = [...cardData, ...cardData];
        shuffleArray(cardPairs);

        gameBoard.innerHTML = '';
        cardElements = cardPairs.map(createCardElement);
        cardElements.forEach(card => gameBoard.appendChild(card));
        cardElements.forEach(card => card.addEventListener('click', () => handleCardClick(card)));

        pairsLeft = cardData.length;
        pairsLeftSpan.textContent = pairsLeft;
        totalPairs = cardData.length;
        totalPairsSpan.textContent = totalPairs;

        adjustCardWidth(cardPairs.length);
    };

    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', startGame);

    powerUpButton.addEventListener('click', () => {
        cardElements.forEach(card => {
            if (!card.classList.contains('flipped')) {
                card.classList.add('flipped');
            }
        });
        setTimeout(() => {
            cardElements.forEach(card => {
                if (!card.classList.contains('matched')) {
                    card.classList.remove('flipped');
                }
            });
        }, 1000);
    });

    difficultySelect.addEventListener('change', (e) => {
        difficulty = e.target.value;
    });

    themeSelect.addEventListener('change', (e) => {
        theme = e.target.value;
        document.body.className = theme;
    });
});
