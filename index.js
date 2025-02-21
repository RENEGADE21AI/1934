const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;

// Player object
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 50,
  speed: 5,
  inertia: 0,
  bullets: [],
  health: 5,
  lives: 3,
  fireRate: 10,
  lastShot: 0,
  invincible: false,
  invincibleTimer: 0,
  bombCount: 3
};

const enemies = [];
const enemyBullets = [];
const healthPacks = [];
const keys = {};
let enemySpawnTimer = 0;
let gameOver = false;

const enemyTypes = [
  { width: 50, height: 50, speed: 2, color: "green", shootChance: 0.007, pattern: "straight" },
  { width: 40, height: 40, speed: 3, color: "purple", shootChance: 0.012, pattern: "zigzag", direction: 1 },
  { width: 60, height: 60, speed: 1.5, color: "red", shootChance: 0.004, health: 3, pattern: "dive" },
  { width: 50, height: 50, speed: 2.5, color: "orange", shootChance: 0.02, pattern: "follow" }
];

// Listen for key presses
document.addEventListener("keydown", (e) => { keys[e.code] = true; });
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function update() {
  if (gameOver) return;
  
  if (player.health <= 0) {
    gameOver = true;
    return;
  }

  // Player movement
  player.inertia *= 0.9;
  if (keys["ArrowLeft"]) player.inertia -= 0.5;
  if (keys["ArrowRight"]) player.inertia += 0.5;
  player.x += player.inertia;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y < canvas.height - player.height) player.y += player.speed;

  // Shooting bullets
  if (keys["Space"] && player.lastShot >= player.fireRate) {
    player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
    player.lastShot = 0;
  }
  player.lastShot++;

  // Spawn enemies
  if (enemySpawnTimer % 80 === 0) {
    let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push({ x: Math.random() * (canvas.width - type.width), y: -type.height, ...type, health: type.health || 1 });
  }
  enemySpawnTimer++;

  // Update enemies and bullets
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    
    if (checkCollision(enemy, player)) {
      player.health--;
      enemies.splice(index, 1);
    }

    if (Math.random() < 0.05) {
      healthPacks.push({ x: enemy.x, y: enemy.y, width: 20, height: 20, speed: 2 });
    }
  });

  // Health packs
  healthPacks.forEach((pack, pIndex) => {
    pack.y += pack.speed;
    if (checkCollision(pack, player)) {
      player.health = Math.min(player.health + 1, 5);
      healthPacks.splice(pIndex, 1);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
    return;
  }

  // Draw player
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  
  // Draw health bar
  ctx.fillStyle = "black";
  ctx.fillRect(10, canvas.height - 30, 110, 20);
  ctx.fillStyle = "red";
  ctx.fillRect(10, canvas.height - 30, player.health * 20, 20);
  
  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // Draw health packs
  ctx.fillStyle = "green";
  healthPacks.forEach((pack) => {
    ctx.fillRect(pack.x, pack.y, pack.width, pack.height);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
