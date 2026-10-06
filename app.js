// ແຜນທີ່ເຂົ້າວົງກົດ ຂະໜາດ 15x15 Grid (1 = Wall, 0 = Path)
const mazeLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const GRID_SIZE = 15;
const TILE_SIZE = 40;

// ຕຳແໜ່ງເລີ່ມຕົ້ນ (Grid)
let playerGridPos = { x: 1, y: 1 };
let ghostGridPos = { x: 13, y: 13 };

// ລະບົບຄະແນນ ແລະ ເກັບເມັດ
let score = 0;
let totalDots = 0;
let dotsGrid = [];

// ລະບົບຄວາມໄວຜີ ແລະ ເວລາ
let ghostSpeed = 500; // ເລີ່ມຕົ້ນ 0.5 ວິນາທີ
let ghostIntervalId = null;
let gameTimeSeconds = 0;
let gameTimerId = null;

const player = document.getElementById('player');
const ghost = document.getElementById('ghost');
const mazeContainer = document.getElementById('maze');
const scoreElement = document.getElementById('score');
const totalDotsElement = document.getElementById('total-dots');
const ghostSpeedText = document.getElementById('ghost-speed-text');

// ສ້າງແຜນທີ່ ແລະ ວາງເມັດດາວ
function createMaze() {
    mazeContainer.innerHTML = '';
    dotsGrid = JSON.parse(JSON.stringify(mazeLayout));
    totalDots = 0;
    score = 0;

    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const tile = document.createElement('div');
            tile.dataset.row = r;
            tile.dataset.col = c;

            if (mazeLayout[r][c] === 1) {
                tile.classList.add('wall');
            } else {
                tile.classList.add('path');
                // ບໍ່ວາງເມັດໃນຕຳແໜ່ງເລີ່ມຕົ້ນຂອງ Player ແລະ Ghost
                if ((r === 1 && c === 1) || (r === 13 && c === 13)) {
                    dotsGrid[r][c] = 0;
                } else {
                    dotsGrid[r][c] = 2; // 2 หมายถึง มีเม็ดดาว
                    totalDots++;
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    tile.appendChild(dot);
                }
            }
            mazeContainer.appendChild(tile);
        }
    }

    scoreElement.textContent = score;
    totalDotsElement.textContent = totalDots;
}

// ອັບເດດຕຳແໜ່ງພິກເຊວ
function updatePositions() {
    player.style.left = (playerGridPos.x * TILE_SIZE) + 'px';
    player.style.top = (playerGridPos.y * TILE_SIZE) + 'px';

    ghost.style.left = (ghostGridPos.x * TILE_SIZE) + 'px';
    ghost.style.top = (ghostGridPos.y * TILE_SIZE) + 'px';
}

function canMoveTo(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return false;
    return mazeLayout[y][x] === 0;
}

// ຂຍັບ Player ແລະ ເກັບເມັດດາວ
function movePlayer(dx, dy) {
    const newX = playerGridPos.x + dx;
    const newY = playerGridPos.y + dy;

    if (canMoveTo(newX, newY)) {
        playerGridPos.x = newX;
        playerGridPos.y = newY;
        updatePositions();

        // ເກັບເມັດ
        if (dotsGrid[newY][newX] === 2) {
            dotsGrid[newY][newX] = 0;
            score++;
            scoreElement.textContent = score;

            // ລົບ Element ເມັດດາວອອກ
            const tileIndex = newY * GRID_SIZE + newX;
            const tile = mazeContainer.children[tileIndex];
            const dot = tile.querySelector('.dot');
            if (dot) dot.remove();

            // ກວດສອບວ່າເກັບຄົບທຸກເມັດຫຼືຍັງ
            if (score === totalDots) {
                setTimeout(() => {
                    alert('🎉 ຍິນດີດ້ວຍ! ທ່ານເກັບເມັດໄດ້ຄົບທຸກເມັດ ແລະ ຊະນະເກມ!');
                    resetGame();
                }, 50);
            }
        }

        checkCollision();
    }
}

// AI ຜີຍ່າງຕາມ Player
function moveGhost() {
    let possibleMoves = [];
    const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
    ];

    directions.forEach(dir => {
        const nextX = ghostGridPos.x + dir.x;
        const nextY = ghostGridPos.y + dir.y;
        if (canMoveTo(nextX, nextY)) {
            const distance = Math.hypot(playerGridPos.x - nextX, playerGridPos.y - nextY);
            possibleMoves.push({ x: nextX, y: nextY, dist: distance });
        }
    });

    if (possibleMoves.length > 0) {
        possibleMoves.sort((a, b) => a.dist - b.dist);
        ghostGridPos.x = possibleMoves[0].x;
        ghostGridPos.y = possibleMoves[0].y;
        updatePositions();
        checkCollision();
    }
}

// ກວດສອບຜີຈັບ Player
function checkCollision() {
    if (playerGridPos.x === ghostGridPos.x && playerGridPos.y === ghostGridPos.y) {
        setTimeout(() => {
            alert('👻 ທ່ານຖືກຜີຈັບໄດ້ແລ້ວ! ເລີ່ມເກມໃຫມ່');
            resetGame();
        }, 50);
    }
}

// ລະບົບປ່ຽນຄວາມໄວຜີຕາມເວລາ
function startTimer() {
    gameTimeSeconds = 0;
    ghostSpeed = 500;
    updateGhostLoop();

    if (gameTimerId) clearInterval(gameTimerId);

    gameTimerId = setInterval(() => {
        gameTimeSeconds++;

        // ທຸກໆ 10 ວິນາທີ ຜີຈະໄວຂຶ້ນ
        if (gameTimeSeconds === 10) {
            ghostSpeed = 350;
            ghostSpeedText.textContent = 'ໄວຂຶ້ນ';
            ghostSpeedText.style.color = '#ff9900';
            updateGhostLoop();
        } else if (gameTimeSeconds === 20) {
            ghostSpeed = 220;
            ghostSpeedText.textContent = 'ໄວຫຼາຍ!';
            ghostSpeedText.style.color = '#ff0055';
            updateGhostLoop();
        } else if (gameTimeSeconds === 30) {
            ghostSpeed = 150;
            ghostSpeedText.textContent = 'ໄວສຸດໆ!! 🔥';
            ghostSpeedText.style.color = '#ff0000';
            updateGhostLoop();
        }
    }, 1000);
}

function updateGhostLoop() {
    if (ghostIntervalId) clearInterval(ghostIntervalId);
    ghostIntervalId = setInterval(moveGhost, ghostSpeed);
}

// ຣີເຊັດເກມ
function resetGame() {
    playerGridPos = { x: 1, y: 1 };
    ghostGridPos = { x: 13, y: 13 };
    ghostSpeedText.textContent = 'ປົກກະຕິ';
    ghostSpeedText.style.color = '#00ffcc';
    createMaze();
    updatePositions();
    startTimer();
}

// ລະບົບຄວບຄຸມ Keyboard
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer(1, 0);
            break;
    }
});

// ປຸ່ມຄວບຄຸມບົນໜ້າຈໍ
document.getElementById('btn-up').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('btn-down').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('btn-left').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('btn-right').addEventListener('click', () => movePlayer(1, 0));

// ເລີ່ມເກມ
resetGame();