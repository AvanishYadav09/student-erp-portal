const express = require("express");
const router = express.Router();
const db = require("../database/db");

// Show Students Page
router.get("/students", (req, res) => {

    const search = req.query.search;

    let sql = "SELECT * FROM students";
    let params = [];

    if (search) {
        sql = "SELECT * FROM students WHERE name LIKE ?";
        params = ['%' + search + '%'];
    }

    db.all(sql, params, (err, rows) => {

        if (err) {
            console.log(err);
        }

        res.render("students", {
            students: rows
        });

    });

});
// Add Student
router.post("/students/add", (req, res) => {

    const { name, roll, branch, semester, phone } = req.body;

    db.run(

        `INSERT INTO students(name,roll,branch,semester,phone)
         VALUES(?,?,?,?,?)`,

        [name, roll, branch, semester, phone],

        (err) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/students");

        }

    );

});
// Update Student
router.post("/students/update/:id", (req, res) => {

    const id = req.params.id;

    const { name, roll, branch, semester, phone } = req.body;

    db.run(

        `UPDATE students
        SET
        name=?,
        roll=?,
        branch=?,
        semester=?,
        phone=?
        WHERE id=?`,

        [name, roll, branch, semester, phone, id],

        (err) => {

            if (err)
                console.log(err);

            res.redirect("/students");

        }

    );

});
// Delete Student
router.get("/students/delete/:id", (req, res) => {

    const id = req.params.id;

    db.run("DELETE FROM students WHERE id = ?", [id], (err) => {

        if (err) {
            console.log(err);
        }

        res.redirect("/students");

    });

});
// Show Edit Form
router.get("/students/edit/:id", (req, res) => {

    const id = req.params.id;

    db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {

        if (err) {
            console.log(err);
        }

        res.render("editStudent", {
            student: row
        });

    });

});

module.exports = router;