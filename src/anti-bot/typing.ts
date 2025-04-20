/**
 * Human-like typing behavior simulation
 */

import type * as playwright from 'playwright';

// Common typing errors that humans make
const commonTypingErrors: Record<string, string[]> = {
  'a': ['s', 'q', 'z'],
  'b': ['v', 'g', 'n'],
  'c': ['x', 'd', 'v'],
  'd': ['s', 'f', 'e'],
  'e': ['w', 'r', 'd'],
  'f': ['d', 'g', 'r'],
  'g': ['f', 'h', 't'],
  'h': ['g', 'j', 'y'],
  'i': ['u', 'o', 'k'],
  'j': ['h', 'k', 'u'],
  'k': ['j', 'l', 'i'],
  'l': ['k', ';', 'o'],
  'm': ['n', ',', 'j'],
  'n': ['b', 'm', 'h'],
  'o': ['i', 'p', 'l'],
  'p': ['o', '[', ';'],
  'q': ['w', 'a', '1'],
  'r': ['e', 't', 'f'],
  's': ['a', 'd', 'w'],
  't': ['r', 'y', 'g'],
  'u': ['y', 'i', 'j'],
  'v': ['c', 'b', 'g'],
  'w': ['q', 'e', 's'],
  'x': ['z', 'c', 'd'],
  'y': ['t', 'u', 'h'],
  'z': ['a', 'x', 's'],
};

/**
 * Get a typing delay that mimics human typing speed with natural variations
 */
function getTypingDelay(level: string): number {
  // Base typing speed in milliseconds between keystrokes
  let baseDelay: number;
  
  switch (level) {
    case 'low':
      // Fast typing (80-120 WPM)
      baseDelay = 100 + Math.random() * 50;
      break;
    case 'medium':
      // Average typing (50-80 WPM)
      baseDelay = 150 + Math.random() * 100;
      break;
    case 'high':
      // Slower, more deliberate typing (30-60 WPM)
      baseDelay = 200 + Math.random() * 150;
      break;
    default:
      baseDelay = 150 + Math.random() * 100;
  }
  
  // Add natural variation to typing speed
  const variationFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
  
  return baseDelay * variationFactor;
}

/**
 * Determine if a typing error should be simulated
 */
function shouldMakeTypingError(level: string): boolean {
  let errorProbability: number;
  
  switch (level) {
    case 'low':
      errorProbability = 0.005; // 0.5% chance of error
      break;
    case 'medium':
      errorProbability = 0.02; // 2% chance of error
      break;
    case 'high':
      errorProbability = 0.04; // 4% chance of error
      break;
    default:
      errorProbability = 0.02;
  }
  
  return Math.random() < errorProbability;
}

/**
 * Simulate human-like typing with natural timing, occasional errors, and corrections
 */
export async function humanizeTyping(
  page: playwright.Page, 
  text: string, 
  level: string = 'medium'
): Promise<void> {
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    
    // Determine if we should make a typing error
    if (shouldMakeTypingError(level) && char.toLowerCase() in commonTypingErrors) {
      // Choose a wrong key near the intended key
      const possibleErrors = commonTypingErrors[char.toLowerCase()];
      const wrongChar = possibleErrors[Math.floor(Math.random() * possibleErrors.length)];
      
      // Type the wrong character
      await page.keyboard.press(wrongChar);
      
      // Wait a moment before correcting (human reaction time)
      await page.waitForTimeout(300 + Math.random() * 200);
      
      // Delete the wrong character
      await page.keyboard.press('Backspace');
      
      // Wait a moment before typing the correct character
      await page.waitForTimeout(200 + Math.random() * 200);
      
      // Now type the correct character
      await page.keyboard.press(char);
    } else {
      // Type the correct character
      await page.keyboard.press(char);
    }
    
    // Move to the next character
    i++;
    
    // Add a natural pause between keystrokes
    if (i < text.length) {
      // Occasionally add a longer pause (as if thinking)
      if (Math.random() < 0.05) {
        await page.waitForTimeout(500 + Math.random() * 1000);
      } else {
        // Normal typing rhythm
        await page.waitForTimeout(getTypingDelay(level));
      }
    }
  }
}
