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
- `dist/styles.css`: Helvetica font stack, colors, responsive layouts, and components.
- `dist/app.js`: screens, form fields, help topics, sample ideas, state, and interactions.

The prototype opens on **About your family** on each page load.
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

## Behavior and limitations

- Family units support multiple children, each with an optional nickname,
  age, one or more support topics, required needs/preferences, and optional
  existing approaches. 'Something else' opens a required custom topic field.
- `No specific needs` is an acceptable needs/preferences response.
- The Today page lets you choose the child whose topics should guide the demo.
- Existing one-child browser profiles are migrated when loaded.
- Family details, saved ideas, feedback, reading status, and weekly family goals persist in this
  browser's localStorage under `paal-prototype`. They are not synced across
  teammates or devices.
- The Progress tab lets parents set and complete weekly Individual and Family goals.
  Goals roll over on Monday; previous weeks are retained locally. Resource reads
  are self-reported; the app cannot verify activity on external resource sites.
- Progress includes a Learning library with short parenting lessons, source links,
  interactive reflection choices, private lesson comments, and locally saved
  completion status. Recommendation detail pages include links to the institutional
  sources that informed each example. Lesson comments and answers stay in this
  browser and are not shared with other parents.
- The Today form offers browser speech recognition where supported. Microphone
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
- This prototype has no account system, backend, shared family accounts,
  production privacy controls, or clinical decision support.

## Checks on this revision

JavaScript syntax and execution checks covered the opening page, migration of
legacy family data, multiple children, family data collection, required fields,
custom topics, active-child selection, topic matching, and all screen renders.
A live browser visual review was not available in the authoring environment.
