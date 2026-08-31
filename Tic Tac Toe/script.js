const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

const resetButton = document.getElementById("reset");
const exitButton = document.getElementById("exit");
const playAgainButton = document.getElementById("playAgain");

const game = document.getElementById("game");
const exitScreen = document.getElementById("exitScreen");

let board = ["", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameOver = false;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];

cells.forEach(cell => {
    cell.addEventListener("click", () => {
        const index = cell.dataset.index;

        if (gameOver || board[index] !== "") {
            return;
        }

        board[index] = currentPlayer;
        cell.textContent = currentPlayer;

        const winningCombination = checkWinner();

        if (winningCombination) {
            gameOver = true;

            statusText.textContent = `Player ${currentPlayer} wins!`;

            winningCombination.forEach(index => {
                cells[index].classList.add("winner");
            });

            return;
        }

        if (!board.includes("")) {
            gameOver = true;
            statusText.textContent = "It's a draw!";
            return;
        }

        if (currentPlayer === "X") {
            currentPlayer = "O";
        } else {
            currentPlayer = "X";
        }

        statusText.textContent = `Player ${currentPlayer}'s turn`;
    });
});

function checkWinner() {
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return combination;
        }
    }

    return null;
}

resetButton.addEventListener("click", resetGame);

function resetGame() {
    board = ["", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameOver = false;

    statusText.textContent = "Player X's turn";

    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("winner");
    });
}

exitButton.addEventListener("click", () => {
    window.location.href = "../index.html";
});

playAgainButton.addEventListener("click", () => {
    exitScreen.style.display = "none";
    game.style.display = "block";

    resetGame();
});