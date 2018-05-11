const axios = require('axios');
const http = require('http')
const https = require('https')

const StockChart = require('../../../models/stockChart')
const promiseIterator = require('../../../util/generalPromiseIterator')


let numConcurrent;
let batchLength;


function addIEXStockCharts(batchSize,numberConcurrent,startI = 0,stopAt) {
numConcurrent = numberConcurrent;
batchLength = batchSize;
    promiseIterator(
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
        .then(flat => {return flat})
}
function mapDataIntoStocks(stockBatch, data) {
    stockBatch.forEach(stock => {
        stock.chart = data[stock.symbol]
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
        httpAgent: new http.Agent({
            keepAlive: true
        }),
        httpsAgent: new https.Agent({
            keepAlive: true
        })
    })
    .then(response => response.data)
}
module.exports = addIEXStockCharts;