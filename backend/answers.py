"""Approved passage retrieval -> grounded draft -> provenance and independent support check."""
import math
import re
from .catalog import KB, load_catalog, approved, validate_catalog
from .retrieval import retrieve
from .safety import safety_answer
from .model import (OpenAIProvider, ModelUnavailable, ModelOutputError, GENERATOR_RULES,
                    VERIFIER_RULES, DRAFT_SCHEMA, CHECK_SCHEMA, validate_shape)

SPECIAL=re.compile(r'\b(autis\w*|disab\w*|sensory|nonverbal|non-verbal|adhd|trauma)\b',re.I)

def base(status,text,question=None):
    return dict(version=1,status=status,reassurance=text,parent_words=None,actions=[],why=None,
                question=question,uncertainty=[],citations=[],sources=[],retrieved_passage_ids=[],support_checks=[])

def evidence_bundle(retrieved):
    return [dict(source_id=s['id'],passage_id=p['id'],title=s['title'],publisher=s['publisher'],
                 evidence_type=s['evidence_type'],ages_months=p['ages_months'],topics=p['topics'],
                 passage=p['text'],locator=p['locator'],scope=s['review']['scope']) for _,s,p in retrieved]

def claims(draft):
    return [('reassurance',dict(text=draft['reassurance'],refs=[]))]+[
        ('parent_words',draft['parent_words']),('why',draft['why'])]+[
        (f'action-{i}',c) for i,c in enumerate(draft['actions'])]+[
        (f'uncertainty-{i}',c) for i,c in enumerate(draft['uncertainty'])]

def check_support(draft,retrieved):
    """Structural citation validation BEFORE the independent semantic verification call."""
    validate_shape(draft,DRAFT_SCHEMA)
    if draft['status']!='answer': raise ModelOutputError('Only substantive answers use support validation')
    if not 1<=len(draft['actions'])<=3 or len(draft['uncertainty'])>2:
        raise ModelOutputError('Action or uncertainty count invalid')
    pairs={(s['id'],p['id']) for _,s,p in retrieved}
    for label,c in claims(draft):
        if not c['text'].strip() or re.search(r'https?://|www\.|<[^>]+>',c['text'],re.I):
            raise ModelOutputError('Empty claim or model-generated link/markup')
        if label!='reassurance' and not c['refs']: raise ModelOutputError('Missing claim citation')
        for ref in c['refs']:
            if (ref['source_id'],ref['passage_id']) not in pairs: raise ModelOutputError('Citation not retrieved')
    if draft['question'] and re.search(r'https?://|<[^>]+>',draft['question'],re.I): raise ModelOutputError('Invalid question')
    if sum(len(c['text'].split()) for _,c in claims(draft))>240: raise ModelOutputError('Answer too long')
    return [dict(claim_id=label,**c) for label,c in claims(draft)]

def generate(text,age,retrieved,provider):
    evidence=evidence_bundle(retrieved)
    data=dict(situation=text,age_months=age,approved_evidence=evidence)
    draft=provider.complete(GENERATOR_RULES,data,DRAFT_SCHEMA,'paal_parenting_draft')
    validate_shape(draft,DRAFT_SCHEMA)
    if draft['status']!='answer':
        # Never display unconstrained model text or recommendations on non-answer paths.
        return base('insufficient_evidence','The approved passages do not provide enough guidance for this situation.',
                    'What happened just before this, and what do you most need help with now?')
    checked=check_support(draft,retrieved)
    verdict=provider.complete(VERIFIER_RULES,dict(**data,draft=draft,claims=checked),CHECK_SCHEMA,'paal_support_check')
    validate_shape(verdict,CHECK_SCHEMA)
    if verdict['urgent_help_needed']: return safety_answer('immediate danger')
    expected={c['claim_id'] for c in checked}
    checks=verdict['checks']
    if (not verdict['all_supported'] or not verdict['safe'] or not verdict['age_and_situation_fit']
        or len(checks)!=len(expected) or {c['claim_id'] for c in checks}!=expected
        or any(c['supported'] is not True for c in checks)):
        return base('unavailable','I couldn’t verify that the suggested advice is supported by the approved passages. I won’t present it as guidance.')
    result=base('answer',draft['reassurance'],draft['question'] or None)
    def claim(c,adaptation=False):
        # Existing frontend uses the first citation beside the text; all supporting
        # articles are also in the sources list at the end of the response.
        return dict(text=c['text'],**c['refs'][0],source_refs=c['refs'],**({'adaptation':True} if adaptation else {}))
    result['parent_words']=claim(draft['parent_words'],True)
    result['actions']=[claim(c) for c in draft['actions']]
    result['why']=claim(draft['why'])
    result['uncertainty']=[c['text'] for c in draft['uncertainty']]
    ids=list(dict.fromkeys(ref['source_id'] for _,c in claims(draft) for ref in c['refs']))
    metadata={s['id']:s for _,s,p in retrieved}
    result['citations']=ids
    result['sources']=[{k:v for k,v in metadata[id].items() if k!='passages'} for id in ids]
    result['retrieved_passage_ids']=[p['id'] for _,s,p in retrieved]
    result['support_checks']=[dict(claim_id=c['claim_id'],result='model_support_check_passed') for c in checked]
    result['generation']='retrieval_grounded_model_with_separate_support_check'
    return result

def answer(payload,sources=None,provider=None):
    text=payload.get('message')
    if not isinstance(text,str) or not text.strip() or len(text)>2000: raise ValueError('message must contain 1–2000 characters')
    safety=safety_answer(text)
    if safety: return safety
    age=payload.get('age_months')
    if age is None:
        return base('clarify','I need your child’s age to choose developmentally appropriate guidance.','How old is the child this is about (in years or months)?')
    if isinstance(age,bool) or not isinstance(age,(int,float)) or not math.isfinite(age) or not 0<=age<=215:
        raise ValueError('Invalid age_months')
    if not 24<=age<156: return base('out_of_scope','PAAL is designed for parents of children ages 2–12.')
    try:
        retrieved=retrieve(text,age,load_catalog() if sources is None else validate_catalog(sources))
    except (OSError,ValueError,KeyError,TypeError):
        return base('unavailable','The reviewed guidance collection is unavailable. I can’t give an evidence-backed answer right now.')
    if not retrieved:
        return base('insufficient_evidence','I don’t have human-approved guidance matching this age and situation yet.')
    if SPECIAL.search(text):
        return base('clarify','The collection does not yet include human-approved guidance for the specific disability, sensory or trauma context mentioned.',
                    'What communication or sensory support does your child already use?')
    try:
        return generate(text,age,retrieved,provider or OpenAIProvider())
    except ModelUnavailable:
        return base('unavailable','Relevant approved guidance was found, but the answer model is not configured or is unavailable. I won’t substitute unsupported advice.')
    except (ModelOutputError,ValueError,KeyError,TypeError):
        return base('unavailable','I couldn’t verify an answer against the approved guidance. Please try again later.')
