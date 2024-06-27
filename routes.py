from flask import Blueprint, render_template,  redirect, url_for, request
import json

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request

from db import *



flow = Flow.from_client_secrets_file("client_secrets.json", scopes=['https://www.googleapis.com/auth/userinfo.profile'])

flow.redirect_uri = "http://127.0.0.1/oauth"

root = Blueprint("/", __name__, static_folder="static", template_folder="templates")

# update requests responses

@root.route("/")
def home():
    return render_template("home.html")

@root.route("/app")
def application():
    return render_template("app.html")

@root.route("/login")
def login():
    return render_template("auth.html", operation='login')

@root.route("/sign-in")
def signin():
    return render_template("auth.html", operation="sign-in")

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates")

@auth.route("/sign-in", methods=["POST"])
def signin_api():
    try:
        data = request.json
        username = data["username"]
        password = data["password"]
    except:
        return json.dumps("failure"), 400
    
    try:
        response = signin_user(username, password)
        if response:
            return json.dumps({'token': response}), 200
        else:
            return json.dumps("failure"), 400
    except Exception as e:
        print(e)
        return json.dumps("failure"), 500

@auth.route("/login", methods=["POST"])
def login_api():
    #TODO: Add provider type to bypass password verification
    try:
        data = request.json
    except:
        return json.dumps("failure"), 400

    try:
        response = login_user(data["username"], data["password"])
        if response:
            return json.dumps({'token':response}), 200
        else:
            return json.dumps("failure"), 400
    except Exception as e:
        print(e)
        return json.dumps("failure db"), 401

@auth.route("/logout", methods=["POST"])
def logout_api():
    try:
        data = request.json
    except:
        return json.dumps("failure"), 400

    res = logout_user(data["username"], data["token"])
    if res:
        return json.dumps("success")
    else:
        return json.dumps("failure db"), 401

@auth.route("/getuser", methods=["POST"])
def getuser_api():
    try:
        data = request.json
    except:
        return json.dumps("failure"), 400
    
    try:
        response = username_exists(data["username"])
        return json.dumps(response)
    except:
        return json.dumps("failure"), 400

@auth.route("/valid-session", methods=["POST"])
def validsession_api():
    try:
        data = request.json
    except:
        return json.dumps("failure"), 400
    
    try:
        response = valid_user_token(data["username"], data["token"])
        if response: 
            return json.dumps(True)
        else:
            return json.dumps(False)
    except:
        return json.dumps("failure"), 400
        


task = Blueprint("task", __name__, static_folder="static", template_folder="templates")

@task.route("/read") # methods=["GET"]
def read():
    if not request.args:
        return json.dumps("error no args")
    try:
        tasks = get_tasks(request.args.get("username"), request.args.get("token"))
        return json.dumps(tasks)
    except Exception as e:
        print(e)
        return json.dumps("error args")

@task.route("/create", methods=["POST"])
def create():
    try:
        data = request.json
    except:
        return json.dumps("request must be json")
    
    if not valid_user_token(data.get('username'), data.get("token")):
        return json.dumps("invalid json")
    
    id = create_task(data.get("username"), data.get("token"), data.get("task"))

    if id == "user not found error":
        return json.dumps("failure")
    else:
        return json.dumps({"id":id})

@task.route("/update", methods=["PUT"])
def update():
    try:
        data = request.json
    except:
        return json.dumps("request must be json")
    
    if not valid_user_token(data.get("username"), data.get("token")):
        return json.dumps("invalid json")
    
    id = update_task(data.get("username"), data.get("token"), data.get("task"))

    if id == "user not found error":
        return json.dumps("failure")
    else:
        return json.dumps({"id":id})

@task.route('/delete', methods=['DELETE'])
def delete():
    try:
        data = request.json
    except:
        return json.dumps('request must be json')
    
    if not valid_user_token(data.get('username'), data.get('token')):
        return json.dumps('invalid json')
    
    if delete_task(data.get('username'), data.get('token'), data.get('task')):
        return json.dumps("success")
    else:
        return json.dumps("failure")
