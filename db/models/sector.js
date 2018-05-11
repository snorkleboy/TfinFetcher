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
    name:String,
    performance:[{

    }],
    financials: [financialSchema],
    earnings: [earningsSchema],
    created_at: {
        type: Date,
        default: Date.now
    },

});
stockChart.index({
    name: 1
});
const Sector = mongoose.model('Sector', stockChart);

module.exports = Sector