const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("gameOver");
const restartButton = document.getElementById("restart");


// ========================================
// GAME SETTINGS
// ========================================

const gridSize = 30;

const tileSize = canvas.width / gridSize;


// ========================================
// GAME VARIABLES
// ========================================

let snake;

let food;

let direction;

let nextDirection;

let score;

let gameRunning;

let gameLoop;

let speed;


// ========================================
// START GAME
// ========================================

function startGame() {

    snake = [
        {
            x: 15,
            y: 15
        },

        {
            x: 14,
            y: 15
        },

        {
            x: 13,
            y: 15
        }
    ];


    direction = {
        x: 1,
        y: 0
    };


    nextDirection = {
        x: 1,
        y: 0
    };


    score = 0;

    speed = 220;

    gameRunning = true;


    scoreElement.textContent = score;

    gameOverElement.textContent = "";


    placeFood();


    clearInterval(gameLoop);

    gameLoop = setInterval(
        updateGame,
        speed
    );


    draw();
}


// ========================================
// UPDATE GAME
// ========================================

function updateGame() {

    if (!gameRunning) {
        return;
    }


    direction = nextDirection;


    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };


    // ====================================
    // WALL COLLISION
    // ====================================

    if (
        head.x < 0 ||
        head.x >= gridSize ||
        head.y < 0 ||
        head.y >= gridSize
    ) {

        endGame();

        return;
    }


    // ====================================
    // SNAKE COLLISION
    // ====================================

    for (let i = 0; i < snake.length; i++) {

        if (
            head.x === snake[i].x &&
            head.y === snake[i].y
        ) {

            endGame();

            return;
        }
    }


    // Add the new head
    snake.unshift(head);


    // ====================================
    // FOOD
    // ====================================

    if (
        head.x === food.x &&
        head.y === food.y
    ) {

        score++;

        scoreElement.textContent = score;


        placeFood();


        // Make the snake faster
        if (speed > 45) {

            speed -= 3;


            clearInterval(gameLoop);

            gameLoop = setInterval(
                updateGame,
                speed
            );
        }

    } else {

        // Remove the tail
        snake.pop();
    }


    draw();
}


// ========================================
// DRAW GAME
// ========================================

function draw() {

    // Clear canvas
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ====================================
    // BACKGROUND
    // ====================================

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ====================================
    // GRID
    // ====================================

    ctx.strokeStyle = "#f1f3f4";

    ctx.lineWidth = 1;


    for (let x = 0; x <= gridSize; x++) {

        ctx.beginPath();

        ctx.moveTo(
            x * tileSize,
            0
        );

        ctx.lineTo(
            x * tileSize,
            canvas.height
        );

        ctx.stroke();
    }


    for (let y = 0; y <= gridSize; y++) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y * tileSize
        );

        ctx.lineTo(
            canvas.width,
            y * tileSize
        );

        ctx.stroke();
    }


    // ====================================
    // FOOD
    // ====================================

    drawFood();


    // ====================================
    // SNAKE
    // ====================================

    for (
        let i = snake.length - 1;
        i >= 0;
        i--
    ) {

        const part = snake[i];


        if (i === 0) {

            // Head
            ctx.fillStyle = "#34a853";

        } else {

            // Body
            ctx.fillStyle = "#0f9d58";
        }


        drawRoundedRect(
            part.x * tileSize + 2,
            part.y * tileSize + 2,
            tileSize - 4,
            tileSize - 4,
            5
        );
    }


    drawEyes();
}


// ========================================
// DRAW FOOD
// ========================================

