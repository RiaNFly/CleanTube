# CleanTube

A small Firefox / Zen Browser extension that cleans up YouTube. Click the toolbar icon and turn each option on or off. Changes apply instantly, without reloading the page.

## What it hides
- **Shorts** (shelves, menu entry, channel tab). Shorts links are redirected to the normal player (`/shorts/ID` → `/watch?v=ID`).
- **Games** (Playables).
- **"Latest news"** section.
- **Premium promos** and YouTube's own "Featured by YouTube" banners.
- **Members-only content** (videos, shelves and "Join" buttons).
- **"Explore more topics"** section.

## Details
- Runs only on youtube.com.
- No data collection, no network requests, no account needed. The only thing saved is your toggle settings (`storage`, local).
- Plain JavaScript, CSS and HTML. No build step.
- Languages: English and Spanish (follows the browser language).

## Install
- **Temporary (for testing):** open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on…" and select `manifest.json`.
- **Permanent:** download the signed `.xpi` from the Releases page and drag it into the browser, or use `about:addons` → gear icon → "Install Add-on From File…".

## Known limits
YouTube changes its page structure often, so some elements may stop being hidden until the extension is updated. Issues and screenshots are welcome.

## Disclaimer
Independent project, not affiliated with YouTube or Google.
