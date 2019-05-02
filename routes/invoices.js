const express = require('express');
const router = new express.Router();
const ExpressError = require("../expressError");
const db = require("../db");



router.get('/', async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT id, comp_code FROM invoices`);
        return res.json(results.rows);
    }catch(err){
        return next(err);
    }
})

router.get('/:id', async function(req, res, next){
    try{
        const results = await db.query(
            `SELECT * FROM invoices WHERE id=$1`, [req.params.id]
        );
        if(results.rows.length === 0){
            throw new ExpressError('Invalid code', 404);
        }
        return res.json({invoice: results.rows[0]});
    }catch(err){
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
        return res.status(201).json(result.rows[0]);
    }catch(err){
        return next(err);
    }
})

router.put('/:code', async function(req, res, next){
    try{
        const code = req.params.code;
        const { name, description } = req.body;
        const result = await db.query(
            `UPDATE companies SET name=$2, description=$3
             WHERE code=$1
             RETURNING code, name, description`, [code, name, description]
        );
        return res.status(201).json(result.rows[0]);
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