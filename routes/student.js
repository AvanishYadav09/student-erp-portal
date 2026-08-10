const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Show Students Page
router.get("/students", requireAuth, async (req, res) => {
    try {
        const search = req.query.search;
        let sql = "SELECT * FROM students";
        let params = [];

        if (search) {
            sql = "SELECT * FROM students WHERE name LIKE ?";
            params = ['%' + search + '%'];
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
        const { name, roll, branch, semester, phone } = req.body;
        await db.runAsync(
            `INSERT INTO students(name,roll,branch,semester,phone,password) VALUES(?,?,?,?,?,'student123')`,
            [name, roll, branch, semester, phone]
        );
        res.redirect("/students");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
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
        await db.runAsync("DELETE FROM students WHERE id = ?", [id]);
        res.redirect("/students");
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
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