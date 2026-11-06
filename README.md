# PAAL interactive prototype

A buildless HTML, CSS, and JavaScript prototype for a parenting companion.

## Run it

Open `dist/index.html` directly in a browser, or run from this folder:

```sh
python3 -m http.server 8000 --directory dist
```

Then visit http://localhost:8000. No installation, API key, or build step is needed.
A local server is recommended for predictable browser storage behavior.

## Files to edit

- `dist/index.html`: document title, metadata, and asset references.
- `dist/styles.css`: system font stack, colors, responsive layouts, and components.
- `dist/app.js`: screens, form fields, help topics, sample ideas, state, and interactions.

The prototype opens on the **Family** dashboard on each page load. Choose
**Edit family** to add or update family details; **Get started** from the welcome
screen opens the family editor when details are still incomplete.
In `app.js`, `helpTopics` contains 21 support topics; `familyMarkup()` renders
the family editor; `familyErrors()` validates each child's required topics and
needs; `ideas` contains the sample suggestions; `render()` selects a screen;
and `bind()` connects the interactions.

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

## Supabase account setup

The initial Supabase migration is
[`supabase/migrations/20261103220000_initial_shared_care.sql`](./supabase/migrations/20261103220000_initial_shared_care.sql).
It defines profiles, families, child profiles and care guides, caregiver
permissions, care blocks, handoff updates, help requests, and saved toolkit
ideas/feedback, with Row Level Security policies for family membership and
per-child permissions. The migration also creates a profile when an Auth user
signs up.

To turn on account creation and sign-in:

1. Create a Supabase project and run the migration in its SQL Editor.
2. In **Project Settings → API**, copy the project URL and public anon/publishable
   key into `url` and `anonKey` in [`dist/supabase-config.js`](./dist/supabase-config.js).
   These public client values are not passwords. Never use a service-role key
   in this file or anywhere in browser code.
3. In **Authentication → URL Configuration**, set the production site URL and
   allow the local development URL (for example `http://localhost:8000`) and
   production URL as redirects. Configure email confirmation and SMTP for the
   experience you want.
4. Serve the `dist` directory over HTTP (see **Run it**) and reload. With valid
   configuration, visitors must create an account or sign in before entering
   the app. The UI also supports password reset.

This is the first authentication step, not full backend data integration. At
present, family details and activity still save to this browser's local storage
(separate local records per signed-in account); they do not sync across devices
or appear to other caregivers. Existing unsigned demo data is not imported.
Family and caregiver tables in Supabase are not yet read or written by the app,
and caregiver invitations are not implemented. Do not use the prototype to
store real sensitive family information until those flows and access controls
have been connected and tested.

## Behavior and limitations

- Family units support multiple children, each with an optional nickname,
  age, one or more support topics, required needs/preferences, and optional
  existing approaches. 'Something else' opens a required custom topic field.
- `No specific needs` is an acceptable needs/preferences response.
- The Today page lets you choose the child whose topics should guide the demo.
- Main navigation follows the Today, Learn, Care, and Family layout. Learn opens the lesson library (with weekly goals available as a secondary view). Care combines today’s caregiver coordination with saved ideas, past attempts, and trusted resources.
- The Family tab shows selectable child profiles, recent feedback, weekly goals, and additional ideas to explore. Edit family details or add another child from that screen.
- Each child can have a caregiver guide with their needs, calming strategies, and an easy game to play. Caregivers can share or copy the guide into a message; updates remain local and must be shared again.
- The Care tab offers browser-local caregiver permission previews, today's care blocks, handoff updates, and help requests with a demo acceptance action. Caregivers can be granted Family toolkit access for selected children; the toolkit shows who has that permission. Names and permissions are not accounts: no invitations, posts, or requests reach another person.
- Existing one-child browser profiles are migrated when loaded.
- Family details, saved ideas, feedback, reading status, and weekly family goals persist in this
  browser's localStorage under `paal-prototype`. They are not synced across
  teammates or devices.
- The Learn tab lets parents explore lessons and set or complete weekly Individual and Family goals.
  Goals roll over on Monday; previous weeks are retained locally. Resource reads
  are self-reported; the app cannot verify activity on external resource sites.
- The Learn tab includes a library with short parenting lessons, source links,
  interactive reflection choices, private lesson comments, and locally saved
  completion status. Recommendation detail pages include links to the institutional
  sources that informed each example. Lesson comments and answers stay in this
  browser and are not shared with other parents.
- The Today form offers browser speech recognition where supported. Interim
  speech appears as you speak and can be edited before continuing. Microphone
  permission is required; typing remains available as a fallback.
- Reset demo clears the local prototype state after confirmation.
- Recommendations are static examples, not a live AI service or research database.
  Matching uses topic keywords and a subset of circumstance controls. Lesson and
  recommendation references are linked for readers to review; free-text needs and
  preferences do not produce individualized academic or clinical advice. Evidence
  summaries are brief and should be interpreted in the context of each family.
- CSS requests Helvetica, then Helvetica Neue, Arial, and the system sans-serif
  fallback. A device without Helvetica uses the next available font. No
  proprietary font files are distributed.
- The app has no connected account system or live caregiver sync yet. Care-tab
  permissions and interactions remain local demo previews; no invitations,
  updates, or help requests are delivered to caregivers. The Supabase migration
  is an unconnected schema foundation, not production privacy controls or
  clinical decision support.

## Checks on this revision

Browser checks covered the opening page, family and Care navigation, local
caregiver permissions, care-block creation and editing, handoff updates, help
request acceptance, toolkit tabs and search, saved-idea persistence, resource
access, and a 390px mobile layout. Care-tab changes remain local demo data.
