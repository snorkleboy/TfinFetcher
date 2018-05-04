const axios = require('axios');
const Stock = require('../../db/models/stock')
//daily as default interval instead of monthly because for some reason a serieslength of 200 does not always work with a monthly interval...
//hopefully Alphavantage fixes something
//05/04/2018


function fetchIndicatorRange(symbol, indicator, seriesLength, interval = 'daily'){
    const url = `https://www.alphavantage.co/query?function=${indicator}&symbol=${symbol}&interval=${interval}&time_period=${seriesLength}&series_type=close&apikey=6UYKMBS80HT2T5WD`
    return axios({
            url ,
            method: "GET"
        })
        .then(res => extractTodaysIndicator(res.data, indicator))
        .catch(err=>console.log("fetchError", err));
}
function extractTodaysIndicator(data,indicatorName){
    let indicatorByDate = data[`Technical Analysis: ${indicatorName}`]
    const days = Object.keys(indicatorByDate)
    const todaysIndicator = indicatorByDate[days[0]]
    
    return todaysIndicator[`${indicatorName}`] ? 
        todaysIndicator[`${indicatorName}`]
    :
        todaysIndicator

}


const __ranges = [20, 50, 200]
function fetchIndicatorRanges(symbol,indicator, ranges = __ranges){
    const promises = ranges.map((range) => fetchIndicatorRange(symbol, indicator, range))
    return Promise.all(promises)
        .then(data => {
            const reducer = (indicator, range, i) =>{ 
                indicator[range] = data[i];
                return indicator;
            }
            return ranges.reduce(reducer, {})
        });

}
function fetchIndicators(stocks,indicators,ranges=__ranges){
    stocks
    .forEach(stock=>{
        const promises = indicators.map(indicator => fetchIndicatorRanges(stock.symbol, indicator, ranges))
        Promise.all(promises)
        .then(data=> {
            const reducer = (stockData, indicator, i) => {
                stockData[indicator] = data[i];
                return stockData
            };
            console.log(indicators.reduce(reducer, {}));
        })

    })
}

function fillObjFromPromiseReturnArray(keys, returnArray) {
    const reducer = (acc, key, i) => {
        acc[indicator] = returnArray[i];
        return acc
    };
    return keys.reduce(reducer, {});
}
// module.exports =
const testStocks = [{ symbol: "FB" }, { symbol: "GOOG" }]
const indicators = ["RSI", "BBANDS", "SMA"]
fetchIndicators(testStocks, indicators)

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