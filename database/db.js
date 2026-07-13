const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/database.db", (err) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Connected to SQLite Database");
    }
});

db.run(`
CREATE TABLE IF NOT EXISTS students(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    roll TEXT,
    branch TEXT,
    semester TEXT,
    phone TEXT
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS attendance(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT,
    status TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS marks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject TEXT,
    internal_marks INTEGER,
    external_marks INTEGER,
    total INTEGER,
    FOREIGN KEY(student_id) REFERENCES students(id)
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS marks(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject TEXT,
    internal_marks INTEGER,
    external_marks INTEGER,
    total INTEGER
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS admins(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
)
`);
db.run(`
INSERT OR IGNORE INTO admins(id, username, password)
VALUES (1, 'admin', 'admin123')
`);

module.exports = db;