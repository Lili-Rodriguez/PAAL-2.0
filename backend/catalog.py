"""Source approval boundary. Only human-attested, unchanged records are retrievable."""
import datetime
import hashlib
import json
from pathlib import Path
from urllib.parse import urlsplit

KB = Path(__file__).with_name('knowledge.json')
PENDING = Path(__file__).with_name('pending.json')

def today():
    return datetime.datetime.now(datetime.timezone.utc).date().isoformat()

def digest(source):
    content={k:v for k,v in source.items() if k not in ('human_review','review_status')}
    return hashlib.sha256(json.dumps(content,sort_keys=True,ensure_ascii=True).encode()).hexdigest()

def approved(source):
    h=source.get('human_review') or {}
    return (source.get('review_status')=='approved' and h.get('actor_type')=='human'
            and h.get('content_and_support_confirmed') is True and h.get('rights_confirmed') is True
            and bool(h.get('reviewer')) and h.get('approved_digest')==digest(source)
            and h.get('date','9999') <= today() <= h.get('next_review',''))

def validate_catalog(sources):
    if not isinstance(sources,list): raise ValueError('Catalog must be a list')
    ids, passages=set(),set()
    for s in sources:
        required=('id','url','title','publisher','author_or_reviewer','publication_or_update_date',
                  'retrieval_date','ages_months','topics','review_status','evidence_type','storage_basis',
                  'review','access','rights','passages','age_basis')
        if not isinstance(s,dict) or not all(k in s for k in required) or s['id'] in ids:
            raise ValueError('Missing or duplicate source metadata')
        ids.add(s['id'])
        url=urlsplit(s['url'])
        if url.scheme!='https' or not url.hostname or url.username or url.password:
            raise ValueError('Source needs a valid HTTPS URL')
        if s['review_status'] not in ('pending','approved','rejected','withdrawn'):
            raise ValueError('Invalid review status')
        if s['evidence_type'] not in ('professional_guidance','expert_opinion','research_supported'):
            raise ValueError('Invalid evidence type')
        if s['evidence_type']=='research_supported' and not s.get('research_basis'):
            raise ValueError('Research support needs an assessed research basis')
        datetime.date.fromisoformat(s['retrieval_date'])
        if s['publication_or_update_date']: datetime.date.fromisoformat(s['publication_or_update_date'])
        lo,hi=s['ages_months']
        if not 0<=lo<=hi<=215 or not s['passages']: raise ValueError('Invalid source ages or empty content')
        if not s['storage_basis'] or not s['rights'].get('basis'):
            raise ValueError('Missing storage/rights basis')
        for p in s['passages']:
            if p['id'] in passages or not all(p.get(k) for k in ('text','topics','locator','action','wording','why','support_reviewer')):
                raise ValueError('Missing passage/support metadata')
            passages.add(p['id'])
            a,b=p['ages_months']
            if not lo<=a<=b<=hi: raise ValueError('Passage age outside source scope')
            if not all(isinstance(t,str) and t for t in p['topics']): raise ValueError('Invalid topic')
        if s['review_status']=='approved':
            h=s.get('human_review') or {}
            for key in ('date','next_review'):
                datetime.date.fromisoformat(h.get(key,''))
            if (h.get('actor_type')!='human' or h.get('content_and_support_confirmed') is not True
                or h.get('rights_confirmed') is not True or not h.get('reviewer')
                or h.get('approved_digest')!=digest(s) or not s['access'].get('actual_article_read')
                or s['rights']['status']!='confirmed_for_stored_summaries_and_model_use'
                or any(p.get('support_review')!='approved' for p in s['passages'])):
                raise ValueError('Approved source needs human content/support/rights attestation for this exact content')
    return sources

def load_catalog(path=None):
    return validate_catalog(json.loads((path or KB).read_text()))
