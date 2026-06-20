# Airbnb Reviews Scraper + Embed Widget

Auto-scrapes reviews from an Airbnb listing weekly and serves them as an
embeddable `<script>` tag — no plugin needed.

## Folder structure

```
├── .github/workflows/scrape.yml   ← GitHub Actions (runs every Monday)
├── scraper/
│   ├── scrape.js                  ← Puppeteer scraper
│   └── package.json
└── docs/                          ← GitHub Pages root
    ├── reviews.json               ← scraped data (auto-updated)
    └── widget.js                  ← embed script
```

---

## Setup (one-time, ~5 minutes)

### 1. Create a new GitHub repo and push these files

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR-USERNAME/airbnb-reviews-scraper.git
git push -u origin main
```

### 2. Enable GitHub Pages

In your repo → **Settings → Pages**:
- Source: **Deploy from a branch**
- Branch: `main` / folder: `/docs`
- Click **Save**

Your widget will be live at:
```
https://YOUR-USERNAME.github.io/airbnb-reviews-scraper/widget.js
https://YOUR-USERNAME.github.io/airbnb-reviews-scraper/reviews.json
```

### 3. Give GitHub Actions write permission

In your repo → **Settings → Actions → General**:
- Under **Workflow permissions** → select **Read and write permissions**
- Click **Save**

### 4. Run the scraper manually (first time)

Go to **Actions** tab → **Scrape Airbnb Reviews** → **Run workflow** → **Run workflow**

This populates `docs/reviews.json` with all live reviews and commits it automatically.

After that it runs every Monday at 03:00 UTC automatically.

---

## Embed on any website

Paste this into Elementor → HTML widget (or any HTML page):

```html
<script
  src="https://YOUR-USERNAME.github.io/airbnb-reviews-scraper/widget.js"
  data-url="https://YOUR-USERNAME.github.io/airbnb-reviews-scraper/reviews.json"
></script>
```

Replace `YOUR-USERNAME` with your actual GitHub username.

---

## Run locally

```bash
cd scraper
npm install
node scrape.js
```

Output is saved to `docs/reviews.json`.

---

## Changing the listing

Edit the `AIRBNB_LISTING_URL` constant at the top of `scraper/scrape.js`,
or set the env variable `AIRBNB_LISTING_URL` before running.
