const axios = require('axios');
const Stock = require('../../models/stock')
const StockChart = require('../../models/stockChart')
const saveSymbols =()=> axios.get('https://api.iextrading.com/1.0/ref-data/symbols')
    .then(response => {
        const promises = [];
        response.data.forEach((stock)=>{
            if (!stock.symbol.match(/[\*\-\+\#\^\.\~]/)) {
                promises.push(Stock.create({ "symbol": stock.symbol, "name": stock.name } ));
                promises.push(StockChart.create({ "symbol": stock.symbol, "name": stock.name }) );
            }
        })
        return Promise.all(promises);
    })
module.exports = saveSymbols;