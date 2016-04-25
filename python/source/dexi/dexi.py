# -*- coding: utf-8 -*-

from dexi.controllers.executions_controller import ExecutionsController
from dexi.controllers.runs_controller import RunsController

class Dexi:
    def __init__(self, accountId, accessKey):
        self.__accountId = accountId
        self.__accessKey = accessKey

    def executions(self):
        return ExecutionsController(self.__accountId, self.__accessKey)

    def runs(self):
        return RunsController(self.__accountId, self.__accessKey)