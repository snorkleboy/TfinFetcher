const axios = require('axios');
const Stock = require('../../../db/models/stock')
const http = require('http')
const https = require('https')
const FileStream = require('fs');

let lastTime = Date.now();
let sumTime = 0;
let startI = 0;
const rateGoalms = 100;

function getIEXCharts(i=0,batchLength, numConcurentReq){
    startI=i;
    Stock.find({})
        .skip(i)
        .select("symbol")
        .exec()
        .then((stocks) => recusiveFetchandSave(stocks, 0, batchLength, numConcurentReq))
}
const unproccessed = [];

function recusiveFetchandSave(stocks,i=0,batchLength=10,numConcurrent=3){
    rateLimit()
    .then(()=>{
        if (i < stocks.length) {
            lastTime = Date.now();
            launchFetchs(stocks, i, batchLength , numConcurrent)
                .then((saved) => recusiveFetchandSave(stocks, i + (batchLength*numConcurrent), batchLength, numConcurrent))
        } else {
            log(["finished iex chart fetch", unproccessed.length, unproccessed])
        }
    })
    
}
function launchFetchs(stocks, i, batchLength, numConcurrent) {
    const promises = [];

    for (let j=0;j<numConcurrent;j++){
        promises.push(
            fetchSave(stocks, i + batchLength*j, batchLength)
            .catch(err => {
                unproccessed.push(["launch iex chart fetch error",[i,batchLength,numConcurrent]])
            })
        )
    }
    
    return Promise.all(promises)
            .then((saved) => {
                stockNames = saved.map(ret=>ret.map(stock=>stock.symbol).join(','))
                sumTime += (Date.now() - lastTime) / 1000
                const averageTime = sumTime / (i + 1)
                const estimatedTime = ((stocks.length - (i + 1)) / (batchLength*numConcurrent)) * averageTime / 60;
                const percent = parseInt(((i + 1 + batchLength + startI) / (stocks.length + startI)) * 100);
                console.log(
                    stockNames,
                    `${percent}% (${i+1+startI}/${stocks.length+startI}) downloaded and saved`,
                    `errors on ${unproccessed.length} stocks`,
                    `average time ${averageTime} sec`,
                    `est time: ${estimatedTime} min`
                )
            })
}
function fetchSave(stocks,i,batchLength){
    const currentStocks = stocks.slice(i, i + batchLength);
    const stockNames = currentStocks.map(stock => stock.symbol);
    return fetchDayChart(stockNames)
        .then(data => mapSaveStocks(currentStocks, data))
        
}
function mapSaveStocks(stocks, data) {
    const promises = [];
    stocks.forEach(stock => {
        stock.chart = data[stock.symbol]
        promises.push(
            stock.save()
            .then(saved=>{
                delete stock.chart;
                return saved
            })
            .catch(err=>{
                err.stock = stock
                throw err;
            })
        )
    })
    return Promise.all(promises)
}
function rateLimit(){
    return new Promise(res=>{
        if (Date.now() - lastTime > rateGoalms) {
            res();
        } else{
            console.log("rate limited");
            setTimeout(()=>res(),rateGoalms - (Date.now()-lastTime))
        }
    })
}
const fetchDayChart = (symbols) => axios({
        url: `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols.join(',')}&types=chart&range=5y`,
        method: "GET",
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true })
    })
    .then(response => response.data)
        // {
        //     "daily": [{
        //         dateFetched: Date.now(),
        //         series: "5y daily",
        //         data: response.data
        //     }]
        // };

function log(toLog) {
    const fd = FileStream.appendFile(__dirname + 'IEXChartFetch.log', `\n ${JSON.stringify(toLog)}`, function (err) {
        if (err) {
            console.log('err!', err, Date.now);
            throw err;
        }
    });
}

module.exports = getIEXCharts;