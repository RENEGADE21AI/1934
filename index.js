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
  bombCount: 3,
  powerUps: { weapon: "default", duration: 0 }
};

const enemies = [];
const enemyBullets = [];
const healthPacks = [];
const powerUps = [];
const keys = {};
let enemySpawnTimer = 0;
let gameOver = false;

const enemyTypes = [
  { width: 50, height: 50, speed: 2, color: "green", shootChance: 0.005, pattern: "straight", health: 1 },
  { width: 40, height: 40, speed: 3, color: "purple", shootChance: 0.008, pattern: "zigzag", direction: 1, health: 1 },
  { width: 60, height: 60, speed: 1.5, color: "red", shootChance: 0.003, pattern: "dive", health: 3 },
  { width: 50, height: 50, speed: 2.5, color: "orange", shootChance: 0.015, pattern: "follow", health: 2 },
  { width: 80, height: 80, speed: 1, color: "gray", shootChance: 0.02, pattern: "boss", health: 10 }
];

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

  player.inertia *= 0.9;
  if (keys["ArrowLeft"]) player.inertia -= 0.5;
  if (keys["ArrowRight"]) player.inertia += 0.5;
  player.x += player.inertia;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y < canvas.height - player.height) player.y += player.speed;

  if (keys["Space"] && player.lastShot >= player.fireRate) {
    player.bullets.push({ x: player.x + player.width / 2, y: player.y, radius: 5, speedY: -7 });
    player.lastShot = 0;
  }
  player.lastShot++;

  player.bullets.forEach((bullet, index) => {
    bullet.y += bullet.speedY;
    enemies.forEach((enemy, enemyIndex) => {
      if (checkCollision({ x: bullet.x - bullet.radius, y: bullet.y - bullet.radius, width: bullet.radius * 2, height: bullet.radius * 2 }, enemy)) {
        enemy.health--;
        player.bullets.splice(index, 1);
        if (enemy.health <= 0) {
          enemies.splice(enemyIndex, 1);
        }
      }
    });
  });

  enemySpawnTimer++;
  if (enemySpawnTimer % 150 === 0) {
    let typeIndex = Math.floor(Math.random() * enemyTypes.length);
    let type = enemyTypes[typeIndex];
    let waveSize = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < waveSize; i++) {
      enemies.push({ x: 50 + i * 150, y: -type.height, ...type, health: type.health || 1 });
    }
  }

  enemies.forEach((enemy) => {
    enemy.y += enemy.speed;
    if (Math.random() < enemy.shootChance) {
      let angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
      enemyBullets.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height, radius: 7, speedX: Math.cos(angle) * 2, speedY: Math.sin(angle) * 2, color: "red" });
    }
  });

  enemyBullets.forEach((bullet, index) => {
    bullet.x += bullet.speedX;
    bullet.y += bullet.speedY;
    if (checkCollision({ x: bullet.x - bullet.radius, y: bullet.y - bullet.radius, width: bullet.radius * 2, height: bullet.radius * 2 }, player)) {
      player.health -= 1;
      enemyBullets.splice(index, 1);
    }
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
    return;
  }

  ctx.fillStyle = "blue";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "red";
  enemies.forEach((enemy) => {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  ctx.fillStyle = "yellow";
  player.bullets.forEach((bullet) => {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  enemyBullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
