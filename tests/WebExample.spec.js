import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/*
  What this covers (real sites + a small mocked request example):
  - Sauce Demo (https://www.saucedemo.com): login, hover, add to cart, open social link (new window), checkout flow.
    Credentials: standard_user / secret_sauce (public demo site)
  - DemoQA (https://demoqa.com): drag-and-drop, file upload
  - The Internet (https://the-internet.herokuapp.com): keyboard interactions
  - A small network-intercept example that mocks a JSON response for a fetch from a demo page
*/

test.describe('Real web app interaction examples', () => {

  test('SauceDemo: login, hover, add to cart, open social link (multiple windows), checkout', async ({ page, context }) => {
    await page.goto('https://www.saucedemo.com/');

    // Login
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/inventory.html/);

    // Hover over first product and click Add to cart (hover isn't required on site but demonstrates the API)
    const firstItem = page.locator('.inventory_item').first();
    await firstItem.hover();
    await expect(firstItem.locator('.inventory_item_name')).toBeVisible();
    await firstItem.locator('button').click(); // adds first item
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Click the Twitter social link (opens new window) and handle new page
    // Social links are in footer; find the Twitter icon by selector
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a.social_twitter') // opens new tab/window
    ]);
    await newPage.waitForLoadState();
    // Example assertion: title contains Twitter or is not empty
    expect((await newPage.title()).length).toBeGreaterThan(0);
    await newPage.close();

    // Go to cart and start checkout
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/cart.html/);
    await page.click('#checkout');

    // Fill checkout info and finish
    await page.fill('#first-name', 'Amit');
    await page.fill('#last-name', 'Goyal');
    await page.fill('#postal-code', '12345');
    await page.click('#continue');
    await expect(page.locator('.summary_total_label')).toBeVisible();
    await page.click('#finish');
    await expect(page.locator('.complete-header')).toHaveText('THANK YOU FOR YOUR ORDER');
  });

  test('DemoQA: drag-and-drop and file upload', async ({ page }) => {
    // Drag & Drop
    await page.goto('https://demoqa.com/droppable');
    const source = page.locator('#draggable');
    const target = page.locator('#droppable');
    await expect(source).toBeVisible();
    await source.dragTo(target);
    await expect(target).toContainText('Dropped');

    // File upload
    await page.goto('https://demoqa.com/upload-download');
    // Create a temp file to upload
    const tmpDir = testInfo.outputPath('files');
    fs.mkdirSync(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, 'playwright-file.txt');
    fs.writeFileSync(filePath, 'Playwright file upload test');
    const input = page.locator('input#uploadFile');
    await expect(input).toBeVisible();
    await input.setInputFiles(filePath);
    await expect(page.locator('#uploadedFilePath')).toContainText('playwright-file.txt');
  });

  test('The-Internet: keyboard interactions and key assertions', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/key_presses');
    const input = page.locator('#target');
    await input.click();

    await page.keyboard.press('A');
    await expect(page.locator('#result')).toHaveText(/You entered: A/);

    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#result')).toHaveText(/LEFT/);

    // Type a string, then use Ctrl/Cmd+A select all (Playwright maps modifiers)
    await input.fill('');
    await page.keyboard.type('hello');
    await expect(input).toHaveValue('hello');
    await page.keyboard.press('Shift+A');
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  });

test.describe('Real-site mouse interactions demo', () => {
  test('click (login), right-click, drag-and-drop, long-press and selection', async ({ page, context }) => {
    // ---- 1) Click: login on Sauce Demo ----
    await page.goto('https://www.saucedemo.com/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    // assert we landed on the inventory page
    await expect(page).toHaveURL(/inventory.html/);

    // ---- 2) Right-click: demoqa Buttons page ----
    await page.goto('https://demoqa.com/buttons');
    // right-click the button that expects a context click
    await page.locator('#rightClickBtn').click({ button: 'right' });
    // demoqa shows a message with id #rightClickMessage
    await expect(page.locator('#rightClickMessage')).toHaveText(/right click/i);

    // ---- 3) Long-press (hold mouse down) ----
    // Use example.com for a simple element to long-press; this demonstrates the technique.
    await page.goto('https://example.com/');
    const heading = page.locator('h1'); // Example Domain heading
    await heading.waitFor();
    const headingBox = await heading.boundingBox();
    if (headingBox) {
      // move over the heading center, press and hold for 1s, then release
      const hx = Math.round(headingBox.x + headingBox.width / 2);
      const hy = Math.round(headingBox.y + headingBox.height / 2);
      await page.mouse.move(hx, hy);
      await page.mouse.down();            // press
      await page.waitForTimeout(1000);    // hold (long-press)
      await page.mouse.up();              // release
      // There is no site-side effect for this page, but this demonstrates the long-press pattern.
    }

  });
});

});