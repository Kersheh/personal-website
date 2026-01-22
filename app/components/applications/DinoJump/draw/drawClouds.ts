import { DrawContext } from './types';

export const drawClouds = ({ ctx, state }: DrawContext) => {
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
