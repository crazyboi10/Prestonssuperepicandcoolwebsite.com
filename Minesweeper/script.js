// ========================================
// GAME SETTINGS
// ========================================

const rows = 9;

const columns = 9;

const totalMines = 10;


// ========================================
// HTML ELEMENTS
// ========================================

const boardElement =
    document.getElementById("board");

const mineCounter =
    document.getElementById("mineCounter");

const timerElement =
    document.getElementById("timer");

const restartButton =
    document.getElementById("restart");

const exitButton =
    document.getElementById("Exit");

const messageElement =
    document.getElementById("message");

const cheatButton =
    document.getElementById("cheatButton");


// ========================================
// GAME VARIABLES
// ========================================

let board;

let mines;

let gameOver;

let flags;

let revealedCells;

let timer;

let time;


// ========================================
// START GAME
// ========================================

function startGame() {

    // Reset everything
    board = [];

    mines = [];

    gameOver = false;

    flags = 0;

    revealedCells = 0;

    time = 0;


    clearInterval(timer);


    timerElement.textContent = "0";

    mineCounter.textContent = totalMines;

    messageElement.textContent = "";

    restartButton.textContent = "🙂";


    // Create board
    createBoard();


    // Put mines on board
    placeMines();


    // Calculate numbers
    calculateNumbers();


    // Draw board
    drawBoard();


    // Start timer
    timer = setInterval(function () {

        if (!gameOver) {

            time++;

            timerElement.textContent = time;
        }

    }, 1000);
}


// ========================================
// CREATE BOARD
// ========================================

function createBoard() {

    for (let row = 0; row < rows; row++) {

        board[row] = [];

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            board[row][column] = {

                mine: false,

                revealed: false,

                flagged: false,

                hinted: false,

                number: 0
            };
        }
    }
}


// ========================================
// PLACE MINES
// ========================================

function placeMines() {

    let placedMines = 0;


    while (placedMines < totalMines) {

        const row =
            Math.floor(Math.random() * rows);

        const column =
            Math.floor(Math.random() * columns);


        if (!board[row][column].mine) {

            board[row][column].mine = true;

            mines.push({
                row: row,
                column: column
            });

            placedMines++;
        }
    }
}


// ========================================
// CALCULATE NUMBERS
// ========================================

function calculateNumbers() {

    for (let row = 0; row < rows; row++) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            if (board[row][column].mine) {
                continue;
            }


            let mineCount = 0;


            // Check every neighboring cell
            for (
                let rowOffset = -1;
                rowOffset <= 1;
                rowOffset++
            ) {

                for (
                    let columnOffset = -1;
                    columnOffset <= 1;
                    columnOffset++
                ) {

                    if (
                        rowOffset === 0 &&
                        columnOffset === 0
                    ) {
                        continue;
                    }


                    const neighborRow =
                        row + rowOffset;

                    const neighborColumn =
                        column + columnOffset;


                    // Make sure neighbor is inside board
                    if (
                        neighborRow >= 0 &&
                        neighborRow < rows &&
                        neighborColumn >= 0 &&
                        neighborColumn < columns
                    ) {

                        if (
                            board[
                                neighborRow
                            ][
                                neighborColumn
                            ].mine
                        ) {

                            mineCount++;
                        }
                    }
                }
            }


            board[row][column].number =
                mineCount;
        }
    }
}


// ========================================
// DRAW BOARD
// ========================================

function drawBoard() {

    boardElement.innerHTML = "";


    for (let row = 0; row < rows; row++) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const cell =
                document.createElement("div");


            cell.classList.add("cell");


            const currentCell =
                board[row][column];


            if (currentCell.hinted) {
                cell.classList.add("hinted");
            }


            // ====================================
            // REVEALED CELL
            // ====================================

            if (currentCell.revealed) {

                cell.classList.add("revealed");


                if (currentCell.mine) {

                    cell.classList.add("mine");

                    cell.textContent = "💣";

                }

                else if (currentCell.number > 0) {

                    cell.classList.add(
                        "number-" +
                        currentCell.number
                    );

                    cell.textContent =
                        currentCell.number;
                }
            }


            // ====================================
            // FLAGGED CELL
            // ====================================

            else if (currentCell.flagged) {

                cell.classList.add("flagged");

                cell.textContent = "🚩";
            }


            // ====================================
            // LEFT CLICK
            // ====================================

            cell.addEventListener(
                "click",
                function () {

                    revealCell(
                        row,
                        column
                    );

                }
            );


            // ====================================
            // RIGHT CLICK
            // ====================================

            cell.addEventListener(
                "contextmenu",
                function (event) {

                    event.preventDefault();


                    flagCell(
                        row,
                        column
                    );
                }
            );


            boardElement.appendChild(cell);
        }
    }
}


