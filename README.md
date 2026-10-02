# Impromptu Speech Reveal Board

Live reveal system for the **Impromptu Speech** category (Padula) at **Literary Night 2026**.

The board shows ten enchanted Harry Potter-themed relics, "Choose Your Fate". Each relic can be touched **once**, and it unveils its own hidden image full screen. The pictures are kept secret until the event: they are uploaded by the operator on the day, so nobody (including the site builder) sees them beforehand.

## Features

- **10 relic containers** in a 5x2 grid, sized for a projector / LED wall. Each shows an animated video or a gently moving image.
- **One touch each.** Once opened, a container is disabled and marked "Revealed". This persists across refreshes.
- **PIN-gated upload.** The "Upload" button (bottom-left) asks for a PIN, then opens an upload panel.
  - Pick **10 or more** images. The first 10 *different* images are used.
  - **1:1 assignment:** image 1 goes to container 1, image 2 to container 2, and so on. Duplicate files (compared by content, not filename) are rejected, so an image never appears in two containers.
- **Images stay out of the repo.** Uploaded pictures are stored in the browser (IndexedDB), never in the source files or on a server.
- **Operator reset.** `Ctrl+Shift+K` (or `Ctrl+Alt+Shift+R`) makes every container clickable again. Uploaded images are kept.
- Wand cursor, sparkle trail and a burst effect on reveal.

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder with any static server:

```bash
npx serve .
```

### Deploy on Vercel

Import the repo as a static site. No framework or build settings are needed.

## Using it on the day

1. Open the **deployed site** on the device and browser you will use at the event.
2. Click **Upload**, enter the PIN, and select your 10+ images.
3. Run the event. Clicking a container reveals its image.
4. To run again, press `Ctrl+Shift+K`.

> **Important:** uploaded images live in that browser, for that exact web address. Uploading on `localhost` will not carry over to the Vercel URL, and clearing site data or using a private window removes them. Do a trial upload on the live site beforehand.

## About the PIN

The PIN (`0000`) is hard-coded in `app.js` **on purpose**. It is only a casual "not before the event" gate for the operator. No sensitive data is protected by it, and the hidden images are never stored in the repo.

## Customising

- Container artwork and names: the `RELICS` list at the top of `app.js` (files live in `assets/media/`, images or `.mp4` videos).
- Colours, layout and animation: `style.css`.

## AI-generated assets

All artwork and videos in `assets/media/` (the relic images and clips) are **AI-generated**. The prompts used are provided in [`gif-prompts.txt`](gif-prompts.txt).

This is an unofficial, fan-made, non-commercial project and is not affiliated with or endorsed by the owners of Harry Potter.

## License

[MIT](LICENSE). The license applies to the code; the AI-generated media is themed on a third-party franchise, so reuse it with that in mind.
