# 🔌 InfinityAI Chrome Extension — Memory Assistant

The companion Manifest V3 Chrome Extension allows you to ingest any webpage or documentation article directly into your personal Cognee Cloud database in a single click.

---

## 🛠️ How It Works

1. **Content Extraction Script (`src/content/content.ts`)**:
   * Uses Mozilla's `@mozilla/readability` module to strip navigation, ads, and footers from the active tab.
   * Extracts clean, structured webpage data (Title, URL, Domain, and main Article Content).
2. **Toolbar Popup Interface (`src/popup`)**:
   * Displays the current page details and domain name inside a premium, glassmorphic popup panel.
   * Disables itself automatically on unsupported protocol schemes (e.g. `chrome://` settings tabs).
3. **Background Service Worker (`src/background/background.ts`)**:
   * Relays extracted content securely to your backend ingestion APIs.
   * Manages status badges and displays notifications (e.g. `Remembered ✅` or `Server Offline ❌`).

---

## ⚙️ Development & Packaging
* Run build: `npm run build`
* Compiled assets will be packaged into the `dist/` directory, ready to be loaded unpacked as a developer extension.
