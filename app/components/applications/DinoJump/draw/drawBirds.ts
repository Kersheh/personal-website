import { DrawContext } from './types';

export const drawBirds = ({ ctx, state }: DrawContext) => {
  ctx.fillStyle = '#535353';
  for (const bird of state.environment.birds) {
    const { x, y, width, height, flapPhase } = bird;

    // simple shaped bird with connected silhouette
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
