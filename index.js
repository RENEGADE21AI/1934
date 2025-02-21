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
  player.bullets.forEach((bullet, bIndex) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) player.bullets.splice(bIndex, 1);
    
    enemies.forEach((enemy, eIndex) => {
      if (checkCollision(bullet, enemy)) {
        enemy.health--;
        player.bullets.splice(bIndex, 1);
        if (enemy.health <= 0) enemies.splice(eIndex, 1);
      }
    });
  });

  // Spawn enemy waves
  if (enemySpawnTimer % 80 === 0) {
    let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    enemies.push({ x: Math.random() * (canvas.width - type.width), y: -type.height, ...type, health: type.health || 1 });
  }
  enemySpawnTimer++;

  // Update enemies
  enemies.forEach((enemy, index) => {
    if (enemy.pattern === "straight") {
      enemy.y += enemy.speed;
    } else if (enemy.pattern === "zigzag") {
      enemy.y += enemy.speed;
      enemy.x += enemy.direction * 2;
      if (enemy.x < 0 || enemy.x > canvas.width - enemy.width) enemy.direction *= -1;
    } else if (enemy.pattern === "dive") {
      if (enemy.y > canvas.height / 2) {
        enemy.x += (player.x - enemy.x) * 0.02;
      }
      enemy.y += enemy.speed;
    } else if (enemy.pattern === "follow") {
      enemy.x += (player.x - enemy.x) * 0.02;
      enemy.y += enemy.speed;
    }

    // Collision with player
    if (checkCollision(enemy, player)) {
      player.health--;
      enemies.splice(index, 1);
    }

    // Avoid enemy overlap
    enemies.forEach((otherEnemy) => {
      if (enemy !== otherEnemy && checkCollision(enemy, otherEnemy)) {
        enemy.x += enemy.speed;
      }
    });
  });

  // Enemy shooting
  enemies.forEach((enemy) => {
    if (Math.random() < enemy.shootChance) {
      enemyBullets.push({ x: enemy.x + enemy.width / 2 - 2.5, y: enemy.y + enemy.height, width: 5, height: 10, speed: 5 });
    }
  });

  // Update enemy bullets & check for collision with player
  enemyBullets.forEach((bullet, bIndex) => {
    bullet.y += bullet.speed;
    if (bullet.y > canvas.height) enemyBullets.splice(bIndex, 1);
    if (checkCollision(bullet, player)) {
      player.health--;
      enemyBullets.splice(bIndex, 1);
    }
  });
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
