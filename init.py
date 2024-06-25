import sqlite3

def init_db():
    conn = sqlite3.connect('data.db')
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
    
    # "SELECT * FROM tasks WHERE user_id = ?", (id)
    
    cursor.execute("""CREATE TABLE users (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       username TEXT NOT NULL UNIQUE,
                       password TEXT NOT NULL check(length(password) >= 6),
                       token TEXT
                  )""")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
