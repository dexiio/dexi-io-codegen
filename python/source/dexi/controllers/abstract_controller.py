# -*- coding: utf-8 -*-
from dexi.api_helper import APIHelper


class AbstractController:
    def __init__(self, accountId, accessKey):
        self.api_helper = APIHelper(accountId, accessKey)
