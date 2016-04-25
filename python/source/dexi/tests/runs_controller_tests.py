# -*- coding: utf-8 -*-

import logging
import os
import random
import string
import unittest

import time
from dexi.dexi import Dexi
from dexi.models.bulk_inputs import BulkInputs
from dexi.models.run_inputs import RunInputs
from dexi.models.state import State
from dexi.tests.executions_controller_tests import ExecutionsControllerTest

logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger(__name__)

account_id = os.environ['DEXI_TEST_ACCOUNT_ID']
access_token = os.environ['DEXI_TEST_ACCESS_TOKEN']


class RunsControllerTest(unittest.TestCase):
    def __init__(self, methodName='runTest'):
        super(RunsControllerTest, self).__init__(methodName)
        self.runs_controller = Dexi(account_id, access_token).runs()
        self.run_id = os.environ['DEXI_TEST_RUN_ID']
        self.executions_controller = Dexi(account_id, access_token).executions()

    def test_run_get(self):
        run = self.runs_controller.get(self.run_id)

        self.assertEqual(run.id, self.run_id)
        self.assertEqual(run.name, 'Default')

    def test_run_execute(self):
        execution = self.runs_controller.execute(self.run_id)

        self.assertIsNotNone(execution.id)
        self.assertTrue(execution.state in [State.QUEUED, State.RUNNING])
        self.assertIsNotNone(execution.starts)
        self.assertIsNone(execution.finished)

    def test_run_execute_sync(self):
        result = self.runs_controller.execute_sync(self.run_id)

        ExecutionsControllerTest.validate_test_execution_result(self, result)

    def test_run_execute_with_input_sync(self):
        email = self.__random_email()
        result = self.runs_controller.execute_with_input_sync(RunInputs(email=email), self.run_id)

        ExecutionsControllerTest.validate_test_execution_result(self, result, email_input=email)

    def test_run_execute_bulk_sync(self):
        email1 = self.__random_email()
        email2 = self.__random_email()
        result = self.runs_controller.execute_bulk_sync(BulkInputs([RunInputs(email=email1),
                                                                    RunInputs(email=email2)]), self.run_id)

        self.assertEqual(len(result.rows), 2)

    def test_run_execute_with_input(self):
        email = self.__random_email()
        execution = self.runs_controller.execute_with_input(RunInputs(email=email), self.run_id)

        self.assertIsNotNone(execution.id)
        self.assertTrue(execution.state in [State.QUEUED, State.RUNNING])
        self.assertIsNotNone(execution.starts)
        self.assertIsNone(execution.finished)

        result = self.get_async_result(execution)
        ExecutionsControllerTest.validate_test_execution_result(self, result, email)

    def get_async_result(self, execution):
        while execution.state != State.OK:
            if execution.state == State.FAILED:
                raise Exception("Execution failed")
            time.sleep(1)
            execution = self.executions_controller.get(execution.id)
        result = self.executions_controller.get_result(execution.id)
        return result

    def test_run_execute_bulk(self):
        email = self.__random_email()
        execution = self.runs_controller.execute_bulk(BulkInputs([RunInputs(email=email)]), self.run_id)

        self.assertIsNotNone(execution.id)
        self.assertTrue(execution.state in [State.QUEUED, State.RUNNING])
        self.assertIsNotNone(execution.starts)
        self.assertIsNone(execution.finished)

    def test_run_get_latest_results(self):
        result = self.runs_controller.get_latest_result(self.run_id)

        self.assertEqual(len(result.headers), 6)

    def test_run_get_executions(self):
        execution_result = self.runs_controller.get_executions(self.run_id, 0, 3)

        self.assertEqual(len(execution_result.rows), 3)
        self.assertIsNotNone(execution_result.total_rows)

    def __random_email(self):
        return '%s@dexi.io' % ''.join(random.choice(string.lowercase) for i in range(10))
