const mongoose = require('mongoose');
const {
    earningsSchema,
    financialSchema,
    performanceSchema,
    generalSchema,
    analyticsSchema,
} = require('./stock/stockSubDocs');
const aggregateScreen = require('./stock/aggregationScreen')
const {
    mapScreenOptions,
    screen,
    listKeys
} = require('./stock/stockUtil')

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

stock.statics.mapScreenOptions = mapScreenOptions
stock.statics.screen = screen
stock.statics.aggregateScreen = aggregateScreen
stock.statics.listKeys = listKeys
stock.index({
    symbol: 1
});

const Stock = mongoose.model('Stock', stock);

module.exports = Stock






