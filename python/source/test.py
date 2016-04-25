import unittest

from dexi.tests.executions_controller_tests import ExecutionsControllerTest
from dexi.tests.runs_controller_tests import RunsControllerTest

tests = [
    ExecutionsControllerTest,
    RunsControllerTest,
]
unittest.main()
