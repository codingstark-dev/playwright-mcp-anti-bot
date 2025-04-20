/**
 * CAPTCHA detection and avoidance strategies
 */

import type * as playwright from 'playwright';

// Common CAPTCHA selectors and patterns
const captchaSelectors = [
  // Google reCAPTCHA
  'iframe[src*="google.com/recaptcha/api2/anchor"]',
  'iframe[src*="google.com/recaptcha/api2/bframe"]',
  'div.g-recaptcha',
  'div[data-sitekey]',

  // hCaptcha
  'iframe[src*="hcaptcha.com/captcha"]',
  'div.h-captcha',

  // Cloudflare Turnstile
  'iframe[src*="challenges.cloudflare.com"]',
  'div.cf-turnstile',

  // Common CAPTCHA text patterns
  'form:has(input[name*="captcha"])',
  'div:has-text("I\'m not a robot")',
  'div:has-text("Verify you are human")',
  'div:has-text("Security check")',
];

/**
 * Check if a CAPTCHA is present on the page
 */
export async function detectCaptcha(page: playwright.Page): Promise<boolean> {
  for (const selector of captchaSelectors) {
    const element = await page.$(selector);
    if (element) {
      return true;
    }
  }

  // Check for CAPTCHA in iframes
  const frames = page.frames();
  for (const frame of frames) {
    for (const selector of captchaSelectors) {
      try {
        const element = await frame.$(selector);
        if (element) {
          return true;
        }
      } catch (error) {
        // Ignore errors when checking iframes
      }
    }
  }

  return false;
}

/**
 * Apply strategies to avoid triggering CAPTCHAs
 */
export async function avoidCaptcha(page: playwright.Page, level: string = 'medium'): Promise<void> {
  // Set common headers that make the browser look more legitimate
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  });

  // Modify browser fingerprinting based on protection level
  if (level === 'medium' || level === 'high') {
    // Override common fingerprinting methods
    await page.addInitScript(() => {
      // Make navigator.webdriver not detectable
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });

      // Spoof plugins to look like a regular browser
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          const plugins = {
            length: 5,
            item: (index: number) => {
              // Return a dummy plugin for any index
              return {
                description: 'Dummy plugin',
                filename: 'dummy.plugin',
                name: `Plugin ${index}`,
                version: '1.0.0'
              };
            },
            namedItem: (name: string) => {
              // Return a dummy plugin for any name
              return {
                description: 'Dummy plugin',
                filename: 'dummy.plugin',
                name: name,
                version: '1.0.0'
              };
            },
            refresh: () => {},
          };
          return plugins;
        },
      });

      // Add a fake language list
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
  }

  // For high protection level, apply more advanced fingerprinting protections
  if (level === 'high') {
    // We'll use a simpler approach that's compatible with Playwright
    await page.addInitScript(() => {
      // Basic anti-fingerprinting measures
      try {
        // Override Chrome-specific properties if they exist
        if ('chrome' in window) {
          // Create a simple chrome object with minimal properties
          Object.defineProperty(window, 'chrome', {
            value: {
              app: { isInstalled: false },
              runtime: {}
            },
            writable: true,
            configurable: true
          });
        }

        // We'll skip the permissions API override as it's causing type issues
        // This is a non-critical part of the anti-fingerprinting
      } catch (e) {
        // Silently fail if any of the overrides cause issues
        console.log('Anti-fingerprinting error:', e);
      }
    });
  }
}
