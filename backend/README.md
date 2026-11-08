# PAAL curated retrieval backend

PAAL serves parents of children ages **2–12** (24 months until the thirteenth birthday).
The HTML/CSS layout and existing chat renderer are preserved. Python's standard
library remains the backend stack; SQLite FTS5 adds passage search without a new
service or dependency. OpenAI Responses API calls run on the server only.

## Current status — November 8, 2026

**Implemented and tested locally, but live evidence-backed model answers are not yet
activated or verified.** Eight actual parenting articles have been inspected and
prepared in `pending.json`. All are pending human review and permission confirmation.
The live `knowledge.json` is intentionally empty. No source was silently promoted.
`OPENAI_API_KEY` and `PAAL_MODEL` were absent during implementation.

See [the article review packet](SOURCE_REVIEW.md) for URLs, dates, proposed age bands,
selected sections, exclusions, coverage gaps and approval instructions.

The prior implementation counted topic keywords, retrieved every passage of matching
articles and assembled prewritten adaptations. It also labeled automated inspections
as approved. The current implementation replaces that approval assumption, performs
passage-level retrieval, supplies approved evidence to a model, and separately checks
provenance and semantic support before returning an answer.

## Run locally

From the repository root, use Python 3.11+ with SQLite FTS5 enabled:

```sh
python3 -m backend.server --port 8098
```

Open http://127.0.0.1:8098. This serves both the unchanged app layout and its same-origin
`POST /api/answer`. Restart after changing Python code; catalog changes load on the
next request. Static GitHub Pages or `python3 -m http.server` alone cannot serve the API.

`GET /api/health` reports environment configuration and active approval counts. A
configured key is not proof that the external model is reachable or its responses
are clinically valid. Health does not make a billable API call.

## Human review and rights boundary

- `pending.json`: inspected candidates, source metadata, original short factual
  summaries and section locators. Candidate authors/dates are null when not supplied.
- `knowledge.json`: only records with an explicit completed human review may be used.
- Human approval attests to the exact source/passages, proposed ages, substantive
  support, adaptations, exclusions and permitted summary storage/model transmission.
  Source reputation and expert credentials do not automatically approve anything.
- The approval stores a digest of the reviewed record. Editing its content invalidates
  approval. Expired, pending, withdrawn and rejected content is excluded.
- No full articles, images, audio, paid materials or expert quotations are reproduced.
  A publisher reproduction license has not been obtained. Human confirmation of the
  stated storage and model-use basis is required. Do not replace summaries with
  scraped article text without permission. No access controls or paywalls were bypassed.
- Research-supported status requires a documented `research_basis`. These candidates
  are professional guidance or expert opinion; there is no fabricated evidence grade.

List candidates:

```sh
python3 -m backend.review
```

**Only after you have actually completed the human review**, run a dry-run command
with the real reviewer name, future review date and specific rights basis:

```sh
python3 -m backend.review --source-id cdc-emotions \
  --reviewer 'Reviewer name' --next-review 2027-02-08 \
  --rights-basis 'Describe the confirmed basis for these summaries and model use' \
  --confirm-human-review
```

Add `--apply` to record that completed approval. This command is a human attestation,
not an automatic legal/clinical review. Repository write access is the trust boundary;
there is no public approval endpoint. The candidate record stays pending as an intake
snapshot; the attested copy goes into the separate active catalog. `--apply` can replace
an older approval for the same source. To withdraw a source, set its active
`review_status` to `withdrawn` or remove it. Then inspect the diff and run the tests.

To add a resource, create a pending entry with the same metadata and narrow passage
schema. Read the full public article, record authorship, dates, age basis and precise
section locators; assess qualifications, underlying evidence and any conflicting
claims. Record excluded sections and reproduction restrictions. Review each passage's
applicability, not the whole domain. Then follow the same human approval process.

## Retrieval and model flow

1. Pinned safety routing runs before age checks, retrieval or model calls.
2. Ask for age when missing. Reject ordinary parenting advice outside ages 2–12.
3. Load and validate the approved catalog and human attestations. Invalid storage fails
   closed. Match the specific situation intent and passage age scope.
4. Build an ephemeral SQLite FTS5 index, search relevant passages with bound SQL,
   rank with BM25, and return at most six passages / two per source. Generic words
   such as “child” cannot make an unrelated passage relevant. No queries are saved.
5. Send only the current situation, age and retrieved passage summaries, IDs and
   metadata to the server-side model. No URLs, family profile or conversation history
   are supplied to the model. Text typed into the current situation may still contain
   personal information; it is not automatically redacted.
