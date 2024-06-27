import json
from os.path import exists
import datetime

logs = {}
init_date = datetime.datetime.now().strftime("%d/%m/%Y, %H:%M:%S")


# create the logs.json file in case it's not already
if not exists("logs.json"):
    with open("logs.json", "w") as f:
        pass

def add_log(log: str):
    print(log)
    current_date = datetime.datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
    logs[current_date] = log

def save_logs():
    with open("logs.json") as f:
        content = json.load(f)
        content[init_date] = logs
    
    with open("logs.json", "w") as f:
        json.dump(content, f, indent=4)