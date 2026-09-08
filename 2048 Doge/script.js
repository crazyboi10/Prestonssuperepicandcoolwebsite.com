const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const scoreElement = document.getElementById('score');
const bestElement = document.getElementById('best');
let tiles;
let score = 0;
let best = Number(localStorage.getItem('doge-2048-best') || 0);
let hasWon = false;

function startGame() {
    tiles = Array(16).fill(0);
    score = 0;
    hasWon = false;
    addTile();
    addTile();
    statusElement.textContent = 'Use your arrow keys or swipe.';
    render();
}

function addTile() {
    const empty = tiles.map((value, index) => value ? null : index).filter(index => index !== null);
    if (empty.length) tiles[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
    boardElement.innerHTML = tiles.map(value => '<div class="tile" data-value="' + value + '" aria-label="' + (value || 'empty') + '">' + (value === 2048 ? 'WOW' : (value || '')) + '</div>').join('');
    scoreElement.textContent = score;
    bestElement.textContent = best;
}

function slide(line) {
    const values = line.filter(Boolean);
    for (let index = 0; index < values.length - 1; index++) {
        if (values[index] === values[index + 1]) {
            values[index] *= 2;
            score += values[index];
            values.splice(index + 1, 1);
        }
    }
    while (values.length < 4) values.push(0);
    return values;
}

function move(direction) {
    const before = tiles.join(',');
    const next = Array(16).fill(0);

    for (let line = 0; line < 4; line++) {
        let values = [];
        for (let spot = 0; spot < 4; spot++) {
            const position = direction === 'up' || direction === 'down' ? spot * 4 + line : line * 4 + spot;
            values.push(tiles[position]);
        }
        if (direction === 'right' || direction === 'down') values.reverse();
        values = slide(values);
        if (direction === 'right' || direction === 'down') values.reverse();
        for (let spot = 0; spot < 4; spot++) {
            const position = direction === 'up' || direction === 'down' ? spot * 4 + line : line * 4 + spot;
            next[position] = values[spot];
        }
    }

    if (before === next.join(',')) {
        statusElement.textContent = 'Much blocked. Try another direction.';
        return;
    }

    tiles = next;
    addTile();
    if (score > best) {
        best = score;
        localStorage.setItem('doge-2048-best', best);
    }
    render();

    if (tiles.includes(2048) && !hasWon) {
        hasWon = true;
        statusElement.textContent = 'WOW! You found the ultimate Doge tile!';
    } else if (!canMove()) {
        statusElement.textContent = 'Such game over. Start a new game?';
    }
}

function canMove() {
    if (tiles.includes(0)) return true;
    for (let index = 0; index < 16; index++) {
        if (index % 4 < 3 && tiles[index] === tiles[index + 1]) return true;
        if (index < 12 && tiles[index] === tiles[index + 4]) return true;
    }
    return false;
}

document.addEventListener('keydown', event => {
    const directions = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (directions[event.key]) {
        event.preventDefault();
        move(directions[event.key]);
    }
});

let swipeStart;
boardElement.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    swipeStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
boardElement.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
boardElement.addEventListener('touchend', event => {
    if (!swipeStart) return;
    const distanceX = event.changedTouches[0].clientX - swipeStart.x;
    const distanceY = event.changedTouches[0].clientY - swipeStart.y;
    swipeStart = null;
    if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) < 30) return;
    move(Math.abs(distanceX) > Math.abs(distanceY)
        ? (distanceX > 0 ? 'right' : 'left')
        : (distanceY > 0 ? 'down' : 'up'));
}, { passive: true });
boardElement.addEventListener('touchcancel', () => { swipeStart = null; });
document.getElementById('new-game').addEventListener('click', startGame);
startGame();
