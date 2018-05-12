const StockChart = require('../models/stockChart')
const Stock = require('../models/stock');
const mongoose = require('mongoose');

const promiseIterator = require('../util/generalPromiseIterator.js')
// const promiseFiller = require('../util/promiseFiller.js')

function moveValuesFromChartsToStocks(batchSize = 10, startI = 0, stopAt) {
    promiseIterator(
        StockChart,
        moveValues,
        startI,
        batchSize,
        stopAt
    )
}
function moveValues(charts){
    const  chartsHash ={};
    const ids=[];
    const promises = [];
    charts.forEach(chart => {
        ids.push(mongoose.Types.ObjectId(chart.stock_id))
        chartsHash[chart.symbol] = chart
    });
    return Stock.find({"_id":{"$in":ids}})
    .then((stocks)=>{
        stocks.forEach(stock=>{
            const chart = chartsHash[stock.symbol].chart
            const todaysReport = chart[chart.length-1];

            const performance = stock.performance

            if (performance && todaysReport) {
                if (isNaN(performance.revenuePerEmployee)) {
                    performance.revenuePerEmployee = undefined;
                }
                if (isNaN(performance.revenuePerShare)) {
                    performance.revenuePerShare = undefined;
                }
                performance.sma = todaysReport.sma
                performance.stdev = todaysReport.stdev
                performance.rsi = todaysReport.rsi
                performance.roi = {
                    '20day': getROI(todaysReport, chart, 20),
                    '50day': getROI(todaysReport, chart, 50),
                    '200day': getROI(todaysReport, chart, 200),
                    '1yr': getROI(todaysReport, chart, 365),
                }
            } else{
                const missing = todaysReport ? "performance missing" : [chart.length,chart[chart.length-2]]
                throw {message:"NO todaysReport or performance OBJECT", missing, symbol:stock.symbol}
            }
            
        })
        
        return stocks
    })
}

function getROI(todaysReport, chart, days) {
    let val;
    try {
        val = (todaysReport.close - chart[chart.length - days].close) / chart[chart.length - days].close
    } catch (error) {
        val=undefined;
    }
    return val;
}
function promiseFiller(documents, callback) {
    const promises = [];
    documents.forEach(doc => promise.push(callback(doc)))
    return Promise.all(promises);
}



const a = {
    ROI: {
        '20day': null,
        '50day': null,
        '200day': null,
        '1yr': null,
    },
    RSI: null,
    SMA: {
        '20day': null,
        '50day': null,
        '200day': null,
    },
    stdev: {
        '20day': null,
        '50day': null,
        '200day': null,
    }
}
module.exports = moveValuesFromChartsToStocks