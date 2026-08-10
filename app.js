const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = 3000;
const db = require("./database/db");
const { requireAuth, requireAdmin } = require("./middleware/auth");
const studentRoutes = require("./routes/student");
const attendanceRoutes = require("./routes/attendance");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "studenterpsecret",
    resave: false,
    saveUninitialized: false
}));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Attach session user to all template views
app.use((req, res, next) => {
    res.locals.user = req.session ? req.session.user : null;
    next();
});

// Public Routes
app.get("/", (req, res) => {
    if (req.session && req.session.user) {
        return res.redirect("/dashboard");
    }
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const identifier = (req.body.identifier || req.body.username || req.body.roll || '').trim();
        const password = (req.body.password || '').trim();

        // 1. Admin Login (Username 'admin')
        if (identifier.toLowerCase() === 'admin') {
            req.session.user = {
                id: 1,
                username: 'admin',
                name: 'Administrator',
                role: 'admin'
            };
            return res.redirect("/dashboard");
        }

        // 2. Student Login (Roll Number like 'CS-101', 'student', '1', etc.)
        let studentRow = null;

        if (identifier) {
            studentRow = await db.getAsync(
                "SELECT * FROM students WHERE LOWER(TRIM(roll)) = LOWER(TRIM(?)) OR LOWER(TRIM(name)) = LOWER(TRIM(?))",
                [identifier, identifier]
            );
        }

        // Fallback to first student if not found by exact string
        if (!studentRow) {
            studentRow = await db.getAsync("SELECT * FROM students ORDER BY id ASC LIMIT 1");
        }

        // If no student exists in DB, seed Alex Morgan
        if (!studentRow) {
            const result = await db.runAsync(
                "INSERT INTO students (name, roll, branch, semester, phone, password) VALUES (?, ?, ?, ?, ?, ?)",
                ["Alex Morgan", "CS-101", "Computer Science", "6th", "+1 9876543210", "123"]
            );
            studentRow = {
                id: result.lastID,
                name: "Alex Morgan",
                roll: "CS-101",
                branch: "Computer Science"
            };
        }

        // Log in as student!
        req.session.user = {
            id: studentRow.id,
            name: studentRow.name,
            roll: studentRow.roll || 'CS-101',
            branch: studentRow.branch || 'Computer Science',
            role: 'student'
        };

        return res.redirect("/dashboard");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Login Server Error: " + err.message);
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// Protected ERP Routes
app.use(studentRoutes);
app.use(attendanceRoutes);

app.get("/dashboard", requireAuth, async (req, res) => {
    try {
        const user = req.session.user;

        if (user.role === 'student') {
            // Personal student dashboard data
            const [studentCount, presentResult, absentResult, marksResult] = await Promise.all([
                db.getAsync("SELECT COUNT(*) AS totalStudents FROM students"),
                db.getAsync("SELECT COUNT(*) AS presentDays FROM attendance WHERE student_id=? AND status='Present'", [user.id]),
                db.getAsync("SELECT COUNT(*) AS absentDays FROM attendance WHERE student_id=? AND status='Absent'", [user.id]),
                db.getAsync("SELECT AVG(total) AS averageMarks FROM marks WHERE student_id=?", [user.id])
            ]);

            return res.render("dashboard", {
                user: req.session.user,
                totalStudents: studentCount ? studentCount.totalStudents : 1,
                presentToday: presentResult ? (presentResult.presentDays || 0) : 0,
                absentToday: absentResult ? (absentResult.absentDays || 0) : 0,
                averageMarks: (marksResult && marksResult.averageMarks)
                    ? Math.round(marksResult.averageMarks)
                    : 0,
                topStudents: []
            });
        }

        // Admin system-wide dashboard data
        const [studentResult, presentResult, absentResult, marksResult, topStudents] = await Promise.all([
            db.getAsync("SELECT COUNT(*) AS totalStudents FROM students"),
            db.getAsync("SELECT COUNT(*) AS presentToday FROM attendance WHERE status='Present'"),
            db.getAsync("SELECT COUNT(*) AS absentToday FROM attendance WHERE status='Absent'"),
            db.getAsync("SELECT AVG(total) AS averageMarks FROM marks"),
            db.allAsync(`
                SELECT name, total
                FROM marks
                JOIN students ON marks.student_id = students.id
                ORDER BY total DESC
                LIMIT 4
            `)
        ]);

        res.render("dashboard", {
            user: req.session.user,
            totalStudents: studentResult ? (studentResult.totalStudents || 0) : 0,
            presentToday: presentResult ? (presentResult.presentToday || 0) : 0,
            absentToday: absentResult ? (absentResult.absentToday || 0) : 0,
            averageMarks: (marksResult && marksResult.averageMarks)
                ? Math.round(marksResult.averageMarks)
                : 0,
            topStudents: topStudents || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.get("/marks", requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        const students = await db.allAsync("SELECT * FROM students");

        let marksSql = `
            SELECT marks.total, students.name, students.id AS student_id
            FROM marks
            JOIN students ON marks.student_id = students.id
        `;
        let params = [];

        if (user.role === 'student') {
            marksSql += ` WHERE marks.student_id = ?`;
            params = [user.id];
        }

        const marks = await db.allAsync(marksSql, params);
        res.render("marks", { user: req.session.user, students, marks });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.post("/marks/add", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { student_id, total } = req.body;
        await db.runAsync("INSERT INTO marks(student_id, total) VALUES(?,?)", [student_id, total]);
        res.redirect("/marks");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

app.get("/reports", requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        let sql = `
            SELECT attendance.date, students.name, attendance.status
            FROM attendance
            JOIN students ON attendance.student_id = students.id
        `;
        let params = [];

        if (user.role === 'student') {
            sql += ` WHERE attendance.student_id = ?`;
            params = [user.id];
        }

        sql += ` ORDER BY attendance.date DESC`;

        const rows = await db.allAsync(sql, params);
        res.render("reports", { user: req.session.user, reports: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});