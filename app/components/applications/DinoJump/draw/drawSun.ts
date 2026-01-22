import { DrawContext } from './types';

export const drawSun = ({ ctx, canvasWidth }: DrawContext) => {
  const sunX = canvasWidth - 120;
  const sunY = 100;
  const r = 24;

  // heat rays emanating from sun
  ctx.fillStyle = '#c0c0c0';
  // top ray
  ctx.fillRect(sunX - 2, sunY - r - 18, 4, 12);
  ctx.fillRect(sunX - 1, sunY - r - 22, 2, 6);
  // bottom ray
  ctx.fillRect(sunX - 2, sunY + r + 6, 4, 12);
  ctx.fillRect(sunX - 1, sunY + r + 16, 2, 6);
  // left ray
  ctx.fillRect(sunX - r - 18, sunY - 2, 12, 4);
  ctx.fillRect(sunX - r - 22, sunY - 1, 6, 2);
  // right ray
  ctx.fillRect(sunX + r + 6, sunY - 2, 12, 4);
  ctx.fillRect(sunX + r + 16, sunY - 1, 6, 2);
  // diagonal rays (top-left)
  ctx.fillRect(sunX - r - 8, sunY - r - 8, 8, 3);
  ctx.fillRect(sunX - r - 8, sunY - r - 8, 3, 8);
  // diagonal rays (top-right)
  ctx.fillRect(sunX + r, sunY - r - 8, 8, 3);
  ctx.fillRect(sunX + r + 5, sunY - r - 8, 3, 8);
  // diagonal rays (bottom-left)
  ctx.fillRect(sunX - r - 8, sunY + r + 5, 8, 3);
  ctx.fillRect(sunX - r - 8, sunY + r, 3, 8);
  // diagonal rays (bottom-right)
  ctx.fillRect(sunX + r, sunY + r + 5, 8, 3);
  ctx.fillRect(sunX + r + 5, sunY + r, 3, 8);

  // outer glow ring
  ctx.fillStyle = '#d0d0d0';
  ctx.fillRect(sunX - r - 4, sunY - r + 6, r * 2 + 8, r * 2 - 12);
  ctx.fillRect(sunX - r + 6, sunY - r - 4, r * 2 - 12, r * 2 + 8);
  ctx.fillRect(sunX - r - 2, sunY - r + 2, r * 2 + 4, r * 2 - 4);
  ctx.fillRect(sunX - r + 2, sunY - r - 2, r * 2 - 4, r * 2 + 4);

  // main sun body (rounder circle approximation)
  ctx.fillStyle = '#a0a0a0';
  // core square
  ctx.fillRect(sunX - r + 4, sunY - r + 4, r * 2 - 8, r * 2 - 8);
  // extend edges for roundness
  ctx.fillRect(sunX - r + 2, sunY - r + 6, r * 2 - 4, r * 2 - 12);
  ctx.fillRect(sunX - r + 6, sunY - r + 2, r * 2 - 12, r * 2 - 4);
  ctx.fillRect(sunX - r, sunY - r + 10, r * 2, r * 2 - 20);
  ctx.fillRect(sunX - r + 10, sunY - r, r * 2 - 20, r * 2);
};
