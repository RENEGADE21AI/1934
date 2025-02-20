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
  speed: 4,
  inertia: 0,
  bullets: [],
  powerUpActive: false,
  powerUpDuration: 0,
  health: 3,
  lives: 3,
  fireRate: 10,
  lastShot: 0,
  invincible: false,
  invincibleTimer: 0,
  bombCount: 3
};

const enemies = [];
const enemyBullets = [];
const powerUps = [];
const keys = {};
let enemySpawnTimer = 0;
let powerUpSpawnTimer = 0;
let difficulty = 1;

const enemyTypes = [
  { width: 50, height: 50, speed: 2, color: "green", shootChance: 0.01 },  // Basic enemy
  { width: 40, height: 40, speed: 3, color: "purple", shootChance: 0.02 }, // Faster enemy
  { width: 60, height: 60, speed: 1.5, color: "red", shootChance: 0.005, health: 3 },  // Tanky enemy
  { width: 50, height: 50, speed: 2.5, color: "orange", shootChance: 0.03, followsPlayer: true }, // Tracking enemy
  { width: 50, height: 50, speed: 3, color: "yellow", shootChance: 0.02, diveAttack: true } // Diving enemy
];

// Listen for key presses
document.addEventListener("keydown", (e) => { keys[e.code] = true; });
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

function update() {
  // Player movement with inertia
  player.inertia *= 0.9;
  if (keys["ArrowLeft"]) player.inertia -= 0.5;
  if (keys["ArrowRight"]) player.inertia += 0.5;
  player.x += player.inertia;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y < canvas.height - player.height) player.y += player.speed;

  // Use bomb
  if (keys["KeyB"] && player.bombCount > 0) {
    enemies.length = 0; // Clear all enemies
    enemyBullets.length = 0; // Clear enemy bullets
    player.bombCount--;
  }

  // Shooting bullets with fire rate limit
  if (keys["Space"] && player.lastShot >= player.fireRate) {
    player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
    if (player.powerUpActive) {
      player.bullets.push({ x: player.x + 10, y: player.y, width: 5, height: 10, speed: 7 });
      player.bullets.push({ x: player.x + player.width - 15, y: player.y, width: 5, height: 10, speed: 7 });
    }
    player.lastShot = 0;
  }
  player.lastShot++;

  // Update bullets
  player.bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) player.bullets.splice(index, 1);
  });

  // Spawn enemy waves
  if (enemySpawnTimer % (100 - difficulty) === 0) {
    let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push({ x: Math.random() * (canvas.width - type.width), y: -type.height, ...type, lifetime: 0, health: type.health || 1 });
  }
  enemySpawnTimer++;

  // Increase difficulty over time
  if (enemySpawnTimer % 1000 === 0) difficulty++;

  // Update enemies
  enemies.forEach((enemy, index) => {
    if (enemy.followsPlayer) {
      enemy.x += (player.x > enemy.x ? 1 : -1) * enemy.speed * 0.5;
    }
    if (enemy.diveAttack && enemy.lifetime > 50) {
      enemy.y += enemy.speed * 2;
    } else {
      enemy.y += enemy.speed;
    }
    enemy.lifetime++;
    if (enemy.y > canvas.height) enemies.splice(index, 1);
    if (enemy.lifetime > 100 && Math.random() < enemy.shootChance) {
      enemyBullets.push({ x: enemy.x + enemy.width / 2 - 2.5, y: enemy.y + enemy.height, width: 5, height: 10, speed: 4 });
    }
  });

  // Update enemy bullets
  enemyBullets.forEach((bullet, index) => {
    bullet.y += bullet.speed;
    if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
  });

  // Spawn power-ups
  if (powerUpSpawnTimer % 500 === 0) {
    powerUps.push({ x: Math.random() * (canvas.width - 30), y: -30, width: 30, height: 30, speed: 2 });
  }
  powerUpSpawnTimer++;

  // Update power-ups
  powerUps.forEach((powerUp, index) => {
    powerUp.y += powerUp.speed;
    if (powerUp.y > canvas.height) powerUps.splice(index, 1);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "white";
  ctx.fillText(`Health: ${player.health}  Lives: ${player.lives}  Bombs: ${player.bombCount}`, 10, 20);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
