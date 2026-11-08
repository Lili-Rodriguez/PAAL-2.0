"""Offline human approval, with exact-content attestation. Never a web endpoint."""
import argparse
import copy
import datetime
import json
from .catalog import KB, PENDING, digest, load_catalog, validate_catalog, today

def promote(source, reviewer, next_review, rights_basis):
    if not reviewer.strip() or not rights_basis.strip(): raise ValueError('Reviewer and rights basis required')
    if not today() < next_review: raise ValueError('Next review must be in the future')
    datetime.date.fromisoformat(next_review)
    if not source['access'].get('actual_article_read'): raise ValueError('Read the actual article first')
    s=copy.deepcopy(source)
    s['review_status']='approved'
    s['rights']={'status':'confirmed_for_stored_summaries_and_model_use','basis':rights_basis}
    for p in s['passages']:
        p['support_review']='approved';p['support_reviewer']=reviewer
    s['human_review']=dict(actor_type='human',reviewer=reviewer,date=today(),next_review=next_review,
                           content_and_support_confirmed=True,rights_confirmed=True,approved_digest=digest(s))
    validate_catalog([s])
    return s

if __name__=='__main__':
    parser=argparse.ArgumentParser(description='List/check candidates, or record a completed human review')
    parser.add_argument('--source-id')
    parser.add_argument('--reviewer')
    parser.add_argument('--next-review')
    parser.add_argument('--rights-basis')
    parser.add_argument('--confirm-human-review',action='store_true',help='Attest that YOU read the article, checked applicability, all claims, adaptations and permitted storage/model use')
    parser.add_argument('--apply',action='store_true')
    args=parser.parse_args()
    pending=load_catalog(PENDING); current=load_catalog()
    if not args.source_id:
        print(json.dumps([dict(id=s['id'],title=s['title'],status=s['review_status'],url=s['url']) for s in pending],indent=2))
    else:
        if not all((args.reviewer,args.next_review,args.rights_basis,args.confirm_human_review)):
            parser.error('Approval requires a named reviewer, next-review, rights-basis and --confirm-human-review')
        candidate=next((s for s in pending if s['id']==args.source_id),None)
        if not candidate: parser.error('Unknown candidate')
        s=promote(candidate,args.reviewer,args.next_review,args.rights_basis)
        catalog=[x for x in current if x['id']!=s['id']]+[s]
        validate_catalog(catalog)
        if args.apply:
            temp=KB.with_suffix('.tmp');temp.write_text(json.dumps(catalog,indent=2)+'\n');temp.replace(KB)
        print('Human-reviewed record validated'+('; approval stored' if args.apply else '; dry run, nothing changed'))
