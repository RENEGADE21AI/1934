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
const keys = {};
let enemySpawnTimer = 0;

const enemyTypes = [
  { width: 50, height: 50, speed: 2, color: "green", shootChance: 0.007 },
  { width: 40, height: 40, speed: 3, color: "purple", shootChance: 0.012 },
  { width: 60, height: 60, speed: 1.5, color: "red", shootChance: 0.004, health: 3 },
  { width: 50, height: 50, speed: 2.5, color: "orange", shootChance: 0.02, followsPlayer: true }
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

  // Shooting bullets
  if (keys["Space"] && player.lastShot >= player.fireRate) {
    player.bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y, width: 5, height: 10, speed: 7 });
    player.lastShot = 0;
  }
  player.lastShot++;

  // Update bullets
  player.bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) player.bullets.splice(index, 1);
  });

  // Spawn enemy waves
  if (enemySpawnTimer % 80 === 0) {
    let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push({ x: Math.random() * (canvas.width - type.width), y: -type.height, ...type, health: type.health || 1 });
  }
  enemySpawnTimer++;

  // Update enemies
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.followsPlayer) {
      enemy.x += (player.x - enemy.x) * 0.01;
    }
    if (enemy.y > canvas.height) enemies.splice(index, 1);
  });

  // Enemy shooting
  enemies.forEach((enemy) => {
    if (Math.random() < enemy.shootChance) {
      enemyBullets.push({ x: enemy.x + enemy.width / 2 - 2.5, y: enemy.y + enemy.height, width: 5, height: 10, speed: 5 });
    }
  });

  // Update enemy bullets
  enemyBullets.forEach((bullet, index) => {
    bullet.y += bullet.speed;
    if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw player
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw bullets
  ctx.fillStyle = "white";
  player.bullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height));

  // Draw enemies
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // Draw enemy bullets
  ctx.fillStyle = "red";
  enemyBullets.forEach(bullet => ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height));
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
