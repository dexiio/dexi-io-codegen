from __builtin__ import list


class ListModel(list):
    def __init__(self, args, **kwargs):
        list.__init__(self, args)
