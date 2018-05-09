const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ScreenController = require('./screenController');
router.get('/',(req,res)=>{
    res.send('stocksAPI')
})
router.use('/screen', ScreenController);

module.exports = router;
