class BaseModel:
    def __init__(self, args=None, **kwargs):
        self.param_mapping = None

    def get_body_param_mapping(self):
        mapping = {}
        if self.param_mapping:
            # reversing param mapping, key will be the param name, value is the property name
            mapping = {v: k for k, v in self.param_mapping.items()}

        return mapping
