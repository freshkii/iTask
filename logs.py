import json
from os.path import exists
import os
import datetime

LOGS_FILE = "/data/logs.json" if os.environ.get("DOCKER_PROCESS", False) else "logs.json"

logs = {}
init_date = datetime.datetime.now().strftime("%d/%m/%Y, %H:%M:%S")


# create the logs.json file in case it's not already
if not exists(LOGS_FILE):
    with open(LOGS_FILE, "w") as f:
        pass

def add_log(log: str):
    print(log)
    current_date = datetime.datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
    logs[current_date] = log

def save_logs():
    with open("logs.json") as f:
        try:
            content = json.load(f)
        except json.JSONDecodeError:
            content = {}
        content[init_date] = logs
    
    with open("logs.json", "w") as f:
        json.dump(content, f, indent=4)