const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
    
    actualEPS: {type:Number, set: numberOrNull},
    consensusEPS: {type:Number, set: numberOrNull},
    estimatedEPS: {type:Number, set:numberOrNull},
    announceTime: String,
    numberOfEstimates: {type:Number, set: numberOrNull},
    EPSSurpriseDollar: {type:Number, set: numberOrNull},
    EPSReportDate: String,
    fiscalPeriod: String,
    fiscalEndDate: String,
    yearAgo: {type:Number, set: numberOrNull},
    yearAgoChangePercent: {type:Number, set: numberOrNull},
    estimatedChangePercent: {type:Number, set: numberOrNull},
    symbolId: {type:Number, set: numberOrNull}
})

const financialSchema = new mongoose.Schema({
    profitMargin: {type:Number, set: numberOrNull},
    operatingMargin: {type:Number, set: numberOrNull},
    grossMargin: {type:Number, set: numberOrNull},
    reportDate: String,
    grossProfit: {type:Number, set: numberOrNull},
    costOfRevenue: {type:Number, set: numberOrNull},
    operatingRevenue: {type:Number, set: numberOrNull},
    totalRevenue: {type:Number, set: numberOrNull},
    operatingIncome: {type:Number, set: numberOrNull},
    netIncome: {type:Number, set: numberOrNull},
    researchAndDevelopment: {type:Number, set: numberOrNull},
    operatingExpense: {type:Number, set: numberOrNull},
    currentAssets: {type:Number, set: numberOrNull},
    totalAssets: {type:Number, set: numberOrNull},
    totalLiabilities: {type:Number, set: numberOrNull},
    currentRatio: {type:Number, set: numberOrNull},
    quickRatio:{type:Number, set: numberOrNull},
    currentCash: {type:Number, set: numberOrNull},
    currentDebt: {type:Number, set: numberOrNull},
    totalCash: {type:Number, set: numberOrNull},
    totalDebt: {type:Number, set: numberOrNull},
    shareholderEquity: {type:Number, set: numberOrNull},
    cashChange: {type:Number, set: numberOrNull},
    cashFlow: {type:Number, set: numberOrNull},
    operatingGainsLosses: {type:Number, set: numberOrNull}
})
const performanceSchema = new mongoose.Schema({
    roi: {
        '20day': {type:Number, set: numberOrNull},
        '50day': {type:Number, set: numberOrNull},
        '200day': {type:Number, set: numberOrNull},
        '1yr': {type:Number, set: numberOrNull},
    },
    rsi:{type:Number, set: numberOrNull},
    sma:{
        '20day': {type:Number, set: numberOrNull},
        '50day': {type:Number, set: numberOrNull},
        '200day': {type:Number, set: numberOrNull},
    },
    stdev:{
        '20day': {type:Number, set: numberOrNull},
        '50day': {type:Number, set: numberOrNull},
        '200day': {type:Number, set: numberOrNull},
    },
    peRatio: {type:Number, set: numberOrNull},
    _id: String,
    companyName: String,
    marketcap: {type:Number, set: numberOrNull},
    beta: {type:Number, set: numberOrNull},
    week52high: {type:Number, set: numberOrNull},
    week52low: {type:Number, set: numberOrNull},
    week52change: {type:Number, set: numberOrNull},
    shortInterest: {type:Number, set: numberOrNull},
    shortDate: String,
    dividendRate: {type:Number, set: numberOrNull},
    dividendYield: {type:Number, set: numberOrNull},
    exDividendDate: String,
    latestEPS: {type:Number, set: numberOrNull},
    latestEPSDate: String,
    sharesOutstanding: {type:Number, set: numberOrNull},
    float: {type:Number, set: numberOrNull},
    returnOnEquity: {type:Number, set: numberOrNull},
    consensusEPS: {type:Number, set: numberOrNull},
    numberOfEstimates: {type:Number, set: numberOrNull},
    EPSSurpriseDollar: {type:Number, set: numberOrNull},
    EPSSurprisePercent: {type:Number, set: numberOrNull},
    symbol: String,
    EBITDA: {type:Number, set: numberOrNull},
    revenue: {type:Number, set: numberOrNull},
    grossProfit: {type:Number, set: numberOrNull},
    cash: {type:Number, set: numberOrNull},
    debt: {type:Number, set: numberOrNull},
    ttmEPS: {type:Number, set: numberOrNull},
    revenuePerShare: {type:Number, set: numberOrNull},
    revenuePerEmployee: {type:Number, set: numberOrNull},
    peRatioHigh: {type:Number, set: numberOrNull},
    peRatioLow: {type:Number, set: numberOrNull},
    returnOnAssets: {type:Number, set: numberOrNull},
    returnOnCapital: {type:Number, set: numberOrNull},
    profitMargin: {type:Number, set: numberOrNull},
    priceToSales: {type:Number, set: numberOrNull},
    priceToBook: {type:Number, set: numberOrNull},
    day200MovingAvg: {type:Number, set: numberOrNull},
    day50MovingAvg: {type:Number, set: numberOrNull},
    institutionPercent: {type:Number, set: numberOrNull},
    insiderPercent: {type:Number, set: numberOrNull},
    shortRatio: {type:Number, set: numberOrNull},
    year5ChangePercent: {type:Number, set: numberOrNull},
    year2ChangePercent: {type:Number, set: numberOrNull},
    year1ChangePercent: {type:Number, set: numberOrNull},
    ytdChangePercent: {type:Number, set: numberOrNull},
    month6ChangePercent: {type:Number, set: numberOrNull},
    month3ChangePercent: {type:Number, set: numberOrNull},
    month1ChangePercent: {type:Number, set: numberOrNull},
    day5ChangePercent: {type:Number, set: numberOrNull},
    day30ChangePercent: {type:Number, set: numberOrNull},
})

const generalSchema = new mongoose.Schema({
    _id: String,
    CEO: String,
    companyName: String,
    description: String,
    exchange: String,
    industry: String,
    issueType: String,
    sector: String,
    symbol: String,
    website: String
})
const analyticsSchema = new mongoose.Schema({

})

function numberOrNull(num){
    return isNaN(num) ? null : num 
}

module.exports = {
    earningsSchema,
    financialSchema,
    performanceSchema,
    generalSchema,
    analyticsSchema,
}