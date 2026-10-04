# Impromptu Speech Reveal Board

Live reveal system for the **Impromptu Speech** category (Padula) at **Literary Night 2026**.

The board shows ten enchanted Harry Potter-themed relics, "Choose Your Fate". Each relic can be touched **once**, and it unveils its own hidden image full screen. The pictures are kept secret until the event: they are uploaded by the operator on the day, so nobody (including the site builder) sees them beforehand.

## Features

- **10 relic containers** in a 5x2 grid, sized for a projector / LED wall. Each shows an animated video or a gently moving image.
- **One touch each.** Once opened, a container is disabled and marked "Revealed". This persists across refreshes.
- **PIN-gated upload.** The "Upload" button (bottom-left) asks for a PIN, then opens an upload panel (see [How the upload works](#how-the-upload-works)).
  - Pick **10 or more** images. The first 10 *different* images are used.
  - **1:1 assignment:** image 1 goes to container 1, image 2 to container 2, and so on. Duplicate files (compared by content, not filename) are rejected, so an image never appears in two containers.
- **Images stay out of the repo.** Uploaded pictures are stored in the browser (IndexedDB), never in the source files or on a server.
- **Operator reset.** `Ctrl+Shift+R` (or `Ctrl+Alt+Shift+R`) makes every container clickable again. Uploaded images are kept. `Ctrl+Shift+K` (or `Ctrl+Alt+Shift+K`) empties all uploaded images so the containers are imageless again.
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
4. To run again, press `Ctrl+Shift+R`.

> **Important:** uploaded images live in that browser, for that exact web address. Uploading on `localhost` will not carry over to the Vercel URL, and clearing site data or using a private window removes them. Do a trial upload on the live site beforehand.

## How the upload works

1. **PIN check.** Clicking **Upload** opens a PIN prompt. A wrong PIN is rejected; the right one opens the upload panel.
2. **Pick files.** Select 10 or more images at once. Non-image files are ignored, and fewer than 10 images shows an error.
3. **Duplicate removal.** Each file is fingerprinted by its contents (SHA-256), not its filename, so the same picture saved under two names counts once. If fewer than 10 *different* images remain, nothing is saved.
4. **Slot assignment (1:1).** The first 10 unique images fill slots 1 to 10 in the order picked: image 1 to container 1, image 2 to container 2, and so on. Extra images beyond 10 are ignored. Every image belongs to exactly one slot, so it can never appear in two containers.
5. **Saved in the browser.** All 10 images are written to IndexedDB in a single step, replacing any previous upload, so the slots are never left half-filled. Nothing is sent to a server or committed to the repo.
6. **Reveal.** Clicking a container loads only that slot's image into the full-screen viewer. If a slot has no upload, a placeholder says so.

The panel lists which file went into which container so you can check the order before the event.

## About the PIN

The PIN is hard-coded statically in `app.js` **on purpose**. The only thing being hidden is a set of event pictures until the reveal, so there is no sensitive data, no personal information (SPI/PII) and no accounts involved. The PIN is just a casual "not before the event" gate for the operator, not real security, so a backend or proper authentication would be unnecessary here. The hidden images themselves are never stored in the repo.

## Customising

- Container artwork and names: the `RELICS` list at the top of `app.js` (files live in `assets/media/`, images or `.mp4` videos).
- Colours, layout and animation: `style.css`.

## AI-generated assets

All artwork and videos in `assets/media/` (the relic images and clips) are **AI-generated**. The prompts used are provided in [`gif-prompts.txt`](gif-prompts.txt).

This is an unofficial, fan-made, non-commercial project and is not affiliated with or endorsed by the owners of Harry Potter.

## License

[MIT](LICENSE). The license applies to the code; the AI-generated media is themed on a third-party franchise, so reuse it with that in mind.
