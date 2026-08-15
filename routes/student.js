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
            sql = "SELECT * FROM students WHERE LOWER(name) LIKE LOWER(?) OR LOWER(roll) LIKE LOWER(?) OR LOWER(branch) LIKE LOWER(?) ORDER BY id DESC";
            params = ['%' + search + '%', '%' + search + '%', '%' + search + '%'];
        }

        const rows = await db.allAsync(sql, params);
        res.render("students", { user: req.session.user, students: rows, search });
    } catch (err) {
        console.error("Error fetching students:", err);
        res.status(500).send("Server Error: " + err.message);
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
            req.flash('danger', 'Student name is required.');
            return res.redirect("/students");
        }

        if (!roll) {
            req.flash('danger', 'Roll number is required.');
            return res.redirect("/students");
        }

        // Case-insensitive check for existing roll number
        const existing = await db.getAsync("SELECT * FROM students WHERE LOWER(TRIM(roll)) = LOWER(TRIM(?))", [roll]);
        if (existing) {
            req.flash('danger', `Roll Number "${roll}" is already registered to ${existing.name}. Please enter a unique roll number.`);
            return res.redirect("/students");
        }

        await db.runAsync(
            `INSERT INTO students(name, roll, branch, semester, phone, password) VALUES(?, ?, ?, ?, ?, 'student123')`,
            [name, roll, branch, semester, phone]
        );

        req.flash('success', `Student "${name}" (${roll}) successfully registered!`);
        res.redirect("/students");
    } catch (err) {
        console.error("Error adding student:", err);
        req.flash('danger', 'Failed to add student: ' + err.message);
        res.redirect("/students");
    }
});

// Update Student (Admin Only)
router.post("/students/update/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        let { name, roll, branch, semester, phone } = req.body;
        name = (name || '').trim();
        roll = (roll || '').trim();
        branch = (branch || 'Computer Science').trim();
        semester = (semester || '1st').trim();
        phone = (phone || '').trim();

        if (!name || !roll) {
            req.flash('danger', 'Name and Roll number are required fields.');
            return res.redirect(`/students/edit/${id}`);
        }

        // Check if another student has the same roll number
        const existing = await db.getAsync(
            "SELECT * FROM students WHERE LOWER(TRIM(roll)) = LOWER(TRIM(?)) AND id != ?",
            [roll, id]
        );

        if (existing) {
            req.flash('danger', `Roll Number "${roll}" is already assigned to ${existing.name}.`);
            return res.redirect(`/students/edit/${id}`);
        }

        await db.runAsync(
            `UPDATE students SET name=?, roll=?, branch=?, semester=?, phone=? WHERE id=?`,
            [name, roll, branch, semester, phone, id]
        );

        req.flash('success', `Student profile for "${name}" updated successfully.`);
        res.redirect("/students");
    } catch (err) {
        console.error("Error updating student:", err);
        req.flash('danger', 'Error updating student record: ' + err.message);
        res.redirect("/students");
    }
});

// Delete Student (Admin Only)
router.get("/students/delete/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db.getAsync("SELECT name FROM students WHERE id = ?", [id]);
        
        await db.runAsync("DELETE FROM attendance WHERE student_id = ?", [id]);
        await db.runAsync("DELETE FROM marks WHERE student_id = ?", [id]);
        await db.runAsync("DELETE FROM students WHERE id = ?", [id]);
        
        const studentName = student ? student.name : 'Student';
        req.flash('success', `Deleted record for ${studentName}.`);
        res.redirect("/students");
    } catch (err) {
        console.error("Error deleting student:", err);
        req.flash('danger', 'Error deleting student record.');
        res.redirect("/students");
    }
});

// Show Edit Form (Admin Only)
router.get("/students/edit/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const row = await db.getAsync("SELECT * FROM students WHERE id = ?", [id]);
        if (!row) {
            req.flash('danger', 'Student record not found.');
            return res.redirect("/students");
        }
        res.render("editStudent", { user: req.session.user, student: row });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;