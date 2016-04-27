# -*- coding: utf-8 -*-
from dexi.dexi_api_helper import DexiAPIHelper


class DexiAbstractController:
    def __init__(self, dexi, accountId, accessKey):
        self.api = DexiAPIHelper(dexi, accountId, accessKey)
