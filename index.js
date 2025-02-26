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
  health: 15,
  lives: 3,
  fireRate: 10,
  lastShot: 0,
  bombCount: 3
};

const enemies = [];
const enemyBullets = [];
const healthPacks = [];
const keys = {};
let enemySpawnTimer = 0;
let gameOver = false;

const enemyTypes = [
  { width: 50, height: 50, speed: 2, color: "green", shootChance: 0.007, pattern: "straight", health: 1 },
  { width: 40, height: 40, speed: 3, color: "purple", shootChance: 0.012, pattern: "zigzag", direction: 1, health: 1 },
  { width: 60, height: 60, speed: 1.5, color: "red", shootChance: 0.004, pattern: "dive", health: 3 },
  { width: 50, height: 50, speed: 2.5, color: "orange", shootChance: 0.02, pattern: "follow", health: 2 },
  { width: 80, height: 80, speed: 1, color: "gray", shootChance: 0.03, pattern: "boss", health: 10 }
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

  player.bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) player.bullets.splice(index, 1);
    
    enemies.forEach((enemy, enemyIndex) => {
      if (checkCollision(bullet, enemy)) {
        enemy.health -= 1;
        if (enemy.health <= 0) enemies.splice(enemyIndex, 1);
        player.bullets.splice(index, 1);
      }
    });
  });

  // Spawn enemies in varied waves
  if (enemySpawnTimer % 150 === 0) {
    let typeIndex = Math.floor(Math.random() * enemyTypes.length);
    let type = enemyTypes[typeIndex];
    let waveSize = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < waveSize; i++) {
      enemies.push({ x: 50 + i * 150, y: -type.height, ...type });
    }
  }
  enemySpawnTimer++;

  // Update enemies
  enemies.forEach((enemy, index) => {
    if (enemy.pattern === "zigzag") {
      enemy.x += enemy.direction * 2;
      if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) enemy.direction *= -1;
    }
    if (enemy.pattern === "follow") {
      if (enemy.x < player.x) enemy.x += 1;
      else if (enemy.x > player.x) enemy.x -= 1;
    }
    enemy.y += enemy.speed;
    
    if (checkCollision(enemy, player)) {
      player.health -= 2;
      enemies.splice(index, 1);
    }

    if (Math.random() < enemy.shootChance) {
      let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemyBullets.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height, speed: 4, angle: angle });
    }
  });

  enemyBullets.forEach((bullet, index) => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;
    if (bullet.y > canvas.height) enemyBullets.splice(index, 1);
    if (checkCollision(bullet, player)) {
      player.health -= 1;
      enemyBullets.splice(index, 1);
    }
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
