const canvas = document.getElementById('wheel');
const context = canvas.getContext('2d');
const namesInput = document.getElementById('names');
const count = document.getElementById('count');
const result = document.getElementById('result');
const spinButton = document.getElementById('spin');
const colors = ['#f05d7b', '#ffd166', '#8fe3cf', '#5d78e8', '#ff9c70', '#b7a5f5', '#c6e86b', '#f6a6ca'];
const defaults = 'Preston\nMom\nA mystery choice\nSomething silly';
let names = [];
let rotation = 0;
let spinning = false;

function getNames() {
    return namesInput.value.split('\n').map((name) => name.trim()).filter(Boolean).slice(0, 40);
}

function drawWheel() {
    names = getNames();
    count.textContent = `${names.length} item${names.length === 1 ? '' : 's'}`;
    const center = canvas.width / 2;
    const radius = center - 5;
    const slice = (Math.PI * 2) / Math.max(names.length, 1);
    context.clearRect(0, 0, canvas.width, canvas.height);
    names.forEach((name, index) => {
        const start = -Math.PI / 2 + index * slice;
        context.beginPath();
        context.moveTo(center, center);
        context.arc(center, center, radius, start, start + slice);
        context.closePath();
        context.fillStyle = colors[index % colors.length];
        context.fill();
        context.strokeStyle = '#20202c';
        context.lineWidth = 3;
        context.stroke();
        context.save();
        context.translate(center, center);
        context.rotate(start + slice / 2);
        context.textAlign = 'right';
        context.fillStyle = '#20202c';
        context.font = `800 ${Math.max(13, Math.min(22, 300 / names.length))}px Nunito, sans-serif`;
        context.fillText(name.slice(0, 22), radius - 22, 7);
        context.restore();
    });
}

function updateWheel() {
    if (spinning) return;
    drawWheel();
    result.textContent = names.length ? 'Ready to spin!' : 'Add at least one choice.';
}

function spin() {
    if (spinning || !names.length) {
        result.textContent = names.length ? 'The wheel is already spinning!' : 'Add at least one choice first.';
        return;
    }
    spinning = true;
    spinButton.disabled = true;
    const winnerIndex = Math.floor(Math.random() * names.length);
    const sliceDegrees = 360 / names.length;
    const centerDegrees = -90 + (winnerIndex + 0.5) * sliceDegrees;
    const offset = ((-centerDegrees - rotation) % 360 + 360) % 360;
    rotation += 1440 + offset;
    canvas.style.transition = 'transform 4s cubic-bezier(.12,.75,.18,1)';
    canvas.style.transform = `rotate(${rotation}deg)`;
    result.textContent = 'The wheel is spinning...';
    setTimeout(() => {
        result.textContent = `Winner: ${names[winnerIndex]}!`;
        spinning = false;
        spinButton.disabled = false;
    }, 4100);
}

document.getElementById('update').addEventListener('click', updateWheel);
spinButton.addEventListener('click', spin);
document.getElementById('reset').addEventListener('click', () => {
    namesInput.value = defaults;
    rotation = 0;
    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0deg)';
    updateWheel();
});
namesInput.addEventListener('input', updateWheel);
drawWheel();
