const pads = document.querySelectorAll('.pad');
const startBtn = document.getElementById('startBtn');
const scoreValue = document.getElementById('scoreValue');
const message = document.getElementById('message');

let sequence = [];
let playerIndex = 0;
let inSequence = false;
let score = 0;
let canPlay = false;

function flashPad(index, duration = 420) {
  const pad = pads[index];
  if (!pad) return Promise.resolve();

  pad.classList.add('active');
  return new Promise((resolve) => {
    setTimeout(() => {
      pad.classList.remove('active');
      setTimeout(resolve, 80);
    }, duration);
  });
}

function updateScore() {
  scoreValue.textContent = String(score);
}

async function playSequence() {
  inSequence = true;
  canPlay = false;
  message.textContent = 'Watch the pattern...';

  for (const padIndex of sequence) {
    await flashPad(padIndex, 450);
    await new Promise((resolve) => setTimeout(resolve, 180));
  }

  inSequence = false;
  canPlay = true;
  playerIndex = 0;
  message.textContent = 'Your turn! Repeat the sequence.';
}

function startGame() {
  sequence = [];
  score = 0;
  updateScore();
  message.textContent = 'Starting...';
  nextRound();
}

async function nextRound() {
  sequence.push(Math.floor(Math.random() * pads.length));
  score = sequence.length - 1;
  updateScore();
  await playSequence();
}

function handlePadClick(event) {
  const padIndex = Number(event.currentTarget.dataset.pad);

  if (!canPlay || inSequence) return;

  flashPad(padIndex, 220);

  if (padIndex !== sequence[playerIndex]) {
    canPlay = false;
    message.textContent = 'Wrong move! Game over.';
    startBtn.textContent = 'Play Again';
    return;
  }

  playerIndex += 1;

  if (playerIndex === sequence.length) {
    canPlay = false;
    message.textContent = 'Nice! Next round...';
    setTimeout(nextRound, 700);
  }
}

startBtn.addEventListener('click', startGame);
pads.forEach((pad) => pad.addEventListener('click', handlePadClick));
updateScore();
