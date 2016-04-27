# -*- coding: utf-8 -*-

class DexiAPIException:
    def __init__(self, response):
        self.data = response.response_body
        self.mime_type = response.headers["Content-Type"]
