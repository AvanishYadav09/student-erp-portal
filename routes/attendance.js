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
        const date = req.body.date || new Date().toISOString().split('T')[0];
        const status = req.body.status || {};

        for (let studentId in status) {
            const studentStatus = status[studentId];
            if (!studentStatus) continue;

            const existing = await db.getAsync(
                "SELECT id FROM attendance WHERE student_id = ? AND date = ?",
                [studentId, date]
            );

            if (existing) {
                await db.runAsync(
                    "UPDATE attendance SET status = ? WHERE id = ?",
                    [studentStatus, existing.id]
                );
            } else {
                await db.runAsync(
                    "INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)",
                    [studentId, date, studentStatus]
                );
            }
        }

        res.redirect("/reports");
    } catch (err) {
        console.error("Error saving attendance:", err);
        res.status(500).send("Server Error");
    }
});

router.get("/attendance/report", requireAuth, (req, res) => {
    res.redirect("/reports");
});

module.exports = router;