const Stock = require('../models/stock')
const StockChart = require('../models/stockChart')
const promiseIterator = require('../util/generalPromiseIterator')

function initChartsFromstocks(){
    promiseIterator(Stock, getStockName, 0, 1, 2)
}
function getStockName(stocks) {
    stocks.forEach(stock => {
        console.log(stock.symbol);
    })
    return stocks;
}
module.exports = initChartsFromstocks;