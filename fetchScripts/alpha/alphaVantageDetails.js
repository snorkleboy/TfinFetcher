const axios = require('axios');
const Stock = require('../../db/models/stock')
//daily as default interval instead of monthly because for some reason a serieslength of 200 does not always work with a monthly interval...
//hopefully Alphavantage fixes something
//05/04/2018


const __ranges = [20, 50, 200];
const __indicators = ["RSI", "BBANDS", "SMA"];
const unprocessed = [];

const updateAlphaVanrageAnalytics = function (indicators = __indicators, ranges = __ranges) {
    Stock.find()
        .then(stocks=> recursiveUpdate(stocks, indicators, ranges ) )
}
let averageTime = 0;
let startTime=0
let timeSum=0;
function recursiveUpdate(stocks, indicators, ranges,i = 0) {
    startTime = Date.now();
    if (i<stocks.length){
        fetchIndicators(stocks[i], indicators, ranges)
            .then(analyticsObj => {
                stocks[i].analytics = analyticsObj
                stocks[i].save((err,saved)=>{
                    timeSum += (Date.now() - startTime) / (3600000)
                    const averageTime = timeSum / (i + 1)
                    console.log(`${stocks[i].symbol} saved`, `${(i/stocks.length)*100}%`,`est time left =${averageTime*(stocks.length-i)} hrs`)
                    recursiveUpdate(stocks,indicators, ranges,i+1)
                })
            })
            .catch(err => {
                unprocessed.push([stock[i].symbol, err, Date.now()]);
            })
    } else{
        log(["finished AlphavantageDetails Update", Date.now() ,unprocessed.length, unprocessed])
        console.log("finished AlphavantageDetails Update", unprocessed.length, unprocessed)
    }
    
}


function fetchIndicators(stock,indicators,ranges = __ranges){
    const promises = indicators.map(indicator => fetchIndicatorRanges(stock.symbol, indicator, ranges))
    return Promise.all(promises)
        .then(data => hashNamesToPromiseReturn(indicators, data))
}
function fetchIndicatorRanges(symbol, indicator, ranges = __ranges) {
    const promises = ranges.map((range) => fetchIndicatorRange(symbol, indicator, range))
    return Promise.all(promises)
        .then(data => hashNamesToPromiseReturn(ranges, data));
}
function hashNamesToPromiseReturn(keys, returnArray) {
    const reducer = (acc, key, i) => {
        acc[key] = returnArray[i];
        return acc
    };
    return keys.reduce(reducer, {});
}



function fetchIndicatorRange(symbol, indicator, seriesLength, interval = 'daily') {
    const url = `https://www.alphavantage.co/query?function=${indicator}&symbol=${symbol}&interval=${interval}&time_period=${seriesLength}&series_type=close&apikey=6UYKMBS80HT2T5WD`
    return axios({
        url,
        method: "GET"
    })
    .then(res => extractTodaysIndicator(res.data, indicator))
    .catch(err => console.log("fetchError", err));
}
function extractTodaysIndicator(data, indicatorName) {
    let indicatorByDate = data[`Technical Analysis: ${indicatorName}`]
    const days = Object.keys(indicatorByDate)
    const todaysIndicator = indicatorByDate[days[0]]

    return todaysIndicator[`${indicatorName}`] ?
        todaysIndicator[`${indicatorName}`] :
        todaysIndicator
}


function log(toLog) {
    const fd = FileStream.appendFile(__dirname + 'AlphavantageAnalFetch.log', `\n ${JSON.stringify(toLog)}`, function (err) {
        if (err) {
            console.log('err!', err, Date.now);
            throw err;
        }
    });
}
module.exports = updateAlphaVanrageAnalytics


//maybe general fetch for all apis?
function apiFetch(request, extractor, logger) {
    return axios({
        url: request.url,
        method: request.method
    })
        .then(res => extractor(res))
        .catch(err => {
            if (logger) {
                logger(["Fetch Error", urlOpts, err])
            } else {
                throw err
            }
        })
}