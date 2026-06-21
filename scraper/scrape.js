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
const LISTING_URL = (process.env.AIRBNB_LISTING_URL || 'https://www.airbnb.com/rooms/17517160') + (process.env.AIRBNB_LISTING_URL && !process.env.AIRBNB_LISTING_URL.includes('locale') ? '?locale=en' : '');
const OUT_DIR     = path.join(__dirname, '..', 'docs');
const OUT_FILE    = path.join(OUT_DIR, process.env.OUT_FILE || 'reviews.json');

const SKIP_MODAL     = process.env.SKIP_MODAL_SEARCH === 'true'; // skip XPath button search
const SCROLL_STEP    = 700;   // px per scroll inside the modal
const SCROLL_PAUSE   = 1800;  // ms to wait after each scroll
const STABLE_ROUNDS  = 4;     // consecutive unchanged counts = done

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

// Parse reviews from raw HTML without executing browser JS
function parseHtmlReviews(html) {
  const photoRe = /<img[^>]+src="(https?:\/\/[^"]*muscache[^"]*)"[^>]*>/gi;
  const photos = [];
  let pm;
  while ((pm = photoRe.exec(html)) !== null) photos.push(pm[1]);

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:div|p|li|h[1-6]|section|article|header|footer|nav|span)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');

  const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
  const MONTH_RE  = new RegExp(`^(${MONTHS})\\s+\\d{4}$`);
  const RATING_RE = /^Rating,\s+\d+\s+stars?$/i;
  const SKIP_RE   = /^(Translated by Google|Show original|Show more|Read more|Report this review|Report|Translate|Write a review)$/i;
  const META_RE   = /(\d+\s+years? on Airbnb|[A-Z][a-zA-Z\s,\-']+,\s*[A-Z][a-zA-Z\s\-']+)/;

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results = [];
  const seen = new Set();

  for (let i = 0; i < lines.length; i++) {
    if (!RATING_RE.test(lines[i])) continue;
    const name    = lines[i - 2] || '';
    const meta    = lines[i - 1] || '';
    const hasKids = /stayed with kids/i.test(lines[i + 1] || '');
    const dateRaw = lines[i + 3] || '';
    const date    = MONTH_RE.test(dateRaw) ? dateRaw : (lines[i + 4] || '');
    const key = name + '|' + date;
    if (!name || seen.has(key)) continue;
    seen.add(key);

    let textStart = i + 3;
    while (textStart < lines.length && !MONTH_RE.test(lines[textStart])) textStart++;
    textStart++;

    const textLines = [];
    for (let j = textStart; j < lines.length; j++) {
      const l = lines[j];
      if (RATING_RE.test(l) || /^Show all \d+ reviews/i.test(l)) break;
      if (SKIP_RE.test(l) || MONTH_RE.test(l)) continue;
      if (j > textStart + 1 && META_RE.test(l) && l.length < 60) break;
      textLines.push(l);
    }

    results.push({
      name:  name.trim(),
      meta:  meta.replace(/stayed with kids/i, '').trim(),
      date:  date.trim(),
      text:  textLines.join(' ').trim().replace(/\s*Response from\s[\s\S]*/i, '').trim(),
      kids:  hasKids,
      photo: '',
    });
  }

  // Assign user avatar photos (prefer /user/ paths)
  const userPhotos = photos.filter(p => /\/user\//i.test(p) || /im_w=120/.test(p));
  const photoPool  = userPhotos.length >= results.length ? userPhotos : photos;
  results.forEach((r, idx) => { if (!r.photo && photoPool[idx]) r.photo = photoPool[idx]; });

  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('Launching browser (stealth mode)...');

  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 180_000,
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

    // ── Network interception: capture Airbnb's own review API calls ───────────
    const interceptedReviews = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (!url.includes('airbnb') && !url.includes('muscache')) return;
      if (!url.includes('review') && !url.includes('Review')) return;
      try {
        const ct = response.headers()['content-type'] || '';
        if (!ct.includes('json')) return;
        const json = await response.json().catch(() => null);
        if (!json) return;
        // Airbnb v2 API: {reviews: [...]}
        if (Array.isArray(json.reviews) && json.reviews.length) {
          interceptedReviews.push(...json.reviews);
          log(`  Intercepted ${json.reviews.length} reviews from API`);
        }
        // Airbnb v3 / StaysPdpReviewsQuery: deeper structure
        const nested = json?.data?.presentation?.stayProductDetailPage?.sections?.metadata?.reviewDetails?.reviewHighlights?.reviews
          || json?.data?.presentation?.stayProductDetailPage?.sections?.sbuiData?.sectionData?.reviewDetails?.reviews;
        if (Array.isArray(nested) && nested.length) {
          interceptedReviews.push(...nested);
          log(`  Intercepted ${nested.length} reviews from GraphQL`);
        }
      } catch (_) {}
    });

    // ── 1. Open listing ───────────────────────────────────────────────────────
    log(`Opening ${LISTING_URL} ...`);
    await page.goto(LISTING_URL, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(5000); // let JS-rendered content finish loading
    await sleep(3000);

    // Race XPath queries with a 6s timeout so heavy pages don't hang
    let hasModal = false;

    if (!SKIP_MODAL) {
      const xpathRace = (query) => Promise.race([
        page.$x(query),
        new Promise(r => setTimeout(() => r([]), 6000))
      ]);

      // Dismiss cookie banner and translation popup
      try {
        const [cookieBtn] = await xpathRace("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'only necessary') or contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'accept all')]");
        if (cookieBtn) { await cookieBtn.click(); await sleep(800); }
      } catch (_) {}

      await page.keyboard.press('Escape');
      await sleep(500);

      try {
        const [closeBtn] = await xpathRace("//button[@aria-label='Close' or @aria-label='close' or @aria-label='Dismiss']");
        if (closeBtn) { await closeBtn.click(); await sleep(500); }
      } catch (_) {}

      // ── 2. Find & click "Show all X reviews" ───────────────────────────────
      log('Looking for "Show all reviews" button...');
      const [showAllBtn] = await xpathRace("//button[contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'show all') and contains(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'review')]");
      hasModal = !!showAllBtn;

      if (hasModal) {
        await showAllBtn.evaluate(el => el.scrollIntoView({ block: 'center' }));
        await sleep(500);
        await showAllBtn.click();
        log('Clicked "Show all reviews". Waiting for modal...');
        await sleep(2500);
      }
    } else {
      log('Skipping modal search (SKIP_MODAL_SEARCH=true) — inline review mode');
    }

    if (hasModal) {
      // ── 3. Wait for modal ───────────────────────────────────────────────────
      await page.waitForSelector('[role="dialog"]', { timeout: 15_000 });
      log('Modal opened.');

      // ── 4. Scroll modal ─────────────────────────────────────────────────────
      log('Scrolling modal to load all reviews...');
      const FIXED_SCROLLS = 30;
      for (let s = 0; s < FIXED_SCROLLS; s++) {
        await page.evaluate((step) => {
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return;
          const scrollable = [...modal.querySelectorAll('*')].find(el => {
            const cs = window.getComputedStyle(el);
            return (cs.overflowY === 'auto' || cs.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
          }) || modal;
          scrollable.scrollTop += step;
        }, SCROLL_STEP);
        await sleep(SCROLL_PAUSE);
        log(`  Scroll ${s + 1}/${FIXED_SCROLLS}`);
      }
    } else {
      log('No "Show all reviews" button — scraping reviews directly from page...');
      // Use mouse.wheel (Input CDP, no JS eval) so heavy pages don't block
      for (let s = 0; s < 12; s++) {
        await page.mouse.wheel({ deltaY: 800 }).catch(() => {});
        await sleep(600);
        log(`  Page scroll ${s + 1}/12`);
      }
    }

    log(`Finished scrolling. Extracting reviews...`);

    // ── 5a. No-modal: extract via CDP DOM (avoids JS eval on heavy pages) ────
    let reviews;
    if (!hasModal) {
      const cdpClient = await page.createCDPSession();
      try {
        await cdpClient.send('DOM.enable');
        const domDoc = await cdpClient.send('DOM.getDocument');
        const {outerHTML} = await cdpClient.send('DOM.getOuterHTML', {nodeId: domDoc.root.nodeId});
        reviews = parseHtmlReviews(outerHTML);
      } finally {
        await cdpClient.detach().catch(() => {});
      }
      log(`Extracted ${reviews.length} reviews.`);
      if (reviews.length === 0) throw new Error('No reviews found via DOM extraction.');
    } else {

    // ── 5b. Modal: extract via page.evaluate ─────────────────────────────────
    reviews = await page.evaluate((useModal) => { // eslint-disable-line
      const root = (useModal && document.querySelector('[role="dialog"]')) || document.body;

      const results = [];

      /**
       * Strategy: walk all text nodes / structured children.
       * Airbnb renders reviews roughly as:
       *   <img>  avatar photo
       *   <h3>   Name
       *   <div>  "X years on Airbnb" | "City, Country"
       *   <span> "October 2024"
       *   <svg>  stars
       *   <span> review text
       *
       * We also fall back to body-text line parsing if the structured approach
       * returns fewer than 6 reviews.
       */

      // ── Helper: find avatar photo near an element ─────────────────────────
      function findAvatar(el) {
        let node = el;
        for (let i = 0; i < 8; i++) {
          if (!node.parentElement) break;
          node = node.parentElement;
          // Try any img inside this container
          const imgs = node.querySelectorAll('img');
          for (const img of imgs) {
            const src = img.src || img.getAttribute('data-src') || '';
            if (src && (src.includes('muscache') || src.includes('airbnb') || src.includes('picture'))) {
              return src;
            }
            // Try srcset
            const srcset = img.getAttribute('srcset') || '';
            const firstSrc = srcset.split(',')[0].trim().split(' ')[0];
            if (firstSrc && (firstSrc.includes('muscache') || firstSrc.includes('airbnb'))) {
              return firstSrc;
            }
          }
        }
        return '';
      }

      // ── Structured extraction ─────────────────────────────────────────────
      const seen = new Set();

      function tryStructured() {
        const nameEls = [...root.querySelectorAll('h3')].filter(h => h.textContent.trim().length > 0);

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

          const photo = findAvatar(nameEl);
          results.push({ name, meta, date, text: '', kids: false, photo });
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

        const raw = root.innerText || '';
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

              const text = textLines.join(' ').trim().replace(/\s*Response from\s[\s\S]*/i, '').trim();

              results.push({
                name:  name.trim(),
                meta:  meta.replace(/stayed with kids/i, '').trim(),
                date:  date.trim(),
                text:  text,
                kids:  hasKids,
                photo: '',   // filled in by DOM photo pass below
              });
            }
          }
          i++;
        }
      }

      // ── DOM photo pass ────────────────────────────────────────────────────
      // Try h3, then any element whose text exactly matches a reviewer name.
      {
        const allEls = [...root.querySelectorAll('*')];
        for (const entry of results) {
          if (entry.photo) continue;
          const match = allEls.find(el =>
            el.children.length === 0 &&
            el.textContent.trim() === entry.name
          );
          if (match) entry.photo = findAvatar(match);
        }
      }

      // Last resort: grab all muscache imgs in modal order and assign sequentially
      if (results.every(r => !r.photo)) {
        const allImgs = [...root.querySelectorAll('img')].filter(img => {
          const s = img.src || '';
          return s.includes('muscache') || s.includes('airbnb');
        });
        allImgs.forEach((img, i) => {
          if (results[i]) results[i].photo = img.src;
        });
      }

      // ── Fill in text for structured results ───────────────────────────────
      // (If structured extracted names but no text, do another pass)
      if (results.length > 0 && results.every(r => !r.text)) {
        const raw   = root.innerText || '';
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
    }, hasModal); // end page.evaluate

    log(`Extracted ${reviews.length} reviews.`);
    } // end else (hasModal)

    // Fallback: use network-intercepted API data if extraction got nothing
    if ((!reviews || reviews.length === 0) && interceptedReviews.length > 0) {
      log(`Using ${interceptedReviews.length} intercepted API reviews as fallback`);
      reviews = interceptedReviews.map(r => ({
        name:  r.reviewer?.first_name || r.author?.name || r.reviewerName || 'Guest',
        meta:  r.reviewer?.location || r.author?.meta || '',
        date:  r.localized_date || r.created_at || '',
        text:  (r.comments || r.localizedReview || r.body || '').replace(/\s*Response from\s[\s\S]*/i, '').trim(),
        kids:  false,
        photo: r.reviewer?.picture_url || r.author?.pictureUrl || '',
      }));
    }

    if (!reviews || reviews.length === 0) {
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
