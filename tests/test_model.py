import json
import os
import unittest
from unittest.mock import patch
from backend.model import OpenAIProvider, ModelOutputError, ModelUnavailable, DRAFT_SCHEMA, GENERATOR_RULES
from tests.helpers import FakeProvider, fixture_catalog
from backend.answers import evidence_bundle
from backend.retrieval import retrieve

class Response:
    def __init__(self,data):self.data=data
    def read(self,n):return json.dumps(self.data).encode()[:n]
    def __enter__(self):return self
    def __exit__(self,*args):pass

class AdapterTests(unittest.TestCase):
    def setUp(self):
        self.data=dict(situation='tantrum',age_months=36,approved_evidence=evidence_bundle(retrieve('tantrum',36,fixture_catalog())))
        self.draft=FakeProvider().complete('',self.data,{},'paal_parenting_draft')

    def call(self,response):
        with patch.dict(os.environ,{'OPENAI_API_KEY':'synthetic-test-key','PAAL_MODEL':'test-model'}),patch('backend.model.urllib.request.build_opener') as build:
            build.return_value.open.return_value=Response(response)
            out=OpenAIProvider().complete(GENERATOR_RULES,self.data,DRAFT_SCHEMA,'paal_parenting_draft')
            req=build.return_value.open.call_args.args[0]
            body=json.loads(req.data)
            self.assertFalse(body['store']);self.assertNotIn('tools',body)
            self.assertEqual(body['text']['format']['type'],'json_schema')
            self.assertEqual(body['input'][0]['role'],'system')
            self.assertEqual(body['input'][1]['role'],'user')
            self.assertIn('approved_evidence',json.loads(body['input'][1]['content']))
            self.assertEqual(req.full_url,'https://api.openai.com/v1/responses')
            return out

    def test_wire_contract_and_evidence(self):
        self.assertEqual(self.call(dict(status='completed',output=[dict(type='message',content=[dict(type='output_text',text=json.dumps(self.draft))])])),self.draft)

    def test_refusal_incomplete_malformed(self):
        for result in (dict(status='incomplete'),dict(status='completed',output=[dict(type='message',content=[dict(type='refusal')])]),
                       dict(status='completed',output=[dict(type='message',content=[dict(type='output_text',text='not json')])])):
            with self.assertRaises(ModelOutputError):self.call(result)

    def test_missing_credentials_make_no_network_call(self):
        with patch.dict(os.environ,{'OPENAI_API_KEY':'','PAAL_MODEL':''}),patch('backend.model.urllib.request.build_opener') as build:
            with self.assertRaises(ModelUnavailable):OpenAIProvider().complete('',{},DRAFT_SCHEMA,'test')
            build.assert_not_called()

if __name__=='__main__':unittest.main()
