const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;

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

function checkCollisionCircleRect(circle, rect) {
  const distX = Math.abs(circle.x - rect.x - rect.width / 2);
  const distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX > (rect.width / 2 + circle.radius)) { return false; }
  if (distY > (rect.height / 2 + circle.radius)) { return false; }

  if (distX <= (rect.width / 2)) { return true; }
  if (distY <= (rect.height / 2)) { return true; }

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function spawnEnemyWave() {
  let waveType = Math.floor(Math.random() * enemyTypes.length);
  let enemyGroupSize = Math.floor(Math.random() * 4) + 2;
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

  if (keys["KeyB"] && player.bombCount > 0) {
    enemies.length = 0;
    enemyBullets.length = 0;
    player.bombCount--;
  }

  player.bullets = player.bullets.filter(bullet => bullet.y > 0);
  player.bullets.forEach(bullet => bullet.y += bullet.speedY);

  if (enemySpawnTimer % 180 === 0) {
    spawnEnemyWave();
  }
  enemySpawnTimer++;

  enemies.forEach((enemy, enemyIndex) => {
    switch (enemy.pattern) {
      case "zigzag":
        enemy.x += enemy.direction * 2;
        if (enemy.x <= 0 || enemy.x >= canvas.width - enemy.width) enemy.direction *= -1;
        break;
      case "follow":
        enemy.x += enemy.x < player.x ? 1 : -1;
        break;
      case "dive":
        enemy.y += enemy.speed * 1.5;
        enemy.x += Math.sin(enemy.y / 50) * 3;
        break;
      case "boss":
        enemy.x += Math.cos(enemy.y / 30) * 1.5;
        break;
    }
    enemy.y += enemy.speed;

    if (Math.random() < enemy.shootChance) {
      enemyBullets.push({ x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height, radius: 7, speedY: 3, color: "red" });
    }

    player.bullets.forEach((bullet, bulletIndex) => {
      if (checkCollision(bullet, enemy)) {
        enemy.health -= 1;
        player.bullets.splice(bulletIndex, 1);
        if (enemy.health <= 0) enemies.splice(enemyIndex, 1);
      }
    });
  });

  enemyBullets.forEach((bullet, index) => {
    bullet.y += bullet.speedY;
    if (checkCollisionCircleRect(bullet, player)) {
      player.health -= 1;
      enemyBullets.splice(index, 1);
    } else if (bullet.y > canvas.height) {
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

  player.bullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  enemyBullets.forEach(bullet => {
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Health: ${player.health}`, 10, 20);
  ctx.fillText(`Bombs: ${player.bombCount}`, 10, 50);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
gameLoop();
