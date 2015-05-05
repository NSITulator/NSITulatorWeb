from google.appengine.ext  import ndb


class Request(ndb.Model):
    semester_attempted = ndb.IntegerProperty(indexed = False)
    branch = ndb.StringProperty(indexed = False)
    marks = ndb.StringProperty(repeated=True, indexed = False)

