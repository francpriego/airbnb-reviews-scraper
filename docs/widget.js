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
  var reviewsUrl4 = (scriptEl && scriptEl.getAttribute('data-url4')) || '';

  /* ── Inject CSS ──────────────────────────────────────────────────────────── */
  var CSS = `
.fgr-wrap*,.fgr-wrap *::before,.fgr-wrap *::after{box-sizing:border-box;margin:0;padding:0}
.fgr-wrap{width:100%;background:#f5f3ee;font-family:'Libre Franklin',Arial,sans-serif;-webkit-font-smoothing:antialiased;padding:0 0 48px}
.fgr-tabs{display:flex;align-items:center;background:#fff;border-bottom:1px solid #e8e8e8;padding:0 16px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.fgr-tabs::-webkit-scrollbar{display:none}
.fgr-tab{display:flex;align-items:center;gap:6px;padding:12px 14px;font-family:inherit;font-size:12px;font-weight:500;color:#888;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;transition:color .18s,border-color .18s,background .18s;margin-bottom:-1px}
.fgr-tab:hover{color:#fff;background:#2d7a4f;border-radius:6px}
.fgr-tab.is-active{color:#fff;background:#2d7a4f;border-bottom-color:#2d7a4f;font-weight:600;border-radius:6px}
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
.fgr-nav{position:absolute;top:50%;transform:translateY(-50%);width:52px;height:52px;border-radius:50%;background:#fff;border:1px solid #ddd;box-shadow:0 2px 8px rgba(0,0,0,.12);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:10;transition:box-shadow .18s,background .18s}
.fgr-nav:hover{background:#f5f5f5;box-shadow:0 4px 14px rgba(0,0,0,.18)}
.fgr-nav svg{width:26px;height:26px;stroke:#333;fill:none;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}
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
.fgr-overlay{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);align-items:center;justify-content:center;padding:40px 24px 24px;animation:fgrFadeIn .2s ease}
.fgr-overlay.is-open{display:flex}
@keyframes fgrFadeIn{from{opacity:0}to{opacity:1}}
.fgr-modal-wrap{position:relative;width:100%;max-width:620px}
.fgr-modal{background:#fff;border-radius:16px;width:100%;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.25);animation:fgrSlideUp .25s ease}
@keyframes fgrSlideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
.fgr-modal-close-btn{position:absolute;top:-14px;right:-14px;width:36px;height:36px;border-radius:50%;background:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:inherit;font-size:16px;color:#444;box-shadow:0 2px 10px rgba(0,0,0,.25);transition:background .18s,color .18s;z-index:1}
.fgr-modal-close-btn:hover{background:#2d7a4f;color:#fff}
.fgr-modal-topbar{display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid #e8e8e8;flex-shrink:0}
.fgr-modal-tabs{display:flex;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;flex:1}
.fgr-modal-tabs::-webkit-scrollbar{display:none}
.fgr-modal-tab{display:flex;align-items:center;gap:6px;padding:8px 12px;font-family:inherit;font-size:12px;font-weight:500;color:#888;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;white-space:nowrap;flex-shrink:0}
.fgr-modal-tab:hover{color:#fff;background:#2d7a4f;border-radius:6px}
.fgr-modal-tab.is-active{color:#fff;background:#2d7a4f;border-bottom-color:#2d7a4f;font-weight:700;border-radius:6px}
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
  var GOOGLE_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" style="flex-shrink:0;vertical-align:middle"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>';
  var GOOGLE_LOGO = '<svg viewBox="0 0 74 24" width="74" height="24" style="flex-shrink:0"><path d="M9.24 8.19v2.46h5.88c-.18 1.38-.64 2.39-1.34 3.1-.86.86-2.2 1.8-4.54 1.8-3.62 0-6.45-2.92-6.45-6.54s2.83-6.54 6.45-6.54c1.95 0 3.38.77 4.43 1.76L15.4 2.5C13.94 1.08 11.98 0 9.24 0 4.28 0 .11 4.04.11 9s4.17 9 9.13 9c2.68 0 4.7-.88 6.28-2.52 1.62-1.62 2.13-3.91 2.13-5.75 0-.57-.04-1.1-.13-1.54H9.24z" fill="#4285F4"/><path d="M25 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z" fill="#EA4335"/><path d="M53.58 7.49h-.09c-.57-.68-1.67-1.3-3.06-1.3C47.53 6.19 45 8.72 45 12c0 3.26 2.53 5.81 5.43 5.81 1.39 0 2.49-.62 3.06-1.32h.09v.83c0 2.22-1.19 3.41-3.1 3.41-1.56 0-2.53-1.12-2.93-2.07l-2.22.92c.64 1.54 2.33 3.43 5.15 3.43 2.99 0 5.52-1.76 5.52-6.05V6.49h-2.42v1zm-2.93 8.03c-1.76 0-3.1-1.5-3.1-3.52 0-2.05 1.34-3.52 3.1-3.52 1.74 0 3.1 1.49 3.1 3.54.01 2.03-1.36 3.5-3.1 3.5z" fill="#4285F4"/><path d="M38 6.19c-3.21 0-5.83 2.44-5.83 5.81 0 3.34 2.62 5.81 5.83 5.81s5.83-2.46 5.83-5.81c0-3.37-2.62-5.81-5.83-5.81zm0 9.33c-1.76 0-3.28-1.45-3.28-3.52 0-2.09 1.52-3.52 3.28-3.52s3.28 1.43 3.28 3.52c0 2.07-1.52 3.52-3.28 3.52z" fill="#34A853"/><path d="M58 .24h2.51v17.57H58z" fill="#FBBC05"/><path d="M68.28 15.52l1.95 1.3c-.63.93-2.15 2.52-4.78 2.52-3.26 0-5.7-2.52-5.7-5.81 0-3.46 2.46-5.81 5.42-5.81 2.98 0 4.44 2.39 4.92 3.68l.26.65-7.69 3.18c.59 1.15 1.5 1.74 2.79 1.74 1.29 0 2.19-.64 2.83-1.45zm-6.03-2.07l5.14-2.13c-.28-.72-1.13-1.22-2.13-1.22-1.28 0-3.06 1.13-3.01 3.35z" fill="#EA4335"/></svg>';
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
  function buildCards(reviews, carousel, modalBody, prefix, openModal, isGoogle) {
    var badgeIcon = isGoogle ? GOOGLE_ICON : AIRBNB;
    reviews.forEach(function (r, i) {
      var color   = COLORS[i % COLORS.length];
      var initial = (r.name || '?').charAt(0).toUpperCase();
      var name    = r.name || '';
      var meta    = r.meta || '';
      var date    = r.date || '';
      var text    = r.text || '';
      var kids    = r.kids || false;
      var photo   = r.photo || '';
      var stars   = Math.min(5, Math.max(1, parseInt(r.stars || r.rating || 5)));

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
            '<div class="fgr-avatar-badge">' + badgeIcon + '</div>' +
          '</div>' +
          '<div style="display:flex;flex-direction:column;gap:4px;justify-content:center">' +
            '<div class="fgr-reviewer-name" style="display:flex;align-items:center;gap:5px">' + name + CHECK + '</div>' +
            '<div class="fgr-reviewer-source">' + date + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fgr-card-stars">' + CSTAR.repeat(stars) + '</div>' +
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
            '<div class="fgr-modal-meta">' + badgeIcon + (kids ? '👨‍👩‍👧 Stayed with kids · ' : '') + meta + '</div>' +
            '<div class="fgr-modal-date">' + date + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="fgr-modal-review-stars">' + RSTAR.repeat(stars) + '</div>' +
        '<p class="fgr-modal-review-text">' + text + '</p>';

      modalBody.appendChild(row);
    });
  }

  /* ── Build full widget with 1–4 listing tabs ─────────────────────────────── */
  function buildWidget(datasets) {
    var wrap = document.createElement('div');
    wrap.className = 'fgr-wrap';

    /* Tab labels */
    var tabLabels  = ['Guesthouse', 'Garden House', 'Both Houses', "Felisa's Guesthouse"];
    var tabSources = datasets.map(function (d) { return d.source || 'airbnb'; });
    var tabScores  = datasets.map(function (d) { return d.score || '4.93'; });
    var tabCounts  = datasets.map(function (d) { return (d.total_count || (d.reviews || []).length); });

    /* ── Main tab bar ── */
    var tabBar = document.createElement('div');
    tabBar.className = 'fgr-tabs';
    datasets.forEach(function (d, ti) {
      var icon = tabSources[ti] === 'google' ? GOOGLE_ICON : AIRBNB;
      var btn = document.createElement('button');
      btn.className = 'fgr-tab' + (ti === 0 ? ' is-active' : '');
      btn.innerHTML = icon + ' ' + tabLabels[ti] + ' <strong style="margin-left:4px">' + tabScores[ti] + '</strong>';
      tabBar.appendChild(btn);
    });
    wrap.appendChild(tabBar);

    /* ── Shared modal (one overlay, content swaps per tab) ── */
    var sharedOverlay = document.createElement('div');
    sharedOverlay.className = 'fgr-overlay';
    sharedOverlay.setAttribute('role', 'dialog');
    sharedOverlay.setAttribute('aria-modal', 'true');

    var sharedModal = document.createElement('div');
    sharedModal.className = 'fgr-modal';

    /* Modal topbar with all tabs */
    var modalTopbar = document.createElement('div');
    modalTopbar.className = 'fgr-modal-topbar';

    var modalTabsEl = document.createElement('div');
    modalTabsEl.className = 'fgr-modal-tabs';

    var modalTabBtns = [];
    datasets.forEach(function (d, ti) {
      var icon = tabSources[ti] === 'google' ? GOOGLE_ICON : AIRBNB;
      var btn = document.createElement('button');
      btn.className = 'fgr-modal-tab' + (ti === 0 ? ' is-active' : '');
      btn.innerHTML = icon + ' ' + tabLabels[ti] + ' <strong>' + tabScores[ti] + '</strong>';
      modalTabBtns.push(btn);
      modalTabsEl.appendChild(btn);
    });

    modalTopbar.appendChild(modalTabsEl);
    sharedModal.appendChild(modalTopbar);

    /* One content div per dataset */
    var contentDivs = [];
    datasets.forEach(function (data, ti) {
      var isGoogle   = tabSources[ti] === 'google';
      var headerLogo = isGoogle ? GOOGLE_LOGO : AIRBNB_LOGO;
      var score      = tabScores[ti];
      var totalCount = tabCounts[ti];
      var listingUrl = data.listing || '#';

      var content = document.createElement('div');
      content.style.cssText = 'display:' + (ti === 0 ? 'flex' : 'none') + ';flex-direction:column;flex:1;overflow:hidden';
      content.innerHTML =
        '<div class="fgr-modal-header">' +
          '<div>' +
            '<div class="fgr-modal-brand">' + headerLogo + ' Reviews</div>' +
            '<div class="fgr-modal-score-row">' +
              '<span class="fgr-modal-score-big">' + score + '</span>' +
              '<div class="fgr-modal-stars">' + MSTAR.repeat(5) + '</div>' +
              '<span class="fgr-modal-count">(' + totalCount + ')</span>' +
            '</div>' +
          '</div>' +
          '<a href="' + listingUrl + '" target="_blank" rel="noopener" class="fgr-action-btn" style="font-size:12px;padding:10px 18px">Write a Review</a>' +
        '</div>' +
        '<div class="fgr-modal-body" id="fgr' + ti + '_ModalBody"></div>';

      contentDivs.push(content);
      sharedModal.appendChild(content);
    });

    var modalCloseBtn = document.createElement('button');
    modalCloseBtn.className = 'fgr-modal-close-btn';
    modalCloseBtn.setAttribute('aria-label', 'Close');
    modalCloseBtn.innerHTML = '&#10005;';

    var modalWrap = document.createElement('div');
    modalWrap.className = 'fgr-modal-wrap';
    modalWrap.appendChild(modalCloseBtn);
    modalWrap.appendChild(sharedModal);
    sharedOverlay.appendChild(modalWrap);
    wrap.appendChild(sharedOverlay);

    /* switchModalTab: swap content & active tab button */
    function switchModalTab(ti) {
      modalTabBtns.forEach(function (b, i) { b.classList.toggle('is-active', i === ti); });
      contentDivs.forEach(function (c, i) { c.style.display = i === ti ? 'flex' : 'none'; });
    }

    function openSharedModal(tabIndex, reviewPrefix, reviewIdx) {
      switchModalTab(tabIndex);
      sharedOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(function () {
        if (reviewIdx !== null && reviewIdx !== undefined) {
          var target = document.getElementById(reviewPrefix + 'R' + reviewIdx);
          if (target) { target.scrollIntoView({ block: 'start' }); return; }
        }
        var body = contentDivs[tabIndex].querySelector('.fgr-modal-body');
        if (body) body.scrollTop = 0;
      }, 60);
    }

    function closeSharedModal() {
      sharedOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    /* Modal tab clicks */
    modalTabBtns.forEach(function (btn, ti) {
      btn.addEventListener('click', function () {
        switchModalTab(ti);
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      });
    });

    modalCloseBtn.addEventListener('click', closeSharedModal);
    sharedOverlay.addEventListener('click', function (e) { if (e.target === sharedOverlay) closeSharedModal(); });

    /* ── One panel per listing ── */
    var panels = [];
    var carousels = [];

    datasets.forEach(function (data, ti) {
      var reviews    = data.reviews || [];
      var totalCount = tabCounts[ti];
      var prefix     = 'fgr' + ti + '_';
      var isGoogle   = tabSources[ti] === 'google';
      var headerLogo = isGoogle ? GOOGLE_LOGO : AIRBNB_LOGO;
      var score      = tabScores[ti];

      var panel = document.createElement('div');
      panel.className = 'fgr-panel' + (ti === 0 ? ' is-active' : '');
      panels.push(panel);

      panel.innerHTML =
        '<div class="fgr-header">' +
          '<div>' +
            '<div class="fgr-brand">' + headerLogo + ' Reviews</div>' +
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
        '</div>';

      wrap.appendChild(panel);

      var carousel  = panel.querySelector('#' + prefix + 'Carousel');
      var modalBody = contentDivs[ti].querySelector('.fgr-modal-body');
      carousels.push(carousel);

      /* Carousel arrows */
      var prev = panel.querySelector('#' + prefix + 'Prev');
      var next = panel.querySelector('#' + prefix + 'Next');
      var cardW = 280 + 16;
      function updateBtns() {
        prev.disabled = carousel.scrollLeft <= 4;
        next.disabled = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 4;
      }
      prev.addEventListener('click', function () { carousel.scrollBy({ left: -cardW * 2, behavior: 'smooth' }); });
      next.addEventListener('click', function () { carousel.scrollBy({ left:  cardW * 2, behavior: 'smooth' }); });
      carousel.addEventListener('scroll', updateBtns);
      var _io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { updateBtns(); _io.disconnect(); }
      });
      _io.observe(carousel);

      /* Build cards with openModal bound to this tab index */
      (function (tiCapture, prefixCapture) {
        function openModal(p, idx) { openSharedModal(tiCapture, p, idx); }
        buildCards(reviews, carousel, modalBody, prefixCapture, openModal, isGoogle);
        panel.querySelector('#' + prefixCapture + 'OpenAll').addEventListener('click', function () {
          openSharedModal(tiCapture, prefixCapture, 0);
        });
      })(ti, prefix);

      updateBtns();
    });

    /* Global Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSharedModal();
    });

    /* ── Main tab switching ── */
    var tabs = tabBar.querySelectorAll('.fgr-tab');
    tabs.forEach(function (tab, ti) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        panels.forEach(function (p) { p.classList.remove('is-active'); });
        tab.classList.add('is-active');
        panels[ti].classList.add('is-active');
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
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
  if (reviewsUrl4) fetches.push(fetchJson(reviewsUrl4));

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
