import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('http://localhost:3000/onboarding/mock-onboard-vikram');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/onboarding-diag.png', fullPage: true });
console.log('URL:', page.url());
console.log('Title:', await page.title());
console.log('Body text:', (await page.locator('main').textContent())?.trim().slice(0, 300));
await browser.close();
