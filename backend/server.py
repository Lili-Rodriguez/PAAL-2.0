"""Local same-origin app/API server. Standard library only; no request-content logs."""
import argparse
import json
import time
from collections import deque
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from .answers import answer
from .catalog import load_catalog, approved
from .model import configuration

DIST = Path(__file__).resolve().parents[1] / 'dist'

class Handler(SimpleHTTPRequestHandler):
    # One bounded global window; no IPs, tokens, names, prompts or responses retained.
    requests = deque(maxlen=121)

    def __init__(self,*args,**kwargs):
        super().__init__(*args, directory=str(DIST), **kwargs)

    def log_message(self,*args):
        pass

    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Referrer-Policy','no-referrer')
        super().end_headers()

    def reply(self,code,data):
        body=json.dumps(data).encode()
        self.send_response(code)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length',str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if urlsplit(self.path).path == '/api/health':
            try:
                count=sum(approved(s) for s in load_catalog())
                collection='ready' if count else 'awaiting_human_approval'
            except (OSError, ValueError, KeyError, TypeError):
                count=0; collection='unavailable'
            return self.reply(200,dict(status='ok', generator='retrieval_grounded_model',
                model_configured=configuration(), approved_source_count=count, collection_status=collection,
                supported_ages_years=[2,12]))
        if urlsplit(self.path).path.startswith('/api/'):
            return self.reply(404,dict(error='Not found'))
        return super().do_GET()

    def do_POST(self):
        if self.path != '/api/answer':
            return self.reply(404,dict(error='Not found'))
        # Same-origin only, no CORS. Never trust forwarded headers.
        origin=self.headers.get('Origin')
        if origin and origin not in ('http://'+self.headers.get('Host',''), 'https://'+self.headers.get('Host','')):
            return self.reply(403,dict(error='Cross-origin requests are not allowed'))
        now=time.monotonic()
        if len(self.requests)>=120 and now-self.requests[0]<60:
            return self.reply(429,dict(error='Please try again in a minute'))
        self.requests.append(now)
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=8192:
                return self.reply(413,dict(error='Request too large or empty'))
            if self.headers.get('Content-Type','').split(';')[0] != 'application/json':
                return self.reply(415,dict(error='Expected JSON'))
            self.connection.settimeout(10)
            payload=json.loads(self.rfile.read(size))
            if not isinstance(payload,dict) or set(payload)-{'message','age_months'}:
                raise ValueError('Expected only message and optional age_months')
            return self.reply(200,answer(payload))
        except (ValueError,TypeError,UnicodeError):
            return self.reply(400,dict(error='Invalid request: provide message (1–2000 characters) and optional age_months (0–215)'))
        except Exception:
            return self.reply(503,dict(error='Reviewed guidance unavailable'))

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--port',type=int,default=8098)
    args=parser.parse_args()
    print(f'PAAL: http://127.0.0.1:{args.port}',flush=True)
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    server.daemon_threads=True
    server.serve_forever()