function drawFood() {

    const centerX =
        food.x * tileSize +
        tileSize / 2;


    const centerY =
        food.y * tileSize +
        tileSize / 2;


    const radius =
        tileSize * 0.35;


    ctx.fillStyle = "#ea4335";


    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ========================================
// DRAW SNAKE EYES
// ========================================

function drawEyes() {

    const head = snake[0];


    const baseX =
        head.x * tileSize;


    const baseY =
        head.y * tileSize;


    let eye1X;
    let eye1Y;

    let eye2X;
    let eye2Y;


    // Facing right
    if (direction.x === 1) {

        eye1X = baseX + tileSize * 0.68;
        eye1Y = baseY + tileSize * 0.30;

        eye2X = baseX + tileSize * 0.68;
        eye2Y = baseY + tileSize * 0.70;
    }


    // Facing left
    else if (direction.x === -1) {

        eye1X = baseX + tileSize * 0.32;
        eye1Y = baseY + tileSize * 0.30;

        eye2X = baseX + tileSize * 0.32;
        eye2Y = baseY + tileSize * 0.70;
    }


    // Facing down
    else if (direction.y === 1) {

        eye1X = baseX + tileSize * 0.30;
        eye1Y = baseY + tileSize * 0.68;

        eye2X = baseX + tileSize * 0.70;
        eye2Y = baseY + tileSize * 0.68;
    }


    // Facing up
    else {

        eye1X = baseX + tileSize * 0.30;
        eye1Y = baseY + tileSize * 0.32;

        eye2X = baseX + tileSize * 0.70;
        eye2Y = baseY + tileSize * 0.32;
    }


    // White eyes
    ctx.fillStyle = "white";


    ctx.beginPath();

    ctx.arc(
        eye1X,
        eye1Y,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        eye2X,
        eye2Y,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Black pupils
    ctx.fillStyle = "black";


    ctx.beginPath();

    ctx.arc(
        eye1X,
        eye1Y,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        eye2X,
        eye2Y,
        1.5,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ========================================
// ROUNDED RECTANGLE
// ========================================

function drawRoundedRect(
    x,
    y,
    width,
    height,
    radius
) {

    ctx.beginPath();


    ctx.moveTo(
        x + radius,
        y
    );


    ctx.lineTo(
        x + width - radius,
        y
    );


    ctx.quadraticCurveTo(
        x + width,
        y,
        x + width,
        y + radius
    );


    ctx.lineTo(
        x + width,
        y + height - radius
    );


    ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
    );


    ctx.lineTo(
        x + radius,
        y + height
    );


    ctx.quadraticCurveTo(
        x,
        y + height,
        x,
        y + height - radius
    );


    ctx.lineTo(
        x,
        y + radius
    );


    ctx.quadraticCurveTo(
        x,
        y,
        x + radius,
        y
    );


    ctx.closePath();

    ctx.fill();
}


// ========================================
// PLACE FOOD
// ========================================

function placeFood() {

    let validPosition = false;


    while (!validPosition) {

        food = {
            x: Math.floor(
                Math.random() * gridSize
            ),

            y: Math.floor(
                Math.random() * gridSize
            )
        };


        validPosition = true;


        // Make sure food isn't inside snake
        for (let i = 0; i < snake.length; i++) {

            if (
                food.x === snake[i].x &&
                food.y === snake[i].y
            ) {

                validPosition = false;

                break;
            }
        }
    }
}


// ========================================
// GAME OVER
// ========================================

function endGame() {

    gameRunning = false;

    clearInterval(gameLoop);


    gameOverElement.textContent =
        "Game Over! Score: " + score;
}


// ========================================
// KEYBOARD CONTROLS
// ========================================

document.addEventListener(
    "keydown",
    function(event) {

        const key = event.key.toLowerCase();


        // UP
        if (
            key === "arrowup" ||
            key === "w"
        ) {

            if (direction.y !== 1) {

                nextDirection = {
                    x: 0,
                    y: -1
                };
            }

            event.preventDefault();
        }


        // DOWN
        else if (
            key === "arrowdown" ||
            key === "s"
        ) {

            if (direction.y !== -1) {

                nextDirection = {
                    x: 0,
                    y: 1
                };
            }

            event.preventDefault();
        }


        // LEFT
        else if (
            key === "arrowleft" ||
            key === "a"
        ) {

            if (direction.x !== 1) {

                nextDirection = {
                    x: -1,
                    y: 0
                };
            }

            event.preventDefault();
        }


        // RIGHT
        else if (
            key === "arrowright" ||
            key === "d"
        ) {

            if (direction.x !== -1) {

                nextDirection = {
                    x: 1,
                    y: 0
                };
            }

            event.preventDefault();
        }


        // SPACE TO RESTART
        else if (
            key === " " &&
            !gameRunning
        ) {

            startGame();
        }

    }
);


// ========================================
// RESTART BUTTON
// ========================================

restartButton.addEventListener(
    "click",
    startGame
);


// ========================================
// START
// ========================================

startGame();