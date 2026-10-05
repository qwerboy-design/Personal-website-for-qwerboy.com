// QWEROS_PLAYWRIGHT must point to a package matching installed browser revisions.
const { webkit, chromium } = require(process.env.QWEROS_PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QWEROS_BASE_URL || 'http://127.0.0.1:18768';
const output = '/tmp/qweros-mobile-qa';
fs.mkdirSync(output, { recursive: true });
const results = [];
const sizes = [
  ['webkit', webkit, 'iphone', 390, 844],
  ['webkit', webkit, 'small', 320, 568],
  ['webkit', webkit, 'landscape', 844, 390],
  ['chromium', chromium, 'pixel', 393, 851],
];
async function geometry(page) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'horizontal overflow');
  const bounds = await page.locator('#boot-overlay').boundingBox();
  const size = page.viewportSize();
  assert.equal(bounds.width, size.width);
  assert.equal(bounds.height, size.height);
  assert.equal(await page.evaluate(() => Array.from(document.images).some(img => !img.hidden && img.getBoundingClientRect().width > 0 && img.complete && img.naturalWidth === 0)), false, 'visible broken image');
}
async function normal(browser, engine, name, width, height, locale) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.playFailures = [];
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      const result = original.apply(this, args);
      if (result) result.catch(error => window.playFailures.push(error.name + ': ' + error.message));
      return result;
    };
  });
  const path = locale === 'en' ? '/en/login/' : '/login/';
  try {
    await page.goto(base + path + '?replay=1');
    await page.waitForFunction(() => document.querySelector('video').readyState >= 2 || document.querySelector('video').hidden);
    await geometry(page);
    await page.screenshot({ path: `${output}/${engine}-${name}-${locale}-boot.png` });
    const playback = await page.evaluate(() => ({ readyState: document.querySelector('video').readyState, currentTime: document.querySelector('video').currentTime, failures: window.playFailures }));
    if (!playback.failures.length) {
      await page.waitForFunction(() => document.querySelector('video').currentTime > 0, null, { timeout: 3000 });
      playback.currentTime = await page.locator('video').evaluate(video => video.currentTime);
    }
    // Exercise rotation while the overlay remains active.
    if (name === 'iphone') {
      await page.setViewportSize({ width: 844, height: 390 });
      await geometry(page);
      await page.screenshot({ path: `${output}/${engine}-${name}-${locale}-rotated.png` });
      await page.setViewportSize({ width, height });
    }
    await page.waitForFunction(() => document.body.classList.contains('boot-finished'), null, { timeout: 7000 });
    const finishTime = await page.evaluate(() => performance.now());
    assert.ok(finishTime >= 4900 && finishTime < 8000, `automatic finish ${finishTime} ms`);
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#boot-overlay')).opacity === '0');
    await page.screenshot({ path: `${output}/${engine}-${name}-${locale}-login.png` });
    await page.goto(base + path);
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('boot-enabled')), false, 'session replayed');
    await page.goto(base + path + '?replay=1');
    assert.equal(await page.locator('body').evaluate(body => body.classList.contains('boot-enabled')), true, 'explicit replay missing');
    await page.locator('#skip-boot').click();
    assert.equal(await page.locator('#boot-overlay').getAttribute('aria-hidden'), 'true');
    for (const language of ['en', 'zh-TW']) {
      await page.locator(`[data-lang="${language}"]`).click();
      assert.equal(await page.locator('#login').getAttribute('href'), language === 'en' ? '/en/resume/' : '/resume/');
    }
    await page.locator(`[data-lang="${locale === 'en' ? 'en' : 'zh-TW'}"]`).click();
    await page.locator('#login').click();
    await page.waitForURL(url => url.pathname === (locale === 'en' ? '/en/resume/' : '/resume/'));
    assert.deepEqual(errors, []);
    results.push({ engine, name, locale, status: 'PASS', autoplay: playback.failures.length ? 'RESTRICTED_BY_BROWSER' : 'PASS', playback, autoFinishMs: Math.round(finishTime) });
  } finally { await context.close(); }
}
async function fallbacks(browser, engine, reducedMotion = false) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
  const page = await context.newPage();
  const aborted = [];
  if (!reducedMotion) await page.route(/macos-boot-4k\.(mp4|webm|gif)/, route => { aborted.push(route.request().url()); return route.abort(); });
  try {
    await page.goto(base + '/login/?replay=1');
    if (reducedMotion) {
      assert.equal(await page.locator('body').evaluate(body => body.classList.contains('boot-enabled')), false);
      assert.equal(await page.locator('#boot-overlay').isVisible(), false);
    } else {
      await page.waitForFunction(() => document.querySelector('video').hidden && document.querySelector('.boot-fallback').src, null, { timeout: 3000 });
      await page.waitForFunction(() => document.querySelector('.boot-fallback').complete);
      assert.ok(aborted.some(url => url.endsWith('.mp4')));
      assert.ok(aborted.some(url => url.endsWith('.gif')));
      assert.equal(await page.locator('.boot-fallback').isVisible(), false);
      await geometry(page);
      assert.ok(await page.locator('#boot-overlay').evaluate(el => getComputedStyle(el).backgroundImage.includes('macos-boot-poster.jpg')));
      await page.screenshot({ path: `${output}/${engine}-poster-fallback.png` });
      await page.locator('#skip-boot').click();
    }
    if (reducedMotion) await page.screenshot({ path: `${output}/${engine}-reduced-motion.png` });
    results.push({ engine, scenario: reducedMotion ? 'reduced-motion' : 'poster-fallback', status: 'PASS', aborted });
  } finally { await context.close(); }
}
async function touchPlayback(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  try {
    await page.goto(base + '/login/?replay=1');
    await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
    await page.evaluate(() => document.querySelector('#boot-overlay').addEventListener('click', () => {
      const video = document.querySelector('video');
      video.hidden = false;
      video.play();
    }, { once: true }));
    await page.touchscreen.tap(190, 200);
    await page.waitForFunction(() => document.querySelector('video').currentTime > 0, null, { timeout: 3000 });
    const playback = await page.locator('video').evaluate(video => ({ readyState: video.readyState, currentTime: video.currentTime }));
    await page.screenshot({ path: `${output}/webkit-touch-decoding.png` });
    results.push({ engine: 'webkit', scenario: 'touch-decoding', status: 'PASS', playback, limitation: 'Injected trusted-touch playback validates decoding only, not product autoplay.' });
  } finally { await context.close(); }
}
(async () => {
  const browsers = { webkit: await webkit.launch(), chromium: await chromium.launch() };
  try {
    await Promise.all(sizes.flatMap(([engine, , name, width, height]) => ['tw', 'en'].map(locale => normal(browsers[engine], engine, name, width, height, locale).catch(error => results.push({ engine, name, locale, status: 'FAIL', error: error.message })))));
    await Promise.all(Object.entries(browsers).flatMap(([engine, browser]) => [false, true].map(reduced => fallbacks(browser, engine, reduced).catch(error => results.push({ engine, scenario: reduced ? 'reduced-motion' : 'poster-fallback', status: 'FAIL', error: error.message })))));
    await touchPlayback(browsers.webkit).catch(error => results.push({ engine: 'webkit', scenario: 'touch-decoding', status: 'FAIL', error: error.message }));
  } finally { await Promise.all(Object.values(browsers).map(browser => browser.close())); }
  fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  if (results.some(result => result.status === 'FAIL')) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
