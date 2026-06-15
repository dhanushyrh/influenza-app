import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });

await page.goto('http://localhost:3000/influencer/67346359-69f4-4f75-828f-631031699c19');
await page.waitForLoadState('networkidle');

// Full page
await page.screenshot({ path: '/tmp/lookbook-full.png', fullPage: true });

// Above-fold
await page.screenshot({ path: '/tmp/lookbook-fold.png', fullPage: false });

// Scroll to recent works
await page.evaluate(() => window.scrollTo(0, 480));
await page.screenshot({ path: '/tmp/lookbook-posts.png', fullPage: false });

// Scroll to reviews
await page.evaluate(() => window.scrollTo(0, 900));
await page.screenshot({ path: '/tmp/lookbook-reviews.png', fullPage: false });

await browser.close();
console.log('done');
