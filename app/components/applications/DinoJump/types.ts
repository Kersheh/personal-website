export interface Obstacle {
  x: number;
  width: number;
  height: number;
  variant: number;
}

export interface DirtFleck {
  x: number;
  size: number;
  offset: number;
}

export interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  variant: number;
}

export interface Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  flapPhase: number;
}

export interface GameState {
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
