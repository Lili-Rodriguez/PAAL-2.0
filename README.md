# PAAL – parenting companion prototype

A buildless HTML, CSS and JavaScript prototype. This is Andres's version
(branch `andres-test`), rebuilt from Lili Rodriguez's original PAAL 2.0.
Lili's original code is unchanged on her repository's `main` branch.

## Run it

```sh
python3 -m http.server 8000 --directory dist
```

Then visit http://localhost:8000. No installation, API key or build step is needed.
To try it on a phone, use your computer's local IP address (same Wi-Fi), e.g.
`http://192.168.1.23:8000`.

## What it does

- **Sign-up** (first visit): your name, your children (name and age), and where you
  struggle: putting them to sleep, taking them off screens, controlling temper
  tantrums, or "I just want to learn".
- **Home**: your children (each with a character that matches their age), Talk to
  PAAL, a colorful lesson-progress ring, a Schedule care card, and PAAL's
  research-based tips for the struggles you chose.
- **Learn**: illustrated lessons with a progress bar at the top. Mark a lesson
  complete to fill in the progress.
- **Care**: ported from Lili's Care page (her commit `fcd8050`): today's care blocks,
  handoff updates, help requests, caregiver permissions, and a shareable caregiver
  guide. Local demo only. Nothing is sent to anyone. Her "Family toolkit" section
  was left out because it was the old Village content.
- **PAAL**: a chat box with the PAAL mascot peeking over it. Answers are
  **scripted**: PAAL matches keywords (sleep, screens, tantrums, learning) to
  prepared, research-based answers. It is not a live AI. Asking for quick ideas
  ("distract", "bored", "waiting"…) returns screen-free activities matched to the
  child's age (`QUICK_IDEAS`).
- **Guided by PAAL** (below the chat): *Parent reset*, a ~4-minute guided
  meditation in a full-screen player with a timer, an animated breathing circle
  and PAAL's voice: cyclic sighing (Balban et al., 2023), Kristin Neff's
  self-compassion break, and a mindful-parenting intention.

### PAAL's voice

- PAAL's voice is one set of real recordings in `dist/audio/parent-reset/`
  (`1.m4a` … `7.m4a`, one per step, plus `cue-breath.m4a`, the spoken breathing
  guide used for the first 3 breaths; about 600 KB in total). The app does not
  use the browser's built-in voices.
- They were made with **[Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)**,
  an open-source text-to-speech model (Apache-2.0 license), using its
  highest-rated voice, "Heart" (`af_heart`), at normal speed. Each step is
  generated as one passage so the pauses are the voice's own. The audio is then
  slowed by 10% (smooth resampling), which makes it deeper and calmer.
  Kokoro ran once, offline on a computer; visitors only download the audio files.
- **If you change a step's text**, re-record it the same way so the voice
  matches: install `kokoro-js` (npm) in a separate folder, generate the whole step
  with `voice: 'af_heart', speed: 1`, slow it to 90%, convert to `.m4a`, keep the
  file name, and bump `AUDIO_VERSION` in `app.js`.

| Struggle | Answer based on |
|---|---|
| Putting them to sleep | Bedtime-routine research (Mindell et al., 2009) |
| Taking them off screens | American Academy of Pediatrics Family Media Plan |
| Controlling temper tantrums | Parent-Child Interaction Therapy (PCIT, Eyberg) |
| I just want to learn | Serve and Return (Harvard Center on the Developing Child) |

## Files to edit

- `dist/app.js`: everything the app says and does, in six labeled sections:
  1. **CONTENT**: `STRUGGLES` (sign-up options, answers, chat keywords) and `LESSONS`
  2. **STATE**: saved data
  3. **HELPERS**: utilities and the `paal()` character (the purple friend from Lili's illustration)
  4. **SCREENS**: one function per page (`signupScreen`, `homeScreen`, `learnScreen`, `lessonScreen`, `careScreen`, `paalScreen`)
  5. **CHAT**: `paalReply()` decides how PAAL answers
  6. **ROUTER**: page addresses (`#home`, `#learn`, `#learn/<lesson>`, `#care`, `#paal`, `#edit`)
- `dist/styles.css`: colors and fonts at the top (`:root` and the `.tone-*` colors),
  then one section per page.
- `dist/index.html`: page title. Bump `?v=17` after editing CSS/JS so phones
  don't show a cached copy.
- `index.html` (repo root): only redirects to `dist/` for GitHub Pages.

## Limitations

- Data is saved only in this browser's `localStorage` (key `paal-andres`). It is
  not synced between devices. **Reset demo** clears it.
- No accounts, backend or live AI. Tips are general, research-based ideas, not
  medical advice.
