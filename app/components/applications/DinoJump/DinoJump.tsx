'use client';

import { useEffect, useRef } from 'react';
import { GameState, Obstacle } from './types';
import {
  drawDino,
  drawObstacles,
  drawGround,
  drawSun,
  drawBirds,
  drawClouds,
  drawScore,
  drawStartScreen,
  drawGameOver,
  drawYouWin
} from './draw';

interface DinoJumpProps {
  height: number;
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
  const animationRef = useRef<number>(0);
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
        const birdLeft = bird.x + 12;
        const birdRight = bird.x + bird.width - 12;
        const birdTop = bird.y + 8;
        const birdBottom = bird.y + bird.height - 8;

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
        // spawn birds 90-210 pixels above ground (some reachable, some aesthetic)
        const birdGroundHeight = 90 + Math.floor(Math.random() * 120);
        const birdY = groundY - birdGroundHeight;

        // prevent birds from spawning near cacti to ensure they're dodgeable
        let canSpawn = true;
        for (const obstacle of state.obstacles.list) {
          // check if any cactus is within 550px of right edge or approaching
          // this gives enough spacing for player to react to both obstacles
          if (
            obstacle.x > CANVAS_WIDTH - 550 &&
            obstacle.x < CANVAS_WIDTH + 100
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

      const drawContext = {
        ctx,
        state,
        groundY,
        canvasHeight,
        canvasWidth: CANVAS_WIDTH,
        dinoHeight: DINO_HEIGHT,
        dinoX: DINO_X
      };

      drawSun(drawContext);
      drawClouds(drawContext);
      drawGround(drawContext);
      drawDino(drawContext);
      drawObstacles(drawContext);
      drawBirds(drawContext);
      drawScore(drawContext);

      if (state.game.isWon) {
        drawYouWin(drawContext);
      } else if (state.game.isGameOver) {
        drawGameOver(drawContext);
      } else if (!state.game.isRunning) {
        drawStartScreen(drawContext);
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
        className="border border-gray-200 cursor-pointer select-none touch-none [-webkit-touch-callout:none]"
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
};

export default DinoJump;
