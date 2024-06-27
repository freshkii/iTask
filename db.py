import sqlite3
from os.path import exists

import secrets
import hashlib

DATABASE = "data.db"

class DB:
    """
    Context manager that automatically closes the cursor and database connection 
    Return a cursor object upon entering.
    """
    def __init__(self):
        self.conn = sqlite3.connect(DATABASE)
    
    def __enter__(self):
        self.conn = self.conn.__enter__()
        self.cursor = self.conn.cursor()
        return self.cursor
    
    def __exit__(self, *exc_info):
        self.cursor.close()
        self.conn.commit()
        self.conn.close()

def init_db():
    with open(DATABASE, "w") as f:
        pass

    with DB() as cursor:
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
 
# creates database if not existing
if not exists(DATABASE):
    init_db()

# -- AUTH --

def generate_token() -> str:
    return secrets.token_urlsafe(16)

def hash(password: str) -> str:
    h = hashlib.sha256()
    h.update(password.encode())
    return h.hexdigest()

# check if username already used
def username_exists(username: str) -> bool:
    with DB() as cursor:
        cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
        return bool(cursor.fetchone())

# check if username and password are those of a user
def valid_credentials(username: str, password: str) -> bool:
    if not username: # the users signed in with google haven't passwords
        return False
    with DB() as cursor:
        cursor.execute("SELECT id FROM users WHERE username = ? AND password = ?", (username, hash(password)))
        return bool(cursor.fetchone())

# check if username and token are those of a user
def valid_connection(username: str, token: str) -> bool:
    if not(username and token):
        return False

    with DB() as cursor:
        cursor.execute("SELECT id FROM users WHERE username = ? and token = ?", (username, token))
        return bool(cursor.fetchone())

def signin_user(username, password):
    # verify credentials
    if username_exists(username):
        return "username already used"

    with DB() as cursor:
        password = hash(password)
        cursor.execute("INSERT INTO users (username, password) VALUES(?,?)", (username, password))

        token = generate_token()
        cursor.execute("UPDATE users SET token = ? WHERE username = ? AND password = ?", (token, username, password))
        return token

def login_user(username, password):
    # verify credentials
    if not valid_credentials(username, password):
        return "invalid credentials"
 
    with DB() as cursor:
        password = hash(password)

        token = generate_token()
        cursor.execute("UPDATE users SET token = ? WHERE username = ? AND password = ?", (token, username, password))
        return token

def logout_user(username, token):
    # verify connection
    if not valid_connection(username, token):
        return "invalid connection"

    with DB() as cursor:
        cursor.execute("UPDATE users SET token = NULL WHERE username = ?", (username))
        return bool(cursor.rowcount)

# -- TASKS --

def update_task(username,token,task):
    # verify connection
    if not valid_connection(username,token):
        return "invalid connection"

    with DB() as cursor:
        # if task hasn't any id then we don't do anything
        if not task[0]:
            return

        cursor.execute(
            "UPDATE tasks SET content = ?, checked = ?, canceled = ? WHERE id = ? AND user_id = (SELECT id FROM users WHERE username = ?)",
            (task[1], task[2], task[3], task[0], username))

def create_task(username,token,task):
    # verify connection
    if not valid_connection(username, token):
        return "invalid connection"

    # checks if the id of the task is a digit equal to 0
    # comment: this is useless for the functionment of the app itself
    # though it can prevent "a little bit" from hackers
    if task[0] != "0":
        return "bad request"

    with DB() as cursor:
        cursor.execute(
            "INSERT INTO tasks (content, checked, canceled, user_id) VALUES (?,?,?, (SELECT id FROM users WHERE username = ?))",
            (task[1], task[2], task[3], username))
        return bool(cursor.rowcount)

def get_tasks(username,token):
    # verify connection
    if not valid_connection(username,token):
        return "invalid connection"
    
    # send tasks
    with DB() as cursor:
        cursor.execute(
            "SELECT id, content, checked, canceled FROM tasks WHERE user_id = (SELECT id FROM users WHERE username = ?) ORDER BY id ASC",
            (username,))
        return cursor.fetchall()

def delete_task (username,token,task):
    # verify connection
    if not valid_connection(username,token):
        return "invalid connection"
    
    # delete task
    with DB() as cursor:
        cursor.execute(
            "DELETE FROM tasks WHERE id=? AND user_id = (SELECT id FROM users WHERE username = ?)",
            (task[0],username))
        return bool(cursor.rowcount)