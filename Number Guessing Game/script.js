const form = document.getElementById('guess-form');
const guessInput = document.getElementById('guess');
const message = document.getElementById('message');
const attemptsElement = document.getElementById('attempts');
const statusLabel = document.getElementById('status-label');
let secretNumber;
let attempts;
let finished;

function randomDigit() {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % 10;
}

function createSecretNumber() {
    const digits = 1 + randomDigit() * 10 + randomDigit();
    let value = String(1 + (randomDigit() % 9));
    for (let index = 1; index < digits; index++) value += randomDigit();
    return BigInt(value);
}

function startGame() {
    secretNumber = createSecretNumber();
    attempts = 0;
    finished = false;
    guessInput.value = '';
    guessInput.disabled = false;
    form.querySelector('button').disabled = false;
    attemptsElement.textContent = '0 attempts';
    statusLabel.textContent = 'Your first guess can be any whole number.';
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