// ========================================
// REVEAL CELL
// ========================================

function revealCell(row, column) {

    if (gameOver) {
        return;
    }


    const cell =
        board[row][column];


    // Don't reveal flagged cells
    if (cell.flagged) {
        return;
    }


    // Don't reveal already revealed cells
    if (cell.revealed) {
        return;
    }


    // ====================================
    // HIT MINE
    // ====================================

    if (cell.mine) {

        cell.revealed = true;

        loseGame();

        return;
    }


    // ====================================
    // REVEAL CELL
    // ====================================

    cell.revealed = true;

    revealedCells++;


    // ====================================
    // EMPTY CELL
    // ====================================

    if (cell.number === 0) {

        revealNeighbors(
            row,
            column
        );
    }


    drawBoard();


    checkWin();
}


// ========================================
// REVEAL NEIGHBORS
// ========================================

function revealNeighbors(row, column) {

    for (
        let rowOffset = -1;
        rowOffset <= 1;
        rowOffset++
    ) {

        for (
            let columnOffset = -1;
            columnOffset <= 1;
            columnOffset++
        ) {

            if (
                rowOffset === 0 &&
                columnOffset === 0
            ) {
                continue;
            }


            const neighborRow =
                row + rowOffset;

            const neighborColumn =
                column + columnOffset;


            if (
                neighborRow < 0 ||
                neighborRow >= rows ||
                neighborColumn < 0 ||
                neighborColumn >= columns
            ) {
                continue;
            }


            const neighbor =
                board[
                    neighborRow
                ][
                    neighborColumn
                ];


            if (
                neighbor.revealed ||
                neighbor.flagged ||
                neighbor.mine
            ) {
                continue;
            }


            neighbor.revealed = true;

            revealedCells++;


            // Keep spreading through empty cells
            if (neighbor.number === 0) {

                revealNeighbors(
                    neighborRow,
                    neighborColumn
                );
            }
        }
    }
}


// ========================================
// FLAG CELL
// ========================================

function flagCell(row, column) {

    if (gameOver) {
        return;
    }


    const cell =
        board[row][column];


    // Can't flag revealed cells
    if (cell.revealed) {
        return;
    }


    // Add/remove flag
    if (cell.flagged) {

        cell.flagged = false;

        flags--;

    }

    else {

        // Don't allow more flags than mines
        if (flags >= totalMines) {
            return;
        }


        cell.flagged = true;

        flags++;
    }


    mineCounter.textContent =
        totalMines - flags;


    drawBoard();
}


// ========================================
// LOSE GAME
// ========================================

function loseGame() {

    gameOver = true;


    clearInterval(timer);


    // Reveal all mines
    for (let i = 0; i < mines.length; i++) {

        const mine = mines[i];


        board[
            mine.row
        ][
            mine.column
        ].revealed = true;
    }


    restartButton.textContent = "😵";

    messageElement.textContent =
        "💥 Game Over!";


    drawBoard();
}


// ========================================
// CHECK WIN
// ========================================

function checkWin() {

    const safeCells =
        rows * columns - totalMines;


    if (revealedCells >= safeCells) {

        winGame();
    }
}


// ========================================
// WIN GAME
// ========================================

function winGame() {

    gameOver = true;


    clearInterval(timer);


    // Automatically flag every mine
    for (let i = 0; i < mines.length; i++) {

        const mine = mines[i];


        board[
            mine.row
        ][
            mine.column
        ].flagged = true;
    }


    flags = totalMines;


    mineCounter.textContent = "0";


    restartButton.textContent = "😎";


    messageElement.textContent =
        "🎉 You Win!";


    drawBoard();
}


// ========================================
// BOARD HINT BUTTON
// ========================================

function hintMines() {

    if (gameOver) {
        return;
    }

    for (let i = 0; i < mines.length; i++) {

        const mine = mines[i];


        board[mine.row][mine.column].hinted = true;
    }


    drawBoard();
}


// ========================================
// RESTART BUTTON
// ========================================

restartButton.addEventListener(
    "click",
    startGame
);

exitButton.addEventListener(
    "click",
    function () {
        window.location.href = "../Main Page/index.html";
    }
);

cheatButton.addEventListener(
    "click",
    hintMines
);


// ========================================
// START THE GAME
// ========================================

startGame();