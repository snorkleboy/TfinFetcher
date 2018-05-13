const Stock = require('../models/stock')
const StockChart = require('../models/stockChart')
const FileStream = require('fs');

//uneeded for final init

//moves charts from stocks collection to a new stockCharts collection


let stocksNum = null;
let startI = 0;
let startTime =null;
function deleteCharts (){
    const options = {
        multi:true
    }
    const callback = ()=>console.log("done");
    Stock.update({}, { $unset: { chart:1 }}, options, callback)
}
function moveStockCharts(i=0,limit=10) {
    console.log("START");
    deleteCharts();
    // startI = i;
    // Stock.find({}).count()
    // .then(count=>{
        // stocksNum = count;
        // startTime = Date.now();
        // iterateStocks(i, limit);
    // })
}
function iterateStocks(i, limit) {
    const projection = {
        chart: 1,
        symbol: 1,
        name: 1
    }
    if (i < stocksNum) {
        lastTime = Date.now();
        Stock.find({}, projection)
            .skip(i)
            .limit(limit)
            .then((stocks) => moveCreateCharts(stocks))
            .then((saved) => log(i,saved))
            .then(()=>iterateStocks(i+limit, limit))
            .catch(err=>logF(err))
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
            .catch(err=>logF([stock.symbok,err]))
        )
    })
    return Promise.all(promises);
}
const msToMin = 1/(60000);
function log(i,saved){
    i = i+1
    const elapsedTime = Date.now() - startTime
    const averageTime = parseInt(elapsedTime / (i - startI))
    const estimatedTime = parseInt(averageTime * (stocksNum - i) * msToMin)
    const names = saved.map(model=>model.symbol)
    const percent = parseInt (100 * i / (stocksNum - startI) )
    console.log(`${percent}%`,`averageTime:${averageTime}ms`, `${estimatedTime} minutes left`, names)
}
function logF(toLog) {
    const fd = FileStream.appendFile(__dirname + 'MoveChart.log', `\n ${JSON.stringify(toLog)}`, function (err) {
        if (err) {
            console.log('write to file error!', err, Date.now);
            throw err;
        }
    });
}
module.exports = moveStockCharts;