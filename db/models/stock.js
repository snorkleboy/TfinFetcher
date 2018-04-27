const mongoose = require('mongoose');

const stock = new mongoose.Schema({
    symbol: {
        type: String,
        required: 'must include symbol/ticker'
    },
    name: String,
    chart:{},
    sector: String,
    industry: String,
    financials:{},
    analytics:{},
    created_at: {
        type: Date,
        default: Date.now
    }
});
const Stock = mongoose.model('Stock', stock);

module.exports = Stock
