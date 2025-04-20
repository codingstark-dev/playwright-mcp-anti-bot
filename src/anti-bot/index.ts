/**
 * Anti-bot protection module for Playwright MCP
 *
 * This module provides tools and utilities to make browser automation
 * more human-like and avoid triggering anti-bot protections like CAPTCHAs.
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { Tool, ToolFactory } from '../tools/tool';
import { humanizeMouseMovement } from './mouse';
import { humanizeTyping } from './typing';
import { humanizeScrolling } from './scrolling';
import { setUserAgent } from './user-agent';
import { avoidCaptcha } from './captcha';

// Schema for enabling anti-bot protection
const enableAntiBotSchema = z.object({
  level: z.enum(['low', 'medium', 'high']).optional().describe('Protection level: low, medium, or high. Default is medium.'),
});

// Tool to enable anti-bot protection
const enableAntiBot: Tool = {
  capability: 'anti-bot',
  schema: {
    name: 'browser_enable_anti_bot',
    description: 'Enable anti-bot protection to make browser automation more human-like and avoid CAPTCHAs',
    inputSchema: zodToJsonSchema(enableAntiBotSchema),
  },
  handle: async (context, params) => {
    const validatedParams = enableAntiBotSchema.parse(params);
    const level = validatedParams.level || 'medium';

    // Apply anti-bot protection to the current tab
    const tab = await context.ensureTab();

    // Set a realistic user agent
    await setUserAgent(tab.page, level);

    // Enable human-like mouse movement, typing, and scrolling
    await tab.page.evaluate((level) => {
      // Store the protection level in the page context
      (window as any).__antiBotProtectionLevel = level;
    }, level);

    const code = [
      `// Enable anti-bot protection (${level} level)`,
      `// This applies various techniques to make browser automation more human-like`,
    ];

    return {
      code,
      captureSnapshot: false,
      waitForNetwork: false,
    };
  },
};

// Schema for configuring user agent
const configureUserAgentSchema = z.object({
  userAgent: z.string().optional().describe('Custom user agent string. If not provided, a realistic one will be generated.'),
  platform: z.enum(['windows', 'macos', 'linux', 'android', 'ios']).optional().describe('Platform to emulate'),
  browser: z.enum(['chrome', 'firefox', 'safari', 'edge']).optional().describe('Browser to emulate'),
});

// Tool to configure user agent
const configureUserAgent: Tool = {
  capability: 'anti-bot',
  schema: {
    name: 'browser_configure_user_agent',
    description: 'Configure the browser user agent to avoid fingerprinting',
    inputSchema: zodToJsonSchema(configureUserAgentSchema),
  },
  handle: async (context, params) => {
    const validatedParams = configureUserAgentSchema.parse(params);
    const tab = context.currentTabOrDie();

    // Set the user agent based on parameters
    const userAgent = await setUserAgent(tab.page, 'high', validatedParams);

    const code = [
      `// Configure user agent`,
      `await page.setUserAgent('${userAgent}');`,
    ];

    return {
      code,
      captureSnapshot: false,
      waitForNetwork: false,
    };
  },
};

// Export all anti-bot tools
export default [
  enableAntiBot,
  configureUserAgent,
];
