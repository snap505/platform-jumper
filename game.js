const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player properties
const player = {
    x: 100,
    y: 500,
    width: 30,
    height: 30,
    speed: 5,
    dy: 0,
    jumpHeight: 0,
    grounded: false,
    canJump: true,
};

// Levels data
const levels = [
    // Levels 1-3: Regular jumpers
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 150, y: 450, width: 100, height: 20 },
            { x: 300, y: 350, width: 100, height: 20 },
            { x: 450, y: 250, width: 100, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
    },
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 100, y: 450, width: 100, height: 20 },
            { x: 250, y: 350, width: 100, height: 20 },
            { x: 400, y: 250, width: 100, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
    },
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 200, y: 450, width: 150, height: 20 },
            { x: 450, y: 350, width: 150, height: 20 },
            { x: 600, y: 250, width: 150, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
    },

    // Levels 4-6: Bigger platforms with kill tiles
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 100, y: 450, width: 200, height: 20 },
            { x: 350, y: 400, width: 150, height: 20 },
            { x: 600, y: 300, width: 200, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
        killTiles: [{ x: 100, y: 430, width: 50, height: 20 }],
    },
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 150, y: 450, width: 250, height: 20 },
            { x: 450, y: 350, width: 250, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
        killTiles: [{ x: 200, y: 430, width: 50, height: 20 }],
    },
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 250, y: 450, width: 300, height: 20 },
            { x: 550, y: 350, width: 200, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
        killTiles: [{ x: 250, y: 430, width: 50, height: 20 }],
    },

    // Levels 7-9: Moving platforms
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 150, y: 450, width: 200, height: 20, move: true },
            { x: 350, y: 400, width: 100, height: 20 },
            { x: 600, y: 300, width: 200, height: 20, move: true },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
        killTiles: [],
    },
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 250, y: 450, width: 300, height: 20, move: true },
            { x: 450, y: 350, width: 200, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
        killTiles: [],
    },
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 200, y: 450, width: 250, height: 20, move: true },
            { x: 450, y: 350, width: 250, height: 20 },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
        killTiles: [],
    },

    // Level 10: Both features combined
    {
        platforms: [
            { x: 0, y: 550, width: 800, height: 20 },
            { x: 100, y: 450, width: 300, height: 20, move: true },
            { x: 400, y: 350, width: 150, height: 20 },
            { x: 600, y: 250, width: 200, height: 20, move: true },
        ],
        finishArea: { x: 700, y: 120, width: 50, height: 30 },
        killTiles: [{ x: 200, y: 430, width: 50, height: 20 }],
    },
];

let currentLevel = 0;
let lastJumpTime = 0;
let gameRunning = true;

// Input handling
const keys = {
    right: false,
    left: false,
    jump: false,
};

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    ctx.fillStyle = 'green';
    levels[currentLevel].platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawFinishArea() {
    ctx.fillStyle = 'red';
    const finish = levels[currentLevel].finishArea;
    ctx.fillRect(finish.x, finish.y, finish.width, finish.height);
}

function drawKillTiles() {
    ctx.fillStyle = 'orange';
    const killTiles = levels[currentLevel].killTiles || [];
    killTiles.forEach(tile => {
        ctx.fillRect(tile.x, tile.y, tile.width, tile.height);
    });
}

function updatePlatforms() {
    const platforms = levels[currentLevel].platforms;
    platforms.forEach(platform => {
        if (platform.move) {
            platform.x += platform.direction || 1;
            if (platform.x > canvas.width - platform.width || platform.x < 0) {
                platform.direction = -platform.direction || -1;
            }
        }
    });
}

function update() {
    if (!gameRunning) return;

    // Horizontal movement
    if (keys.right) player.x += player.speed;
    if (keys.left) player.x -= player.speed;

    // Gravity
    player.dy += 0.5;
    player.y += player.dy;

    // Collision detection with platforms
    player.grounded = false;
    levels[currentLevel].platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height < platform.y + platform.height &&
            player.y + player.height + player.dy >= platform.y) {
            player.y = platform.y - player.height;
            player.dy = 0;
            player.grounded = true;
        }
    });

    // Check for kill tiles
    const killTiles = levels[currentLevel].killTiles || [];
    killTiles.forEach(tile => {
        if (player.x < tile.x + tile.width &&
            player.x + player.width > tile.x &&
            player.y < tile.y + tile.height &&
            player.y + player.height > tile.y) {
            alert("You hit a kill tile! Press 'R' to retry.");
            resetGame();
        }
    });

    // Jumping
    if (keys.jump && player.canJump && (Date.now() - lastJumpTime > 1000)) {
        player.dy = -4/5 * (levels[currentLevel].platforms[0].height);
        player.canJump = false;
        lastJumpTime = Date.now();
    }

    if (!keys.jump) player.canJump = true;

    // Check collision with finish area
    const finish = levels[currentLevel].finishArea;
    if (player.x < finish.x + finish.width &&
        player.x + player.width > finish.x &&
        player.y < finish.y + finish.height &&
        player.y + player.height > finish.y) {
        alert(`Level ${currentLevel + 1} Complete! Teleporting to the next level...`);
        currentLevel++;
        resetGame();
    }

    // Check for out of bounds
    if (player.y > canvas.height) {
        resetGame();
    }

    // Update moving platforms
    updatePlatforms();

    // Draw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawFinishArea();
    drawKillTiles();
    drawPlayer();

    requestAnimationFrame(update);
}

function resetGame() {
    player.x = 100;
    player.y = 500;
    player.dy = 0;
    player.canJump = true;

    // Check if there are more levels
    if (currentLevel >= levels.length) {
        alert("You've completed all levels!");
        currentLevel = 0; // Reset to the first level or end the game
    }
}

function keyDown(e) {
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === ' ') keys.jump = true;
    if (e.key === 'r') resetGame(); // Retry on 'R'
}

function keyUp(e) {
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === ' ') keys.jump = false;
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

update();
