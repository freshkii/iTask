from flask import Blueprint, render_template, request, redirect

import json
import traceback

from db import *
from logs import *

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
    return render_template("auth.html", operation="login")

@root.route("/sign-in")
def signin():
    return render_template("auth.html", operation="sign-in")

"""
this function is used for request with json content
checks the validity of:
    - the request content-type
    - the presence of the params (username, password, token, ...)
yes ?
    -> write in the d dict for each params
        key: param (param)
        value: associated request content (request.json[param])

output:
    - error status code (invalid) or True (valid)
"""
def request_valid(request, params: list[str], d: dict[str]):
    try:
        data = request.json
    except:
        return 415
    try:
        for param in params:
            d[param] = data[param]
    except:
        return 401

"""
Structure of functions below
"""

# -- AUTH --

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates")

@auth.route("/sign-in", methods=["POST"])
def signin_api():
    d = {}
    try:
        # verify validity
        response = request_valid(request, ["username", "password"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code

        # handle request
        response = signin_user(d["username"], d["password"])
        if response == "username already used":
            return json.dumps("username already used")
        else:
            return json.dumps({"token": response}) # 200
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500

@auth.route("/login", methods=["POST"])
def login_api():
    d = {}
    try:
        # verify request validity
        response = request_valid(request, ["username", "password"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code

        # handle request
        response = login_user(d["username"], d["password"])
        if response == "invalid credentials":
            add_log({
                "error_type": "400",
                "log": f"{request.remote_addr} attempted to connect with username: {d["username"]} and password: {d["password"]}"
                })
            return json.dumps("failure"), 401
        else:
            return json.dumps({"token":response}) # 200
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500

@auth.route("/logout", methods=["POST"])
def logout_api():
    d = {}
    try:
        # verify request validity
        response = request_valid(request, ["username", "token"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code

        # handle request
        response = logout_user(d["username"], d["token"])
        if response == "invalid connection":
            add_log({
                "error_type": "401",
                "log": f"{request.remote_addr} attempted to logout with username: {d["username"]} and token: {d["token"]}"
                })
            return json.dumps("failure"), 401
        else:
            return json.dumps("success") # 200
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500

@auth.route("/getuser", methods=["POST"])
def getuser_api():
    d = {}
    try:
        # verify request validity
        response = request_valid(request, ["username"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code
    
        # handle request
        response = username_exists(d["username"])
        return json.dumps(response)
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500

@auth.route("/valid-session", methods=["POST"])
def validsession_api():
    d = {}
    try:
        # verify request validity
        response = request_valid(request, ["username", "token"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code

        # handle request
        response = valid_connection(d["username"], d["token"])
        return json.dumps(response)
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500

# -- TASK --

task = Blueprint("task", __name__, static_folder="static", template_folder="templates")

@task.route("/read") # methods=["GET"]
def read():
    try:
        # verify if request got args
        if not request.args:
            return json.dumps("failure"), 415
        
        try:
            username = request.args["username"]
            token = request.args["token"]
        except:
            return json.dumps("failure"), 400
        
        # handle request
        tasks = get_tasks(username, token)
        if tasks == "invalid connection":
            return json.dumps("failure"), 401
        else:
            return json.dumps(tasks) 
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500

@task.route("/create", methods=["POST"])
def create():
    d = {}
    try:
        response = request_valid(request, ["username", "token", "task"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code

        #  handle request
        response = create_task(d["username"], d["token"], d["task"])
        if response == "invalid connection":
            return json.dumps("failure"), 401
        elif response == "bad request":
            return json.dumps("failure"), 400
        else:
            return json.dumps({"id":response})
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500

@task.route("/update", methods=["PUT"])
def update():
    d = {}
    try:
        response = request_valid(request, ["username", "token", "task"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code
    
        # handle request
        id = update_task(d["username"], d["token"], d["task"])
        if id == "invalid connection":
            return json.dumps("failure"), 401
        else:
            return json.dumps({"id":id})
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500


@task.route("/delete", methods=["DELETE"])
def delete():
    d = {}
    try:
        response = request_valid(request, ["username", "token", "taks"], d)
        if response is int: # -> error status code
            return "failure", response # ~ status code
    
        # handle request
        if delete_task(d["username"], d["token"], d["task"]) == "invalid connection":
            return json.dumps("failure"), 401
        else:
            return json.dumps("success") # 200
    except:
        add_log({
            "error_type": "500",
            "log": traceback.format_exc()
        })
        return json.dumps("failure"), 500