const StockChart = require('../models/stockChart')
const promiseIterator = require('../util/generalPromiseIterator.js')

const __ranges = [20, 50, 200]
const __rsiRange = 14

function addSMARSIBBAND(batchSize = 10, startI = 0, stopAt, ranges = __ranges, rsiRange = __rsiRange) {
    promiseIterator(
        StockChart,
        addSMARISBBANDToStocks.bind(null, ranges, rsiRange),
        startI,
        batchSize,
        stopAt
    )
}

function addSMARISBBANDToStocks(ranges, rsiRange, stocks) {
    stocks.forEach(stock => {
        try {
            addAnalysis(stock.chart, ranges, rsiRange)
            stock.markModified('chart')
        } catch (e) {
            throw {'symbol':stock.symbol, e};
        }
    })
    return stocks;
}


function addAnalysis(chartData, ranges, rsiRange) {
    const sums = {}
    const sqSums = {}
    ranges.forEach(range => {
        [sums[range], sqSums[range]] = [0, 0]
    })
    let rsiCount = [0, 0];
    for (let i = 0; i < chartData.length; i++) {
        chartData[i].stdev = {};
        chartData[i].ma = {};

        ranges.forEach(range => {
            [sums[range], sqSums[range]] = updateSums(chartData, sums, sqSums, i, range);
            chartData[i].ma[range] = calcAverage(sums, range, i)
            chartData[i].stdev[range] = calcStDev(chartData, sqSums, range, i)
        })
        rsiCount = updateRSICount(chartData, rsiCount[0], rsiCount[1], i, rsiRange);
        chartData[i].rsi = calcRSI(rsiCount[0], rsiCount[1], rsiRange, i)
    }
    return chartData;
}

function updateSums(data, sums, sqSums, i, range) {
    let [sum, sqSum] = [sums[range], sqSums[range]]
    const num = i + 1
    if (range >= num) {
        sqSum = sqSum + Math.pow(data[i].close, 2)
        sum = sum + data[i].close
    } else {
        sqSum = sqSum + Math.pow(data[i].close, 2) - Math.pow(data[i - range].close, 2)
        sum = sum + data[i].close - data[i - range].close
    }
    return [sum, sqSum]
}

function calcAverage(sums, range, i) {
    const num = i + 1

    return num >= range ?
        sums[range] / range :
        sums[range] / num
}

function calcStDev(data, sqSums, range, i) {
    const num = i + 1

    const interval = num <= range ? num : range;
    const variance = sqSums[range] / interval - Math.pow(data[i].ma[range], 2);
    return Math.pow(variance, 1 / 2)
}

function updateRSICount(data, inc, dec, i, rsiRange) {
    if (data[i].change > 0) {
        inc = inc + data[i].change
    } else {
        dec = dec + data[i].change
    }
    if ((i + 1) > rsiRange) {
        [inc, dec] = removeChanges(data, i, inc, dec, rsiRange);
    }
    return [inc, dec]
}

function removeChanges(data, i, increases, decreases, rsiRange) {
    if (data[i - rsiRange].change >= 0) {
        increases = increases - data[i - rsiRange].change
    } else {
        decreases = decreases - data[i - rsiRange].change
    }
    return [increases, decreases]
}

function calcRSI(inc, dec, range, j) {
    const i = range > j ? j + 1 : range;
    let rsi = Math.abs((inc / i) / (dec / i))
    return 100 - 100 / (1 + rsi)
}


module.exports = addSMARSIBBAND;