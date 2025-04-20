# Anti-Bot Protection for Playwright MCP

This module provides anti-bot protection capabilities for the Playwright MCP server, making browser automation more human-like and helping to avoid CAPTCHAs and other anti-bot measures.

## Features

- **User Agent Management**: Sets realistic user agents and browser fingerprints
- **Human-like Mouse Movement**: Simulates natural mouse movement patterns with acceleration and deceleration
- **Human-like Typing**: Simulates natural typing with variable speed and occasional errors
- **Human-like Scrolling**: Simulates natural scrolling behavior with pauses and variable speed
- **CAPTCHA Avoidance**: Implements strategies to avoid triggering CAPTCHAs

## Usage

### Command Line

Enable anti-bot protection with default settings (medium level):

```bash
npx @playwright/mcp --anti-bot
```

Specify a protection level:

```bash
npx @playwright/mcp --anti-bot=high
```

Available protection levels:
- `low`: Minimal protection, faster automation
- `medium`: Balanced protection (default)
- `high`: Maximum protection, slower but more human-like

### Programmatic Usage

```javascript
import { createServer } from '@playwright/mcp';

// Enable anti-bot protection with default settings
const server = await createServer({
  antiBot: true
});

// Or with custom settings
const server = await createServer({
  antiBot: {
    level: 'high',
    platform: 'windows',
    browser: 'chrome'
  }
});
```

## Tools

The anti-bot module provides the following tools that can be used in your MCP client:

### browser_enable_anti_bot

Enables anti-bot protection for the current browser session.

```javascript
await client.callTool({
  name: 'browser_enable_anti_bot',
  arguments: {
    level: 'medium' // Optional: 'low', 'medium', or 'high'
  }
});
```

### browser_configure_user_agent

Configures the browser's user agent to avoid fingerprinting.

```javascript
await client.callTool({
  name: 'browser_configure_user_agent',
  arguments: {
    // All parameters are optional
    userAgent: 'Custom user agent string', // If not provided, a realistic one will be generated
    platform: 'windows', // 'windows', 'macos', 'linux', 'android', 'ios'
    browser: 'chrome' // 'chrome', 'firefox', 'safari', 'edge'
  }
});
```

## How It Works

The anti-bot protection works by intercepting and modifying browser interactions to make them more human-like:

1. **Mouse Movement**: Instead of moving directly to a target, the mouse follows a natural curve with variable speed
2. **Typing**: Characters are typed with variable timing and occasional realistic errors
3. **Scrolling**: Pages are scrolled with natural acceleration and deceleration
4. **Browser Fingerprinting**: Browser fingerprints are modified to appear more like a regular user

These techniques help avoid detection by sophisticated anti-bot systems that look for patterns of automated behavior.
