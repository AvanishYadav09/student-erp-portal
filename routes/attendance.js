const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Show Attendance Page with optional date selection
router.get("/attendance", requireAuth, async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const selectedDate = (req.query.date || todayStr).trim();
        const students = await db.allAsync("SELECT * FROM students ORDER BY name ASC");

        // Fetch existing attendance logs for the selected date
        const attendanceRows = await db.allAsync("SELECT student_id, status FROM attendance WHERE date = ?", [selectedDate]);
        
        // Build map of student_id -> status ('Present' | 'Absent')
        const attendanceMap = {};
        attendanceRows.forEach(row => {
            attendanceMap[row.student_id] = row.status;
        });

        res.render("attendance", { 
            user: req.session.user, 
            students, 
            selectedDate, 
            attendanceMap 
        });
    } catch (err) {
        console.error("Error loading attendance page:", err);
        res.status(500).send("Server Error: " + err.message);
    }
});

// Save Attendance Register (Admin Only)
router.post("/attendance/save", requireAuth, requireAdmin, async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const date = (req.body.date || todayStr).trim();
        const statusObj = req.body.status || {};

        let presentCount = 0;
        let absentCount = 0;

        for (let studentIdStr in statusObj) {
            const studentId = parseInt(studentIdStr, 10);
            const studentStatus = statusObj[studentIdStr];
            if (isNaN(studentId) || !studentStatus) continue;

            if (studentStatus === 'Present') presentCount++;
            else if (studentStatus === 'Absent') absentCount++;

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

        const totalSaved = presentCount + absentCount;
        req.flash('success', `Attendance successfully saved for ${totalSaved} student(s) on ${date} (${presentCount} Present, ${absentCount} Absent).`);
        res.redirect(`/attendance?date=${date}`);
    } catch (err) {
        console.error("Error saving attendance register:", err);
        req.flash('danger', 'Failed to save attendance register: ' + err.message);
        res.redirect("/attendance");
    }
});

router.get("/attendance/report", requireAuth, (req, res) => {
    res.redirect("/reports");
});

module.exports = router;