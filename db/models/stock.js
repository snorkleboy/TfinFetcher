const mongoose = require('mongoose');

const stock = new mongoose.Schema({
    symbol: {
        type: String,
        required: 'must include symbol/ticker'
    },
    name: String,
    logo: String,
    earnings:{
        actualEPS:	Number,
        consensusEPS:	Number,
        estimatedEPS:	Number,
        announceTime: String,
        numberOfEstimates:	Number,
        EPSSurpriseDollar:	Number,
        EPSReportDate: String,
        fiscalPeriod: String,
        fiscalEndDate: String
    },
    financials:{
        reportDate:	String,
        grossProfit:	Number,
        costOfRevenue:	Number,
        operatingRevenue:	Number,
        totalRevenue:	Number,
        operatingIncome:	Number,
        netIncome:	Number,
        researchAndDevelopment:	Number,
        operatingExpense:	Number,
        currentAssets:	Number,
        totalAssets:	Number,
        totalLiabilities:	Number,
        currentCash:	Number,
        currentDebt:	Number,
        totalCash:	Number,
        totalDebt:	Number,
        shareholderEquity:	Number,
        cashChange:	Number,
        cashFlow:	Number,
        operatingGainsLosses:	String,
    },
    performance:{
    },
    general:{
        symbol:	String,
        companyName:	String,
        exchange:	String,
        industry:	String,
        website:	String,
        description:	String,
        CEO:	String,
        issueType:   String,
        sector:	String,
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});
const Stock = mongoose.model('Stock', stock);

module.exports = Stock
