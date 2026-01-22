'use client';

import { useEffect, useRef } from 'react';

interface DinoJumpProps {
  height: number;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  variant: number;
}

interface DirtFleck {
  x: number;
  size: number;
  offset: number;
}

interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  variant: number;
}

interface GameState {
  dino: {
    y: number;
    velocity: number;
    isJumping: boolean;
    isHoldingJump: boolean;
    jumpHoldFrames: number;
  };
  game: {
    isRunning: boolean;
    isGameOver: boolean;
    isWon: boolean;
    score: number;
    highScore: number;
    frameCount: number;
  };
  obstacles: {
    list: Array<Obstacle>;
    nextIn: number;
  };
  difficulty: {
    speed: number;
  };
  environment: {
    dirt: Array<DirtFleck>;
    clouds: Array<Cloud>;
  };
}

const CANVAS_WIDTH = 800;
const GROUND_HEIGHT = 50;
const DINO_WIDTH = 44;
const DINO_HEIGHT = 47;
const DINO_X = 50;
const GRAVITY = 0.8;
const JUMP_VELOCITY = 12;
const JUMP_BOOST = 0.8;
const MAX_JUMP_HOLD_FRAMES = 8;
const JUMP_CUT_MULTIPLIER = 0.4;
const BASE_SPEED = 4;
const MIN_OBSTACLE_INTERVAL = 50;
const MAX_OBSTACLE_INTERVAL = 150;
const HIGH_SCORE_KEY = 'dino-jump-high-score';

