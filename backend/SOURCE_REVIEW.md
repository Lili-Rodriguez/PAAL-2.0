# Source review packet — pending human review

Prepared November 8, 2026. **Eight candidates, zero active human approvals.** Each
linked article body was opened and read, rather than accepted from a search snippet.
The supplied organization homepages were discovery entry points, not evidence sources.
No subscription/paywall was bypassed. Only short original factual summaries and
metadata are stored. The exact candidate content is in `pending.json`.

| Candidate / exact article | Organization | Displayed author/reviewer | Displayed update/publication date | Proposed ages in PAAL | Selected coverage |
|---|---|---|---|---|---|
| [Tips for Noticing and Naming Emotions](https://www.cdc.gov/parenting-toddlers/noticing-and-naming/emotion-coaching.html) | CDC | Not displayed | April 30, 2026 | 2–4 | Tantrums, emotions, communication |
| [Top Tips for Surviving Tantrums](https://www.healthychildren.org/english/family-life/family-dynamics/communication-discipline/pages/temper-tantrums.aspx) | AAP / HealthyChildren.org | Wendy Sue Swanson, MD, MBE, FAAP | April 21, 2021 | 2–3 | Caregiver capacity |
| [Toddler Tantrums 101: Why They Happen and What You Can Do](https://www.zerotothree.org/resource/toddler-tantrums-101-why-they-happen-and-what-you-can-do/) | ZERO TO THREE | Not displayed | April 10, 2024 | 2–3 | Limits, emotions, transitions |
| [Tips for Giving Directions](https://www.cdc.gov/parenting-toddlers/communication/giving-directions.html) | CDC | Not displayed | April 30, 2026 | 2–4 | Communication, boundaries |
| [Toddler Biting: Finding the Right Response](https://www.zerotothree.org/resource/toddler-biting-finding-the-right-response/) | ZERO TO THREE | Not displayed | February 22, 2025 | 2–3 | Biting |
| [How to Ease Your Child’s Separation Anxiety](https://www.healthychildren.org/English/ages-stages/toddler/Pages/Soothing-Your-Childs-Separation-Anxiety.aspx) | AAP / HealthyChildren.org | Wendy Sue Swanson, MD, MBE, FAAP | May 11, 2026 | 2–4 | Separation |
| [Improving Family Communications](https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Improving-Family-Communications.aspx) | AAP / HealthyChildren.org | Not displayed | December 15, 2025 | Proposed 2–12 | Communication, caregiver stress |
| [What’s the Best Way to Discipline My Child?](https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Disciplining-Your-Child.aspx) | AAP / HealthyChildren.org | Not displayed | November 5, 2018 | Proposed 2–12, with narrower passage bands | Hitting, boundaries, repair |

All retrieval dates are November 8, 2026. A displayed date is not proof that every
claim has been freshly reviewed. `publication_or_update_date` records what the page
shows; missing authors are stored as null. These candidates are professional guidance
or expert opinion, not independently assessed systematic research evidence.

## What needs the human reviewer’s attention

The proposed age bands are editorial applicability decisions, not publisher-stated
numeric eligibility or clinical efficacy claims. CDC Essentials identifies its audience
as 2–4. Toddler sources are kept narrow. Broad family communication and parent repair
are proposed for 2–12; confirm appropriateness across ages and communication needs.
The discipline source has distinct proposed toddler (24–35 months), preschool (36–71)
and gradeschool (72–155) passage bands. These bands must be checked before approval.

`pending.json` includes section locators, proposed adaptations and exclusions for each
article. Compare every summary, action, suggested phrase and explanation with the
actual linked section. Do not approve a resource merely because its publisher or
author is reputable. In particular, the older discipline article and sources containing
physical holding, punitive measures or categorical developmental claims require care.
Those parts were excluded from candidate passages. No automatic whole-article approval
is implied by approving its selected summaries.

CDC distress guidance and some AAP/ZERO TO THREE distraction suggestions have different
contexts and timing. A reviewer should preserve that distinction. Only approved
passages can be supplied to the model; pending or excluded recommendations must never
be introduced merely to make an answer appear more complete.

Human review must also confirm the permitted basis for **storing these original
summaries and sending them to a model**. No publisher reproduction license was obtained;
public access alone is not permission to reproduce an article. No full text, images,
paid resources or expert quotations are included. If that basis cannot be confirmed,
reject/withdraw the affected candidate rather than promoting it.

## Coverage limits after approval

These candidates form a small collection across the five requested areas. They do
not make every topic appropriate for every age from 2–12. In particular, toddler
biting and preschool separation must not be reused for a 10-year-old. Broader
school-age regulation, school separation, disability-specific interventions and
sensory/trauma-specific advice need additional inspected and human-approved resources.
Questions outside available evidence must keep returning an explicit evidence gap.

## Safety sources are separate

Pinned immediate-help routing is in `safety.py`, outside parenting retrieval. Its
source metadata explicitly records editorial review pending human sign-off:

- [AAP: When to Call Emergency Medical Services (EMS) for Your Child](https://www.healthychildren.org/english/health-issues/injuries-emergencies/pages/when-to-call-emergency-medical-services-ems.aspx), Brooke Redmond, MD, CHSE, FAAP; updated May 11, 2026.
- [USAGov: Report a crime](https://www.usa.gov/report-crime), “Crimes involving children”; updated September 17, 2026; individual author not displayed.

Both public page bodies were inspected on November 8, 2026. The former Childcare.gov
page returned 403 and was removed from the safety source metadata. It was not bypassed
or accepted on the basis of its search snippet. The immediate-help fallback is kept
available while human safety review is outstanding; it is not labeled clinically approved.

## Record a completed human review

See [the review command](README.md#human-review-and-rights-boundary). Run it only after
the review is complete, with the actual reviewer name, specific rights basis and a
future review date. The tool never decides that an article or expert is trustworthy
on its own. It records the human’s attestation and invalidates it when the approved
record changes.
