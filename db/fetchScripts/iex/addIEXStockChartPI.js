const axios = require('axios');


const StockChart = require("../../models/stockChart")
const promiseIterator = require('../../util/generalPromiseIterator')


let numConcurrent;
let batchLength;


function addIEXStockCharts(startI = 0, stopAt,batchSize = 50, numberConcurrent = 2 ) {
    numConcurrent = numberConcurrent;
    batchLength = batchSize;
    console.log("started fetching charts");
    return promiseIterator(
        StockChart, 
        fetchAndMapCharts,
        startI,
        batchSize * numConcurrent,
        stopAt
    )
}
function fetchAndMapCharts(stocks) {
    const promises = [];
    for (let j = 0; j < numConcurrent; j++) {
        const stockBatch = stocks.slice(j * batchLength, (j + 1) * batchLength);
        if (stockBatch.length > 0){
            let stockBatchNames = stockBatch.map(stock => stock.symbol);
            promises.push(
                fetchDayChartBatch(stockBatchNames)
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
            stock.chart = data[stock.symbol].chart
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

function fetchDayChartBatch(symbols){
    return axios({
        url: `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols.join(',')}&types=chart&range=5y`,
        method: "GET",
    })
    .then(response => response.data)
}
module.exports = addIEXStockCharts;