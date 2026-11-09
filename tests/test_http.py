"""Opt-in real local HTTP test. Model HTTP transport and human approvals are simulated."""
import json
import os
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from backend.server import Handler
from backend.model import ModelUnavailable
from tests.helpers import FakeProvider,fixture_catalog
from tests.test_model import Response

@unittest.skipUnless(os.environ.get('PAAL_RUN_HTTP_TESTS')=='1','Opt-in: PAAL_RUN_HTTP_TESTS=1')
class HTTPTests(unittest.TestCase):
    def setUp(self):
        self.server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True);self.thread.start()
        self.url='http://127.0.0.1:'+str(self.server.server_port)
        self.client=urllib.request.build_opener()
    def tearDown(self):
        self.server.shutdown();self.server.server_close();self.thread.join()
    def post(self,text='My child is having a tantrum',age=36):
        req=urllib.request.Request(self.url+'/api/answer',data=json.dumps(dict(message=text,age_months=age)).encode(),headers={'Content-Type':'application/json'})
        return json.load(self.client.open(req,timeout=5))

    def test_actual_catalog_http_fail_closed_and_frontend(self):
        health=json.load(self.client.open(self.url+'/api/health'))
        self.assertEqual(health['approved_source_count'],0)
        self.assertEqual(self.post()['status'],'insufficient_evidence')
        self.assertEqual(self.post('My child is not breathing')['status'],'safety')
        self.assertIn(b'app.js',self.client.open(self.url+'/').read())
        with self.assertRaises(urllib.error.HTTPError) as error:self.client.open(self.url+'/../backend/pending.json')
        error.exception.close()

    def test_full_http_retrieval_adapter_verifier_response(self):
        fake=FakeProvider()
        class Opener:
            def open(self,request,timeout):
                body=json.loads(request.data)
                value=fake.complete(body['input'][0]['content'],json.loads(body['input'][1]['content']),body['text']['format']['schema'],body['text']['format']['name'])
                return Response(dict(status='completed',output=[dict(type='message',content=[dict(type='output_text',text=json.dumps(value))])]))
        # urllib.request.urlopen above is real; only outbound model transport is mocked.
        with patch('backend.answers.load_catalog',return_value=fixture_catalog()),patch.dict(os.environ,{'OPENAI_API_KEY':'test-key','PAAL_MODEL':'test-model'}),patch('backend.model.urllib.request.build_opener',return_value=Opener()):
            a=self.post()
            self.assertEqual(a['status'],'answer');self.assertEqual(len(fake.calls),2)
            self.assertTrue(a['sources'][0]['url'].startswith('https://www.cdc.gov/'))
            self.assertIn(a['actions'][0]['passage_id'],a['retrieved_passage_ids'])
            self.assertTrue(a['support_checks'])
            self.assertEqual(self.post('biting',120)['status'],'insufficient_evidence')

if __name__=='__main__':unittest.main()
