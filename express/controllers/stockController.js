const express = require('express');
const StockController = express.Router();
const mongoose = require('mongoose');
const Stock = require('../../db/models/stock');
const StockChart = require('../../db/models/stockChart');
StockController.get('/:symbol/:chart?', (req, res) => {
    const symbol = req.params.symbol;
    const getChart = req.params.chart
    const returnObj = {};

    promises = [ Stock.find({symbol})];
    if (getChart){
        promises[1]=StockChart.find({symbol})
    }
    Promise.all(promises)
        .then(data=> res.send(data));
})


module.exports = StockController;