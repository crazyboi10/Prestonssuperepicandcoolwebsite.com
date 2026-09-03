const diceCountSelect = document.getElementById('diceCount');
const sidesSelect = document.getElementById('sides');
const diceDisplay = document.getElementById('diceDisplay');
const totalValue = document.getElementById('totalValue');
const rollBtn = document.getElementById('rollBtn');

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function renderDice(values) {
  diceDisplay.innerHTML = '';

  values.forEach((value) => {
    const die = document.createElement('div');
    die.className = 'die';
    die.textContent = value;
    diceDisplay.appendChild(die);
  });
}

function rollDice() {
  const count = Number(diceCountSelect.value);
  const sides = Number(sidesSelect.value);

  const values = Array.from({ length: count }, () => rollDie(sides));
  const total = values.reduce((sum, value) => sum + value, 0);

  renderDice(values);
  totalValue.textContent = String(total);
}

rollBtn.addEventListener('click', rollDice);

rollDice();
