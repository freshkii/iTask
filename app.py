from flask import Flask

from routes import task as task_blueprint
from routes import auth as auth_blueprint
from routes import root as root_blueprint

from logs import save_logs

app = Flask(__name__)

app.register_blueprint(root_blueprint)
app.register_blueprint(task_blueprint, url_prefix='/api/task')
app.register_blueprint(auth_blueprint, url_prefix='/api/auth')

if __name__ == '__main__':
    app.run(debug=True)
    save_logs()