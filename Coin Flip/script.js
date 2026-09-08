const coin = document.getElementById('coin');
const coinFace = document.getElementById('coin-face');
const result = document.getElementById('result');
const flipButton = document.getElementById('flip-button');
const headsCount = document.getElementById('heads-count');
const tailsCount = document.getElementById('tails-count');
const streakElement = document.getElementById('streak');
let heads = 0;
let tails = 0;
let streak = 0;
let lastResult = '';

function flipCoin() {
    flipButton.disabled = true;
    coin.classList.remove('flipping');
    void coin.offsetWidth;
    coin.classList.add('flipping');
    const landedOnHeads = Math.random() < 0.5;

    setTimeout(() => {
        const side = landedOnHeads ? 'heads' : 'tails';
        coin.classList.toggle('heads', landedOnHeads);
        coin.classList.toggle('tails', !landedOnHeads);
        coinFace.textContent = landedOnHeads ? 'H' : 'T';
        coin.setAttribute('aria-label', landedOnHeads ? 'Heads' : 'Tails');
        result.textContent = `It landed on ${landedOnHeads ? 'heads' : 'tails'}!`;
        if (landedOnHeads) heads++;
        else tails++;
        streak = side === lastResult ? streak + 1 : 1;
        lastResult = side;
        headsCount.textContent = heads;
        tailsCount.textContent = tails;
        streakElement.textContent = streak;
        flipButton.disabled = false;
    }, 750);
}

function reset() {
    heads = 0;
    tails = 0;
    streak = 0;
    lastResult = '';
    headsCount.textContent = '0';
    tailsCount.textContent = '0';
    streakElement.textContent = '0';
    result.textContent = 'Ready when you are.';
    coin.className = 'coin heads';
    coinFace.textContent = 'H';
}

flipButton.addEventListener('click', flipCoin);
document.getElementById('reset-button').addEventListener('click', reset);
