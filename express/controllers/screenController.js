const express = require('express');
const ScreenController = express.Router();
const mongoose = require('mongoose');
const Stock = require('../../db/models/stock');
ScreenController.get('/',(req,res)=>{
    try {
        //mapScreenOptions validates user inputed search params and either errors out or returns a query object with keys translated to model schemas keys
        let params = Stock.mapScreenOptions(req.query)
        console.log(params,'here');
        Stock.screen(params)
            .then(stocks => res.send(stocks))
    } catch (error) {
        console.log(error);
        res.send(error)
    }

    
})


module.exports = ScreenController;