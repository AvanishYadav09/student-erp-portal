const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Show Attendance Page
router.get("/attendance", requireAuth, async (req, res) => {
    try {
        const rows = await db.allAsync("SELECT * FROM students");
        res.render("attendance", { user: req.session.user, students: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Save Attendance (Admin Only)
router.post("/attendance/save", requireAuth, requireAdmin, async (req, res) => {
    try {
        const date = req.body.date;
        const status = req.body.status || {};

        for (let studentId in status) {
            await db.runAsync(
                "INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
                [studentId, date, status[studentId]]
            );
        }

        res.redirect("/reports");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/attendance/report", requireAuth, (req, res) => {
    res.redirect("/reports");
});

module.exports = router;