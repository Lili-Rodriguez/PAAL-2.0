"""Ephemeral SQLite FTS5 passage search. No user queries are persisted."""
import re
import sqlite3
from .catalog import approved

INTENTS={
 'repair':r'\b(repair|apologi\w*|i yelled|i shouted|yelled at|after (?:a )?(?:fight|conflict)|lost my temper)\b',
 'caregiver_stress':r'\b(stress\w*|overwhelmed|burn\w* out|my patience|exhausted|need a break)\b',
 'separation':r'\b(separation|drop[- ]?off|daycare|goodbye|cling\w*|leaving me|leave (?:him|her|them))\b',
 'transitions':r'\b(transition\w*|leav\w* (?:the )?park|stop playing|switch\w* activit\w*|activity ends?|time to leave)\b',
 'biting':r'\b(bit(?:e|es|ing|ten)?)\b',
 'hitting':r'\b(hit(?:s|ting)?|kick\w*|punch\w*)\b',
 'boundaries':r'\b(boundar\w*|limit\w*|rules?|discipline)\b',
 'communication':r'\b(communicat\w*|listen\w*|talk\w*|directions?|won.t listen)\b',
 'tantrums':r'\b(tantrum\w*|meltdown\w*|scream\w*)\b',
 'emotions':r'\b(emotion\w*|angry|upset|cry\w*|big feelings|frustrat\w*)\b'
}

def intents(text):
    return [topic for topic,pattern in INTENTS.items() if re.search(pattern,text,re.I)]

def retrieve(text, age, sources, limit=6):
    topics=intents(text)
    if not topics: return []
    # Intent-specific tags are the retrieval vocabulary. Shared words like 'child'
    # must not turn unrelated questions into apparently relevant evidence.
    primary=topics[0]
    db=sqlite3.connect(':memory:')
    try:
        db.execute('CREATE VIRTUAL TABLE passages USING fts5(topics, body, tokenize="porter unicode61")')
        rows={}
        for s in sources:
            if not approved(s): continue
            for p in s['passages']:
                if p.get('support_review')!='approved' or not p['ages_months'][0]<=age<=p['ages_months'][1]: continue
                if primary not in p['topics']: continue
                row=db.execute('INSERT INTO passages(topics,body) VALUES (?,?)',(' '.join(p['topics']),p['text'])).lastrowid
                rows[row]=(s,p)
        query=' OR '.join('"'+topic+'"' for topic in topics)
        hits=db.execute('SELECT rowid, bm25(passages, 4.0, 1.0) FROM passages WHERE passages MATCH ? ORDER BY 2, rowid',(query,)).fetchall()
        output=[]
        per_source={}
        for row,rank in hits:
            s,p=rows[row]
            if per_source.get(s['id'],0)>=2: continue
            output.append((-rank,s,p));per_source[s['id']]=per_source.get(s['id'],0)+1
            if len(output)>=limit: break
        return output
    finally:
        db.close()
