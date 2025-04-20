/**
 * Human-like scrolling behavior simulation
 */

import type * as playwright from 'playwright';

/**
 * Get a human-like scrolling speed
 */
function getScrollSpeed(level: string): number {
  // Base scroll speed in pixels per step
  let baseSpeed: number;
  
  switch (level) {
    case 'low':
      // Faster scrolling
      baseSpeed = 120 + Math.random() * 60;
      break;
    case 'medium':
      // Average scrolling
      baseSpeed = 80 + Math.random() * 40;
      break;
    case 'high':
      // Slower, more deliberate scrolling
      baseSpeed = 40 + Math.random() * 30;
      break;
    default:
      baseSpeed = 80 + Math.random() * 40;
  }
  
  // Add natural variation
  const variationFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
  
  return baseSpeed * variationFactor;
}

/**
 * Get a human-like delay between scroll steps
 */
function getScrollDelay(level: string): number {
  // Base delay in milliseconds
  let baseDelay: number;
  
  switch (level) {
    case 'low':
      // Faster scrolling
      baseDelay = 10 + Math.random() * 10;
      break;
    case 'medium':
      // Average scrolling
      baseDelay = 20 + Math.random() * 15;
      break;
    case 'high':
      // Slower, more deliberate scrolling
      baseDelay = 30 + Math.random() * 20;
      break;
    default:
      baseDelay = 20 + Math.random() * 15;
  }
  
  return baseDelay;
}

/**
 * Simulate human-like scrolling with natural timing and occasional pauses
 */
export async function humanizeScrolling(
  page: playwright.Page, 
  targetPosition: number, 
  level: string = 'medium'
): Promise<void> {
  // Get current scroll position
  const currentPosition = await page.evaluate(() => window.scrollY);
  
  // Calculate scroll direction and distance
  const scrollDown = targetPosition > currentPosition;
  const distance = Math.abs(targetPosition - currentPosition);
  
  // If distance is very small, just scroll directly
  if (distance < 100) {
    await page.evaluate((position) => window.scrollTo(0, position), targetPosition);
    return;
  }
  
  // Calculate number of steps based on distance and level
  let steps = Math.ceil(distance / getScrollSpeed(level));
  
  // Ensure a minimum number of steps
  steps = Math.max(3, steps);
  
  // Scroll in steps
  for (let i = 1; i <= steps; i++) {
    // Calculate intermediate position with slight acceleration/deceleration
    // Using a sine curve for natural acceleration and deceleration
    const progress = i / steps;
    const easedProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress);
    const intermediatePosition = currentPosition + (targetPosition - currentPosition) * easedProgress;
    
    // Scroll to the intermediate position
    await page.evaluate((position) => window.scrollTo(0, position), Math.round(intermediatePosition));
    
    // Add a natural pause between scroll steps
    if (i < steps) {
      // Occasionally add a longer pause (as if reading content)
      if (Math.random() < 0.1) {
        await page.waitForTimeout(500 + Math.random() * 2000);
      } else {
        // Normal scrolling rhythm
        await page.waitForTimeout(getScrollDelay(level));
      }
    }
  }
  
  // Occasionally add a small adjustment at the end (humans often overshoot slightly)
  if (level === 'high' && Math.random() < 0.3) {
    const overshoot = targetPosition + (scrollDown ? 20 : -20) * Math.random();
    await page.evaluate((position) => window.scrollTo(0, position), Math.round(overshoot));
    await page.waitForTimeout(200 + Math.random() * 300);
    await page.evaluate((position) => window.scrollTo(0, position), targetPosition);
  }
}
