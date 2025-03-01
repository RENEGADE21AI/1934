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

document.addEventListener("keydown", (e) => { keys[e.code] = true; });
document.addEventListener("keyup", (e) => { keys[e.code] = false; });

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect2.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function spawnEnemyWave() {
  let waveType = Math.floor(Math.random() * enemyTypes.length);
  let enemyGroupSize = Math.floor(Math.random() * 4) + 2; // Spawns 2-5 enemies per wave
  for (let i = 0; i < enemyGroupSize; i++) {
    let type = enemyTypes[waveType];
    let startX = (canvas.width / enemyGroupSize) * i + Math.random() * 20;
    enemies.push({ x: startX, y: -type.height, ...type });
  }
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
    player.bullets.push({ x: player.x + player.width / 2 - 3, y: player.y, width: 6, height: 15, speedY: -7, color: "yellow" });
    player.lastShot = 0;
  }
  player.lastShot++;

  player.bullets.forEach((bullet, index) => {
    bullet.y += bullet.speedY;
    if (bullet.y < 0) player.bullets.splice(index, 1);
  });

  if (enemySpawnTimer % 180 === 0) {
    spawnEnemyWave();
  }
  enemySpawnTimer++;

  enemies.forEach((enemy, enemyIndex) => {
    if (enemy.pattern === "zigzag") {
      enemy.x += enemy.direction * 2;
      if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) enemy.direction *= -1;
    }
    if (enemy.pattern === "follow") {
      if (enemy.x < player.x) enemy.x += 1;
      else if (enemy.x > player.x) enemy.x -= 1;
    }
    enemy.y += enemy.speed;
    
    if (Math.random() < enemy.shootChance) {
      enemyBullets.push({ x: enemy.x + enemy.width / 2 - 5, y: enemy.y + enemy.height, width: 10, height: 10, speedY: 3, color: "red" });
    }
    
    player.bullets.forEach((bullet, bulletIndex) => {
      if (checkCollision(bullet, enemy)) {
        enemy.health -= 1;
        player.bullets.splice(bulletIndex, 1);
        if (enemy.health <= 0) enemies.splice(enemyIndex, 1);
      }
    });
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

  player.bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  enemyBullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    bullet.y += bullet.speedY;
    if (checkCollision(bullet, player)) {
      player.health -= 1;
    }
  });

  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
