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

interface Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  flapPhase: number;
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
    birds: Array<Bird>;
  };
}

const CANVAS_WIDTH = 800;
const GROUND_HEIGHT = 50;
const DINO_HEIGHT = 72;
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
      clouds: [],
      birds: []
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
    state.environment.birds = [];

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
      // scale factor
      const s = 1.5;
      const ox = DINO_X - 45;
      const oy = dinoScreenY;

      ctx.fillStyle = '#535353';

      // tail (matches SVG exactly, scaled)
      ctx.fillRect(ox + 2 * s, oy + 38 * s, 4 * s, 2 * s);
      ctx.fillRect(ox + 5 * s, oy + 36 * s, 5 * s, 3 * s);
      ctx.fillRect(ox + 9 * s, oy + 34 * s, 6 * s, 4 * s);
      ctx.fillRect(ox + 14 * s, oy + 32 * s, 7 * s, 5 * s);
      ctx.fillRect(ox + 19 * s, oy + 30 * s, 8 * s, 7 * s);
      ctx.fillRect(ox + 25 * s, oy + 28 * s, 9 * s, 9 * s);

      // body
      ctx.fillRect(ox + 32 * s, oy + 26 * s, 12 * s, 14 * s);
      ctx.fillRect(ox + 36 * s, oy + 24 * s, 11 * s, 16 * s);
      ctx.fillRect(ox + 41 * s, oy + 22 * s, 8 * s, 18 * s);

      // neck
      ctx.fillRect(ox + 45 * s, oy + 20 * s, 7 * s, 8 * s);
      ctx.fillRect(ox + 47 * s, oy + 15 * s, 6 * s, 9 * s);
      ctx.fillRect(ox + 49 * s, oy + 9 * s, 5 * s, 10 * s);
      ctx.fillRect(ox + 50 * s, oy + 4 * s, 4 * s, 9 * s);

      // head
      ctx.fillRect(ox + 49 * s, oy + 2 * s, 8 * s, 7 * s);
      ctx.fillRect(ox + 48 * s, oy + 3 * s, 3 * s, 5 * s);
      ctx.fillRect(ox + 56 * s, oy + 3 * s, 3 * s, 5 * s);
      ctx.fillRect(ox + 51 * s, oy + 1 * s, 6 * s, 3 * s);

      // beak
      ctx.fillRect(ox + 57 * s, oy + 4 * s, 4 * s, 4 * s);
      ctx.fillRect(ox + 59 * s, oy + 5 * s, 3 * s, 3 * s);
      ctx.fillRect(ox + 56 * s, oy + 7 * s, 5 * s, 2 * s);

      // eye
      ctx.fillStyle = '#fff';
      ctx.fillRect(ox + 54 * s, oy + 3 * s, 2 * s, 2 * s);

      ctx.fillStyle = '#535353';

      // legs with animation
      if (
        state.game.isRunning &&
        !state.dino.isJumping &&
        !state.game.isGameOver
      ) {
        const legPhase = Math.floor(state.game.score / 5) % 2;
        if (legPhase === 0) {
          // front legs (alternating heights)
          ctx.fillRect(ox + 45 * s, oy + 40 * s, 3 * s, 10 * s);
          ctx.fillRect(ox + 40 * s, oy + 40 * s, 3 * s, 6 * s);
          // back legs
          ctx.fillRect(ox + 28 * s, oy + 40 * s, 3 * s, 6 * s);
          ctx.fillRect(ox + 33 * s, oy + 40 * s, 3 * s, 10 * s);
        } else {
          // front legs
          ctx.fillRect(ox + 45 * s, oy + 40 * s, 3 * s, 6 * s);
          ctx.fillRect(ox + 40 * s, oy + 40 * s, 3 * s, 10 * s);
          // back legs
          ctx.fillRect(ox + 28 * s, oy + 40 * s, 3 * s, 10 * s);
          ctx.fillRect(ox + 33 * s, oy + 40 * s, 3 * s, 6 * s);
        }
      } else {
        // front legs (static)
        ctx.fillRect(ox + 45 * s, oy + 40 * s, 3 * s, 8 * s);
        ctx.fillRect(ox + 40 * s, oy + 40 * s, 3 * s, 8 * s);
        // back legs
        ctx.fillRect(ox + 28 * s, oy + 40 * s, 3 * s, 8 * s);
        ctx.fillRect(ox + 33 * s, oy + 40 * s, 3 * s, 8 * s);
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

    const drawBirds = () => {
      ctx.fillStyle = '#535353';
      for (const bird of state.environment.birds) {
        const { x, y, width, height, flapPhase } = bird;

        // simpleshaped bird with connected silhouette
        if (flapPhase < 15) {
          // W shape (wings up)
          // left wing outer
          ctx.fillRect(x, y + height * 0.15, width * 0.18, height * 0.12);
          ctx.fillRect(
            x + width * 0.05,
            y + height * 0.05,
            width * 0.13,
            height * 0.15
          );
          // left wing connection to body
          ctx.fillRect(
            x + width * 0.15,
            y + height * 0.15,
            width * 0.18,
            height * 0.2
          );
          ctx.fillRect(
            x + width * 0.25,
            y + height * 0.25,
            width * 0.1,
            height * 0.15
          );
          // center body
          ctx.fillRect(
            x + width * 0.35,
            y + height * 0.3,
            width * 0.3,
            height * 0.25
          );
          ctx.fillRect(
            x + width * 0.4,
            y + height * 0.25,
            width * 0.2,
            height * 0.3
          );
          // right wing connection to body
          ctx.fillRect(
            x + width * 0.65,
            y + height * 0.25,
            width * 0.1,
            height * 0.15
          );
          ctx.fillRect(
            x + width * 0.67,
            y + height * 0.15,
            width * 0.18,
            height * 0.2
          );
          // right wing outer
          ctx.fillRect(
            x + width * 0.82,
            y + height * 0.05,
            width * 0.13,
            height * 0.15
          );
          ctx.fillRect(
            x + width * 0.82,
            y + height * 0.15,
            width * 0.18,
            height * 0.12
          );
        } else {
          // M shape (wings down)
          // left wing outer
          ctx.fillRect(x, y + height * 0.35, width * 0.18, height * 0.12);
          ctx.fillRect(
            x + width * 0.05,
            y + height * 0.42,
            width * 0.13,
            height * 0.13
          );
          // left wing connection to body
          ctx.fillRect(
            x + width * 0.15,
            y + height * 0.25,
            width * 0.18,
            height * 0.2
          );
          ctx.fillRect(
            x + width * 0.25,
            y + height * 0.2,
            width * 0.1,
            height * 0.15
          );
          // center body
          ctx.fillRect(
            x + width * 0.35,
            y + height * 0.15,
            width * 0.3,
            height * 0.25
          );
          ctx.fillRect(
            x + width * 0.4,
            y + height * 0.15,
            width * 0.2,
            height * 0.3
          );
          // right wing connection to body
          ctx.fillRect(
            x + width * 0.65,
            y + height * 0.2,
            width * 0.1,
            height * 0.15
          );
          ctx.fillRect(
            x + width * 0.67,
            y + height * 0.25,
            width * 0.18,
            height * 0.2
          );
          // right wing outer
          ctx.fillRect(
            x + width * 0.82,
            y + height * 0.42,
            width * 0.13,
            height * 0.13
          );
          ctx.fillRect(
            x + width * 0.82,
            y + height * 0.35,
            width * 0.18,
            height * 0.12
          );
        }
      }
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
      // hitbox covers the dino's body area (not tail or head)
      const dinoLeft = DINO_X - 3;
      const dinoRight = DINO_X + 25;
      const dinoTop = state.dino.y + 10;
      const dinoBottom = state.dino.y;

      // check cactus collisions
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

      // check bird collisions
      for (const bird of state.environment.birds) {
        const birdLeft = bird.x + 8;
        const birdRight = bird.x + bird.width - 8;
        const birdTop = bird.y + 5;
        const birdBottom = bird.y + bird.height - 5;

        // convert bird screen Y to dino coordinate system
        const birdTopHeight = groundY - birdBottom;
        const birdBottomHeight = groundY - birdTop;

        if (
          dinoRight > birdLeft &&
          dinoLeft < birdRight &&
          state.dino.y < birdBottomHeight &&
          state.dino.y + DINO_HEIGHT > birdTopHeight
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

      // spawn and move birds
      if (Math.random() < 0.004) {
        // check if there's a cactus in the spawn area
        const birdX = CANVAS_WIDTH;
        const birdY = 100 + Math.floor(Math.random() * 50);
        const birdGroundHeight = groundY - birdY;

        // check if any obstacle would be near this bird's position
        let canSpawn = true;
        for (const obstacle of state.obstacles.list) {
          const horizontalDistance = Math.abs(obstacle.x - birdX);
          // if obstacle is within 200px and bird would be at similar height
          if (
            horizontalDistance < 200 &&
            birdGroundHeight < obstacle.height + 20
          ) {
            canSpawn = false;
            break;
          }
        }

        if (canSpawn) {
          state.environment.birds.push({
            x: birdX,
            y: birdY,
            width: 20 + Math.floor(Math.random() * 10),
            height: 15 + Math.floor(Math.random() * 5),
            flapPhase: 0
          });
        }
      }
      // move birds and remove one off-screen per frame
      let removedBird = false;
      for (let i = 0; i < state.environment.birds.length; i++) {
        state.environment.birds[i].x -= state.difficulty.speed;
        state.environment.birds[i].flapPhase =
          (state.environment.birds[i].flapPhase + 1) % 30;
        if (
          !removedBird &&
          state.environment.birds[i].x + state.environment.birds[i].width < -10
        ) {
          state.environment.birds.splice(i, 1);
          removedBird = true;
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
      drawBirds();
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
          // reset and start
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
