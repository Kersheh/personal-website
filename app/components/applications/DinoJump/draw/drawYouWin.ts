import { DrawContext } from './types';

export const drawYouWin = ({ ctx, canvasWidth, canvasHeight }: DrawContext) => {
  ctx.fillStyle = '#535353';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('YOU WIN!', canvasWidth / 2, canvasHeight / 2 - 20);
  ctx.font = '14px monospace';
  ctx.fillText(
    'Press SPACE or click to play again',
    canvasWidth / 2,
    canvasHeight / 2 + 10
  );
};
