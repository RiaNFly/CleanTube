# CleanTube

[![Get the add-on](https://img.shields.io/badge/Firefox-Get%20the%20add--on-FF7139?logo=firefoxbrowser&logoColor=white)](https://addons.mozilla.org/es-ES/firefox/addon/cleanytube/)

A small Firefox / Zen Browser extension that cleans up YouTube. Click the toolbar icon and turn each option on or off. Changes apply instantly, without reloading the page.

## What it hides

| Option | What it does |
| --- | --- |
| **Shorts** | Hides Shorts shelves, the menu entry and the channel tab. Shorts links are redirected to the normal player (`/shorts/ID` → `/watch?v=ID`). |
| **Games** | Hides the Playables (games) section and its menu entry. |
| **Latest news** | Hides the "Latest news" shelves and the "News" menu entry. |
| **Premium promos** | Hides YouTube Premium buttons, menu entries and banners, and YouTube's own "Featured by YouTube" promo banners. |
| **Members-only content** | Hides members-only videos and shelves, "Join" buttons and membership banners. |
| **Explore more topics** | Hides the "Explore more topics" section. |

All options are on by default and can be switched individually from the toolbar menu.

## Install

**Recommended:** install it from the official Firefox Add-ons page. It updates automatically.

👉 https://addons.mozilla.org/es-ES/firefox/addon/cleanytube/

Works in Firefox and in Firefox-based browsers such as Zen.

**Alternatives**

- **Self-distributed build:** download the signed `.xpi` from the [Releases](../../releases) page and drag it into the browser (or use `about:addons` → gear icon → "Install Add-on From File…"). It does not update automatically.
- **Temporary (for testing):** open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on…" and select `manifest.json`.

## Privacy and permissions

- Runs **only on youtube.com**.
- **No data collection**, no network requests, no account needed.
- The only permission is `storage`, used to save your toggle settings locally in the browser.
- No remote code, no `eval`, no `innerHTML`.

## How it works

A content script runs on youtube.com. It finds the elements to hide and marks them with a data attribute. A small CSS file then hides each category only when its toggle is on, so switching an option off brings the content back immediately.

Elements are detected in three ways:

- **Link targets** (`/shorts`, `/playables`, `/premium`).
- **Badge classes** (for example the members-only badge).
- **Short text labels**, such as section titles and button texts. These patterns are written in English, Spanish and Catalan.

Only new page elements are checked, in small batches, and nothing runs while the tab is in the background.

## Project structure

```
manifest.json        Extension manifest (Manifest V3)
content.js           Detection and marking of elements on youtube.com
hide.css             Hides the marked elements according to the toggles
popup.html / .css / .js   Toolbar menu with the toggles
_locales/en, es      English (default) and Spanish texts
icon-*.png           Icons
```

There is no build step: the code is plain, hand-written JavaScript, CSS and HTML.

## Languages

English and Spanish. The menu follows the language of the browser.

## Known limits

YouTube changes its page structure often, so some elements may stop being hidden until the extension is updated. If something is not hidden, please open an issue and include a screenshot, and if you can, the name of the page element (right-click → Inspect).

## Contributing

Issues and pull requests are welcome.

## License

See the [LICENSE](LICENSE) file.

## Disclaimer

CleanTube is an independent project and is not affiliated with YouTube or Google.
