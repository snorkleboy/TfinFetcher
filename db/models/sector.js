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
const performanceSchema = new mongoose.Schema({
    ROI: {
        '20day': Number,
        '50day': Number,
        '200day': Number,
        '1yr': Number,
    },
    peRatio:Number,
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
    exDividendDate: String,
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
    marketcapMax:Number
    
    
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
    currentRatio: Number,
    currentCash: Number,
    currentDebt: Number,
    totalCash: Number,
    totalDebt: Number,
    shareholderEquity: Number,
    cashChange: Number,
    cashFlow: Number,
    operatingGainsLosses: Number
})
const sector = new mongoose.Schema({
    sector: {
        type: String,
        required: 'must include sector name'
    },
    numStocks:Number,
    performance: performanceSchema,
    financials: [financialSchema],
    todaysFinancials: financialSchema,
    earnings: [earningsSchema],
    todaysEarnings: earningsSchema,
    created_at: {
        type: Date,
        default: Date.now
    },

});
sector.index({
    sector: 1
});
const Sector = mongoose.model('Sector', sector);

module.exports = Sector