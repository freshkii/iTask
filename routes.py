from flask import Blueprint, render_template,  redirect, url_for, request
import json

from db import *

root = Blueprint("/", __name__, static_folder="static", template_folder="templates")

@root.route("/")
def home():
    return render_template("home.html")

@root.route("/app")
def application():
    try:
        username = request.args['username']
        token = request.args['token']
    except:
        return redirect(url_for('home'))
    
    try:
        if not valid_user_token(username, token):
            return redirect(url_for('home'))
        else:
            return render_template("app.html")
    except Exception as e:
        return json.dumps("failure")


@root.route("/login")
def login():
    return render_template("login.html")

@root.route("/sign-in")
def signin():
    return render_template("sign-in.html")

auth = Blueprint("auth", __name__, static_folder="static", template_folder="templates")

@auth.route("/sign-in", methods=["POST"])
def signin_api():
    try:
        data = request.json
    except:
        return json.dumps("failure"), 400
    
    print(data)
    
    try:
        response = signin_user(data['username'], data['password'])
        if response:
            return json.dumps({'token': response}), 200
        else:
            return json.dumps("failure")
    except Exception as e:
        print(e)
        return json.dumps("failure db"), 401

@auth.route("/login", methods=["POST"])
def login_api():
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

    if logout_user(data["username"], data["token"]):
        return json.dumps("success")
    else:
        return json.dumps("failure db"), 401


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
