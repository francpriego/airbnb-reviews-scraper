/**
 * Airbnb Reviews Scraper
 * Fetches all reviews from an Airbnb listing and saves to docs/reviews.json
 *
 * Usage:  node scrape.js
 * Env:    AIRBNB_LISTING_URL  (optional, defaults to the listing below)
 */

const puppeteer   = require('puppeteer-extra');
const Stealth     = require('puppeteer-extra-plugin-stealth');
const fs          = require('fs');
const path        = require('path');

puppeteer.use(Stealth());

// ── Config ────────────────────────────────────────────────────────────────────
const LISTING_URL = process.env.AIRBNB_LISTING_URL || 'https://www.airbnb.com/rooms/17517160';
const OUT_DIR     = path.join(__dirname, '..', 'docs');
const OUT_FILE    = path.join(OUT_DIR, 'reviews.json');

const SCROLL_STEP    = 700;   // px per scroll inside the modal
const SCROLL_PAUSE   = 1800;  // ms to wait after each scroll
const STABLE_ROUNDS  = 4;     // consecutive unchanged counts = done

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('Launching browser (stealth mode)...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--lang=en-US,en',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    // Mask webdriver flag
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // ── 1. Open listing ───────────────────────────────────────────────────────
    log(`Opening ${LISTING_URL} ...`);
    await page.goto(LISTING_URL, { waitUntil: 'networkidle2', timeout: 90_000 });
    await sleep(3000);

    // Dismiss any "translate page" or cookie banner
    await page.keyboard.press('Escape');
    await sleep(500);

    // ── 2. Find & click "Show all X reviews" ─────────────────────────────────
    log('Looking for "Show all reviews" button...');

    const showAllBtn = await page.evaluateHandle(() => {
      const btns = [...document.querySelectorAll('button')];
      return btns.find(b => /show all \d+ review/i.test(b.textContent));
    });

    if (!showAllBtn || !(await showAllBtn.evaluate(el => el instanceof HTMLElement))) {
      throw new Error('Could not find "Show all reviews" button. Airbnb may have changed their layout.');
    }

    await showAllBtn.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await sleep(500);
    await showAllBtn.click();
    log('Clicked "Show all reviews". Waiting for modal...');
    await sleep(2500);

    // ── 3. Wait for modal ─────────────────────────────────────────────────────
    await page.waitForSelector('[role="dialog"]', { timeout: 15_000 });
    log('Modal opened.');

    // ── 4. Scroll modal until all reviews are loaded ──────────────────────────
    log('Scrolling modal to load all reviews...');

    let prevCount  = 0;
    let stable     = 0;
    let totalScrolls = 0;

    while (stable < STABLE_ROUNDS) {
      // Count review items currently in the modal
      const count = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return 0;
        // Airbnb renders each review in an <li> or a div with a heading (reviewer name)
        // We use the h3 reviewer-name headings as the count signal
        const headings = modal.querySelectorAll('h3, [data-testid="review-presenter"]');
        return headings.length;
      });

      log(`  Reviews loaded: ${count}  (stable rounds: ${stable}/${STABLE_ROUNDS})`);

      if (count === prevCount) {
        stable++;
      } else {
        stable  = 0;
        prevCount = count;
      }

      // Scroll the modal's scrollable container
      await page.evaluate((step) => {
        const modal = document.querySelector('[role="dialog"]');
        if (!modal) return;
        // Find the scrollable child (usually the first overflow-y: auto child)
        const scrollable = [...modal.querySelectorAll('*')].find(el => {
          const s = window.getComputedStyle(el);
          return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
        }) || modal;
        scrollable.scrollTop += step;
      }, SCROLL_STEP);

      await sleep(SCROLL_PAUSE);
      totalScrolls++;

      // Safety exit after 60 scrolls (~60 * 700px = 42 000px of scrolling)
      if (totalScrolls > 60) {
        log('Reached scroll limit — stopping.');
        break;
      }
    }

    log(`Finished scrolling. Extracting reviews...`);

    // ── 5. Extract review data ────────────────────────────────────────────────
    const reviews = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return [];

      const results = [];

      /**
       * Strategy: walk all text nodes / structured children.
       * Airbnb renders reviews roughly as:
       *   <div> avatar </div>
       *   <h3> Name </h3>
       *   <div> "X years on Airbnb" | "City, Country" </div>
       *   <span> "October 2024" </span>
       *   <svg …> (stars, usually 5)
       *   <span> review text </span>
       *
       * We also fall back to body-text line parsing if the structured approach
       * returns fewer than 6 reviews.
       */

      // ── Structured extraction ─────────────────────────────────────────────
      const cards = modal.querySelectorAll('[data-testid="review-presenter"], [aria-label*="review"], section > div > div');

      const seen = new Set();

      function tryStructured() {
        // Find each reviewer by their h3 name heading
        const nameEls = [...modal.querySelectorAll('h3')].filter(h => {
          const p = h.closest('[role="dialog"]');
          return p && h.textContent.trim().length > 0;
        });

        for (const nameEl of nameEls) {
          const name = nameEl.textContent.trim();
          if (!name || name.length > 60) continue;

          // Walk siblings / parent children after the name heading
          const parent = nameEl.parentElement;
          const children = parent ? [...parent.parentElement?.children || []] : [];

          // Find the container that holds this review block
          let container = nameEl;
          for (let i = 0; i < 5; i++) {
            if (container.parentElement) container = container.parentElement;
            const text = container.textContent;
            if (text.length > 200) break;
          }

          const containerText = container.textContent || '';

          // Extract date (e.g. "October 2024")
          const dateMatch = containerText.match(
            /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/
          );
          const date = dateMatch ? dateMatch[0] : '';

          // Extract member info (e.g. "8 years on Airbnb" or "Davao, Philippines")
          const metaMatch = containerText.match(/(\d+\s+years? on Airbnb|[A-Z][a-z]+(?:[\s,]+[A-Za-z]+)*,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
          const meta = metaMatch ? metaMatch[0] : '';

          const key = name + '|' + date;
          if (seen.has(key)) continue;

          results.push({ name, meta, date, text: '', kids: false });
          seen.add(key);
        }
      }

      tryStructured();

      // ── Body-text fallback (line-by-line parser) ──────────────────────────
      // This is the same approach that successfully extracted 24 reviews earlier.
      if (results.length < 6) {
        results.length = 0;
        seen.clear();

        const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
        const MONTH_RE   = new RegExp(`^(${MONTHS})\\s+\\d{4}$`);
        const RATING_RE  = /^Rating,\s+\d+\s+stars?$/i;
        const META_RE    = /(\d+\s+years? on Airbnb|[A-Z][a-zA-ZéàâüöäÀ-ɏ'`\-\s]+,\s*[A-Z][a-zA-ZéàâüöäÀ-ɏ'`\-\s]+)/;
        const SKIP_RE    = /^(Translated by Google|Show original|Show more|Read more|Report this review|Report|Translate|Write a review|^$)/i;

        const raw = modal.innerText || '';
        const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

        let i = 0;
        while (i < lines.length) {
          if (RATING_RE.test(lines[i])) {
            const name    = lines[i - 2] || '';
            const meta    = lines[i - 1] || '';
            const hasKids = /stayed with kids/i.test(lines[i + 1] || '');
            const dateRaw = lines[i + 3] || '';
            const date    = MONTH_RE.test(dateRaw) ? dateRaw : (lines[i + 4] || '');

            const key = name + '|' + date;
            if (name && !seen.has(key)) {
              seen.add(key);

              // Collect review text lines
              let textStart = i + 3;
              while (textStart < lines.length && !MONTH_RE.test(lines[textStart])) textStart++;
              textStart++;

              const textLines = [];
              let j = textStart;
              while (j < lines.length) {
                const l = lines[j];
                if (RATING_RE.test(l)) break;           // next review
                if (/^Show all \d+ reviews/i.test(l)) break;
                if (SKIP_RE.test(l)) { j++; continue; }
                if (MONTH_RE.test(l)) { j++; continue; }
                // Stop if we hit what looks like the next reviewer's name+meta
                if (j > textStart + 1 && META_RE.test(l) && l.length < 60) break;
                textLines.push(l);
                j++;
              }

              const text = textLines.join(' ').trim();

              results.push({
                name:  name.trim(),
                meta:  meta.replace(/stayed with kids/i, '').trim(),
                date:  date.trim(),
                text:  text,
                kids:  hasKids,
              });
            }
          }
          i++;
        }
      }

      // ── Fill in text for structured results ───────────────────────────────
      // (If structured extracted names but no text, do another pass)
      if (results.length > 0 && results.every(r => !r.text)) {
        const raw   = modal.innerText || '';
        const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
        const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
        const RATING_RE = /^Rating,\s+\d+\s+stars?$/i;
        const MONTH_RE  = new RegExp(`^(${MONTHS})\\s+\\d{4}$`);
        const SKIP_RE   = /^(Translated|Show original|Show more|Read more|Report|Translate|Write|^$)/i;
        const META_RE   = /(\d+\s+years? on Airbnb|[A-Z][a-zA-Z\s,]+)/;

        for (let i = 0; i < lines.length; i++) {
          if (!RATING_RE.test(lines[i])) continue;
          const name = lines[i - 2]?.trim() || '';
          const date = [lines[i+3], lines[i+4]].find(l => MONTH_RE.test(l || '')) || '';
          const entry = results.find(r => r.name === name && r.date === date);
          if (!entry || entry.text) continue;

          let textStart = i + 3;
          while (textStart < lines.length && !MONTH_RE.test(lines[textStart])) textStart++;
          textStart++;

          const textLines = [];
          for (let j = textStart; j < lines.length; j++) {
            const l = lines[j];
            if (RATING_RE.test(l)) break;
            if (SKIP_RE.test(l) || MONTH_RE.test(l)) continue;
            if (j > textStart + 1 && META_RE.test(l) && l.length < 60) break;
            textLines.push(l);
          }
          entry.text = textLines.join(' ').trim();
        }
      }

      return results;
    });

    log(`Extracted ${reviews.length} reviews.`);

    if (reviews.length === 0) {
      throw new Error('No reviews found. Airbnb may have changed their HTML structure.');
    }

    // ── 6. Save output ────────────────────────────────────────────────────────
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    const output = {
      listing:    LISTING_URL,
      scraped_at: new Date().toISOString(),
      count:      reviews.length,
      reviews,
    };

    fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
    log(`Saved → ${OUT_FILE}`);

  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
