const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;
const db = require("./database/db");
const studentRoutes = require("./routes/student");
const attendanceRoutes = require("./routes/attendance");
const session = require("express-session");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "studenterpsecret",
    resave: false,
    saveUninitialized: true
}));
app.use(express.json());
app.use(studentRoutes);
app.use(attendanceRoutes);

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.get("/", (req, res) => {
    res.render("login");
});

// Home Route
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM admins WHERE username=? AND password=?",
        [username, password],
        (err, row) => {

            if (err) return console.log(err);

            if (row) {
                req.session.user = row.username;
                return res.redirect("/dashboard");
            } else {
                return res.send("Invalid Username or Password");
            }

        }
    );

});

app.get("/dashboard", (req, res) => {

    db.get("SELECT COUNT(*) AS totalStudents FROM students", (err, studentResult) => {

        if (err) return console.log(err);

        db.get("SELECT COUNT(*) AS presentToday FROM attendance WHERE status='Present'", (err, presentResult) => {

            if (err) return console.log(err);

            db.get("SELECT COUNT(*) AS absentToday FROM attendance WHERE status='Absent'", (err, absentResult) => {

                if (err) return console.log(err);

                db.get("SELECT AVG(total) AS averageMarks FROM marks", (err, marksResult) => {

                    if (err) return console.log(err);

                    res.render("dashboard", {

                        totalStudents: studentResult.totalStudents || 0,

                        presentToday: presentResult.presentToday || 0,

                        absentToday: absentResult.absentToday || 0,

                        averageMarks: marksResult.averageMarks
                            ? Math.round(marksResult.averageMarks)
                            : 0

                    });

                });

            });

        });

    });

});
app.get("/students", (req, res) => {
    res.render("students");
});

app.get("/attendance", (req, res) => {
    res.render("attendance");
});

app.get("/marks", (req, res) => {

    db.all("SELECT * FROM students", [], (err, students) => {

        db.all(

            `SELECT marks.total,
students.name

FROM marks

JOIN students

ON marks.student_id=students.id`

            , [],

            (err, marks) => {

                res.render("marks", {

                    students,

                    marks

                });

            });

    });

});
app.post("/marks/add", (req, res) => {

    const { student_id, total } = req.body;

    db.run(

        "INSERT INTO marks(student_id,total) VALUES(?,?)",

        [student_id, total],

        (err) => {

            if (err) console.log(err);

            res.redirect("/marks");

        });

});


app.get("/reports", (req, res) => {

    db.all(
        `SELECT attendance.date,
                students.name,
                attendance.status
         FROM attendance
         JOIN students
         ON attendance.student_id = students.id`,
        [],
        (err, rows) => {

            if (err) {
                console.log(err);
                return res.send(err.message);
            }

            res.render("reports", {
                reports: rows
            });

        }
    );

});
// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});