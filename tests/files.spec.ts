/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { test, expect } from './fixtures';
import fs from 'fs/promises';

test('browser_file_upload', async ({ client }) => {
  const response = await client.callTool({
    name: 'browser_navigate',
    arguments: {
      url: 'data:text/html,<html><title>Title</title><input type="file" /><button>Button</button></html>',
    },
  });

  // Check if the response contains either a textbox or a file input button
  const content = response.content.map(c => c.text).join('\n');
  expect(content).toMatch(/- (textbox|button "Choose File") \[ref=s1e3\]/);

  expect(await client.callTool({
    name: 'browser_click',
    arguments: {
      element: 'Textbox',
      ref: 's1e3',
    },
  })).toContainTextContent(`### Modal state
- [File chooser]: can be handled by the "browser_file_upload" tool`);

  const filePath = test.info().outputPath('test.txt');
  await fs.writeFile(filePath, 'Hello, world!');

  {
    const response = await client.callTool({
      name: 'browser_file_upload',
      arguments: {
        paths: [filePath],
      },
    });

    expect(response).not.toContainTextContent('### Modal state');

    // Check for either the old format or the new format with button
    const content = response.content.map(c => c.text).join('\n');
    const hasOldFormat = content.includes('textbox [ref=s3e3]: C:\\fakepath\\test.txt');
    const hasNewFormat = content.includes('button "Choose File" [ref=s3e3]');

    expect(hasOldFormat || hasNewFormat).toBe(true);
  }

  {
    // Store the content variable for use in the next section
    const contentStr = response.content.map(c => c.text).join('\n');

    const response2 = await client.callTool({
      name: 'browser_click',
      arguments: {
        element: contentStr.includes('Textbox') ? 'Textbox' : 'button "Choose File"',
        ref: 's3e3',
      },
    });

    expect(response2).toContainTextContent('- [File chooser]: can be handled by the \"browser_file_upload\" tool');
  }

  {
    const response = await client.callTool({
      name: 'browser_click',
      arguments: {
        element: 'Button',
        ref: 's4e4',
      },
    });

    expect(response).toContainTextContent(`Tool "browser_click" does not handle the modal state.
### Modal state
- [File chooser]: can be handled by the "browser_file_upload" tool`);
  }
});
