"""Opt-in live provider check with synthetic data. Never prints prompts, keys or drafts."""
import json
from .answers import answer
from .catalog import load_catalog, approved
from .model import configuration

if __name__=='__main__':
    if not configuration():
        raise SystemExit('BLOCKED: OPENAI_API_KEY and PAAL_MODEL are required; no provider call made.')
    if not any(approved(s) for s in load_catalog()):
        raise SystemExit('BLOCKED: no human-approved sources; no provider call made.')
    # This fictional situation is deliberately not loaded from anyone’s profile.
    result=answer(dict(message='A child is having a tantrum. What can a caregiver try?',age_months=36))
    print(json.dumps(dict(status=result['status'],source_ids=result['citations'],
                         support_check_count=len(result['support_checks']))))
    raise SystemExit(0 if result['status']=='answer' else 2)
