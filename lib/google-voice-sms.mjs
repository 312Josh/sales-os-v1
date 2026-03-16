/**
 * Google Voice SMS Automation
 * 
 * Sends SMS via Google Voice through browser automation (Playwright + CDP).
 * Requires Chrome running with --remote-debugging-port=9222
 * and logged into Google Voice.
 * 
 * Usage:
 *   node google-voice-sms.mjs <phone_number> <message>
 * 
 * Example:
 *   node google-voice-sms.mjs "7733551457" "Hey, following up on our call today"
 * 
 * Prerequisites:
 *   1. Launch Chrome with: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug-profile"
 *   2. Log into Google Voice in that Chrome window
 *   3. npm install playwright
 * 
 * Note: The WebSocket URL needs to match your Chrome instance.
 *       Get it from: curl http://localhost:9222/json/version
 *       Or check Chrome's startup output for "DevTools listening on ws://..."
 */

import { chromium } from 'playwright';

// Update this WebSocket URL when Chrome is relaunched
const WS_URL = process.env.CHROME_WS_URL || 'ws://127.0.0.1:9222/devtools/browser/acc010e7-f117-4acf-8276-034b472b81ee';

export async function sendGoogleVoiceSMS(phoneNumber, messageText) {
  const browser = await chromium.connectOverCDP(WS_URL);
  const page = browser.contexts()[0]?.pages()[0];
  
  if (!page) throw new Error('No Chrome page found');
  
  // Step 1: Navigate to Google Voice messages
  await page.goto('https://voice.google.com/u/0/messages');
  await page.waitForTimeout(3000);
  
  // Step 2: Click "Send new message"
  await page.mouse.click(200, 155);
  await page.waitForTimeout(2000);
  
  // Step 3: Type the phone number (triggers the "Send to" dropdown)
  await page.keyboard.type(phoneNumber.replace(/\D/g, ''), { delay: 80 });
  await page.waitForTimeout(2000);
  
  // Step 4: Find and click the "Send to (xxx) xxx-xxxx" dropdown option
  const sendToPos = await page.evaluate(() => {
    const els = [...document.querySelectorAll('*')];
    const matches = els.filter(el => {
      const t = el.textContent || '';
      const rect = el.getBoundingClientRect();
      return t.includes('Send to') && 
             rect.height > 10 && rect.height < 80 &&
             rect.width > 50 &&
             el.classList.contains('send-to-label');
    });
    if (matches.length > 0) {
      const r = matches[0].getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }
    // Fallback: find the send-to-button div
    const btn = document.querySelector('.send-to-button');
    if (btn) {
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }
    return null;
  });
  
  if (!sendToPos) throw new Error('Could not find "Send to" dropdown option');
  
  await page.mouse.click(sendToPos.x, sendToPos.y);
  await page.waitForTimeout(2000);
  
  // Step 5: Dismiss any "No contacts found" dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // Step 6: Click the message textarea and type
  const msgPos = await page.evaluate(() => {
    const ta = document.querySelector('textarea[placeholder="Type a message"]');
    if (ta) {
      const r = ta.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }
    return null;
  });
  
  if (!msgPos) throw new Error('Could not find message input');
  
  await page.mouse.click(msgPos.x, msgPos.y);
  await page.waitForTimeout(500);
  await page.keyboard.type(messageText, { delay: 20 });
  await page.waitForTimeout(500);
  
  // Step 7: Click the Send button
  const sendBtnInfo = await page.evaluate(() => {
    const btn = document.querySelector('[aria-label="Send message"]');
    if (btn && !btn.disabled) {
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, disabled: false };
    }
    return { disabled: true };
  });
  
  if (sendBtnInfo.disabled) throw new Error('Send button is disabled — recipient may not be accepted');
  
  await page.mouse.click(sendBtnInfo.x, sendBtnInfo.y);
  await page.waitForTimeout(2000);
  
  return { success: true, to: phoneNumber, message: messageText };
}

// CLI usage
if (process.argv[2]) {
  const phone = process.argv[2];
  const message = process.argv[3] || 'Sent from Sales OS';
  
  sendGoogleVoiceSMS(phone, message)
    .then(result => {
      console.log('✅ SMS sent:', JSON.stringify(result));
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Failed:', err.message);
      process.exit(1);
    });
}
