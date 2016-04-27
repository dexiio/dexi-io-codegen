# -*- coding: utf-8 -*-

from dexi.controllers.executions_controller import ExecutionsController
from dexi.controllers.runs_controller import RunsController

class Dexi:
    def __init__(self, account_id, api_key):
        self._account_id = account_id
        self._api_key = api_key
        self.user_agent = "Dexi-Java/1.0"
        self.request_timeout = 3600
        self.endpoint = "https://api.dexi.io"



    def executions(self):
        return ExecutionsController(self._account_id, self._api_key)

    def runs(self):
        return RunsController(self._account_id, self._api_key)