6. Require a strict structured draft. Every action, suggested wording, explanation
   and uncertainty claim must reference a retrieved source/passage pair. The server
   rejects invented/mismatched citations, model-created URLs/HTML, missing claims and
   excessive length. Parent wording is explicitly an adaptation, not a quotation.
7. Make a separate verification call with the original evidence and every draft claim,
   including reassurance and uncertainty. Check actual support, age/situation fit,
   unsafe implications and whether urgent help should replace advice. Missing checks,
   false/uncertain support or service failure produces an explicit non-answer.
8. Build all source links from the approved catalog, then return the frontend's
   existing structured response format. No unrestricted web or memory fallback runs.

The model is instructed to explain meaningful disagreements when supported by the
retrieved evidence, avoid ideology and promises, and consider available capacity
without assuming facts. Non-answer paths use fixed messages and contain no model
advice. Disability/trauma/sensory-specific interventions remain a stated coverage gap.

A second model call is a **probabilistic support check, not proof of entailment or
clinical safety**. Human evaluations of real model outputs are still necessary before
production release. Tests verify the validation contract and rejection paths; they do
not establish actual model accuracy while no live key/model is configured.

Search the runtime-approved collection locally:

```sh
python3 -m backend.search 'hitting' --age-months 96
```

An empty result is expected before human approval. No pending-search flag is available
in runtime retrieval. The fixed intent vocabulary is in `retrieval.py`; extend it
alongside tests when adding genuinely new topics. The initial ranker is intentionally
conservative and is not claimed to understand all paraphrases or multi-issue questions.

## Model setup and missing infrastructure

Set **server environment variables** `OPENAI_API_KEY` and `PAAL_MODEL` to an authorized
key and a Responses-compatible model supporting strict JSON Schema. There is no
default model, browser key field, or automatic credential lookup. See `.env.example`
for names; this server does not automatically load `.env` files.

The adapter follows [official Structured Outputs documentation](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
It uses the fixed HTTPS endpoint `https://api.openai.com/v1/responses`, rejects
redirects, sets `store:false`, supplies no web tools, bounds output/read sizes and
uses a six-second timeout per call. Provider-side retention policies still apply;
`store:false` is not a claim of zero retention. No API credentials were available
for a live provider test. Two external calls are required for a substantive answer.

Also missing: human source and storage/model-use approvals; production backend hosting,
TLS, robust infrastructure rate limits and operational/clinical evaluation. The local
API has no account enforcement. Supabase JWT verification is required before making
it account-restricted. `dist/supabase-config.js` still has blank public configuration;
login is not configured. Supabase is not used for this knowledge collection.

## Safety and privacy

Urgent situations use `safety.py`, independently of model configuration and the
knowledge catalog. These short immediate-help messages were editorially checked,
**not human/clinically signed off**. That missing sign-off is explicitly recorded;
they are not human-approved parenting evidence. Basic emergency routing remains
available even while all parenting articles await approval. Regex recognition is
conservative and cannot guarantee detection of every emergency, abuse disclosure
or serious symptom. It never diagnoses or supplies invented helpline numbers.

The older Childcare.gov source returned 403 and was excluded from the safety sources;
no snippet was substituted for its article. The public USAGov “Report a crime” page
was read for basic child-protection routing. Rebuild the static network-outage fallback
with `python3 -m backend.export_safety` after reviewing safety changes.

No prompt/response, family profile, account token or IP logs; no analytics, outbound
web search, database writes or conversation memory. Existing frontend chat stays in
memory. The bounded global rate-limit queue holds only timestamps. Other family
features retain their pre-existing local storage behavior. This loopback-only stdlib
HTTP server is for local development and serves only `dist`.

## Verification and honest activation check

```sh
python3 -m unittest discover -s tests -v
PAAL_RUN_HTTP_TESTS=1 python3 -m unittest discover -s tests -v
```

On November 8, 2026: **19 tests passed** with HTTP tests enabled. This includes real
local HTTP -> actual retrieval -> model adapter -> separate verifier -> structured
response, using simulated human approvals and a mocked model HTTP transport. No test
approvals are written to the active catalog. Tests cover topic relevance, age bands,
no evidence, pending/expired/modified records, fabricated/mismatched citations,
unsupported advice with real citations, incomplete checks, refusals, missing keys,
safety during outages, and serving the existing frontend without exposing backend files.

**Not yet verified:** a live approved-source + real model response, model support-check
accuracy or visual browser rendering. After real approvals and credentials are in
place, run `python3 -m backend.live_check` with a synthetic test question. Success is
only reported after the actual provider and verifier respond with a grounded answer;
blocked prerequisites exit nonzero. This check does not certify clinical correctness.
