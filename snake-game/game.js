(function () {
  const CELL = 10;
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const cols = canvas.width / CELL;
  const rows = canvas.height / CELL;

  const scoreEl = document.getElementById("score");
  const livesEl = document.getElementById("lives");
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlay-text");

  const COLOR_BG = "#9bbc0f";
  const COLOR_PIXEL = "#0f380f";

  const START_LIVES = 1000;

  const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  let snake, direction, nextDirection, food, score, lives, running, paused, tickMs, timer;

  function spawnSnake() {
    return [
      { x: Math.floor(cols / 2), y: Math.floor(rows / 2) },
      { x: Math.floor(cols / 2) - 1, y: Math.floor(rows / 2) },
      { x: Math.floor(cols / 2) - 2, y: Math.floor(rows / 2) },
    ];
  }

  function reset() {
    snake = spawnSnake();
    direction = DIRS.right;
    nextDirection = DIRS.right;
    score = 0;
    lives = START_LIVES;
    tickMs = 160;
    paused = false;
    food = placeFood();
    updateHud();
  }

  function placeFood() {
    let pos;
    do {
      pos = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows),
      };
    } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }

  function updateHud() {
    if (livesEl) {
      scoreEl.textContent = "Score: " + score;
      livesEl.textContent = "Lives: " + lives;
    } else {
      scoreEl.textContent = "Score: " + score + "  |  Lives: " + lives;
    }
  }

  function draw() {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = COLOR_PIXEL;
    snake.forEach((segment) => {
      ctx.fillRect(segment.x * CELL, segment.y * CELL, CELL - 1, CELL - 1);
    });

    ctx.fillRect(food.x * CELL, food.y * CELL, CELL - 1, CELL - 1);
  }

  function step() {
    direction = nextDirection;
    const head = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    const hitWall = head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows;
    if (hitWall) {
      loseLife("You hit the wall");
      return;
    }

    const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
    if (hitSelf) {
      loseLife("You ran into yourself");
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 1;
      updateHud();
      food = placeFood();
      if (tickMs > 70) {
        tickMs -= 4;
        restartTimer();
      }
    } else {
      snake.pop();
    }

    draw();
  }

  // A collision costs a life but the snake stays exactly where it was -
  // play continues from that spot instead of resetting to the start.
  function loseLife(reason) {
    lives -= 1;
    updateHud();

    if (lives <= 0) {
      gameOver(reason);
      return;
    }

    draw();
  }

  function restartTimer() {
    clearInterval(timer);
    timer = setInterval(step, tickMs);
  }

  function gameOver(reason) {
    running = false;
    paused = false;
    clearInterval(timer);
    overlayText.textContent =
      (reason ? reason + " - " : "") + "Game Over - Score: " + score + " - Press START";
    overlay.hidden = false;
  }

  function startGame() {
    reset();
    running = true;
    overlay.hidden = true;
    draw();
    restartTimer();
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    if (paused) {
      clearInterval(timer);
      overlayText.textContent = "Paused - Press SPACE to resume";
      overlay.hidden = false;
    } else {
      overlay.hidden = true;
      restartTimer();
    }
  }

  function setDirection(name) {
    const wanted = DIRS[name];
    const isOpposite =
      wanted.x === -direction.x && wanted.y === -direction.y;
    if (!isOpposite) {
      nextDirection = wanted;
    }
  }

  document.addEventListener("keydown", (e) => {
    const map = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    if (map[e.key]) {
      e.preventDefault();
      if (running && !paused) setDirection(map[e.key]);
    } else if (e.key === " ") {
      e.preventDefault();
      if (running) {
        togglePause();
      } else {
        startGame();
      }
    } else if (e.key === "Enter") {
      if (!running) startGame();
    }
  });

  document.getElementById("btn-up").addEventListener("click", () => running && !paused && setDirection("up"));
  document.getElementById("btn-down").addEventListener("click", () => running && !paused && setDirection("down"));
  document.getElementById("btn-left").addEventListener("click", () => running && !paused && setDirection("left"));
  document.getElementById("btn-right").addEventListener("click", () => running && !paused && setDirection("right"));
  document.getElementById("btn-start").addEventListener("click", () => {
    if (!running) startGame();
  });

  reset();
  draw();
})();
