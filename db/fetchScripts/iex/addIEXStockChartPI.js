const axios = require('axios');


const StockChart = require("../../models/stockChart")
const promiseIterator = require('../../util/generalPromiseIterator')


let numConcurrent;
let batchLength;


function addIEXStockCharts({startI = 0, stopAt,batchSize = 50, numberConcurrent = 2, range=null }) {
    numConcurrent = numberConcurrent;
    batchLength = batchSize;
    console.log("started fetching charts");
    return promiseIterator(
        StockChart, 
        fetchAndMapCharts.bind(null,range),
        startI,
        batchSize * numConcurrent,
        stopAt
    )
}

function fetchAndMapCharts(range,stocks) {
    const promises = [];
    for (let j = 0; j < numConcurrent; j++) {
        const stockBatch = stocks.slice(j * batchLength, (j + 1) * batchLength);
        if (stockBatch.length > 0){
            let stockBatchNames = stockBatch.map(stock => stock.symbol);
            promises.push(
                fetchDayChartBatch(stockBatchNames,range)
                .then(data => mapDataIntoStocks(stockBatch, data))
            )
        }
    }
    return Promise.all(promises)
        .then(multiArray => flatten(multiArray))
}
function mapDataIntoStocks(stockBatch, data) {
    stockBatch.forEach(stock => {
        try {
            if(stock.chart === undefined){
                stock.chart = data[stock.symbol].chart
            }else{
                stock.chart = stock.chart.concat(data[stock.symbol].chart)
            }
            stock.markModified('chart')
        } catch (error) {
            console.log(stock.symbol,error);
        }
        
    })
    return stockBatch;
}
function flatten(multiArray) {
    return [].concat(...multiArray)
}

function fetchDayChartBatch(symbols,range){
    return axios({
        url: `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols.join(',')}&types=chart&range=${range? "1m" :"5y"}${range? `&chartLast=${range}`:""}`,
        method: "GET",
    })
    .then(response => response.data)
}
module.exports = addIEXStockCharts;