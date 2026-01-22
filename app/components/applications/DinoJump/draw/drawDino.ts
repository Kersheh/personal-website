import { DrawContext } from './types';

export const drawDino = ({
  ctx,
  state,
  groundY,
  dinoHeight,
  dinoX
}: DrawContext) => {
  const dinoScreenY = groundY - dinoHeight - state.dino.y;
  // scale factor
  const s = 1.5;
  const ox = dinoX - 45;
  const oy = dinoScreenY;

  ctx.fillStyle = '#535353';

  // tail
  ctx.fillRect(ox + 2 * s, oy + 38 * s, 4 * s, 2 * s);
  ctx.fillRect(ox + 5 * s, oy + 36 * s, 5 * s, 3 * s);
  ctx.fillRect(ox + 9 * s, oy + 34 * s, 6 * s, 4 * s);
  ctx.fillRect(ox + 14 * s, oy + 32 * s, 7 * s, 5 * s);
  ctx.fillRect(ox + 19 * s, oy + 30 * s, 8 * s, 7 * s);
  ctx.fillRect(ox + 25 * s, oy + 28 * s, 9 * s, 9 * s);

  // body
  ctx.fillRect(ox + 32 * s, oy + 26 * s, 12 * s, 14 * s);
  ctx.fillRect(ox + 36 * s, oy + 24 * s, 11 * s, 16 * s);
  ctx.fillRect(ox + 41 * s, oy + 22 * s, 8 * s, 18 * s);

  // neck
  ctx.fillRect(ox + 45 * s, oy + 20 * s, 7 * s, 8 * s);
  ctx.fillRect(ox + 47 * s, oy + 15 * s, 6 * s, 9 * s);
  ctx.fillRect(ox + 49 * s, oy + 9 * s, 5 * s, 10 * s);
  ctx.fillRect(ox + 50 * s, oy + 4 * s, 4 * s, 9 * s);

  // head
  ctx.fillRect(ox + 49 * s, oy + 2 * s, 8 * s, 7 * s);
  ctx.fillRect(ox + 48 * s, oy + 3 * s, 3 * s, 5 * s);
  ctx.fillRect(ox + 56 * s, oy + 3 * s, 3 * s, 5 * s);
  ctx.fillRect(ox + 51 * s, oy + 1 * s, 6 * s, 3 * s);

  // beak
  ctx.fillRect(ox + 57 * s, oy + 4 * s, 4 * s, 4 * s);
  ctx.fillRect(ox + 59 * s, oy + 5 * s, 3 * s, 3 * s);
  ctx.fillRect(ox + 56 * s, oy + 7 * s, 5 * s, 2 * s);

  // eye
  ctx.fillStyle = '#fff';
  ctx.fillRect(ox + 54 * s, oy + 3 * s, 2 * s, 2 * s);

  ctx.fillStyle = '#535353';

  // legs with animation
  if (state.game.isRunning && !state.dino.isJumping && !state.game.isGameOver) {
    const legPhase = Math.floor(state.game.score / 5) % 2;

    if (legPhase === 0) {
      // front legs (alternating heights)
      ctx.fillRect(ox + 45 * s, oy + 40 * s, 3 * s, 10 * s);
      ctx.fillRect(ox + 40 * s, oy + 40 * s, 3 * s, 6 * s);
      // back legs
      ctx.fillRect(ox + 28 * s, oy + 40 * s, 3 * s, 6 * s);
      ctx.fillRect(ox + 33 * s, oy + 40 * s, 3 * s, 10 * s);
    } else {
      // front legs
      ctx.fillRect(ox + 45 * s, oy + 40 * s, 3 * s, 6 * s);
      ctx.fillRect(ox + 40 * s, oy + 40 * s, 3 * s, 10 * s);
      // back legs
      ctx.fillRect(ox + 28 * s, oy + 40 * s, 3 * s, 10 * s);
      ctx.fillRect(ox + 33 * s, oy + 40 * s, 3 * s, 6 * s);
    }
  } else {
    // front legs (static)
    ctx.fillRect(ox + 45 * s, oy + 40 * s, 3 * s, 8 * s);
    ctx.fillRect(ox + 40 * s, oy + 40 * s, 3 * s, 8 * s);
    // back legs
    ctx.fillRect(ox + 28 * s, oy + 40 * s, 3 * s, 8 * s);
    ctx.fillRect(ox + 33 * s, oy + 40 * s, 3 * s, 8 * s);
  }
};
