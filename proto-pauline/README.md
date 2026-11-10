# paal · Pauline's design, now the main app

The prototype that lived here is now the app itself: **`dist/index.html`**.
It runs on Lili's backend when served by `python3 -m backend.server`:

- **Chat**: asks Lili's `POST /api/answer` first (reviewed, sourced answers and safety replies). When the server has no approved source yet, or when the page is opened without the server, it falls back to paal's own answers built from the lessons.
- **Accounts**: Lili's Supabase sign-in (sign in, create account, reset password, continue without an account). Active only when `dist/supabase-config.js` has a url and anon key.
- **Parent reset**: plays Lili's audio files from `dist/audio/parent-reset/`.
- **Learn**: Andres's lessons as card decks, plus Pauline's five study lessons, same format.
- **Data**: still saved in the browser (as in the team's app). `sharedCareRows()` returns the family as rows of Lili's Supabase tables (`supabase/migrations`), ready for the sync step.

The team's previous app is kept unchanged at **`dist/team.html`**.

Live preview (no backend): https://claude.ai/artifact/2Pstihx9LVfbULNcCCuxb6
