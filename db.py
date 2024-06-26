import sqlite3
from os.path import exists

import secrets
import hashlib

data = 'data.db'

def connect():
    return sqlite3.connect(data)

def init_db():
    with open(data, 'w') as db:
        pass
    conn = connect()
    cursor = conn.cursor()
    cursor.execute("""CREATE TABLE tasks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        content TEXT NOT NULL,
                        checked INTEGER NOT NULL,
                        canceled INTEGER NOT NULL,
                        user_id INTEGER NOT NULL,
                        FOREIGN KEY (user_id)
                        REFERENCES user(id)
                            ON DELETE CASCADE
                    )""")
    
    cursor.execute("""CREATE TABLE users (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       username TEXT NOT NULL UNIQUE,
                       password TEXT NOT NULL check(length(password) >= 6),
                       token TEXT
                  )""")
    
    conn.commit()
    conn.close()

# creates database

if not exists(data):
    init_db()

# -- AUTH --

def generate_token():
    return secrets.token_urlsafe(16)

def hash(password):
    h = hashlib.sha256()
    h.update(password.encode())
    return h.hexdigest()

def username_exists(username):
    conn = connect()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        res = True
    else:
        res = False

    conn.close()
    return res


def valid_user_password(username, password):
    conn = connect()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE username = ? AND password = ?", (username, hash(password)))
    res = cursor.fetchone()

    conn.close()
    return bool(res)

def valid_user_token(username, token):
    conn = connect()
    cursor = conn.cursor()

    if not(username and token):
        return False
    cursor.execute("SELECT id FROM users WHERE username = ? and token = ?", (username, token))
    if cursor.fetchone():
        return True
    else:
        return False

def signin_user(username, password):
    conn = connect()
    cursor = conn.cursor()


    if username_exists(username):
        response = None
    else:
        password = hash(password)
        cursor.execute("INSERT INTO users (username, password) VALUES(?,?)", (username, password))

        token = generate_token()
        cursor.execute("UPDATE users SET token = ? WHERE username = ? AND password = ?", (token, username, password))

        response = token 

    conn.commit()
    conn.close()
    return response

def login_user(username, password):
    #TODO: Add provider type to bypass password verification
    conn = connect()
    cursor = conn.cursor()

    if not valid_user_password(username, password):
        return None 
    
    password = hash(password)

    token = generate_token()
    cursor.execute("UPDATE users SET token = ? WHERE username = ? AND password = ?", (token, username, password))

    conn.commit()
    conn.close()
    return token

def logout_user(username, token):
    conn = connect()
    cursor = conn.cursor()


    if not valid_user_token(username, token):
        return None

    cursor.execute("UPDATE users SET token = NULL WHERE username = ? AND token = ?", (username, token))
    res = bool(cursor.rowcount)

    conn.commit()
    conn.close()
    return res

# -- TASKS --

def update_task(username,token,task):
    conn = connect()
    cursor = conn.cursor()

    if not valid_user_token(username,token):
        return "user not found error"

    if task[0]:
        cursor.execute("UPDATE tasks SET content = ?, checked = ?, canceled = ? WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ? AND token = ?)", (task[1], task[2], task[3], task[0],username,token))
        conn.commit()
    
    conn.close()

def create_task(username,token,task):
    conn = connect()
    cursor = conn.cursor()

    if not valid_user_token(username,token):
        return "user not found error"

    try:
        task[0] = int(task[0])
    except:
        return "bad request"
    if task[0] == 0:
        cursor.execute("INSERT INTO tasks (content, checked, canceled, user_id) VALUES (?,?,?, (SELECT id FROM users WHERE username = ? AND token = ?))", (task[1], task[2], task[3], username, token))
        id = cursor.lastrowid
        conn.commit()
    else:
        id = 0

    conn.close()
    return id

def get_tasks (username,token):
    # establish connection with db
    conn = connect()
    cursor = conn.cursor()

    if not valid_user_token(username,token):
        return "user not found error"

    # make request
    cursor.execute("SELECT id, content, checked, canceled FROM tasks WHERE user_id = (SELECT id FROM users WHERE username = ? and token = ? ) ORDER BY id ASC",(username,token))
    response = cursor.fetchall()

    conn.close()
    return response

def delete_task (username,token,task):
    # establish connection with db
    conn = connect()
    cursor = conn.cursor()

    if not valid_user_token(username,token):
        return "user not found error"

    # make request
    cursor.execute("DELETE FROM tasks WHERE id=? AND user_id = (SELECT id FROM users WHERE username = ? and token = ?)", (task[0],username,token))

    res = bool(cursor.rowcount)

    conn.commit()
    conn.close()

    return res