const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Show Students Page
router.get("/students", requireAuth, async (req, res) => {
    try {
        const search = req.query.search;
        let sql = "SELECT * FROM students ORDER BY id DESC";
        let params = [];

        if (search) {
            sql = "SELECT * FROM students WHERE name LIKE ? OR roll LIKE ? ORDER BY id DESC";
            params = ['%' + search + '%', '%' + search + '%'];
        }

        const rows = await db.allAsync(sql, params);
        res.render("students", { user: req.session.user, students: rows, search });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Add Student (Admin Only)
router.post("/students/add", requireAuth, requireAdmin, async (req, res) => {
    try {
        let { name, roll, branch, semester, phone } = req.body;
        name = (name || '').trim();
        roll = (roll || '').trim();
        branch = (branch || 'Computer Science').trim();
        semester = (semester || '1st').trim();
        phone = (phone || '').trim();

        if (!name) {
            return res.redirect("/students");
        }

        // Auto-generate roll if missing
        let finalRoll = roll;
        if (!finalRoll) {
            finalRoll = 'STU-' + Math.floor(1000 + Math.random() * 9000);
        }

        // Safely check for existing roll to prevent SQLite UNIQUE constraint failure
        const existing = await db.getAsync("SELECT * FROM students WHERE roll = ?", [finalRoll]);
        if (existing) {
            finalRoll = `${finalRoll}-${Date.now().toString().slice(-4)}`;
        }

        await db.runAsync(
            `INSERT INTO students(name, roll, branch, semester, phone, password) VALUES(?, ?, ?, ?, ?, 'student123')`,
            [name, finalRoll, branch, semester, phone]
        );

        res.redirect("/students");
    } catch (err) {
        console.error("Error adding student:", err);
        res.redirect("/students");
    }
});

// Update Student (Admin Only)
router.post("/students/update/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { name, roll, branch, semester, phone } = req.body;
        await db.runAsync(
            `UPDATE students SET name=?, roll=?, branch=?, semester=?, phone=? WHERE id=?`,
            [name, roll, branch, semester, phone, id]
        );
        res.redirect("/students");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Delete Student (Admin Only)
router.get("/students/delete/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        await db.runAsync("DELETE FROM attendance WHERE student_id = ?", [id]);
        await db.runAsync("DELETE FROM marks WHERE student_id = ?", [id]);
        await db.runAsync("DELETE FROM students WHERE id = ?", [id]);
        res.redirect("/students");
    } catch (err) {
        console.error("Error deleting student:", err);
        res.redirect("/students");
    }
});

// Show Edit Form (Admin Only)
router.get("/students/edit/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const row = await db.getAsync("SELECT * FROM students WHERE id = ?", [id]);
        res.render("editStudent", { user: req.session.user, student: row });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;