# Afterword

A private grief companion that runs in a phone browser and installs to the home screen.

- **Talk**: live voice conversation with an AI companion over OpenAI's Realtime API (the same speech-to-speech technology as ChatGPT voice). Transcripts save automatically, with a short summary so the next conversation can pick up where the last one stopped.
- **Memories**: record stories with the phone or headphone mic, or write them. Recordings are transcribed, editable, taggable.
- **Practice**: 24 exercises from grief treatment, mindfulness, and philosophy. Each can be done with the companion, in writing, or recorded.
- **Learn**: models of grief, kinds of grief, effects on body and mind, prolonged grief disorder, psychotherapies, philosophy, mindfulness, horror as a lens.
- **More**: settings, daily check-in history, export and restore.

## Running it

It is a static site with no build step and no server. It needs HTTPS (or localhost) for the microphone.

```
cd afterword
python3 -m http.server 8000
# open http://localhost:8000
```

To use it on a phone, host this folder anywhere that serves static files over HTTPS (GitHub Pages, Netlify, Cloudflare Pages), open the URL, then Share > Add to Home Screen.

In the app, open More and paste an OpenAI API key (platform.openai.com > API keys). The key is stored in that browser only.

## Data

Everything is stored in the browser's IndexedDB on the device. Voice conversations and transcription requests go to OpenAI using the user's own key. More > Export everything produces a zip:

```
memories/        Markdown, one file per memory
audio/           original recordings
conversations/   Markdown transcripts
checkins.csv
backup.json      used by Restore from a backup
```

## Editing

- `js/content.js`: all articles, exercises, and story prompts.
- `js/prompt.js`: how the companion behaves.
- `js/openai.js`: the voice connection, transcription, summaries.

Default models (changeable in More): `gpt-realtime-2.1` for voice, `gpt-4o-transcribe` for transcription, `gpt-5.4-mini` for summaries.

This is a companion and a notebook. It does not assess risk or replace treatment.
