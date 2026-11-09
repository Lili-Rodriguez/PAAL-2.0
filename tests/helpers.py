"""Simulated approvals/models ONLY for tests; never written to the live catalog."""
import copy
from backend.catalog import PENDING, load_catalog
from backend.review import promote

def fixture_catalog():
    return [promote(s,'SIMULATED HUMAN REVIEW — TEST ONLY','2099-01-01','TEST ONLY: permitted summaries assumed for isolated test') for s in load_catalog(PENDING)]

class FakeProvider:
    def __init__(self,mutate=None,verdict_mutate=None):
        self.calls=[];self.mutate=mutate;self.verdict_mutate=verdict_mutate
    def complete(self,rules,data,schema,name):
        self.calls.append((name,copy.deepcopy(data)))
        if name=='paal_parenting_draft':
            e=data['approved_evidence'][0]
            ref=dict(source_id=e['source_id'],passage_id=e['passage_id'])
            # Use test catalog adaptations to make the mock response deterministic.
            p=next(p for s in fixture_catalog() for p in s['passages'] if p['id']==e['passage_id'])
            def claim(text): return dict(text=text,refs=[ref.copy()])
            out=dict(status='answer',reassurance='You’re asking for help with a difficult moment.',
                     parent_words=claim(p['wording']),actions=[claim(p['action'])],why=claim(p['why']),question='',uncertainty=[])
            if self.mutate:self.mutate(out)
            return out
        out=dict(all_supported=True,age_and_situation_fit=True,safe=True,urgent_help_needed=False,
                 checks=[dict(claim_id=c['claim_id'],supported=True,reason='Mock verifier, not semantic validation') for c in data['claims']])
        if self.verdict_mutate:self.verdict_mutate(out)
        return out
