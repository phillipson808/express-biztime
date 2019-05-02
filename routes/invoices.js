const express = require('express');
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

router.get('/', async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT id, comp_code FROM invoices`);
        return res.json({ invoices: results.rows });
    } catch(err) {
        return next(err);
    }
})

router.get('/:id', async function(req, res, next){
    try {
        const results = await db.query(
            `SELECT *
             FROM invoices
             JOIN companies
               ON comp_code=code
             WHERE id=$1`, [req.params.id]
        );
        if (results.rows.length === 0){
            throw new ExpressError('Invalid code', 404);
        }
        const { id, amt, paid, add_date, paid_date, code, name, description } = results.rows[0]
        const invoice = {
            id,
            amt,
            paid,
            add_date,
            paid_date,
            company: {
                code,
                name,
                description
            }
        }
        return res.json({invoice: invoice});
    } catch(err) {
        return next(err);
    }
})

router.post('/', async function(req, res, next){
    try {
        const { compCode, amt } = req.body;
        const result = await db.query(
            `INSERT INTO invoices (comp_code, amt)
             VALUES ($1, $2)
             RETURNING id, comp_code, amt, paid, add_date, paid_date`, [compCode, amt]
        );
        return res.status(201).json(result.rows[0]);
    } catch(err) {
        return next(err);
    }
})

router.put('/:id', async function(req, res, next){
    try {
        const id = req.params.id;
        const result = await db.query(
            `UPDATE invoices SET amt=$2
             WHERE id=$1
             RETURNING id, comp_code, amt, paid, add_date, paid_date`, [req.params.id, req.body.amt]
        );
        if (result.rows.length === 0){
            throw new ExpressError('Invalid code', 404);
        }
        return res.json(result.rows[0]);
    } catch(err) {
        return next(err);
    }
})

router.delete('/:id', async function(req, res, next){
    try {
        let delResult = await db.query(`DELETE FROM invoices WHERE id=$1`, [req.params.id]);
        if (!delResult.rows.length){
            throw new ExpressError('Invalid code', 404)
        }
        return res.json({status: "Deleted"});
    } catch(err) {
        return next(err);
    }
})

module.exports = router;