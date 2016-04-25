from __builtin__ import dict


class MapModel(dict):
    def __init__(self, **kwargs):
        dict.__init__(self)
        for key in kwargs:
            self[key] = kwargs[key]

    def get_body_param_mapping(self):
        mapping = {}

        # adding additional properties, param names are same as property names
        for name, value in self.iteritems():
            mapping[name] = name

        return mapping
