// Define your min and max limits here
const MIN_NUMBER = 1n;
const MAX_NUMBER = 100n; // Set to whatever limit you want (e.g., 100n, 1000n)

const form = document.getElementById('guess-form');
const guessInput = document.getElementById('guess');
const message = document.getElementById('message');
const attemptsElement = document.getElementById('attempts');
const statusLabel = document.getElementById('status-label');
let secretNumber;
let attempts;
let finished;

function getRandomBigInt(min, max) {
    const range = max - min + 1n;
    const bits = range.toString(2).length;
    const bytes = Math.ceil(bits / 8);
    const array = new Uint8Array(bytes);
    
    let randomValue;
    do {
        crypto.getRandomValues(array);
        let hex = '0x';
        for (let i = 0; i < array.length; i++) {
            hex += array[i].toString(16).padStart(2, '0');
        }
        randomValue = BigInt(hex);
    } while (randomValue >= (1n << BigInt(bytes * 8)) - ((1n << BigInt(bytes * 8)) % range));

    return min + (randomValue % range);
}

function createSecretNumber(min = MIN_NUMBER, max = MAX_NUMBER) {
    return getRandomBigInt(BigInt(min), BigInt(max));
}

function startGame() {
    secretNumber = createSecretNumber(MIN_NUMBER, MAX_NUMBER);
    attempts = 0;
    finished = false;
    guessInput.value = '';
    guessInput.disabled = false;
    form.querySelector('button').disabled = false;
    attemptsElement.textContent = '0 attempts';
    statusLabel.textContent = `Guess a whole number between ${MIN_NUMBER} and ${MAX_NUMBER}.`;
    message.textContent = 'Higher or lower clues will appear here.';
    message.className = 'message';
    guessInput.focus();
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (finished) return;
    const rawGuess = guessInput.value.trim();
    if (!/^[+-]?\d+$/.test(rawGuess)) {
        message.textContent = 'Please enter a whole number.';
        message.className = 'message lower';
        return;
    }
    const guess = BigInt(rawGuess);
    attempts++;
    attemptsElement.textContent = `${attempts} attempt${attempts === 1 ? '' : 's'}`;
    if (guess === secretNumber) {
        message.textContent = `Correct! You got it in ${attempts} attempt${attempts === 1 ? '' : 's'}!`;
        message.className = 'message correct';
        statusLabel.textContent = 'You found the secret number.';
        finished = true;
        guessInput.disabled = true;
        form.querySelector('button').disabled = true;
    } else if (guess < secretNumber) {
        message.textContent = 'Go higher!';
        message.className = 'message higher';
    } else {
        message.textContent = 'Go lower!';
        message.className = 'message lower';
    }
    guessInput.select();
});

document.getElementById('new-game').addEventListener('click', startGame);
startGame();