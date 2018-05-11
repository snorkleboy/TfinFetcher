const axios = require('axios');
const StockChart = require('../../../models/stockChart')
const http = require('http')
const https = require('https')
const FileStream = require('fs');

let startTime = 0;
let startI = 0;
const rateGoalMS = 100;
let max = null;

function addIEXCharts(i = 0, batchLength = 25, numConcurentReq = 3, stopAt) {
    StockChart.find({}).count()
        .then(count => {
            max = stopAt || count;
            startI = i;
            startTime = Date.now();
            recusiveFetchandSave(stocks, i, batchLength, numConcurentReq)
        })

}
const unproccessed = [];

function recusiveFetchandSave(stocks, i, batchLength, numConcurrent) {
    if (i < max) {
        StockChart.find({})
            .skip(i)
            .limit(batchLength * numConcurrent)
            .select("symbol")
            .exec()
            .then((stocks) => launchFetchesAndSave(stocks, batchLength, numConcurrent))
            .then((saved) => progressReport(saved,i))
            .catch(err => {
                console.log("launch iex chart fetchsave error", err)
                unproccessed.push(["launch iex chart fetchsave error", stocks])
            })
            .then((saved) => recusiveFetchandSave(stocks, i + (batchLength * numConcurrent), batchLength, numConcurrent))
    } else {
        log(["finished iex chart fetch", unproccessed.length, unproccessed])
        console.log(["finished iex chart fetch", unproccessed.length, unproccessed])
    }
}

function launchFetchesAndSave(stocks, batchLength, numConcurrent) {
    const promises = [];
    for (let j = 0; j < numConcurrent; j++) {
        currentStocks = stocks.slice(j, j * batchLength);
        const stockNames = currentStocks.map(stock => stock.symbol);  
        promises.push(
            fetchDayChartBatch(stockNames)
                .then(data => mapSaveStocks(currentStocks, data))
        )
    }
    return Promise.all(promises)
}

function mapSaveStocks(stocks, data) {
    const promises = [];
    stocks.forEach(stock => {
        stock.chart = getChartFromData(data, stock.symbol)
        promises.push(
            stock.save()
            .then(saved => {
                delete stock.chart;
                return saved
            })
            .catch(err => {
                err.stock = stock
                throw err;
            })
        )
    })
    return Promise.all(promises)
}

function getChartFromData(data, key) {
    if (!data[key]) {
        if (key[key.length - 1] === '+') {
            key = key.slice(0, key.length - 1)
        } else if (key[key.length - 2] === '+') {
            key = key.slice(0, key.length - 2)
        }
    }
    return data[key]
}

function rateLimit() {
    return new Promise(res => {
        if (Date.now() - lastTime > rateGoalMS) {
            res();
        } else {
            console.log("rate limited");
            setTimeout(() => res(), rateGoalMS - (Date.now() - lastTime))
        }
    })
}
const fetchDayChartBatch = (symbols) => axios({
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

function progressReport(saved,i) {
    let stockNames;
    try {
        stockNames = saved.map(ret => ret.map(stock => stock.symbol).join(','))
    } catch (e) {
        stockNames = 'No stocks error'
    }
    const numDone = i-startI
    const elapsedTime = Date.now() - startTime
    const averageTime = elapsedTime / numDone
    const estimatedTimeMinutes = parseInt(((max - numDone) * averageTime)/60000);
    const percent = parseInt((numDone/max)*100);
    console.log({
        stockNames,
        averageTime,
        estimatedTimeMinutes,
        percent,
        i,
        max,
    })
}

function log(toLog) {
    const fd = FileStream.appendFile(__dirname + 'IEXChartFetch.log', `\n ${JSON.stringify(toLog)}`, function (err) {
        if (err) {
            console.log('err!', err, Date.now);
            throw err;
        }
    });
}

module.exports = addIEXCharts;