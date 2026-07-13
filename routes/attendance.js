const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Show Attendance Page
router.get("/attendance", (req, res) => {

    db.all("SELECT * FROM students", [], (err, rows) => {

        if (err) console.log(err);

        res.render("attendance", {
            students: rows
        });

    });

});

// Save Attendance
router.post("/attendance/save", (req, res) => {
    const date = req.body.date;
    const status = req.body.status;

    for (let studentId in status) {
        db.run(
            "INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
            [studentId, date, status[studentId]]
        );
    }

    res.redirect("/reports");
});


router.get("/attendance/report", (req, res) => {

    db.all(`

SELECT
attendance.date,
students.name,
attendance.status

FROM attendance

JOIN students

ON attendance.student_id=students.id

ORDER BY attendance.date DESC

`, [], (err, rows) => {

        res.render("attendanceReport", {

            attendance: rows

        });

    });

});

module.exports = router;