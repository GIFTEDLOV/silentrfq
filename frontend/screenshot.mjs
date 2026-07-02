import puppeteer from 'puppeteer-core';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'C:\\Users\\DELL\\silentrfq\\frontend\\docs\\screenshots\\dark-ui-review';

const PAGES = [
  { name: '01-home',       url: 'http://localhost:3000' },
  { name: '02-rfqs',       url: 'http://localhost:3000/rfqs' },
  { name: '03-create',     url: 'http://localhost:3000/create' },
  { name: '04-rfq-detail', url: 'http://localhost:3000/rfq/0x6272ea767fa6e6668173F5a4D532885ce1D2502E' },
];

async function scrollToReveal(page) {
  // Scroll incrementally so IntersectionObserver fires for every section.
  // Exit when window.scrollY + innerHeight reaches scrollHeight (actual bottom).
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const distance = 100;
      const intervalMs = 60; // slow enough for IO to fire
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        const atBottom =
          window.scrollY + window.innerHeight >= document.body.scrollHeight - 2;
        if (atBottom) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, intervalMs);
    });
  });
  // max stagger delay (200ms) + transition (600ms) + buffer = 1500ms
  await new Promise(r => setTimeout(r, 1500));
}

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
  defaultViewport: { width: 1440, height: 900 },
});

for (const { name, url } of PAGES) {
  console.log(`Capturing: ${url}`);
  const page = await browser.newPage();
  page.on('pageerror', () => {});
  page.on('requestfailed', () => {});

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 40000 });
  } catch {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (e) {
      console.log(`  Failed to load: ${e.message}`);
    }
  }

  // Let initial paint and above-fold animations settle
  await new Promise(r => setTimeout(r, 1500));

  // Scroll through the page to trigger all IntersectionObservers
  await scrollToReveal(page);

  const path = `${OUT}\\${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log(`  Saved: ${path}`);
  await page.close();
}

await browser.close();
console.log('All done.');
