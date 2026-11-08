"""Search runtime-approved passages; pending content is never a runtime search input."""
import argparse
import json
from .catalog import load_catalog
from .retrieval import retrieve

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('query')
    parser.add_argument('--age-months',type=int,required=True)
    args=parser.parse_args()
    print(json.dumps([dict(source_id=s['id'],passage_id=p['id'],text=p['text'],
                           locator=p['locator'],url=s['url'],score=score)
                      for score,s,p in retrieve(args.query,args.age_months,load_catalog())],indent=2))
