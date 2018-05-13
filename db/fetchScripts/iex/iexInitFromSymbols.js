const axios = require('axios');
const Stock = require('../../db/models/stock')
const StockChart = require('../../db/models/stockChart')
const saveSymbols =()=> axios.get('https://api.iextrading.com/1.0/ref-data/symbols')
    .then(response => {
        response.data.forEach((stock)=>{
            if (!stock.symbol.match(/[\*\-\+]/)) {
                Stock.create({ "symbol": stock.symbol, "name": stock.name }, (err, saved) => console.log(err,saved));
                StockChart.create({ "symbol": stock.symbol, "name": stock.name }, (err, saved) => console.log(err,saved));
            }
        })
    })
module.exports = saveSymbols;