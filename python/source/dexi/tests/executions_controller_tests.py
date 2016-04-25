# -*- coding: utf-8 -*-

import logging
import os
import unittest
import uuid

from __builtin__ import enumerate
from dexi.dexi import Dexi
from dexi.models.state import State

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger(__name__)

account_id = os.environ['DEXI_TEST_ACCOUNT_ID']
access_token = os.environ['DEXI_TEST_ACCESS_TOKEN']

default_inputs = {
    'email': 'test@dexi.io'
}


class ExecutionsControllerTest(unittest.TestCase):
    def __init__(self, methodName='runTest'):
        super(ExecutionsControllerTest, self).__init__(methodName)
        self.executions_controller = Dexi(account_id, access_token).executions()
        self.runs_controller = Dexi(account_id, access_token).runs()
        self.run_id = os.environ['DEXI_TEST_RUN_ID']
        self.execution_id = os.environ['DEXI_TEST_EXECUTION_ID']
        self.file_id = os.environ['DEXI_TEST_FILE_ID']

    def test_execution_get(self):
        execution = self.executions_controller.get(self.execution_id)

        self.assertIsNotNone(execution.starts)
        self.assertIsNotNone(execution.finished)
        self.assertEqual(execution.id, self.execution_id)
        self.assertEqual(execution.state, State.OK)

    def test_execution_get_throws_exception_if_not_found(self):
        try:
            self.executions_controller.get(uuid.uuid4())
            self.fail("APIException not thrown")
        except APIException, e:
            self.assertEqual(e.message, "Not Found")
            self.assertEqual(e.response_code, 404)
            self.assertEqual(e.response_body, '{"error":true,"code":404}')

    def test_execution_get_result(self):
        result = self.executions_controller.get_result(self.execution_id)

        self.validate_test_execution_result(self, result)

    @staticmethod
    def validate_test_execution_result(test, result, email_input=default_inputs['email']):
        header_idx = {
            'email': -1,
            'contact_header': -1,
            'contact_body': -1,
            'logo': -1,
            'email_output': -1,
            'error': -1
        }
        test.assertEqual(len(result.headers), len(header_idx))
        for idx, header in enumerate(result.headers):
            header_idx[header] = idx
        for header in header_idx:
            if header_idx[header] == -1:
                test.fail('Header not found in response %s' % header)

        test.assertEqual(len(result.rows), 1)
        test.assertEqual(len(result.rows[0]), len(header_idx))

        test.assertEqual(result.rows[0][header_idx['email']], email_input)
        test.assertEqual(result.rows[0][header_idx['contact_header']], u'dexi.io')
        assert u'Norre Voldgade 24' in result.rows[0][header_idx['contact_body']]
        assert u'FILE' in result.rows[0][header_idx['logo']]
        test.assertEqual(email_input, result.rows[0][header_idx['email_output']])
        test.assertIsNone(result.rows[0][header_idx['error']])

    def test_execution_get_result_file(self):
        response = self.executions_controller.get_result_file(self.execution_id, self.file_id)

        assert 'PNG' in response

    def test_execution_stop(self):
        execution = self.runs_controller.execute(self.run_id)
        self.assertIsNone(execution.finished)
        self.executions_controller.stop(execution.id)
        execution = self.executions_controller.get(execution.id)

        self.assertEqual(execution.state, State.STOPPED)
        self.assertIsNotNone(execution.finished)

    @unittest.skip('HTTPError: HTTP Error 500: Internal Server Error')
    def test_execution_continue(self):
        execution = self.runs_controller.execute(self.run_id)
        self.executions_controller.stop(execution.id)
        self.executions_controller.continue_(execution.id)
        execution = self.executions_controller.get(execution.id)

        self.assertEqual(execution.state, State.RUNNING)

    @unittest.skip('HTTPError: HTTP Error 400: Bad Request')
    def test_execution_remove(self):
        execution = self.runs_controller.execute(self.run_id)
        self.executions_controller.remove(execution.id)
