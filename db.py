from google.appengine.ext import ndb


class Data(ndb.Model):
    num_sems = ndb.IntegerProperty()
    branch = ndb.StringProperty()
    section = ndb.IntegerProperty()
    marks = ndb.JsonProperty()
    marks_string = ndb.StringProperty(indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)
    ip_address = ndb.StringProperty()
