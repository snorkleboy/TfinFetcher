const mongoose = require('mongoose');
const earningsSchema = new mongoose.Schema({
    actualEPS: Number,
    consensusEPS: Number,
    estimatedEPS: Number,
    announceTime: String,
    numberOfEstimates: Number,
    EPSSurpriseDollar: Number,
    EPSReportDate: String,
    fiscalPeriod: String,
    fiscalEndDate: String,
    yearAgo: Number,
    yearAgoChangePercent: Number,
    estimatedChangePercent: Number,
    symbolId: Number
})

const financialSchema = new mongoose.Schema({
    reportDate: String,
    grossProfit: Number,
    costOfRevenue: Number,
    operatingRevenue: Number,
    totalRevenue: Number,
    operatingIncome: Number,
    netIncome: Number,
    researchAndDevelopment: Number,
    operatingExpense: Number,
    currentAssets: Number,
    totalAssets: Number,
    totalLiabilities: Number,
    currentCash: Number,
    currentDebt: Number,
    totalCash: Number,
    totalDebt: Number,
    shareholderEquity: Number,
    cashChange:  Number,
    cashFlow: Number,
    operatingGainsLosses: Number
})
const performanceSchema = new mongoose.Schema({
    _id: String,
    companyName: String,
    marketcap: Number,
    beta: Number,
    week52high:Number,
    week52low: Number,
    week52change: Number,
    shortInterest: Number,
    shortDate: String,
    dividendRate: Number,
    dividendYield: Number,
    exDividendDate: Number,
    latestEPS: Number,
    latestEPSDate: String,
    sharesOutstanding: Number,
    float: Number,
    returnOnEquity: Number,
    consensusEPS: Number,
    numberOfEstimates: Number,
    EPSSurpriseDollar: Number,
    EPSSurprisePercent: Number,
    symbol: String,
    EBITDA: Number,
    revenue: Number,
    grossProfit: Number,
    cash: Number,
    debt: Number,
    ttmEPS: Number,
    revenuePerShare: Number,
    revenuePerEmployee: Number,
    peRatioHigh: Number,
    peRatioLow: Number,
    returnOnAssets: Number,
    returnOnCapital: Number,
    profitMargin: Number,
    priceToSales: Number,
    priceToBook: Number,
    day200MovingAvg: Number,
    day50MovingAvg: Number,
    institutionPercent: Number,
    insiderPercent: Number,
    shortRatio: Number,
    year5ChangePercent: Number,
    year2ChangePercent: Number,
    year1ChangePercent: Number,
    ytdChangePercent: Number,
    month6ChangePercent: Number,
    month3ChangePercent: Number,
    month1ChangePercent: Number,
    day5ChangePercent: Number,
    day30ChangePercent: Number,
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
const stock = new mongoose.Schema({
    symbol: {
        type: String,
        required: 'must include symbol/ticker'
    },
    name: String,
    logo: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    earnings: [earningsSchema],
    financials: [financialSchema],
    performance: performanceSchema,
    analytics: analyticsSchema,
    general: generalSchema,
});
//todo 
//this should validate user inputed query string matches to keys in the stock schema and values to possible values
stock.statics.validateScreenOptions = function(queryHash){
    return queryHash
}
stock.statics.screen = function (queryHash) {
    keys = Object.keys(queryHash);

    const where = {};
    const select = {'symbol':1}
    keys.forEach(key=>{
        const query = convertQueryToMongoose(queryHash[key])
        const param = keyToParam(key)
        where[param] = query
        select[param] = true
    })
    console.log("SCREEN",queryHash,where, select)
    return this.model('Stock').find(where,select);
}
function keyToParam(key) {
    if (performanceKeys.includes(key)){
        return `performance.${key}`
    }
}
function convertQueryToMongoose(queryString){
    let query = null;
    let value = parseFloat(queryString.slice(1, queryString.length))
    if (queryString[0]=='<'){
        query = {"$lt":value}
    } else if (queryString[0] == '>'){
        query = {"$gt":value}
    } else{
        query = queryString
    }
    return query
} 

stock.index({symbol:1});

const Stock = mongoose.model('Stock', stock);

module.exports = Stock


