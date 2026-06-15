import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); // iPhone 14
const page = await ctx.newPage();

async function shot(url, file) {
  await page.goto(`http://localhost:3000${url}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `/tmp/app-${file}.png`, fullPage: false });
  console.log(`✓ ${url} → /tmp/app-${file}.png`);
}

await shot('/', 'home');
await shot('/swipe', 'swipe');
await shot('/influencer/67346359-69f4-4f75-828f-631031699c19', 'lookbook-aisha');
await shot('/onboarding/mock-onboard-deepa', 'onboarding');

await browser.close();
console.log('Done.');
