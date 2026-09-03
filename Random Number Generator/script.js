const minInput = document.getElementById('minValue');
const maxInput = document.getElementById('maxValue');
const countInput = document.getElementById('countValue');
const resultDisplay = document.getElementById('resultDisplay');
const generateBtn = document.getElementById('generateBtn');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNumbers() {
  let min = Number(minInput.value);
  let max = Number(maxInput.value);
  let count = Number(countInput.value);

  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(count)) {
    resultDisplay.textContent = 'Invalid input';
    return;
  }

  if (min > max) {
    [min, max] = [max, min];
    minInput.value = min;
    maxInput.value = max;
  }

  count = Math.min(Math.max(Math.round(count), 1), 10);
  countInput.value = count;

  const values = [];
  for (let i = 0; i < count; i += 1) {
    values.push(getRandomInt(min, max));
  }

  resultDisplay.textContent = count === 1 ? String(values[0]) : values.join(', ');
}

generateBtn.addEventListener('click', generateNumbers);
generateNumbers();