const DinoJump = ({ height }: DinoJumpProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>({
    dino: {
      y: 0,
      velocity: 0,
      isJumping: false,
      isHoldingJump: false,
      jumpHoldFrames: 0
    },
    game: {
      isRunning: false,
      isGameOver: false,
      isWon: false,
      score: 0,
      highScore: 0,
      frameCount: 0
    },
    obstacles: {
      list: [],
      nextIn: 100
    },
    difficulty: {
      speed: BASE_SPEED
    },
    environment: {
      dirt: [],
      clouds: []
    }
  });
  const animationRef = useRef<number>(0);

  // load high score from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);

    if (saved) {
      gameStateRef.current.game.highScore = parseInt(saved, 10) || 0;
    }
  }, []);

  const canvasHeight = height - 60;
  const groundY = canvasHeight - GROUND_HEIGHT;

  const getRandomObstacleInterval = () =>
    MIN_OBSTACLE_INTERVAL +
    Math.floor(Math.random() * (MAX_OBSTACLE_INTERVAL - MIN_OBSTACLE_INTERVAL));

  const createObstacle = (): Obstacle => ({
    x: CANVAS_WIDTH,
    width: 8 + Math.floor(Math.random() * 8),
    height: 30 + Math.floor(Math.random() * 25),
    variant: Math.floor(Math.random() * 5)
  });

  const resetGame = () => {
    const state = gameStateRef.current;
    state.dino.y = 0;
    state.dino.velocity = 0;
    state.dino.isJumping = false;
    state.dino.isHoldingJump = false;
    state.dino.jumpHoldFrames = 0;
    state.game.isRunning = false;
    state.game.isGameOver = false;
    state.game.isWon = false;
    state.game.score = 0;
    state.game.frameCount = 0;
    state.obstacles.list = [];
    state.obstacles.nextIn = 100;
    state.difficulty.speed = BASE_SPEED;
    state.environment.dirt = [];
    state.environment.clouds = [];

    // spawn initial clouds
    for (let i = 0; i < 3; i++) {
      state.environment.clouds.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 30 + Math.floor(Math.random() * 80),
        width: 40 + Math.floor(Math.random() * 40),
        height: 15 + Math.floor(Math.random() * 10),
        variant: Math.floor(Math.random() * 4)
      });
    }
  };

  const startGame = () => {
    const state = gameStateRef.current;
    if (state.game.isGameOver || state.game.isWon) {
      resetGame();
    }
    state.game.isRunning = true;
  };

  const jump = () => {
    const state = gameStateRef.current;
    if (!state.dino.isJumping && !state.game.isGameOver) {
      if (!state.game.isRunning) {
        startGame();
      }
      state.dino.velocity = JUMP_VELOCITY;
      state.dino.isJumping = true;
      state.dino.isHoldingJump = true;
      state.dino.jumpHoldFrames = 0;
    }
  };

  const releaseJump = () => {
    const state = gameStateRef.current;
    if (state.dino.isHoldingJump && state.dino.velocity > 0) {
      state.dino.velocity *= JUMP_CUT_MULTIPLIER;
    }
    state.dino.isHoldingJump = false;
  };

  const handleInput = () => {
    const state = gameStateRef.current;
    if (state.game.isGameOver || state.game.isWon) {
      resetGame();
      startGame();
      jump();
    } else {
      jump();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const state = gameStateRef.current;

    const drawDino = () => {
      const dinoScreenY = groundY - DINO_HEIGHT - state.dino.y;

      ctx.fillStyle = '#535353';

      // tail
      ctx.fillRect(DINO_X - 48, dinoScreenY + 22, 6, 3);
      ctx.fillRect(DINO_X - 44, dinoScreenY + 20, 8, 4);
      ctx.fillRect(DINO_X - 38, dinoScreenY + 17, 10, 6);
      ctx.fillRect(DINO_X - 30, dinoScreenY + 15, 12, 8);
      ctx.fillRect(DINO_X - 20, dinoScreenY + 14, 14, 12);
      ctx.fillRect(DINO_X - 10, dinoScreenY + 12, 16, 16);

      // body
      ctx.fillRect(DINO_X - 4, dinoScreenY + 10, 24, 28);
      ctx.fillRect(DINO_X + 4, dinoScreenY + 6, 22, 32);
      ctx.fillRect(DINO_X + 14, dinoScreenY + 4, 16, 34);

      // neck
      ctx.fillRect(DINO_X + 22, dinoScreenY + 2, 14, 12);
      ctx.fillRect(DINO_X + 26, dinoScreenY - 6, 12, 14);
      ctx.fillRect(DINO_X + 30, dinoScreenY - 16, 10, 16);
      ctx.fillRect(DINO_X + 32, dinoScreenY - 26, 8, 14);

      // head
      ctx.fillRect(DINO_X + 30, dinoScreenY - 32, 16, 14);
      ctx.fillRect(DINO_X + 28, dinoScreenY - 30, 4, 10);
      ctx.fillRect(DINO_X + 44, dinoScreenY - 30, 4, 10);
      ctx.fillRect(DINO_X + 32, dinoScreenY - 34, 12, 4);

      // beak
      ctx.fillRect(DINO_X + 46, dinoScreenY - 28, 6, 6);
      ctx.fillRect(DINO_X + 50, dinoScreenY - 26, 4, 4);
      ctx.fillRect(DINO_X + 44, dinoScreenY - 22, 8, 4);
      ctx.fillRect(DINO_X + 46, dinoScreenY - 20, 6, 2);

      // eye
      ctx.fillStyle = '#fff';
      ctx.fillRect(DINO_X + 40, dinoScreenY - 30, 4, 4);

      ctx.fillStyle = '#535353';

      // legs with animation
      if (
        state.game.isRunning &&
        !state.dino.isJumping &&
        !state.game.isGameOver
      ) {
        const legPhase = Math.floor(state.game.score / 5) % 2;
        if (legPhase === 0) {
          // front legs
          ctx.fillRect(DINO_X + 22, dinoScreenY + 38, 6, 14);
          ctx.fillRect(DINO_X + 14, dinoScreenY + 38, 6, 10);
          // back legs
          ctx.fillRect(DINO_X - 6, dinoScreenY + 38, 6, 10);
          ctx.fillRect(DINO_X + 2, dinoScreenY + 38, 6, 14);
        } else {
          // front legs
          ctx.fillRect(DINO_X + 22, dinoScreenY + 38, 6, 10);
          ctx.fillRect(DINO_X + 14, dinoScreenY + 38, 6, 14);
          // back legs
          ctx.fillRect(DINO_X - 6, dinoScreenY + 38, 6, 14);
          ctx.fillRect(DINO_X + 2, dinoScreenY + 38, 6, 10);
        }
      } else {
        // front legs
        ctx.fillRect(DINO_X + 22, dinoScreenY + 38, 6, 14);
        ctx.fillRect(DINO_X + 14, dinoScreenY + 38, 6, 14);
        // back legs
        ctx.fillRect(DINO_X - 6, dinoScreenY + 38, 6, 14);
        ctx.fillRect(DINO_X + 2, dinoScreenY + 38, 6, 14);
      }
    };

    const drawObstacles = () => {
      ctx.fillStyle = '#535353';
      for (const obstacle of state.obstacles.list) {
        const obstacleY = groundY - obstacle.height;
        const w = obstacle.width;
        const h = obstacle.height;

        if (obstacle.variant === 0) {
          // single cactus with arms bending up
          ctx.fillRect(obstacle.x, obstacleY, w, h);
          ctx.fillRect(obstacle.x - 6, obstacleY + h * 0.4, 6, 4);
          ctx.fillRect(obstacle.x - 6, obstacleY + h * 0.15, 4, h * 0.25 + 4);
          ctx.fillRect(obstacle.x + w, obstacleY + h * 0.55, 6, 4);
          ctx.fillRect(
            obstacle.x + w + 2,
            obstacleY + h * 0.3,
            4,
            h * 0.25 + 4
          );
        } else if (obstacle.variant === 1) {
          // double cactus with arms
          ctx.fillRect(obstacle.x, obstacleY + 10, w, h - 10);
          ctx.fillRect(obstacle.x - 5, obstacleY + h * 0.5, 5, 4);
          ctx.fillRect(obstacle.x - 5, obstacleY + h * 0.3, 4, h * 0.2 + 4);
          ctx.fillRect(obstacle.x + w + 6, obstacleY, w, h);
          ctx.fillRect(obstacle.x + w * 2 + 6, obstacleY + h * 0.45, 5, 4);
          ctx.fillRect(
            obstacle.x + w * 2 + 7,
            obstacleY + h * 0.2,
            4,
            h * 0.25 + 4
          );
        } else if (obstacle.variant === 2) {
          // triple cactus cluster with arms
          ctx.fillRect(obstacle.x, obstacleY + 6, w - 2, h - 6);
          ctx.fillRect(obstacle.x - 4, obstacleY + h * 0.5, 4, 3);
          ctx.fillRect(obstacle.x - 4, obstacleY + h * 0.35, 3, h * 0.15 + 3);
          ctx.fillRect(obstacle.x + w + 3, obstacleY, w, h);
          ctx.fillRect(obstacle.x + w * 2 + 3, obstacleY + h * 0.4, 5, 4);
          ctx.fillRect(
            obstacle.x + w * 2 + 4,
            obstacleY + h * 0.15,
            4,
            h * 0.25 + 4
          );
          ctx.fillRect(obstacle.x + w * 2 + 10, obstacleY + 12, w - 2, h - 12);
          ctx.fillRect(obstacle.x + w * 3 + 10, obstacleY + h * 0.55, 4, 3);
          ctx.fillRect(
            obstacle.x + w * 3 + 10,
            obstacleY + h * 0.4,
            3,
            h * 0.15 + 3
          );
        } else if (obstacle.variant === 3) {
          // wide/stocky cactus with arms on both sides
          const wideW = w * 1.4;
          ctx.fillRect(obstacle.x, obstacleY, wideW, h);
          ctx.fillRect(obstacle.x - 7, obstacleY + h * 0.35, 7, 5);
          ctx.fillRect(obstacle.x - 7, obstacleY + h * 0.1, 5, h * 0.25 + 5);
          ctx.fillRect(obstacle.x + wideW, obstacleY + h * 0.5, 7, 5);
          ctx.fillRect(
            obstacle.x + wideW + 2,
            obstacleY + h * 0.25,
            5,
            h * 0.25 + 5
          );
          ctx.fillRect(obstacle.x - 4, obstacleY + h * 0.15, 4, 4);
        } else {
          // tall thin cactus with arms on opposite sides
          const thinW = w * 0.7;
          ctx.fillRect(obstacle.x, obstacleY - 5, thinW, h + 5);
          ctx.fillRect(obstacle.x - 6, obstacleY + h * 0.55, 6, 4);
          ctx.fillRect(obstacle.x - 6, obstacleY + h * 0.35, 4, h * 0.2 + 4);
          ctx.fillRect(obstacle.x + thinW, obstacleY + h * 0.25, 5, 4);
          ctx.fillRect(
            obstacle.x + thinW + 1,
            obstacleY + h * 0.05,
            4,
            h * 0.2 + 4
          );
        }
      }
    };

    const drawGround = () => {
      ctx.strokeStyle = '#535353';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(CANVAS_WIDTH, groundY);
      ctx.stroke();

      // draw dirt flecks
      ctx.fillStyle = '#a0a0a0';
      for (const dirt of state.environment.dirt) {
        ctx.fillRect(dirt.x, groundY + 5 + dirt.offset, dirt.size, dirt.size);
      }
    };

    const drawSun = () => {
      const sunX = CANVAS_WIDTH - 120;
      const sunY = 100;
      const r = 24;

      // heat rays emanating from sun
      ctx.fillStyle = '#c0c0c0';
      // top ray
      ctx.fillRect(sunX - 2, sunY - r - 18, 4, 12);
      ctx.fillRect(sunX - 1, sunY - r - 22, 2, 6);
      // bottom ray
      ctx.fillRect(sunX - 2, sunY + r + 6, 4, 12);
      ctx.fillRect(sunX - 1, sunY + r + 16, 2, 6);
      // left ray
      ctx.fillRect(sunX - r - 18, sunY - 2, 12, 4);
      ctx.fillRect(sunX - r - 22, sunY - 1, 6, 2);
      // right ray
      ctx.fillRect(sunX + r + 6, sunY - 2, 12, 4);
      ctx.fillRect(sunX + r + 16, sunY - 1, 6, 2);
      // diagonal rays (top-left)
      ctx.fillRect(sunX - r - 8, sunY - r - 8, 8, 3);
      ctx.fillRect(sunX - r - 8, sunY - r - 8, 3, 8);
      // diagonal rays (top-right)
      ctx.fillRect(sunX + r, sunY - r - 8, 8, 3);
      ctx.fillRect(sunX + r + 5, sunY - r - 8, 3, 8);
      // diagonal rays (bottom-left)
      ctx.fillRect(sunX - r - 8, sunY + r + 5, 8, 3);
      ctx.fillRect(sunX - r - 8, sunY + r, 3, 8);
      // diagonal rays (bottom-right)
      ctx.fillRect(sunX + r, sunY + r + 5, 8, 3);
      ctx.fillRect(sunX + r + 5, sunY + r, 3, 8);

      // outer glow ring
      ctx.fillStyle = '#d0d0d0';
      ctx.fillRect(sunX - r - 4, sunY - r + 6, r * 2 + 8, r * 2 - 12);
      ctx.fillRect(sunX - r + 6, sunY - r - 4, r * 2 - 12, r * 2 + 8);
      ctx.fillRect(sunX - r - 2, sunY - r + 2, r * 2 + 4, r * 2 - 4);
      ctx.fillRect(sunX - r + 2, sunY - r - 2, r * 2 - 4, r * 2 + 4);

      // main sun body (rounder circle approximation)
      ctx.fillStyle = '#a0a0a0';
      // core square
      ctx.fillRect(sunX - r + 4, sunY - r + 4, r * 2 - 8, r * 2 - 8);
      // extend edges for roundness
      ctx.fillRect(sunX - r + 2, sunY - r + 6, r * 2 - 4, r * 2 - 12);
      ctx.fillRect(sunX - r + 6, sunY - r + 2, r * 2 - 12, r * 2 - 4);
      ctx.fillRect(sunX - r, sunY - r + 10, r * 2, r * 2 - 20);
      ctx.fillRect(sunX - r + 10, sunY - r, r * 2 - 20, r * 2);
    };

    const drawClouds = () => {
      ctx.fillStyle = '#b0b0b0';
      for (const cloud of state.environment.clouds) {
        const { x, y, width, height, variant } = cloud;

        if (variant === 0) {
          // fluffy rounded cloud
          ctx.fillRect(x, y, width, height);
          ctx.fillRect(x + 10, y - 8, width * 0.6, height);
          ctx.fillRect(x - 8, y + 5, width * 0.4, height * 0.6);
          ctx.fillRect(x + width - 10, y - 4, width * 0.3, height * 0.8);
        } else if (variant === 1) {
          // elongated wispy cloud
          ctx.fillRect(x, y, width, height * 0.7);
          ctx.fillRect(x + width * 0.2, y - 4, width * 0.6, height * 0.8);
          ctx.fillRect(x + width * 0.5, y + 2, width * 0.4, height * 0.6);
        } else if (variant === 2) {
          // compact bumpy cloud
          ctx.fillRect(x, y, width * 0.7, height);
          ctx.fillRect(x + width * 0.3, y - 6, width * 0.5, height * 0.9);
          ctx.fillRect(x + width * 0.6, y - 3, width * 0.4, height * 0.8);
          ctx.fillRect(x + width * 0.2, y + 4, width * 0.3, height * 0.5);
        } else {
          // scattered puffy cloud
          ctx.fillRect(x, y + 3, width * 0.5, height * 0.7);
          ctx.fillRect(x + width * 0.35, y, width * 0.4, height);
          ctx.fillRect(x + width * 0.6, y + 2, width * 0.35, height * 0.8);
        }
      }
    };

    const drawScore = () => {
      ctx.fillStyle = '#535353';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(
        `HI ${state.game.highScore.toString().padStart(5, '0')}`,
        CANVAS_WIDTH - 100,
        30
      );
      ctx.fillText(
        state.game.score.toString().padStart(5, '0'),
        CANVAS_WIDTH - 20,
        30
      );
    };

    const drawStartScreen = () => {
      ctx.fillStyle = '#535353';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        'Press SPACE or click to start',
        CANVAS_WIDTH / 2,
        canvasHeight / 2
      );
    };

    const drawGameOver = () => {
      ctx.fillStyle = '#535353';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, canvasHeight / 2 - 20);
      ctx.font = '14px monospace';
      ctx.fillText(
        'Press SPACE or click to restart',
        CANVAS_WIDTH / 2,
        canvasHeight / 2 + 10
      );
    };

    const drawYouWin = () => {
      ctx.fillStyle = '#535353';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU WIN!', CANVAS_WIDTH / 2, canvasHeight / 2 - 20);
      ctx.font = '14px monospace';
      ctx.fillText(
        'Press SPACE or click to play again',
        CANVAS_WIDTH / 2,
        canvasHeight / 2 + 10
      );
    };

    const checkCollision = (): boolean => {
      const dinoLeft = DINO_X + 5;
      const dinoRight = DINO_X + DINO_WIDTH - 5;
      const dinoTop = state.dino.y + 10;
      const dinoBottom = state.dino.y;

      for (const obstacle of state.obstacles.list) {
        const obsLeft = obstacle.x + 3;
        const obsRight = obstacle.x + obstacle.width - 3;
        const obsTop = obstacle.height;

        if (
          dinoRight > obsLeft &&
          dinoLeft < obsRight &&
          dinoBottom < obsTop &&
          dinoTop > 0
        ) {
          return true;
        }
      }
      return false;
    };

    const update = () => {
      if (!state.game.isRunning || state.game.isGameOver) {
        return;
      }

      state.game.frameCount++;

      // physics
      if (state.dino.isJumping || state.dino.y > 0) {
        // apply boost while holding jump button (limited window)
        if (
          state.dino.isHoldingJump &&
          state.dino.jumpHoldFrames < MAX_JUMP_HOLD_FRAMES &&
          state.dino.velocity > 0
        ) {
          state.dino.velocity += JUMP_BOOST;
          state.dino.jumpHoldFrames++;
        }

        state.dino.velocity -= GRAVITY;
        state.dino.y += state.dino.velocity;

        if (state.dino.y <= 0) {
          state.dino.y = 0;
          state.dino.velocity = 0;
          state.dino.isJumping = false;
          state.dino.jumpHoldFrames = 0;
        }
      }

      // spawn obstacles
      state.obstacles.nextIn--;
      if (state.obstacles.nextIn <= 0) {
        state.obstacles.list.push(createObstacle());
        state.obstacles.nextIn = getRandomObstacleInterval();
      }

      // move obstacles and remove one off-screen per frame
      let removedObstacle = false;
      for (let i = 0; i < state.obstacles.list.length; i++) {
        state.obstacles.list[i].x -= state.difficulty.speed;
        if (
          !removedObstacle &&
          state.obstacles.list[i].x + state.obstacles.list[i].width < -10
        ) {
          state.obstacles.list.splice(i, 1);
          removedObstacle = true;
          i--;
        }
      }

      // spawn and move dirt flecks
      if (Math.random() < 0.1) {
        state.environment.dirt.push({
          x: CANVAS_WIDTH,
          size: 2 + Math.floor(Math.random() * 3),
          offset: Math.floor(Math.random() * 20)
        });
      }
      // move dirt and remove one off-screen per frame
      let removedDirt = false;
      for (let i = 0; i < state.environment.dirt.length; i++) {
        state.environment.dirt[i].x -= state.difficulty.speed;
        if (!removedDirt && state.environment.dirt[i].x < -10) {
          state.environment.dirt.splice(i, 1);
          removedDirt = true;
          i--;
        }
      }

      // spawn and move clouds
      if (Math.random() < 0.008) {
        state.environment.clouds.push({
          x: CANVAS_WIDTH,
          y: 30 + Math.floor(Math.random() * 80),
          width: 40 + Math.floor(Math.random() * 40),
          height: 15 + Math.floor(Math.random() * 10),
          variant: Math.floor(Math.random() * 4)
        });
      }
      // move clouds and remove one off-screen per frame
      let removedCloud = false;
      for (let i = 0; i < state.environment.clouds.length; i++) {
        state.environment.clouds[i].x -= state.difficulty.speed * 0.3;
        if (!removedCloud && state.environment.clouds[i].x < -100) {
          state.environment.clouds.splice(i, 1);
          removedCloud = true;
          i--;
        }
      }

      // collision detection
      if (checkCollision()) {
        state.game.isGameOver = true;
        state.game.isRunning = false;
        if (state.game.score > state.game.highScore) {
          state.game.highScore = state.game.score;
          localStorage.setItem(HIGH_SCORE_KEY, state.game.highScore.toString());
        }
        return;
      }

      // score and difficulty
      state.game.score++;

      // win condition
      if (state.game.score >= 99999) {
        state.game.score = 99999;
        state.game.isWon = true;
        state.game.isRunning = false;
        if (state.game.score > state.game.highScore) {
          state.game.highScore = state.game.score;
          localStorage.setItem(HIGH_SCORE_KEY, state.game.highScore.toString());
        }
        return;
      }

      if (state.game.score % 150 === 0 && state.difficulty.speed < 12) {
        state.difficulty.speed += 0.3;
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, canvasHeight);

      drawSun();
      drawClouds();
      drawGround();
      drawDino();
      drawObstacles();
      drawScore();

      if (state.game.isWon) {
        drawYouWin();
      } else if (state.game.isGameOver) {
        drawGameOver();
      } else if (!state.game.isRunning) {
        drawStartScreen();
      }
    };

    const gameLoop = () => {
      update();
      render();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [canvasHeight, groundY]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        const state = gameStateRef.current;
        if (state.game.isGameOver || state.game.isWon) {
          // Reset and start
          state.dino.y = 0;
          state.dino.velocity = 0;
          state.dino.isJumping = false;
          state.dino.isHoldingJump = false;
          state.dino.jumpHoldFrames = 0;
          state.game.isRunning = false;
          state.game.isGameOver = false;
          state.game.isWon = false;
          state.game.score = 0;
          state.game.frameCount = 0;
          state.obstacles.list = [];
          state.obstacles.nextIn = 100;
          state.difficulty.speed = BASE_SPEED;
          state.game.isRunning = true;
          state.dino.velocity = JUMP_VELOCITY;
          state.dino.isJumping = true;
          state.dino.isHoldingJump = true;
          state.dino.jumpHoldFrames = 0;
        } else if (!state.dino.isJumping) {
          if (!state.game.isRunning) {
            state.game.isRunning = true;
          }
          state.dino.velocity = JUMP_VELOCITY;
          state.dino.isJumping = true;
          state.dino.isHoldingJump = true;
          state.dino.jumpHoldFrames = 0;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        releaseJump();
      }
    };

    const handleResetHighScore = () => {
      localStorage.removeItem(HIGH_SCORE_KEY);
      gameStateRef.current.game.highScore = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('dinoJump:resetHighScore', handleResetHighScore);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener(
        'dinoJump:resetHighScore',
        handleResetHighScore
      );
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={canvasHeight}
        onMouseDown={handleInput}
        onMouseUp={releaseJump}
        onMouseLeave={releaseJump}
        onTouchStart={handleInput}
        onTouchEnd={releaseJump}
        className="border border-gray-200 cursor-pointer"
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
};

export default DinoJump;
