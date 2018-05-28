const StockChart = require('../models/stockChart')
const Stock = require('../models/stock');
const mongoose = require('mongoose');

const promiseIterator = require('../util/generalPromiseIterator.js')
// const promiseFiller = require('../util/promiseFiller.js')

function moveValuesFromChartsToStocks(batchSize = 30, startI = 0, stopAt) {
    console.log("moving most recent stockchart info into each stock ")
    return promiseIterator(
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
        const errors = [];
        stocks.forEach(stock=>{
            const chart = chartsHash[stock.symbol].chart
            const todaysReport = chart[chart.length-1];
            const performance = stock.performance

            
            if (performance && todaysReport) {
                let eps = undefined;
                if (stock.earnings[0] && stock.earnings[0].actualEPS && stock.earnings[0].actualEPS > 0) {
                    eps = stock.earnings[0].actualEPS
                } else if (performance.latestEPS && performance.latestEPS > 0) {
                    eps = performance.latestEPS
                } else if (performance.grossProfit / performance.sharesOutstanding > 0) {
                    eps = performance.grossProfit / performance.sharesOutstanding;
                }
                if (isNaN(performance.revenuePerEmployee)) {
                    performance.revenuePerEmployee = undefined;
                }
                if (isNaN(performance.revenuePerShare)) {
                    performance.revenuePerShare = undefined;
                }
                // price per share / earnigns per share === price / earnigns
                performance.peRatio = eps ? todaysReport.close / eps : undefined
                performance.sma = todaysReport.sma
                performance.stdev = todaysReport.stdev
                performance.rsi = todaysReport.rsi
                performance.roi = {
                    '20day': getROI(todaysReport, chart, 20),
                    '50day': getROI(todaysReport, chart, 50),
                    '200day': getROI(todaysReport, chart, 200),
                    '1yr': getROI(todaysReport, chart, 365),
                }
                stock.markModified('performance');
            } else{
                const missing = todaysReport ? "performance missing" : [chart.length,chart[chart.length-2]]
                errors.push({message:"NO todaysReport or performance OBJECT", missing, symbol:stock.symbol})

            }
            
        })
        if (errors.length>0){
            throw errors
        }

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

module.exports = moveValuesFromChartsToStocks