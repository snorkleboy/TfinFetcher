const express = require('express');
const ScreenController = express.Router();
const mongoose = require('mongoose');
const Stock = require('../../db/models/stock');
ScreenController.get('/',(req,res)=>{
    try {
        const query = req.query
        const queryStringExists = Object.keys(query).length > 0
        if (queryStringExists) {
            sendScreenedStocks(query, res);
        } else{
            sendSceenKeysList(res);
        }
        
    } catch (error) {
        console.log(error);
        res.send(error)
    }

    
})

function sendSceenKeysList(response) {
    response.send(Stock.listKeys())
}
function sendScreenedStocks(query,response) {
        //mapScreenOptions validates user inputed search params and either errors out or returns a query object with keys translated to model schemas keys
    let params = Stock.mapScreenOptions(query)
    Stock.screen(params)
        .then(stocks => response.send(stocks))
}

module.exports = ScreenController;