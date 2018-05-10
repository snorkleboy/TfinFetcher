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
    profitMargin: Number,
    operatingMargin: Number,
    grossMargin: Number,
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
    cashChange: Number,
    cashFlow: Number,
    operatingGainsLosses: Number
})
const performanceSchema = new mongoose.Schema({
    ROI: {
        '20day':Number,
        '50day':Number,
        '200day':number,
        '1yr':Number,
    },
    _id: String,
    companyName: String,
    marketcap: Number,
    beta: Number,
    week52high: Number,
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

stock.statics.mapScreenOptions = function mapScreenOptions(queryHash) {

    console.log('here1', Object.keys(queryHash));
    const schemaQueryObj = {};
    Object.keys(queryHash).forEach(queryKey => {

        let schemaKey = null;
        if (Object.keys(earningsSchema.obj).includes(queryKey)) {
            schemaKey = `earnings.$1.${queryKey}`
        } else if (Object.keys(financialSchema.obj).includes(queryKey)) {
            schemaKey = `financials.$1.${queryKey}`
        } else if (Object.keys(performanceSchema.obj).includes(queryKey)) {
            schemaKey = `performance.${queryKey}`
        } else if (Object.keys(generalSchema.obj).includes(queryKey)) {
            schemaKey = `analytics.${queryKey}`
        } else if (Object.keys(analyticsSchema.obj).includes(queryKey)) {
            schemaKey = `general.${queryKey}`
        } else {
            throw `validation error: ${queryKey} not accepted key`
        }
        schemaQueryObj[schemaKey] = queryHash[queryKey]
    })

    return schemaQueryObj
}
stock.statics.screen = function screen(schemaQueryObj) {
    schemaKeys = Object.keys(schemaQueryObj);
    const where = {};
    const select = {
        'symbol': 1,
        "name": 1
    }
    schemaKeys.forEach(key => {
        const query = mapQueryValueToMongoose(schemaQueryObj[key])
        where[key] = query
        select[key] = true
    })
    console.log("SCREEN", schemaQueryObj, where, select)
    return this.model('Stock').find(where, select);
}



function mapQueryValueToMongoose(queryString) {
    let query = null;
    let value = parseFloat(queryString.slice(1, queryString.length))
    if (queryString[0] == '<') {
        query = {
            "$lt": value
        }
    } else if (queryString[0] == '>') {
        query = {
            "$gt": value
        }
    } else {
        query = queryString
    }
    return query
}

stock.index({
    symbol: 1
});

const Stock = mongoose.model('Stock', stock);

module.exports = Stock






