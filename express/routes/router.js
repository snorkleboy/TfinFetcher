const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
router.get('/',(req,res)=>{
    res.send('stocksAPI')
})
router.get('/screen',  (req, res)=> {
    res.send('GET handler for /screen route.');
});

module.exports = router;
