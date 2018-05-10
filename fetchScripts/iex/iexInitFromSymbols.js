const axios = require('axios');
const Stock = require('../../db/models/stock')
const StockChart = require('../../db/models/stockChart')
const saveSymbols =()=> axios.get('https://api.iextrading.com/1.0/ref-data/symbols')
    .then(response => {
        response.data.forEach((stock)=>{
            // const newStock = new Stock({"symbol" : stock.symbol, "name": stock.name})
            // newStock.save(err=>console.log("ERROR",err))
            if (!stock.symbol.includes('+', '-')) {
                Stock.create({ "symbol": stock.symbol, "name": stock.name }, (err, saved) => console.log(err,saved));
                StockChart.create({ "symbol": stock.symbol, "name": stock.name }, (err, saved) => console.log(err,saved));
            }
        })
    })
module.exports = saveSymbols;