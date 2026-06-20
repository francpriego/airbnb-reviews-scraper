/**
 * Felisa's Guesthouse — Airbnb Reviews Embed Widget
 *
 * Usage (paste into any HTML page or Elementor HTML widget):
 *
 *   <script
 *     src="https://YOUR-GITHUB-USERNAME.github.io/airbnb-reviews-scraper/widget.js"
 *     data-url="https://YOUR-GITHUB-USERNAME.github.io/airbnb-reviews-scraper/reviews.json"
 *   ></script>
 *
 * The widget injects its own CSS and renders a horizontal carousel.
 * No other dependencies needed.
 */
(function () {
  'use strict';

  // ── Locate this <script> tag ───────────────────────────────────────────────
  var scriptEl  = document.currentScript;
  var reviewsUrl = (scriptEl && scriptEl.getAttribute('data-url')) || 'reviews.json';

  // ── Inject styles ──────────────────────────────────────────────────────────
  var CSS = `
.fgr-wrap *,.fgr-wrap *::before,.fgr-wrap *::after{box-sizing:border-box;margin:0;padding:0}
.fgr-wrap{width:100%;background:#f5f3ee;font-family:'Libre Franklin',Arial,sans-serif;-webkit-font-smoothing:antialiased;padding:0 0 48px}
.fgr-tabs{display:flex;align-items:center;background:#fff;border-bottom:1px solid #e8e8e8;padding:0 40px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.fgr-tabs::-webkit-scrollbar{display:none}
.fgr-tab{display:flex;align-items:center;gap:8px;padding:16px 20px;font-family:inherit;font-size:13px;font-weight:500;color:#888;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;transition:color .18s,border-color .18s;margin-bottom:-1px}
.fgr-tab:hover{color:#333}
.fgr-tab.is-active{color:#111;border-bottom-color:#111;font-weight:600}
.fgr-tab svg{width:14px;height:14px;flex-shrink:0}
.fgr-header{display:flex;align-items:flex-start;justify-content:space-between;padding:28px 40px 24px;background:#fff;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.fgr-brand{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;color:#111;margin-bottom:8px}
.fgr-brand svg{width:24px;height:24px;fill:#FF5A5F;flex-shrink:0}
.fgr-score-row{display:flex;align-items:center;gap:8px}
.fgr-score-big{font-size:28px;font-weight:700;color:#111;line-height:1}
.fgr-stars-yellow{display:flex;gap:2px}
.fgr-star-y{width:20px;height:20px;fill:#FFB800}
.fgr-review-count{font-size:15px;color:#888;font-weight:400}
.fgr-write-btn{display:inline-flex;align-items:center;background:#2e7d32;color:#fff;font-family:inherit;font-size:13px;font-weight:600;letter-spacing:.04em;padding:12px 24px;border-radius:8px;text-decoration:none;white-space:nowrap;transition:background .18s;flex-shrink:0}
.fgr-write-btn:hover{background:#1f5c24}
.fgr-carousel-outer{position:relative;padding:0 56px}
.fgr-carousel{display:flex;gap:16px;overflow-x:auto;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 2px 8px}
.fgr-carousel::-webkit-scrollbar{display:none}
.fgr-nav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:box-shadow .18s,background .18s}
.fgr-nav:hover{background:#f5f5f5;box-shadow:0 4px 14px rgba(0,0,0,.18)}
.fgr-nav svg{width:18px;height:18px;stroke:#333;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.fgr-nav-prev{left:0}
.fgr-nav-next{right:0}
.fgr-nav:disabled{opacity:.35;cursor:default}
.fgr-card{flex:0 0 280px;background:#fff;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.fgr-card-top{display:flex;align-items:flex-start;gap:12px}
.fgr-avatar-wrap{position:relative;flex-shrink:0}
.fgr-avatar{width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff}
.fgr-verified{position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center}
.fgr-verified svg{width:16px;height:16px}
.fgr-reviewer-name{font-size:14px;font-weight:700;color:#111;line-height:1.2}
.fgr-reviewer-source{display:flex;align-items:center;gap:5px;margin-top:4px;font-size:11.5px;color:#888}
.fgr-reviewer-source svg{width:13px;height:13px;fill:#FF5A5F;flex-shrink:0}
.fgr-card-stars{display:flex;gap:2px}
.fgr-card-star-y{width:16px;height:16px;fill:#FFB800}
.fgr-card-text{font-size:13px;font-weight:300;line-height:1.65;color:#444;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;flex:1}
.fgr-card-text.is-expanded{display:block;-webkit-line-clamp:unset}
.fgr-read-more{font-size:12.5px;font-weight:600;color:#2e7d32;background:none;border:none;padding:0;cursor:pointer;font-family:inherit;text-align:left;transition:color .18s}
.fgr-read-more:hover{color:#1f5c24}
@media(max-width:640px){.fgr-tabs{padding:0 16px}.fgr-header{padding:20px 16px 18px}.fgr-carousel-outer{padding:0 16px}.fgr-card{flex:0 0 240px}.fgr-nav{display:none}}
`;

  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // ── SVG snippets ───────────────────────────────────────────────────────────
  var AIRBNB_SVG = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill="#FF5A5F" d="M16 1C7.716 1 1 7.716 1 16s6.716 15 15 15 15-6.716 15-15S24.284 1 16 1zm0 4c1.86 0 3.37 1.51 3.37 3.37S17.86 11.74 16 11.74 12.63 10.23 12.63 8.37 14.14 5 16 5zm8.25 18.75c-.16.22-.42.35-.69.35H8.44c-.27 0-.53-.13-.69-.35-.16-.22-.19-.5-.09-.75l1.5-4c.74-1.97 2.63-3.29 4.72-3.29h4.24c2.09 0 3.98 1.32 4.72 3.29l1.5 4c.1.25.07.53-.09.75z"/></svg>';
  var CHECK_SVG  = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#00b4d8"/><path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  var STAR_SVG   = '<svg class="fgr-card-star-y" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var HEADER_STAR = '<svg class="fgr-star-y" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

  var COLORS = ['#2e7d32','#1f5c24','#388e3c','#2e7d32','#1a6b1e','#4caf50'];

  // ── Build widget HTML ──────────────────────────────────────────────────────
  function buildWidget(data) {
    var reviews    = data.reviews || [];
    var totalCount = data.total_count || reviews.length;
    var listingUrl = data.listing   || 'https://www.airbnb.com/rooms/17517160';
    var score      = data.score     || '4.93';

    // Container
    var wrap = document.createElement('div');
    wrap.className = 'fgr-wrap';

    // Tab bar
    wrap.innerHTML =
      '<div class="fgr-tabs">' +
        '<button class="fgr-tab is-active">All Reviews <strong style="font-weight:700;margin-left:4px">' + score + '</strong></button>' +
        '<button class="fgr-tab">' + AIRBNB_SVG + 'Guesthouse <strong style="font-weight:700;margin-left:4px">' + score + '</strong></button>' +
      '</div>' +

      '<div class="fgr-header">' +
        '<div>' +
          '<div class="fgr-brand">' + AIRBNB_SVG + 'airbnb Reviews</div>' +
          '<div class="fgr-score-row">' +
            '<span class="fgr-score-big">' + score + '</span>' +
            '<div class="fgr-stars-yellow">' + HEADER_STAR.repeat(5) + '</div>' +
            '<span class="fgr-review-count">(' + totalCount + ')</span>' +
          '</div>' +
        '</div>' +
        '<a href="' + listingUrl + '" target="_blank" rel="noopener" class="fgr-write-btn">View on Airbnb</a>' +
      '</div>' +

      '<div class="fgr-carousel-outer">' +
        '<button class="fgr-nav fgr-nav-prev" id="fgrPrev" aria-label="Previous">' +
          '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</button>' +
        '<div class="fgr-carousel" id="fgrCarousel"></div>' +
        '<button class="fgr-nav fgr-nav-next" id="fgrNext" aria-label="Next">' +
          '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>' +
        '</button>' +
      '</div>';

    var carousel = wrap.querySelector('#fgrCarousel');

    reviews.forEach(function (r, i) {
      var color   = COLORS[i % COLORS.length];
      var initial = (r.name || '?').charAt(0).toUpperCase();
      var meta    = (r.kids ? '👨‍👩‍👧 · ' : '') + (r.date || '');
      var text    = (r.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      var card = document.createElement('div');
      card.className = 'fgr-card';
      card.innerHTML =
        '<div class="fgr-card-top">' +
          '<div class="fgr-avatar-wrap">' +
            '<div class="fgr-avatar" style="background:' + color + '">' + initial + '</div>' +
            '<div class="fgr-verified">' + CHECK_SVG + '</div>' +
          '</div>' +
          '<div>' +
            '<div class="fgr-reviewer-name">' + (r.name || '') + '</div>' +
            '<div class="fgr-reviewer-source">' + AIRBNB_SVG + meta + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fgr-card-stars">' + STAR_SVG.repeat(5) + '</div>' +
        '<p class="fgr-card-text">' + text + '</p>' +
        '<button class="fgr-read-more">Read more</button>';

      // "Read more" toggle
      card.querySelector('.fgr-read-more').addEventListener('click', function () {
        var p = this.previousElementSibling;
        p.classList.toggle('is-expanded');
        this.textContent = p.classList.contains('is-expanded') ? 'Show less' : 'Read more';
      });

      carousel.appendChild(card);
    });

    // Carousel arrows
    var prev   = wrap.querySelector('#fgrPrev');
    var next   = wrap.querySelector('#fgrNext');
    var cardW  = 280 + 16;

    function updateBtns() {
      prev.disabled = carousel.scrollLeft <= 4;
      next.disabled = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 4;
    }

    prev.addEventListener('click', function () { carousel.scrollBy({ left: -cardW * 2, behavior: 'smooth' }); });
    next.addEventListener('click', function () { carousel.scrollBy({ left:  cardW * 2, behavior: 'smooth' }); });
    carousel.addEventListener('scroll', updateBtns);
    setTimeout(updateBtns, 100);

    return wrap;
  }

  // ── Mount placeholder ──────────────────────────────────────────────────────
  var placeholder = document.createElement('div');
  placeholder.style.cssText = 'min-height:200px;display:flex;align-items:center;justify-content:center;color:#aaa;font-family:sans-serif;font-size:13px';
  placeholder.textContent = 'Loading reviews…';

  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.insertBefore(placeholder, scriptEl.nextSibling);
  } else {
    document.body.appendChild(placeholder);
  }

  // ── Fetch reviews.json ─────────────────────────────────────────────────────
  fetch(reviewsUrl)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      var widget = buildWidget(data);
      placeholder.parentNode.replaceChild(widget, placeholder);
    })
    .catch(function (err) {
      placeholder.textContent = 'Reviews unavailable. ' + err.message;
      console.error('[airbnb-reviews-widget]', err);
    });

})();
