/**
 * Felisa's Guesthouse — Airbnb Reviews Embed Widget
 *
 * Usage:
 *   <script
 *     src="https://francpriego.github.io/airbnb-reviews-scraper/widget.js"
 *     data-url="https://francpriego.github.io/airbnb-reviews-scraper/reviews.json"
 *     data-url2="https://francpriego.github.io/airbnb-reviews-scraper/reviews2.json"
 *     data-url3="https://francpriego.github.io/airbnb-reviews-scraper/reviews3.json"
 *   ></script>
 */
(function () {
  'use strict';

  var scriptEl    = document.currentScript;
  var reviewsUrl  = (scriptEl && scriptEl.getAttribute('data-url'))  || 'reviews.json';
  var reviewsUrl2 = (scriptEl && scriptEl.getAttribute('data-url2')) || '';
  var reviewsUrl3 = (scriptEl && scriptEl.getAttribute('data-url3')) || '';

  /* ── Inject CSS ──────────────────────────────────────────────────────────── */
  var CSS = `
.fgr-wrap*,.fgr-wrap *::before,.fgr-wrap *::after{box-sizing:border-box;margin:0;padding:0}
.fgr-wrap{width:100%;background:#f5f3ee;font-family:'Libre Franklin',Arial,sans-serif;-webkit-font-smoothing:antialiased;padding:0 0 48px}
.fgr-tabs{display:flex;align-items:center;background:#fff;border-bottom:1px solid #e8e8e8;padding:0 40px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.fgr-tabs::-webkit-scrollbar{display:none}
.fgr-tab{display:flex;align-items:center;gap:8px;padding:16px 20px;font-family:inherit;font-size:13px;font-weight:500;color:#888;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;transition:color .18s,border-color .18s;margin-bottom:-1px}
.fgr-tab:hover{color:#333}
.fgr-tab.is-active{color:#111;border-bottom-color:#111;font-weight:600}
.fgr-tab img{width:14px;height:14px;flex-shrink:0;object-fit:contain}
.fgr-header{display:flex;align-items:flex-start;justify-content:space-between;padding:28px 40px 24px;background:#fff;margin-bottom:24px;gap:16px;flex-wrap:wrap}
.fgr-brand{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;color:#111;margin-bottom:8px}
.fgr-score-row{display:flex;align-items:center;gap:8px}
.fgr-score-big{font-size:28px;font-weight:700;color:#111;line-height:1}
.fgr-stars-yellow{display:flex;gap:2px}
.fgr-star-y{width:20px;height:20px;fill:#FFB800}
.fgr-review-count{font-size:15px;color:#888;font-weight:400}
.fgr-action-btn{display:inline-flex;align-items:center;background:#2e7d32;color:#fff!important;font-family:inherit;font-size:13px;font-weight:600;letter-spacing:.04em;padding:12px 24px;border-radius:8px;text-decoration:none!important;white-space:nowrap;transition:background .18s;flex-shrink:0;border:none!important;cursor:pointer;box-shadow:none!important}
.fgr-action-btn:hover,.fgr-action-btn:focus,.fgr-action-btn:active{background:#1f5c24!important;color:#fff!important;box-shadow:none!important}
.fgr-carousel-outer{position:relative;padding:0 56px}
.fgr-carousel{display:flex;gap:16px;overflow-x:auto;scroll-behavior:smooth;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 2px 8px}
.fgr-carousel::-webkit-scrollbar{display:none}
.fgr-nav{position:absolute;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:box-shadow .18s,background .18s}
.fgr-nav:hover{background:#f5f5f5;box-shadow:0 4px 14px rgba(0,0,0,.18)}
.fgr-nav svg{width:18px;height:18px;stroke:#333;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.fgr-nav-prev{left:0}.fgr-nav-next{right:0}
.fgr-nav:disabled{opacity:.35;cursor:default}
.fgr-card{flex:0 0 280px;background:#fff;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.fgr-card-top{display:flex;align-items:center;gap:14px}
.fgr-avatar-wrap{position:relative;flex-shrink:0;width:56px;height:56px}
.fgr-avatar{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff}
.fgr-avatar-wrap>img{width:56px;height:56px;border-radius:50%;object-fit:cover;display:block}
.fgr-avatar-badge{position:absolute;bottom:-4px;right:-4px;width:22px;height:22px;display:flex;align-items:center;justify-content:center}
.fgr-avatar-badge img{width:16px;height:16px;object-fit:contain;display:block}
.fgr-reviewer-name{font-size:15px;font-weight:700;color:#111;line-height:1.2}
.fgr-reviewer-source{display:flex;align-items:center;gap:5px;font-size:12px;color:#666}
.fgr-reviewer-source img{width:18px;height:18px;object-fit:contain;flex-shrink:0}
.fgr-card-stars{display:flex;gap:2px}
.fgr-card-star-y{width:16px;height:16px;fill:#FFB800}
.fgr-card-text{font-size:13px;font-weight:300;line-height:1.65;color:#444;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;flex:1}
.fgr-read-more{font-size:12.5px;font-weight:600;color:#2e7d32;background:none!important;border:none!important;padding:0!important;cursor:pointer;font-family:inherit;text-align:left;transition:color .18s;box-shadow:none!important;outline:none!important}
.fgr-read-more:hover,.fgr-read-more:focus,.fgr-read-more:active{color:#2e7d32!important;background:none!important;border:none!important;box-shadow:none!important;outline:none!important}

/* ── Listing panels ── */
.fgr-panel{display:none}.fgr-panel.is-active{display:block}

/* ── Modal ── */
.fgr-overlay{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:24px;animation:fgrFadeIn .2s ease}
.fgr-overlay.is-open{display:flex}
@keyframes fgrFadeIn{from{opacity:0}to{opacity:1}}
.fgr-modal{background:#fff;border-radius:16px;width:100%;max-width:620px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.25);animation:fgrSlideUp .25s ease}
@keyframes fgrSlideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
.fgr-modal-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #e8e8e8;flex-shrink:0;gap:8px}
.fgr-modal-icon-btn{width:36px;height:36px;border-radius:50%;background:none;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .18s;flex-shrink:0;font-family:inherit;font-size:17px;color:#444}
.fgr-modal-icon-btn:hover{background:#f5f5f5}
.fgr-modal-icon-btn svg{width:18px;height:18px;stroke:#333;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.fgr-modal-tabs{display:flex;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;flex:1}
.fgr-modal-tabs::-webkit-scrollbar{display:none}
.fgr-modal-tab{display:flex;align-items:center;gap:6px;padding:10px 16px;font-family:inherit;font-size:13px;font-weight:500;color:#888;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;flex-shrink:0}
.fgr-modal-tab.is-active{color:#111;border-bottom-color:#111;font-weight:700}
.fgr-modal-header{display:flex;align-items:flex-start;justify-content:space-between;padding:20px 24px 16px;flex-shrink:0;gap:12px;flex-wrap:wrap;border-bottom:1px solid #f0f0f0}
.fgr-modal-brand{display:flex;align-items:center;gap:8px;font-size:22px;font-weight:800;color:#111;margin-bottom:10px;letter-spacing:-.01em}
.fgr-modal-score-row{display:flex;align-items:center;gap:10px}
.fgr-modal-score-big{font-size:32px;font-weight:700;color:#111;line-height:1}
.fgr-modal-stars{display:flex;gap:3px}
.fgr-modal-star{width:24px;height:24px;fill:#FFB800}
.fgr-modal-count{font-size:15px;color:#888}
.fgr-modal-body{overflow-y:auto;flex:1;padding:0 24px;-webkit-overflow-scrolling:touch}
.fgr-modal-review{display:flex;flex-direction:column;gap:10px;padding:20px 0;border-bottom:1px solid #f0f0f0}
.fgr-modal-review:last-child{border-bottom:none}
.fgr-modal-reviewer{display:flex;align-items:center;gap:12px}
.fgr-modal-avatar{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#fff;flex-shrink:0}
.fgr-modal-name-row{display:flex;align-items:center;gap:5px;font-size:14px;font-weight:700;color:#111}
.fgr-modal-meta{display:flex;align-items:center;gap:5px;font-size:12px;color:#888;margin-top:2px}
.fgr-modal-meta img{width:12px;height:12px;object-fit:contain}
.fgr-modal-date{font-size:11px;color:#aaa;margin-top:2px}
.fgr-modal-review-stars{display:flex;gap:2px}
.fgr-modal-review-star{width:14px;height:14px;fill:#FFB800}
.fgr-modal-review-text{font-size:13.5px;font-weight:300;line-height:1.7;color:#333}

@media(max-width:640px){
  .fgr-tabs{padding:0 16px}.fgr-header{padding:20px 16px 18px}
  .fgr-carousel-outer{padding:0 16px}.fgr-card{flex:0 0 240px}.fgr-nav{display:none}
  .fgr-overlay{padding:0;align-items:flex-end}
  .fgr-modal{border-radius:16px 16px 0 0;max-height:92vh}
}
`;

  var style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── SVGs / assets ───────────────────────────────────────────────────────── */
  var AIRBNB      = '<img src="https://felisa.franciscopriego.com/wp-content/uploads/2026/06/airbnblogo3.png" alt="Airbnb" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;flex-shrink:0">';
  var AIRBNB_LOGO = '<img src="https://felisa.franciscopriego.com/wp-content/uploads/2026/06/airbnblogo3.png" alt="Airbnb" style="height:36px;width:auto;object-fit:contain;flex-shrink:0">';
  var CHECK  = '<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="10" fill="#2e7d32"/><path d="M5.5 10l3 3 6-6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
  var CSTAR  = '<svg class="fgr-card-star-y" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var HSTAR  = '<svg class="fgr-star-y" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var MSTAR  = '<svg class="fgr-modal-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var RSTAR  = '<svg class="fgr-modal-review-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
  var BACK   = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
  var PREV   = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
  var NEXT   = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';

  var COLORS = ['#2e7d32','#1f5c24','#388e3c','#2e7d32','#1a6b1e','#4caf50'];

  /* ── Build review cards + modal rows for one listing ─────────────────────── */
  function buildCards(reviews, carousel, modalBody, prefix, openModal) {
    reviews.forEach(function (r, i) {
      var color   = COLORS[i % COLORS.length];
      var initial = (r.name || '?').charAt(0).toUpperCase();
      var name    = r.name || '';
      var meta    = r.meta || '';
      var date    = r.date || '';
      var text    = r.text || '';
      var kids    = r.kids || false;
      var photo   = r.photo || '';

      var cardAvatarHtml = photo
        ? '<img src="' + photo + '" alt="' + name + '">'
        : '<div class="fgr-avatar" style="background:' + color + '">' + initial + '</div>';

      var modalAvatarHtml = photo
        ? '<img src="' + photo + '" alt="' + name + '" style="width:52px;height:52px;border-radius:50%;object-fit:cover;display:block;flex-shrink:0">'
        : '<div class="fgr-modal-avatar" style="background:' + color + '">' + initial + '</div>';

      var card = document.createElement('div');
      card.className = 'fgr-card';
      card.innerHTML =
        '<div class="fgr-card-top">' +
          '<div class="fgr-avatar-wrap">' +
            cardAvatarHtml +
            '<div class="fgr-avatar-badge">' + AIRBNB + '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:4px;justify-content:center">' +
            '<div class="fgr-reviewer-name" style="display:flex;align-items:center;gap:5px">' + name + CHECK + '</div>' +
            '<div class="fgr-reviewer-source">' + date + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fgr-card-stars">' + CSTAR.repeat(5) + '</div>' +
        '<p class="fgr-card-text">' + text + '</p>' +
        '<button class="fgr-read-more" data-idx="' + i + '" data-prefix="' + prefix + '">Read more</button>';

      card.querySelector('.fgr-read-more').addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-idx'));
        var p   = this.getAttribute('data-prefix');
        openModal(p, idx);
      });
      carousel.appendChild(card);

      var row = document.createElement('div');
      row.className = 'fgr-modal-review';
      row.id = prefix + 'R' + i;
      row.innerHTML =
        '<div class="fgr-modal-reviewer">' +
          modalAvatarHtml +
          '<div>' +
            '<div class="fgr-modal-name-row">' + name + CHECK + '</div>' +
            '<div class="fgr-modal-meta">' + AIRBNB + (kids ? '👨‍👩‍👧 Stayed with kids · ' : '') + meta + '</div>' +
            '<div class="fgr-modal-date">' + date + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fgr-modal-review-stars">' + RSTAR.repeat(5) + '</div>' +
        '<p class="fgr-modal-review-text">' + text + '</p>';

      modalBody.appendChild(row);
    });
  }

  /* ── Build full widget with 1 or 2 listing tabs ──────────────────────────── */
  function buildWidget(datasets) {
    var wrap = document.createElement('div');
    wrap.className = 'fgr-wrap';

    /* Tab labels */
    var tabLabels = ['Guesthouse', 'Garden House', 'Studio Unit'];
    var tabScores = datasets.map(function (d) { return d.score || '4.93'; });
    var tabCounts = datasets.map(function (d) { return (d.total_count || (d.reviews || []).length); });

    /* ── Tab bar ── */
    var tabBar = document.createElement('div');
    tabBar.className = 'fgr-tabs';
    datasets.forEach(function (d, ti) {
      var btn = document.createElement('button');
      btn.className = 'fgr-tab' + (ti === 0 ? ' is-active' : '');
      btn.innerHTML = AIRBNB + ' ' + tabLabels[ti] + ' <strong style="margin-left:4px">' + tabScores[ti] + '</strong>';
      tabBar.appendChild(btn);
    });
    wrap.appendChild(tabBar);

    /* ── One panel per listing ── */
    var panels = [];
    var carousels = [];
    var modalBodies = [];
    var overlays = [];

    datasets.forEach(function (data, ti) {
      var reviews    = data.reviews    || [];
      var totalCount = tabCounts[ti];
      var listingUrl = data.listing    || '#';
      var score      = tabScores[ti];
      var prefix     = 'fgr' + ti + '_';

      var panel = document.createElement('div');
      panel.className = 'fgr-panel' + (ti === 0 ? ' is-active' : '');
      panels.push(panel);

      panel.innerHTML =
        '<div class="fgr-header">' +
          '<div>' +
            '<div class="fgr-brand">' + AIRBNB_LOGO + ' Reviews</div>' +
            '<div class="fgr-score-row">' +
              '<span class="fgr-score-big">' + score + '</span>' +
              '<div class="fgr-stars-yellow">' + HSTAR.repeat(5) + '</div>' +
              '<span class="fgr-review-count">(' + totalCount + ')</span>' +
            '</div>' +
          '</div>' +
          '<button class="fgr-action-btn" id="' + prefix + 'OpenAll">Read all ' + totalCount + ' reviews</button>' +
        '</div>' +

        '<div class="fgr-carousel-outer">' +
          '<button class="fgr-nav fgr-nav-prev" id="' + prefix + 'Prev" aria-label="Previous">' + PREV + '</button>' +
          '<div class="fgr-carousel" id="' + prefix + 'Carousel"></div>' +
          '<button class="fgr-nav fgr-nav-next" id="' + prefix + 'Next" aria-label="Next">' + NEXT + '</button>' +
        '</div>' +

        '<div class="fgr-overlay" id="' + prefix + 'Overlay" role="dialog" aria-modal="true">' +
          '<div class="fgr-modal">' +
            '<div class="fgr-modal-topbar">' +
              '<button class="fgr-modal-icon-btn" id="' + prefix + 'Close" aria-label="Close">' + BACK + '</button>' +
              '<div class="fgr-modal-tabs">' +
                '<button class="fgr-modal-tab is-active">' + AIRBNB + ' ' + tabLabels[ti] + ' <strong>' + score + '</strong></button>' +
              '</div>' +
              '<button class="fgr-modal-icon-btn" id="' + prefix + 'Close2" aria-label="Close">&#10005;</button>' +
            '</div>' +
            '<div class="fgr-modal-header">' +
              '<div>' +
                '<div class="fgr-modal-brand">' + AIRBNB_LOGO + ' Reviews</div>' +
                '<div class="fgr-modal-score-row">' +
                  '<span class="fgr-modal-score-big">' + score + '</span>' +
                  '<div class="fgr-modal-stars">' + MSTAR.repeat(5) + '</div>' +
                  '<span class="fgr-modal-count">(' + totalCount + ')</span>' +
                '</div>' +
              '</div>' +
              '<a href="' + listingUrl + '" target="_blank" rel="noopener" class="fgr-action-btn" style="font-size:12px;padding:10px 18px">Write a Review</a>' +
            '</div>' +
            '<div class="fgr-modal-body" id="' + prefix + 'ModalBody"></div>' +
          '</div>' +
        '</div>';

      wrap.appendChild(panel);

      var carousel  = panel.querySelector('#' + prefix + 'Carousel');
      var modalBody = panel.querySelector('#' + prefix + 'ModalBody');
      var overlay   = panel.querySelector('#' + prefix + 'Overlay');
      carousels.push(carousel);
      modalBodies.push(modalBody);
      overlays.push(overlay);

      /* Carousel arrows */
      var prev  = panel.querySelector('#' + prefix + 'Prev');
      var next  = panel.querySelector('#' + prefix + 'Next');
      var cardW = 280 + 16;
      function updateBtns() {
        prev.disabled = carousel.scrollLeft <= 4;
        next.disabled = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 4;
      }
      prev.addEventListener('click', function () { carousel.scrollBy({ left: -cardW * 2, behavior: 'smooth' }); });
      next.addEventListener('click', function () { carousel.scrollBy({ left:  cardW * 2, behavior: 'smooth' }); });
      carousel.addEventListener('scroll', updateBtns);
      // Re-run after cards load AND when carousel becomes visible (handles Elementor hidden tabs)
      var _io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { updateBtns(); _io.disconnect(); }
      });
      _io.observe(carousel);

      /* Modal */
      function openModal(p, idx) {
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        setTimeout(function () {
          var target = panel.querySelector('#' + p + 'R' + idx);
          if (target) target.scrollIntoView({ block: 'start' });
          else modalBody.scrollTop = 0;
        }, 60);
      }
      function closeModal() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      buildCards(reviews, carousel, modalBody, prefix, openModal);
      updateBtns();

      panel.querySelector('#' + prefix + 'OpenAll').addEventListener('click', function () { openModal(prefix, 0); });
      panel.querySelector('#' + prefix + 'Close').addEventListener('click', closeModal);
      panel.querySelector('#' + prefix + 'Close2').addEventListener('click', closeModal);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    });

    /* Global Escape closes any open modal */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlays.forEach(function (o) {
        o.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });

    /* ── Tab switching ── */
    var tabs = tabBar.querySelectorAll('.fgr-tab');
    tabs.forEach(function (tab, ti) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        tab.classList.add('is-active');
        panels[ti].classList.add('is-active');
      });
    });

    return wrap;
  }

  /* ── Mount placeholder ───────────────────────────────────────────────────── */
  var placeholder = document.createElement('div');
  placeholder.style.cssText = 'min-height:200px;display:flex;align-items:center;justify-content:center;color:#aaa;font-family:sans-serif;font-size:13px';
  placeholder.textContent = 'Loading reviews…';

  if (scriptEl && scriptEl.parentNode) {
    scriptEl.parentNode.insertBefore(placeholder, scriptEl.nextSibling);
  } else {
    document.body.appendChild(placeholder);
  }

  /* ── Fetch one or two JSON files ─────────────────────────────────────────── */
  function fetchJson(url) { return fetch(url).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }); }
  var fetches = [fetchJson(reviewsUrl)];
  if (reviewsUrl2) fetches.push(fetchJson(reviewsUrl2));
  if (reviewsUrl3) fetches.push(fetchJson(reviewsUrl3));

  Promise.all(fetches)
    .then(function (datasets) {
      var widget = buildWidget(datasets);
      placeholder.parentNode.replaceChild(widget, placeholder);
    })
    .catch(function (err) {
      placeholder.textContent = 'Reviews unavailable. ' + err.message;
      console.error('[fgr-widget]', err);
    });

})();
