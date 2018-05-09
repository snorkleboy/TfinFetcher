const Stock = require('../models/stock')
const StockChart = require('../models/stockChart')

let stocksNum = null;
function moveStockCharts(i=0,limit=10) {
    Stock.find({}).count()
    .then(count=>{
        stocksNum = count;
        iterateStocks(i, limit);
    })
}
function iterateStocks(i, limit) {
    const projection = {
        chart: 1,
        symbol: 1,
        name: 1
    }
    if (i < stocksNum) {
        Stock.find({}, projection)
            .skip(i)
            .limit(limit)
            .then((stocks) => moveCreateCharts(stocks))
            .then((saved) => log(i,saved))
            .then(()=>iterateStocks(i+limit, limit))
    }else{
        console.log("DONE");
    }
    
}

function moveCreateCharts(stocks) {
    promises = [];
    stocks.forEach(stock => {
        promises.push(
            StockChart.create({
                "symbol": stock.symbol,
                "name": stock.name,
                "chart": stock.chart
            })
        )
    })
    return Promise.all(promises);
}
function log(i,saved){
    const names = saved.map(model=>model.symbol)
    console.log(i, names)
}

module.exports = moveStockCharts;