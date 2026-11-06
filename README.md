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

- **Sign-up** (first visit): your name, a family name, and your children (name,
  age, and for each child what they need help with: putting them to sleep, taking
  them off screens, controlling temper tantrums, "I just want to learn", or
  "Something else" with a short description).
- **Home**: your children (each with a character that matches their age), Talk to
  PAAL, a colorful lesson-progress ring, a Schedule care card, **saved ideas** with
  a "How did it go?" check-in (Helped / Partly / Didn't fit), and PAAL's
  research-based tips, each tagged with the kids it applies to.
- **Learn**: illustrated lessons with a progress bar at the top. Mark a lesson
  complete to fill in the progress.
- **Care**: ported from Lili's Care page (her commit `fcd8050`): today's care blocks,
  handoff updates, help requests (open → accepted → done, or cancelled), caregiver
  permissions (care plan, care guide, saved ideas/family toolkit, updates,
  requests), and a shareable caregiver guide (needs, what already helps, what helps
  them feel calm, an easy game). Local demo only. Nothing is sent to anyone.
- **PAAL**: a chat box with the PAAL mascot peeking over it. Answers are
  **scripted**: PAAL matches keywords (sleep, screens, tantrums, learning) to
  prepared, research-based answers. It is not a live AI. Asking for quick ideas
  ("distract", "bored", "waiting"…) returns screen-free activities matched to the
  child's age (`QUICK_IDEAS`), each with a **☆ Save** button.
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
- `dist/index.html`: page title. Bump `?v=18` after editing CSS/JS so phones
  don't show a cached copy.
- `index.html` (repo root): only redirects to `dist/` for GitHub Pages.

## Work as a group

1. Unzip this source package and create a repository in your group's GitHub account.
2. Upload the `dist` folder and this README, or push them using Git.
3. Invite your teammates as repository collaborators.
4. Each teammate can edit a branch and open a pull request for review.

Changes to your group's copy do not automatically update the original hosted
ChatGPT Site. Deploy your repository with your chosen static host, or bring
updated files back to the Site owner for a new deployment.

This export includes no account credentials, hosting identity, or user-entered
family data. The owner-connected source repository is separate from your
new shared repository.

## Supabase backend foundation

The initial Supabase migration is
[`supabase/migrations/20261103220000_initial_shared_care.sql`](./supabase/migrations/20261103220000_initial_shared_care.sql).
It defines accounts, families, child profiles and care guides, caregiver
permissions, care blocks, handoff updates, help requests, and saved toolkit
ideas/feedback. Row-level security checks active family membership and the
per-child permission scopes (`guide`, `plan`, `toolkit`, `updates`, and
`requests`). Care guide details are stored separately from basic child details
so guide access does not automatically grant access to care plans or toolkit
records.

To try the schema, create a Supabase project and run that migration in its SQL
Editor. The `create_family` database function creates a family and its owner
membership together; `accept_help_request` atomically accepts an open request
for the signed-in caregiver. Do not put a Supabase service-role key in the
browser or in this repository; a public anon/publishable key is intended for
client use only when paired with these row-level policies.

### How this app's data maps to the schema

The app's saved data (`localStorage` key `paal-andres`, version 2) already uses the
schema's table and column names, so it can be synced without a translation layer:

| App data | Supabase table |
|---|---|
| `profile` | `profiles` (`display_name`) |
| `family` | `families` (`name`) |
| `family.children` | `family_children` (`nickname`, `age`, `goals`, `other_goal`) |
| `guides[child_id]` | `child_care_guides` (`needs`, `what_helps`, `calming_strategies`, `easy_game`) |
| `care.caregivers` | caregiver members (`family_memberships` + `profiles.display_name`) |
| `care.permissions` | `family_member_child_permissions` (one row per caregiver and child, `can_view_*`) |
| `care.blocks` | `care_blocks` |
| `care.updates` | `handoff_updates` |
| `care.requests` | `help_requests` (`open`, `accepted`, `completed`, `cancelled`) |
| `saved_ideas` | `family_saved_ideas` (`idea_id` = a quick idea, e.g. `freeze-dance`) |
| `idea_feedback` | `family_idea_feedback` (`Helped`, `Partly`, `Didn't fit`) |

Still app-only (no table yet): completed lessons, chat history and guided-activity
counts. Local ids (e.g. `caregiver-…`) and the `'owner'` placeholder for "accepted by
the parent" would become real user ids once sign-in exists. Data saved by the first
version of this app is upgraded automatically when the page loads.

This is schema groundwork, not a live connection: the static app still uses
browser `localStorage` and has no Supabase sign-in, data synchronization, or
caregiver invitation/acceptance flow. Applying the migration alone will not
share existing demo data or deliver messages to caregivers. Those require
additional application integration and a trusted invitation flow before real
caregiver access should be enabled.

## Limitations

- Data is saved only in this browser's `localStorage` (key `paal-andres`). It is
  not synced between devices. **Reset demo** clears it.
- No accounts, backend or live AI. Tips are general, research-based ideas, not
  medical advice.
