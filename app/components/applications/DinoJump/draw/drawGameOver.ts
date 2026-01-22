import { DrawContext } from './types';

export const drawGameOver = ({
  ctx,
  canvasWidth,
  canvasHeight
}: DrawContext) => {
  ctx.fillStyle = '#535353';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', canvasWidth / 2, canvasHeight / 2 - 20);
  ctx.font = '14px monospace';
  ctx.fillText(
    'Press SPACE or click to restart',
    canvasWidth / 2,
    canvasHeight / 2 + 10
  );
};
