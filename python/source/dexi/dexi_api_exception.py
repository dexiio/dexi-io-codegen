# -*- coding: utf-8 -*-

class DexiAPIException(Exception):
    def __init__(self, msg, response_code, response_body):
        Exception.__init__(self, msg)
        self.response_code = response_code
        self.response_body = response_body
