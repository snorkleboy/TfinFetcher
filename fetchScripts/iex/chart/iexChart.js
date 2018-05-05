const axios = require('axios');
const Stock = require('../../../db/models/stock')
const http = require('http')
const https = require('https')
const FileStream = require('fs');


function getIEXCharts(){
    Stock.find({})
        .then((stocks) => recusiveFetchandSave(stocks))
}

const unproccessed = [];
let lastTime = Date.now();
let sumTime = 0;
const goal = 500;
function recusiveFetchandSave(stocks,i=0,numConcurrent=3){
    rateLimit()
    .then(()=>{
        if (i < stocks.length) {
            fetchSave(stocks, i, numConcurrent)
            .then((saved) => {
                    recusiveFetchandSave(stocks, i + numConcurrent, numConcurrent)
                })
                .catch(err => {
                    console.log(err);
                })
        } else {
            log(["finished iex chart fetch", unproccessed.length, unproccessed])
        }
    })
    
}
function fetchSave(stocks,i,numConcurrent){
    const currentStocks = stocks.slice(i, i + numConcurrent);
    const stockNames = currentStocks.map(stock => stock.symbol);

    const averageTime = sumTime / (i+1)
    const estimatedTime = ((stocks.length-(i+1))/numConcurrent) * averageTime/60;
    console.log(
        stockNames,
        `${((i+numConcurrent)/stocks.length)*100}% downloaded and saved`,
        `errors on ${unproccessed.length} stocks`,
        `average time ${averageTime}`,
        `est time: ${estimatedTime}`
    )
    sumTime += (Date.now() - lastTime)/60000
    lastTime = Date.now();
    return fetchDayChart(stockNames)
        .then(data =>  mapSaveStocks(currentStocks, data))
}
function mapSaveStocks(stocks, data) {
    const promises = [];
    stocks.forEach(stock => {
        stock.chart = data[stock.symbol]
        promises.push(
            stock.save()
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
        if (Date.now() - lastTime < goal) {
            res();
        } else{
            setTimeout(()=>res(),goal - (Date.now()-lastTime))
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
    const fd = FileStream.appendFile(__dirname + 'AlphavantageAnalFetch.log', `\n ${JSON.stringify(toLog)}`, function (err) {
        if (err) {
            console.log('err!', err, Date.now);
            throw err;
        }
    });
}
module.exports = getIEXCharts;