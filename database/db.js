const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("SQLite Connection Error:", err.message);
    } else {
        console.log("Connected to SQLite Database at", dbPath);
    }
});

// Use db.serialize to ensure sequential schema setup & migration execution
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            roll TEXT NOT NULL UNIQUE COLLATE NOCASE,
            branch TEXT DEFAULT 'Computer Science',
            semester TEXT DEFAULT '1st',
            phone TEXT,
            password TEXT DEFAULT 'student123'
        )
    `);

    // Safely attempt adding missing password column for backwards compatibility
    db.run("ALTER TABLE students ADD COLUMN password TEXT DEFAULT 'student123'", (err) => {
        db.run("UPDATE students SET password = 'student123' WHERE password IS NULL OR password = ''", () => {});
    });

    // Seed demo students if table is empty
    db.get("SELECT COUNT(*) AS count FROM students", (err, row) => {
        if (row && row.count === 0) {
            db.run(`
                INSERT OR IGNORE INTO students (name, roll, branch, semester, phone, password) VALUES 
                ('Alex Morgan', 'CS-101', 'Computer Science', '6th', '+1 9876543210', 'student123'),
                ('Emma Watson', 'IT-102', 'Information Tech', '6th', '+1 9876543211', 'student123'),
                ('John Smith', 'ME-103', 'Mechanical Eng', '4th', '+1 9876543212', 'student123')
            `);
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS marks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            subject TEXT DEFAULT 'General Performance',
            internal_marks INTEGER DEFAULT 25,
            external_marks INTEGER DEFAULT 60,
            total INTEGER NOT NULL,
            FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
        )
    `);

    // Ensure subject column exists in marks table if upgrading from legacy schema
    db.run("ALTER TABLE marks ADD COLUMN subject TEXT DEFAULT 'General Performance'", (err) => {});
    db.run("ALTER TABLE marks ADD COLUMN internal_marks INTEGER DEFAULT 25", (err) => {});
    db.run("ALTER TABLE marks ADD COLUMN external_marks INTEGER DEFAULT 60", (err) => {});

    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE COLLATE NOCASE,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        INSERT OR IGNORE INTO admins (id, username, password)
        VALUES (1, 'admin', 'admin123')
    `);
});

// Promisified helpers for async/await queries
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