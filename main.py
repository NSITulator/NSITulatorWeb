from flask import Flask, request
from db import *
import json
app = Flask(__name__)
# app.config['DEBUG'] = True

# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.


"""`main` is the top level module for your Flask application."""

# Import the Flask Framework
from flask import Flask
app = Flask(__name__)
# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.


@app.route('/')
def hello():
    """Return a friendly HTTP greeting."""
    return 'Hello World!'

@app.route('/store_marks', methods=['POST'])
def store_marks():
    # num_semesters = request.form['num_semesters']
    # branch = request.form['branch']
    # section = request.form['section']
    # marks = request.form['marks']
    data = Data(num_sems = int(request.form['num_sems']), branch = request.form['branch'], \
     section = int(request.form['section']), marks = request.form['marks'], \
     marks_string = request.form['marks'], ip_address = request.remote_addr)
    data.put()
    return 'Success!'

@app.route('/test')
def test():
    data = Data.query(ndb.AND(Data.branch == "coe", Data.num_sems == 5))
    # return str(data.fetch())
    average, unique, marks_list = get_average_marks(data.fetch())
    return "Average marks in English in COE: " + str(average) + "<br>\nNumber of entries: " + str(data.count()) + "<br>\nNumber of unique entries: " + str(unique) + "<br>\nList of marks: " + str(marks_list)

@app.route('/test_marks/<num_sems>')
def test_marks(num_sems):
    num_sems = int(num_sems)
    data = Data.query(ndb.AND(Data.branch == "coe", Data.num_sems == num_sems)).order(Data.date)
    output_str = "Number of entities: "+str(data.count())+"<br><br><br>"
    result = data.fetch()
    for idx, entity in enumerate(result):
        # del entity['ip_address']
        output_str += 'Entity '+str(idx)+":<br>"
        output_str += 'Date/time: '+str(entity.date)+'<br>'
        output_str += 'Number of sems: '+str(entity.num_sems)+'<br>'
        output_str += 'Section: '+str(entity.section)+'<br>'
        output_str += 'Marks: <br>'+str(entity.marks_string)
        # output_str += str(entity)
        output_str += '<br><br><br><br>'
    return output_str

def get_average_marks(data):
    sum_marks = 0
    count = 0
    marks_list = {}
    for d in data:
        j = json.loads(d.marks_string)
        if d.ip_address not in marks_list:
            marks_list[d.ip_address] = int(j[0]["TH1"])
        else:
            marks_list[d.ip_address] = max(marks_list[d.ip_address], int(j[0]["TH1"]))
    for marks in marks_list.values():
        if marks == 0:
            continue
        sum_marks += marks
        count += 1
    return float(sum_marks)/count, count, marks_list.values()

@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, Nothing at this URL. BulBULle', 404


@app.errorhandler(500)
def application_error(e):
    """Return a custom 500 error."""
    return 'Sorry, unexpected error: {}'.format(e), 500
