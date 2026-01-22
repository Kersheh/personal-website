import { DrawContext } from './types';

export const drawObstacles = ({ ctx, state, groundY }: DrawContext) => {
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
      ctx.fillRect(obstacle.x + w + 2, obstacleY + h * 0.3, 4, h * 0.25 + 4);
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
