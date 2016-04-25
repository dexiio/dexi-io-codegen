# -*- coding: utf-8 -*-
from dexi.api_helper import APIHelper


class AbstractController:
    def __init__(self, x_cloud_scrape_account, x_cloud_scrape_access):
        self.api_helper = APIHelper(x_cloud_scrape_account, x_cloud_scrape_access)
