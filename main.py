from flask import Flask, request
from db import *
app = Flask(__name__)
app.config['DEBUG'] = True

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
    #num_semesters = request.form('num_semesters'), branch = request.form('branch') ,section = request.form('section'), marks = request.form['marks']
    data = Data(num_sems = int(request.form['num_sems']), branch = request.form['branch'], section = int(request.form['section']), marks = request.form['marks'], marks_string = request.form['marks'])
    data.put()
    return 'Success!'

@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, Nothing at this URL. BulBULle', 404


@app.errorhandler(500)
def application_error(e):
    """Return a custom 500 error."""
    return 'Sorry, unexpected error: {}'.format(e), 500
