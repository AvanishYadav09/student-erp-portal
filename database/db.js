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
    roll TEXT UNIQUE,
    branch TEXT,
    semester TEXT,
    phone TEXT,
    password TEXT DEFAULT 'student123'
)
`, () => {
    // Try adding password column safely if it doesn't exist
    db.run("ALTER TABLE students ADD COLUMN password TEXT DEFAULT 'student123'", (err) => {
        // Ignore duplicate column error and ensure default values
        db.run("UPDATE students SET password = 'student123' WHERE password IS NULL OR password = ''", () => {});
    });

    // Seed initial demo student accounts if table is empty
    db.get("SELECT COUNT(*) AS count FROM students", (err, row) => {
        if (!row || row.count === 0) {
            db.run(`INSERT OR IGNORE INTO students (name, roll, branch, semester, phone, password) VALUES 
                ('Alex Morgan', 'CS-101', 'Computer Science', '6th', '+1 9876543210', 'student123'),
                ('Emma Watson', 'IT-102', 'Information Tech', '6th', '+1 9876543211', 'student123'),
                ('John Smith', 'ME-103', 'Mechanical Eng', '4th', '+1 9876543212', 'student123')
            `);
        }
    });
});
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

// Promisified helpers for async/await
db.getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

db.allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

db.runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

module.exports = db;