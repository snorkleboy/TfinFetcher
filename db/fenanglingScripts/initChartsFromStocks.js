const Stock = require('../models/stock')
const StockChart = require('../models/stockChart')
const promiseIterator = require('../util/generalPromiseIterator')

function initChartsFromstocks(){
    promiseIterator(Stock, getStockName, 0, 100)
}
function getStockName(stocks) {
    const promises = [];
    stocks.forEach(stock => {
        promises.push(
            StockChart.create({
                "symbol": stock.symbol,
                "name": stock.name,
                "stock_id":stock.id
            })
        )
    })
    return Promise.all(promises);
}
module.exports = initChartsFromstocks;