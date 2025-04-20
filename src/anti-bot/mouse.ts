/**
 * Human-like mouse movement simulation
 */

import type * as playwright from 'playwright';

// Bezier curve interpolation for smooth mouse movement
function bezierInterpolation(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const cX = 3 * (p1 - p0);
  const bX = 3 * (p2 - p1) - cX;
  const aX = p3 - p0 - cX - bX;

  return aX * Math.pow(t, 3) + bX * Math.pow(t, 2) + cX * t + p0;
}

// Generate points along a bezier curve for smooth mouse movement
function generateBezierCurvePoints(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  numPoints: number
): { x: number, y: number }[] {
  const points: { x: number, y: number }[] = [];

  // Control points for the bezier curve (slightly randomized)
  const ctrlX1 = startX + (endX - startX) / 3 + (Math.random() * 20 - 10);
  const ctrlY1 = startY + (endY - startY) / 3 + (Math.random() * 20 - 10);
  const ctrlX2 = startX + 2 * (endX - startX) / 3 + (Math.random() * 20 - 10);
  const ctrlY2 = startY + 2 * (endY - startY) / 3 + (Math.random() * 20 - 10);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const x = bezierInterpolation(t, startX, ctrlX1, ctrlX2, endX);
    const y = bezierInterpolation(t, startY, ctrlY1, ctrlY2, endY);
    points.push({ x, y });
  }

  return points;
}

// Add human-like variability to mouse movement speed
function getHumanizedDelay(distance: number, level: string): number {
  // Base delay in milliseconds
  let baseDelay = 1;

  // Adjust delay based on protection level
  switch (level) {
    case 'low':
      baseDelay = 0.5;
      break;
    case 'medium':
      baseDelay = 1;
      break;
    case 'high':
      baseDelay = 2;
      break;
    default:
      baseDelay = 1;
  }

  // Add some randomness to the delay
  const randomFactor = 0.5 + Math.random();

  // Longer distances should have slightly higher delays
  const distanceFactor = Math.log(distance + 1) / 10;

  return baseDelay * randomFactor * (1 + distanceFactor);
}

/**
 * Move the mouse in a human-like pattern from current position to target position
 */
export async function humanizeMouseMovement(
  page: playwright.Page,
  targetX: number,
  targetY: number,
  level: string = 'medium'
): Promise<void> {
  // Get current mouse position
  const currentPosition = await page.evaluate(() => {
    // Use a safer way to access custom properties
    const mouseX = (window as any).mouseX || 0;
    const mouseY = (window as any).mouseY || 0;
    return { x: mouseX, y: mouseY };
  });

  const startX = currentPosition.x;
  const startY = currentPosition.y;

  // Calculate distance
  const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));

  // Determine number of points based on distance and level
  let numPoints = Math.floor(distance / 10);
  if (level === 'high') numPoints *= 2;
  if (level === 'low') numPoints = Math.max(3, Math.floor(numPoints / 2));

  // Ensure a minimum number of points
  numPoints = Math.max(5, numPoints);

  // Generate curve points
  const points = generateBezierCurvePoints(startX, startY, targetX, targetY, numPoints);

  // Move through each point with human-like timing
  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    // Calculate delay based on distance to next point and protection level
    let delay = 0;
    if (i < points.length - 1) {
      const nextPoint = points[i + 1];
      const pointDistance = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));
      delay = getHumanizedDelay(pointDistance, level);
    }

    // Move to the point
    await page.mouse.move(point.x, point.y);

    // Wait a variable amount of time between movements
    if (delay > 0) {
      await page.waitForTimeout(delay);
    }
  }

  // Store the final position in the page context
  await page.evaluate(({ x, y }) => {
    (window as any).mouseX = x;
    (window as any).mouseY = y;
  }, { x: targetX, y: targetY });
}

/**
 * Perform a human-like click with natural timing and optional slight movement during click
 */
export async function humanizeClick(
  page: playwright.Page,
  x: number,
  y: number,
  level: string = 'medium'
): Promise<void> {
  // First move to the target position in a human-like way
  await humanizeMouseMovement(page, x, y, level);

  // Add a small random delay before clicking (humans pause before clicking)
  const preClickDelay = 50 + Math.random() * 150;
  await page.waitForTimeout(preClickDelay);

  // Press the mouse button
  await page.mouse.down();

  // Humans often move the mouse slightly during a click
  if (level === 'high') {
    const jitterX = x + (Math.random() * 2 - 1);
    const jitterY = y + (Math.random() * 2 - 1);
    await page.mouse.move(jitterX, jitterY);
  }

  // Hold the click for a variable amount of time
  const clickDuration = 50 + Math.random() * 100;
  await page.waitForTimeout(clickDuration);

  // Release the mouse button
  await page.mouse.up();
}
