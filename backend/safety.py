"""Pinned editorial safety guidance: independent of knowledge storage/retrieval."""
import re

SOURCES = [dict(id='safety-aap', title='When to Call Emergency Medical Services (EMS) for Your Child',
 url='https://www.healthychildren.org/english/health-issues/injuries-emergencies/pages/when-to-call-emergency-medical-services-ems.aspx',
 publisher='American Academy of Pediatrics / HealthyChildren.org', author_or_reviewer='Brooke Redmond, MD, CHSE, FAAP',
 publication_or_update_date='2026-05-11', retrieval_date='2026-11-08', ages_months=[0,215], topics=['medical emergency'],
 review_status='editorially_reviewed_pending_human_signoff', evidence_type='professional_guidance', storage_basis='Original factual summary',
 review={'reviewer':'Codex editorial inspection (not clinical approval)', 'date':'2026-11-08'},
 passage='Breathing difficulty, unresponsiveness and severe symptoms require immediate emergency help; prompt medical concerns need a clinician.'),
 dict(id='safety-abuse', title='Report a crime — Crimes involving children', publisher='USAGov / U.S. General Services Administration',
 url='https://www.usa.gov/report-crime',
 author_or_reviewer=None, publication_or_update_date='2026-09-17', retrieval_date='2026-11-08', ages_months=[0,215],
 topics=['abuse', 'danger'], review_status='editorially_reviewed_pending_human_signoff', evidence_type='professional_guidance',
 storage_basis='Original factual summary', review={'reviewer':'Codex editorial inspection (not clinical approval)', 'date':'2026-11-08'},
 passage='Crimes involving children: call emergency services for an emergency; contact the state child protective agency for child abuse and neglect.')]

EMERGENCY = re.compile(r"\b(not breathing|can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|unconscious|unresponsive|blue lips|seizure|choking|bleeding (?:that |which )?(?:won'?t|will not) stop|vomiting blood|overdos\w*|poison\w*|suicid\w*|kill (?:myself|himself|herself|them|him|her)|(?:might|want to|going to|afraid i(?: will|'ll)) (?:hurt|hit|shake|harm)\b|shook (?:my|the) baby|immediate danger)\b", re.I)
ABUSE = re.compile(r'\b(abus\w*|molest\w*|sexual touch\w*|neglect\w*|(?:partner|parent|caregiver|husband|wife) (?:hits?|beats?|hurts?)|(?:hit|beat|hurt) (?:my|the) child)\b', re.I)
MEDICAL = re.compile(r'\b(fever|dehydrat\w*|stiff neck|severe pain|head injury|letharg\w*|rash|sick|vomit\w*)\b', re.I)
HARMFUL = re.compile(r'\b(spank\w*|humiliat\w*|restrain\w*|withhold food|lock\w* (?:him|her|them)|physical punishment|hit (?:him|her|them))\b', re.I)

def safety_answer(text):
    kind = 'emergency' if EMERGENCY.search(text) else 'abuse' if ABUSE.search(text) else 'medical' if MEDICAL.search(text) else 'unsafe_request' if HARMFUL.search(text) else None
    if not kind:
        return None
    wording = {
      'emergency': 'If this is happening now or someone may be hurt, contact your local emergency services immediately (911 in the United States). Do not wait for a chat reply. Tell the dispatcher what is happening and follow their instructions.',
      'abuse': 'Possible abuse needs direct help. If anyone is in immediate danger, contact local emergency services (911 in the United States). Otherwise contact local child protective services or a trusted healthcare professional promptly. PAAL cannot assess safety or investigate abuse.',
      'medical': 'This needs medical guidance rather than a parenting strategy. Contact your child’s clinician promptly. For trouble breathing, unresponsiveness, or severe or rapidly worsening symptoms, contact local emergency services now (911 in the United States). PAAL cannot diagnose symptoms.',
      'unsafe_request': 'I can’t help with physical punishment, humiliation, withholding basic needs, or unsafe restraint. If someone may be hurt now, contact local emergency services. Are you asking about a situation happening right now?'
    }[kind]
    ids = ['safety-abuse'] if kind in ('abuse', 'unsafe_request') else ['safety-aap']
    return dict(version=1, status='safety', safety_kind=kind, reassurance=wording, parent_words=None,
                actions=[], why=None, question=None, uncertainty=[], citations=ids,
                sources=[s for s in SOURCES if s['id'] in ids], retrieved_passage_ids=[], support_checks=[])
