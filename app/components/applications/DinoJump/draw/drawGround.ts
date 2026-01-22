import { DrawContext } from './types';

export const drawGround = ({
  ctx,
  state,
  groundY,
  canvasWidth
}: DrawContext) => {
  ctx.strokeStyle = '#535353';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvasWidth, groundY);
  ctx.stroke();

  // draw dirt flecks
  ctx.fillStyle = '#a0a0a0';

  for (const dirt of state.environment.dirt) {
    ctx.fillRect(dirt.x, groundY + 5 + dirt.offset, dirt.size, dirt.size);
  }
};
