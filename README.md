<h1 align="center">
  <br>
  💰 Family Expense Tracker
  <br>
</h1>

<h4 align="center">A lightweight, installable PWA for tracking shared family or group expenses.</h4>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#live-demo-and-github-pages">GitHub Pages</a> •
  <a href="#for-users">For Users</a> •
  <a href="#for-developers">For Developers</a> •
  <a href="#backend-setup">Backend Setup</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <strong>Shareable user link after publishing:</strong><br>
  <code>https://&lt;your-github-username&gt;.github.io/expense-tracker/</code>
</p>

---

## Features

- **Installable PWA**: Includes a web app manifest and service worker so the app can be installed from supported mobile and desktop browsers.
- **Family/group tracking**: Join a shared home group with a group ID and track activity by person.
- **Expense and income entry**: Record amount, type, category, date, note, and person for each transaction.
- **Dashboard and analytics**: View monthly totals, recent transactions, per-person summaries, and category/person charts.
- **Local-first settings**: Stores profile, group, API URL, avatars, categories, and budget preferences in browser `localStorage`.
- **Optional Google Sheets backend**: `Code.js` can be deployed as a Google Apps Script web app to persist transactions in Google Sheets.
- **Static hosting friendly**: No build step is required; the repository can be published directly to GitHub Pages.

## Tech Stack

- **Frontend**: Static HTML, CSS, and vanilla JavaScript.
- **PWA**: `manifest.json` plus `sw.js` service worker asset caching.
- **Charts**: Chart.js loaded from the jsDelivr CDN.
- **Icons and fonts**: Google Material Symbols and the Outfit font from Google Fonts.
- **Backend, if retained**: Google Apps Script (`Code.js`) connected to a Google Sheets spreadsheet.
- **Hosting**: GitHub Pages or any static file host such as Netlify, Vercel static hosting, Cloudflare Pages, or a simple web server.

This repository does **not** currently use React, Tailwind CSS, Firebase, Node.js, npm, or `npm run dev`.

## Live Demo and GitHub Pages

This project is ready to publish as a static GitHub Pages site.

### User-facing app link

After GitHub Pages is enabled, share this URL with users:

```text
https://<your-github-username>.github.io/expense-tracker/
```

Replace `<your-github-username>` with the GitHub account or organization that owns the repository. If you rename the repository, replace `expense-tracker` with the new repository name. If you configure a custom domain in GitHub Pages, share that custom domain instead.

### Recommended GitHub Pages setup

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Push to the `main` branch or run the **Deploy static app to GitHub Pages** workflow manually from the **Actions** tab.
5. After the workflow finishes, open the Pages URL shown in the deployment summary.

The workflow in `.github/workflows/pages.yml` validates required static assets and deploys the repository contents without a build step.

### Manual static hosting

If you prefer not to use GitHub Actions, upload the following files to any static host and serve them from the same base path:

- `index.html`
- `app.js`
- `style.css` and the `style-*.css` files
- `manifest.json`
- `sw.js`
- `icon.svg`

For the best PWA experience, serve the app over HTTPS. Localhost is also treated as a secure origin by modern browsers for development.

## For Users

1. **Open the hosted app URL** shared by the app owner or maintainer. For the default GitHub Pages setup, it will look like `https://<your-github-username>.github.io/expense-tracker/`.
2. **Install the app from your browser**:
   - On iPhone/iPad: open the Share menu and choose **Add to Home Screen**.
   - On Android/Chrome: tap the browser menu and choose **Install app** or **Add to Home screen**.
   - On desktop Chrome/Edge: use the install icon in the address bar when available.
3. **Create or join a family/group** by entering your name, the shared Home Group ID, and the backend Database URL provided by the owner.
4. **Start tracking expenses** from the app dashboard. Add income or expenses, choose categories, and review totals and charts.

## Privacy and Data Storage

- Browser settings and cached data are stored in `localStorage` on each user's device.
- Shared persistence is optional and depends on the Google Apps Script URL that users enter during onboarding.
- Do not share a Database URL publicly unless the backend was intentionally configured for public use.
- Do not commit personal finance exports, real family IDs, production Apps Script URLs, or other secrets.

## For Developers

Because the app is static, you only need a local static server. Opening `index.html` directly from the filesystem is not recommended because service workers and some browser APIs require an HTTP origin.

### Option 1: Python

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

### Option 2: Node.js without installing project dependencies

```bash
npx serve .
```

Then open the local URL printed by `serve`.

### Option 3: PHP

```bash
php -S localhost:8000
```

Then open <http://localhost:8000>.

### Project files

- `index.html` contains the static app shell, templates, PWA links, Chart.js CDN script, and app script tag.
- `app.js` contains the single-page app state, rendering, routing hooks, analytics, and browser storage integration.
- `style.css` and the `style-*.css` files contain the UI styles.
- `manifest.json` defines the installable PWA metadata.
- `sw.js` caches core static assets for offline-friendly loading.
- `Code.js` contains the optional Google Apps Script backend.
- `.github/workflows/pages.yml` publishes the static app to GitHub Pages.

## Backend Setup

Advanced users who want their own shared backend can deploy `Code.js` as a Google Apps Script web app backed by Google Sheets.

1. Create a new Google Sheet for the expense database.
2. In the sheet, open **Extensions → Apps Script**.
3. Replace the default script with the contents of `Code.js`.
4. Save the Apps Script project.
5. Run the `setupSheets` function once from the Apps Script editor to create the required sheets:
   - `Transactions`
   - `Families`
   - `Persons`
6. Deploy the script as a web app:
   - Choose **Deploy → New deployment**.
   - Select **Web app**.
   - Execute as the script owner.
   - Set access according to your sharing needs.
7. Copy the deployed web app URL. Use this as the app's **Database URL (API)** during onboarding or in the profile screen.
8. Share the same Home Group ID and Database URL with family/group members who should track expenses together.

The Apps Script backend currently supports transaction creation, transaction loading, basic family configuration, and sheet setup actions.

## Contributing

Contributions, issues, and feature requests are welcome. Please read:

- `CONTRIBUTING.md` for the contribution workflow.
- `CODE_OF_CONDUCT.md` for community expectations.
- `SECURITY.md` before reporting security-sensitive problems.

## License

This project is MIT licensed. See `LICENSE` for details.
