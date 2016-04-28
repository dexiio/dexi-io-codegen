# -*- coding: utf-8 -*-
import gzip
import logging
import re
import json
import urllib2
from StringIO import StringIO

from dexi.dexi_api_exception import DexiAPIException
from dexi.dexi_api_response import DexiAPIResponse
from dexi.models.base_model import BaseModel

log = logging.getLogger(__name__)


class DexiAPIHelper:
    def __init__(self, dexi, account_id, access_token):
        self.__dexy = dexi
        self.__headers = {
            "X-DexiIO-Account": account_id,
            "X-DexiIO-Access": access_token,
            "User-Agent": "DexiIO-Python/1.0",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }


    def send_request(self, url, httpMethod, request_body, request_headers = {}):
        body = None

        if request_body:
            body = self.__to_request_body(request_body)

        request = RequestWithMethod(url, data=body, headers=self.__headers, method=httpMethod)
        response = urllib2.urlopen(request, timeout= self.__dexy.request_timeout)
        return DexiAPIResponse(response.code, response.read(), response.headers)


    def __to_request_body(self, obj):
        return json.dumps(self.__get_body_object(obj)) if obj is not None else None

    def __get_body_object(self, obj):
        if obj is None:
            return None
        if isinstance(obj, list):
            # list
            body = list()
            for item in obj:
                body.append(self.__get_body_object(item))
        elif isinstance(obj, BaseModel):
            # model object
            body = {}
            mapping = obj.get_body_param_mapping()
            for param in mapping:
                key = mapping[param]
                value = __get_value(key, obj)
                if isinstance(value, BaseModel):
                    # model value
                    body[param] = self.__get_body_object(value)
                else:
                    # simple or None value
                    body[param] = value
        else:
            # simple type
            body = obj
        return body

    def __get_value(self, key, obj):
        value = None
        if hasattr(obj, key):
            value = getattr(obj, key)
        elif hasattr(obj, 'additional_properties'):
            value = obj.additional_properties[key]
        return value

    def make_url(self, url, path_parameters, query_parameters):
        if url is None:
            raise ValueError("url is null")
        if path_parameters is None:
            return url

        for key in path_parameters:
            element = path_parameters[key]
            if element is None:
                replace_value = ""
            elif isinstance(element, list):
                replace_value = "/".join(element)
            else:
                replace_value = str(element)
            url = url.replace('{{{0}}}'.format(key), str(replace_value))

        query = self.__make_query_string(query_parameters)

        if query :
            url += query

        return url

    def __make_query_string(self, parameters):

        has_params = False
        for key in parameters:
            element = parameters[key]
            if element is None:
                continue
            separator = '&' if has_params else '?'
            if isinstance(element, list):
                url = url + '{0}{1}[]={2}'.format(separator, key, '&{0}[]='.format(key).join(element))
            else:
                url = url + '{0}{1}={2}'.format(separator, key, str(parameters[key]))
            has_params = True

        if has_params:
            return url

        return None

class RequestWithMethod(urllib2.Request):
    def __init__(self, *args, **kwargs):
        self._method = kwargs.pop('method', None)
        urllib2.Request.__init__(self, *args, **kwargs)

    def get_method(self):
        return self._method if self._method else super(RequestWithMethod, self).get_method()

