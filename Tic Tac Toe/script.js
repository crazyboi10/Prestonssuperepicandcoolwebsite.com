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


// When a square is clicked
cells.forEach(function(cell, index) {

    cell.addEventListener("click", function() {

        // Don't allow moves after the game is over
        if (gameOver) {
            return;
        }

        // Don't allow a square to be used twice
        if (board[index] !== "") {
            return;
        }

        // Put X or O into the board
        board[index] = currentPlayer;
        cell.textContent = currentPlayer;


        // Check for a winner
        const winner = checkWinner();

        if (winner !== null) {

            gameOver = true;

            statusText.textContent =
                "Player " + currentPlayer + " wins!";

            // Highlight the winning squares
            winner.forEach(function(position) {
                cells[position].classList.add("winner");
            });

            return;
        }


        // Check for a draw
        if (!board.includes("")) {

            gameOver = true;

            statusText.textContent = "It's a draw!";

            return;
        }


        // Change player
        if (currentPlayer === "X") {
            currentPlayer = "O";
        } else {
            currentPlayer = "X";
        }

        statusText.textContent =
            "Player " + currentPlayer + "'s turn";

    });

});


// Check if somebody won
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


// Reset button
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


// Exit button
exitButton.addEventListener("click", function() {

    window.location.href = "../index.html";

});