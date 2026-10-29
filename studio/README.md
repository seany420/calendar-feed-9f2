# Clipwright Studio

A browser video and podcast studio for blogs, podcasts, and short-form video. One file, no install, no uploads. Open `index.html` in Chrome or Edge.

## What it does

- **Record** camera, screen, screen with a camera bubble, or audio only. Or import any video/audio file.
- **Formats**: 16:9 (blog, YouTube), 9:16 (Shorts, Reels, TikTok), 1:1 (feed). Switch anytime; zoom and pan sliders keep your face in frame when cropping to vertical.
- **Edit**: split, delete segments, mark in/out and cut, trim, undo. **Remove pauses** finds dead air and jump-cuts it out.
- **Filters**: Warm, Cool, Vivid, Soft, Faded, Vintage, Noir, Dread, plus brightness, contrast, saturation, warmth, vignette, soften.
- **Captions**: live captions while recording (Chrome/Edge speech recognition), or AI transcription that runs on your own machine (Whisper via transformers.js; the model downloads once). Three styles including word-by-word highlight for shorts. Editable, importable (.srt/.vtt), and burned into the export.
- **Auto B-roll**: scans the transcript for people, places, and ideas, then drops in an info card with a picture and a short Wikipedia fact at the moment you say it. Upload your own images and it places them when you mention their file names. Title cards and lower thirds too.
- **Podcast audiogram**: audio-only recordings become video with cover art, title, and a live waveform.
- **Export**: MP4 (or WebM) with everything burned in, optional audio-only file, captions timed to the final cut (.srt/.vtt), a transcript, and a blog post draft in Markdown with a "Mentioned in this episode" list.

## Running it

Double-click `index.html`, or serve the folder (`npx serve studio`) and open the URL. Chrome or Edge on desktop works best. Export plays through in real time, so keep the tab in front while it renders.

Network is only used for the Wikipedia lookups and the one-time speech model download.
