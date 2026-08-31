const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset");
const exitButton = document.getElementById("exit");

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

cells.forEach(function(cell) {
    cell.addEventListener("click", function() {

        const index = parseInt(cell.dataset.index);

        if (gameOver || board[index] !== "") {
            return;
        }

        board[index] = currentPlayer;
        cell.textContent = currentPlayer;

        const winner = checkWinner();

        if (winner) {
            gameOver = true;
            statusText.textContent = "Player " + currentPlayer + " wins!";

            winner.forEach(function(position) {
                cells[position].classList.add("winner");
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

        statusText.textContent = "Player " + currentPlayer + "'s turn";
    });
});


function checkWinner() {

    for (let i = 0; i < winningCombinations.length; i++) {

        const combination = winningCombinations[i];

        const a = combination[0];
        const b = combination[1];
        const c = combination[2];

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


resetButton.addEventListener("click", function() {

    board = ["", "", "", "", "", "", "", ""];

    currentPlayer = "X";
    gameOver = false;

    statusText.textContent = "Player X's turn";

    cells.forEach(function(cell) {
        cell.textContent = "";
        cell.classList.remove("winner");
    });
});


exitButton.addEventListener("click", function() {
    window.location.href = "../index.html";
});