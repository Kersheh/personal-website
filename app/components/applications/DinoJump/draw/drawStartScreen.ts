import { DrawContext } from './types';

export const drawStartScreen = ({
  ctx,
  canvasWidth,
  canvasHeight
}: DrawContext) => {
  ctx.fillStyle = '#535353';
  ctx.font = '16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Press SPACE or click to start',
    canvasWidth / 2,
    canvasHeight / 2
  );
};
