import { GameState } from '../types';

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  state: GameState;
  groundY: number;
  canvasHeight: number;
  canvasWidth: number;
  dinoHeight: number;
  dinoX: number;
}
