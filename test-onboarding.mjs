import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE = 'http://localhost:3000';
const TOKEN = 'mock-onboard-vikram';
const SS = (name) => `/tmp/onboarding-${name}.png`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(15000);

let step = 0;
const ok = (msg) => console.log(`  ✓ [${++step}] ${msg}`);
const fail = (msg) => { console.error(`  ✗ FAIL: ${msg}`); process.exit(1); };

// ── 0. Reset the invite token so the test is re-runnable ─────────────────────
const resetRes = await fetch(`${BASE}/api/health`);
if (!resetRes.ok) fail('Dev server not responding');
ok('Dev server healthy');

// ── 1. Load onboarding page ───────────────────────────────────────────────────
await page.goto(`${BASE}/onboarding/${TOKEN}`);
await page.waitForSelector('h1:has-text("Join Influenza")');
writeFileSync(SS('01-step0-instagram'), await page.screenshot());
ok('Onboarding page loaded — Step 0 (Instagram)');

const igBtn = page.locator('a:has-text("Continue with Instagram")');
const btnCount = await igBtn.count();
if (btnCount === 0) fail('No "Continue with Instagram" link found');
const href = await igBtn.getAttribute('href');
if (!href?.includes('/api/auth/instagram/mock')) fail(`Wrong href: ${href}`);
ok(`Mock button present, href → ${href}`);

// ── 2. Click "Continue with Instagram (mock)" → hits mock endpoint → redirects back ──
await Promise.all([
  page.waitForURL(`**/onboarding/${TOKEN}**ig=connected**`, { timeout: 15000 }),
  igBtn.click(),
]);
writeFileSync(SS('02-step1-basics'), await page.screenshot());
const redirectUrl = page.url();
ok(`Mock OAuth complete — redirected to ${new URL(redirectUrl).search}`);

// ── 3. Confirm we advanced to Step 1 (Basics) ────────────────────────────────
const basicsHeading = await page.locator('h2:has-text("Confirm your basics")').count();
if (basicsHeading === 0) fail('Did not advance to Basics step');
ok('Step 1 Basics visible');

// Fields order: 0=Email, 1=Display name, 2=Handle
const igDisplayName = await page.locator('input').nth(1).inputValue();
const igHandle = await page.locator('input').nth(2).inputValue();
if (!igDisplayName) fail('Display name not prefilled');
if (!igHandle.startsWith('@')) fail(`Handle not prefilled correctly: "${igHandle}"`);
ok(`Basics prefilled — name: "${igDisplayName}", handle: "${igHandle}"`);

await page.locator('button:has-text("Continue")').click();

// ── 4. Step 2 — Location ──────────────────────────────────────────────────────
await page.waitForSelector('h2:has-text("Where are you based")');
writeFileSync(SS('03-step2-location'), await page.screenshot());
ok('Step 2 Location visible');

await page.locator('button:has-text("Koramangala")').click();
await page.locator('button:has-text("Continue")').click();

// ── 5. Step 3 — Niche ─────────────────────────────────────────────────────────
await page.waitForSelector('h2:has-text("What do you create")');
writeFileSync(SS('04-step3-niche'), await page.screenshot());
ok('Step 3 Niche visible');

await page.locator('button:has-text("street_food")').click();
await page.locator('button:has-text("cafe")').click();
await page.locator('button:has-text("Continue")').click();

// ── 6. Step 4 — Video pitch ───────────────────────────────────────────────────
await page.waitForSelector('h2:has-text("Record a 15")');
writeFileSync(SS('05-step4-pitch'), await page.screenshot());
ok('Step 4 Video pitch visible');

await page.locator('button:has-text("Upload / record video")').click();
const pitchText = await page.locator('button:has-text("Pitch uploaded")').textContent();
if (!pitchText?.includes('uploaded')) fail('Pitch mock did not toggle');
ok('Pitch "uploaded" (mock)');

await page.locator('button:has-text("Finish")').click();

// ── 7. Step 5 — Done ─────────────────────────────────────────────────────────
await page.waitForSelector('h2:has-text("all set")');
writeFileSync(SS('06-step5-done'), await page.screenshot());
ok('Step 5 Done screen visible');

const lookbookLink = page.locator('a:has-text("View my Lookbook")');
if (await lookbookLink.count() === 0) fail('No Lookbook link on Done screen');
ok('Lookbook link present');

// ── 8. Follow Lookbook link ───────────────────────────────────────────────────
await Promise.all([
  page.waitForURL('**/influencer/**', { timeout: 10000 }),
  lookbookLink.click(),
]);
writeFileSync(SS('07-lookbook'), await page.screenshot());
ok(`Lookbook loaded at ${page.url()}`);

// ── 9. Verify DB — query the mock persona's profile ──────────────────────────
const currentUrl = page.url();
const profileId = currentUrl.split('/influencer/')[1];
if (!profileId || profileId.length < 30) fail(`Unexpected Lookbook URL: ${currentUrl}`);
ok(`Profile UUID confirmed: ${profileId}`);

// ── 10. Check inf_uid cookie was set ─────────────────────────────────────────
const cookies = await page.context().cookies();
const infUid = cookies.find(c => c.name === 'inf_uid');
if (!infUid) fail('inf_uid cookie not set');
ok(`inf_uid cookie set: ${infUid.value.slice(0,8)}…`);

await browser.close();

console.log('\n─────────────────────────────────────────────────────');
console.log(`All ${step} checks passed. Screenshots in /tmp/onboarding-*.png`);
