const express = require('express');
const ScreenController = express.Router();
const mongoose = require('mongoose');
const Stock = require('../../db/models/stock');
ScreenController.get('/',(req,res)=>{
    if (Stock.validateScreenOptions(req.query)) {
        Stock.screen(req.query)
        .then(stocks => res.send(stocks))
    }else{
        res.send("input valdiation error")
    }
    
})

module.exports = ScreenController;