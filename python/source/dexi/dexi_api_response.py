# -*- coding: utf-8 -*-

class DexiAPIResponse:
    def __init__(self, status_code, response_body, headers):
        self.status_code = status_code
        self.response_body = response_body
        self.headers = headers
