/**
 * User agent management for anti-bot protection
 */

import type * as playwright from 'playwright';

// Common modern user agents by platform and browser
const userAgents = {
  windows: {
    chrome: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    ],
    firefox: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:118.0) Gecko/20100101 Firefox/118.0',
    ],
    edge: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
    ],
  },
  macos: {
    chrome: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    ],
    firefox: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:118.0) Gecko/20100101 Firefox/118.0',
    ],
    safari: [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
    ],
  },
  linux: {
    chrome: [
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    ],
    firefox: [
      'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
      'Mozilla/5.0 (X11; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0',
    ],
  },
  android: {
    chrome: [
      'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.43 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
    ],
    firefox: [
      'Mozilla/5.0 (Android 13; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0',
      'Mozilla/5.0 (Android 13; Mobile; rv:119.0) Gecko/119.0 Firefox/119.0',
      'Mozilla/5.0 (Android 12; Mobile; rv:118.0) Gecko/118.0 Firefox/118.0',
    ],
  },
  ios: {
    safari: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    ],
    chrome: [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/119.0.6045.169 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/118.0.5993.69 Mobile/15E148 Safari/604.1',
    ],
  },
};

/**
 * Get a random user agent based on platform and browser
 */
function getRandomUserAgent(platform?: string, browser?: string): string {
  // Default to a random platform if not specified
  if (!platform) {
    const platforms = Object.keys(userAgents);
    platform = platforms[Math.floor(Math.random() * platforms.length)];
  }

  // Get available browsers for the platform
  const platformAgents = userAgents[platform as keyof typeof userAgents];
  if (!platformAgents) {
    // Fallback to Windows Chrome if platform not found
    return userAgents.windows.chrome[0];
  }

  // Default to a random browser if not specified or not available for the platform
  if (!browser || !platformAgents[browser as keyof typeof platformAgents]) {
    const browsers = Object.keys(platformAgents);
    browser = browsers[Math.floor(Math.random() * browsers.length)];
  }

  // Get user agents for the selected browser
  const browserAgents = platformAgents[browser as keyof typeof platformAgents];
  if (!browserAgents || browserAgents.length === 0) {
    // Fallback to Windows Chrome if browser not found
    return userAgents.windows.chrome[0];
  }

  // Return a random user agent from the selected browser
  return browserAgents[Math.floor(Math.random() * browserAgents.length)];
}

/**
 * Set a realistic user agent for the page
 */
export async function setUserAgent(
  page: playwright.Page,
  level: string = 'medium',
  options?: { userAgent?: string, platform?: string, browser?: string }
): Promise<string> {
  // Use provided user agent if available
  if (options?.userAgent) {
    await page.setExtraHTTPHeaders({
      'User-Agent': options.userAgent
    });
    return options.userAgent;
  }

  // Get a random user agent based on platform and browser
  const userAgent = getRandomUserAgent(
    options?.platform,
    options?.browser
  );

  // Set the user agent
  await page.setExtraHTTPHeaders({
    'User-Agent': userAgent
  });

  // For high protection level, also modify navigator properties to match the user agent
  if (level === 'high') {
    // Extract platform and browser info from user agent
    const isWindows = userAgent.includes('Windows');
    const isMac = userAgent.includes('Mac OS X');
    const isLinux = userAgent.includes('Linux');
    const isAndroid = userAgent.includes('Android');
    const isIOS = userAgent.includes('iPhone') || userAgent.includes('iPad');

    const isChrome = userAgent.includes('Chrome/') && !userAgent.includes('Edg/');
    const isFirefox = userAgent.includes('Firefox/');
    const isSafari = userAgent.includes('Safari/') && !userAgent.includes('Chrome/');
    const isEdge = userAgent.includes('Edg/');

    // Override navigator properties
    await page.addInitScript((ua) => {
      // Store the original navigator
      const originalNavigator = window.navigator;

      // Override navigator
      Object.defineProperty(window, 'navigator', {
        value: {
          ...originalNavigator,
          userAgent: ua,
        },
        writable: false,
        configurable: false,
      });
    }, userAgent);
  }

  return userAgent;
}
