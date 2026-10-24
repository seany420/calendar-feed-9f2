# Dread Ledger

A horror film library you rank, write in, and publish from. It runs in the browser. No server, no account, no build step.

## Open it

- **On a computer:** download this `horror-library` folder and double-click `index.html`. Chrome, Edge, Firefox, and Safari all work.
- **Anywhere, including your phone:** host the folder on GitHub Pages, Netlify Drop, or Cloudflare Pages. Netlify Drop is the fastest: drag the folder onto app.netlify.com/drop and you get a link.

Your data lives in the browser you use it in. Phone and laptop each keep their own copy. Move between them with **Settings > Download full backup** and **Restore backup**.

## What it does

**Library.** Starts with ~500 essential horror films (1920 to 2025) so it works offline on day 1. **Settings > Import the full catalogue** pulls every horror film on record:
- **Wikidata** (no key): every film tagged horror or a horror subgenre. Tens of thousands of titles.
- **TMDB** (free key): every film in TMDB's horror genre, with posters, synopses, and popularity.

Search by title, director, actor, or year. Filter by seen, watchlist, subgenre, decade, lens. "Surprise me" picks something unseen from whatever filter you're in.

**Film pages.** Opening a film fetches its details: director, writers, cast, runtime, country, synopsis, full plot (from Wikipedia), poster (from TMDB or Wikipedia). Edit anything by hand. Links out to IMDb, Letterboxd, JustWatch, and Does the Dog Die.

**Your response.** Every film gets the same structured questions, so your notes line up across films:
gut check, viewing context, setup, the monster really, the scene, who copes and who breaks, burnout read, the system, optimistic nihilism, in the room, craft, take it home, verdict, who should watch.
Plus a 0 to 10 rating, 1 to 5 scores (dread, craft, burnout relevance, nihilism quotient, rewatchability), watch dates, content notes, private notes, and a free-form critique. Edit the questions and score names in Settings.

**Lenses.** 17 clinical and philosophical lenses (burnout, optimistic nihilism, existential givens, terror management, grief and ambiguous loss, trauma, moral injury, caregiver fatigue, family systems, disaster and displacement, why we watch, and more). Tag a film and that lens's prompts and a notes box appear. Each lens has starter references.

**Rankings.** One ordered list of everything you've seen. "Place" slots a new film in with a few head-to-head questions (binary insertion, about 6 questions at 50 films, 7 at 100). Drag, nudge, or jump to a position. "Sort by my rating" seeds the list if you're starting with a backlog.

**Studio.** Turns answers into:
- Blog / Substack post
- Essay scaffold, with [TODO] markers where answers are missing
- Podcast run sheet with segment timings, plus show notes
- Short social posts
- A prompt for Claude that asks for a draft in your voice from only your notes
- Theme compilation: every film under one lens, ranked, as a chapter seed
- Ranked list post (top 5, 10, 13, 31, all)

Copy as Markdown or HTML, or download .md, .html, .txt.

**Voice check.** Flags em dashes, banned words and phrases, negative parallelisms, uncontracted forms, spelled-out numbers, "represents," and paragraphs over 3 sentences. One button swaps dashes for commas. Rules are editable in Settings.

**Stats.** Seen count, words written, writing pipeline (not started, notes, drafted, published), watches per month, rating spread, decades, subgenres, lenses, directors, and blind spots.

**Data in and out.** Full JSON backup and restore (merge or replace). CSV spreadsheets. All writing as one Markdown file. Letterboxd import (ratings.csv, diary.csv, watched.csv) and a Letterboxd-ready export.

## TMDB key (optional, recommended)

1. Make a free account at themoviedb.org.
2. Settings > API > request a developer key (personal use).
3. Paste the "API Key" or "API Read Access Token" into **Settings > TMDB key**.

The key stays in your browser.

## Files

```
index.html        app shell
css/styles.css    styles (dark and light themes)
js/seed.js        starter catalogue
js/lenses.js      questions, scores, subgenres, lenses, voice rules
js/db.js          IndexedDB storage
js/sources.js     Wikidata, Wikipedia, TMDB
js/export.js      blog, essay, podcast, CSV, voice checker
js/app.js         views and state
```

Film data comes from Wikidata (CC0), Wikipedia (CC BY-SA), and TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.
