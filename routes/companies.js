const express = require('express');
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");

router.get('/', async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT code, name FROM companies`);
        return res.json({companies: results.rows});
    }catch(err){
        return next(err);
    }
})

router.get('/:code', async function(req, res, next){
    try {
        const company = await db.query(
            `SELECT *
             FROM companies
             WHERE code=$1`, [req.params.code]
        );
        if (company.rows.length === 0){
            throw new ExpressError('Invalid code', 404);
        }
        const invoices = await db.query(
            `SELECT *
             FROM invoices
             WHERE comp_code=$1`, [req.params.code]
        )
        const { code, name, description } = company.rows[0];
        const results = {
            code,
            name,
            description,
            invoices: invoices.rows
        };
        return res.json({ company: results });
    } catch(err) {
        return next(err);
    }
})

router.post('/', async function(req, res, next){
    try{
        const { code, name, description } = req.body;
        const result = await db.query(
            `INSERT INTO companies (code, name, description)
             VALUES ($1, $2, $3)
             RETURNING code, name, description`, [code, name, description]
        );
        return res.status(201).json({company: result.rows[0]});
    }catch(err){
        return next(err);
    }
})

router.put('/:code', async function(req, res, next){
    try{
        const code = req.params.code;
        const { name, description } = req.body;
        if(!name || !description){
            throw new ExpressError('Missing Information');
        }
        const result = await db.query(
            `UPDATE companies SET name=$2, description=$3
             WHERE code=$1
             RETURNING code, name, description`, [code, name, description]
        );
        if(result.rows.length === 0){
            throw new ExpressError('Invalid code', 404);
        }
        return res.json({company: result.rows[0]});
    }catch(err){
        return next(err);
    }
})

router.delete('/:code', async function(req, res, next){
    try{
        const result = await db.query(
            `DELETE FROM companies WHERE code=$1`, 
            [req.params.code]
        );
        return res.json({message: "Deleted"});
    }catch(err){
        return next(err);
    }
})

module.exports = router;