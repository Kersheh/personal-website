import { DrawContext } from './types';

export const drawScore = ({ ctx, state, canvasWidth }: DrawContext) => {
  ctx.fillStyle = '#535353';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(
    `HI ${state.game.highScore.toString().padStart(5, '0')}`,
    canvasWidth - 100,
    30
  );
  ctx.fillText(
    state.game.score.toString().padStart(5, '0'),
    canvasWidth - 20,
    30
  );
};
