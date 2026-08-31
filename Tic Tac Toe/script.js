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


// -------------------------
// SQUARE CLICKING
// -------------------------

for (let i = 0; i < cells.length; i++) {

    cells[i].addEventListener("click", function () {

        if (gameOver) {
            return;
        }

        if (board[i] !== "") {
            return;
        }

        board[i] = currentPlayer;

        cells[i].textContent = currentPlayer;

        if (checkWinner()) {

            gameOver = true;

            statusText.textContent =
                "Player " + currentPlayer + " wins!";

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

        statusText.textContent =
            "Player " + currentPlayer + "'s turn";
    });
}


// -------------------------
// CHECK WINNER
// -------------------------

function checkWinner() {

    for (let i = 0; i < winningCombinations.length; i++) {

        let combination = winningCombinations[i];

        let a = combination[0];
        let b = combination[1];
        let c = combination[2];

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return true;
        }
    }

    return false;
}


// -------------------------
// RESET
// -------------------------

resetButton.addEventListener("click", function () {

    board = ["", "", "", "", "", "", "", ""];

    currentPlayer = "X";

    gameOver = false;

    statusText.textContent = "Player X's turn";

    for (let i = 0; i < cells.length; i++) {

        cells[i].textContent = "";

        cells[i].classList.remove("winner");
    }
});


// -------------------------
// EXIT
// -------------------------

exitButton.addEventListener("click", function () {

    window.location.href = "../index.html";

});