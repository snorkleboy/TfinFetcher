const mongoose = require('mongoose');

const stock = new mongoose.Schema({
    symbol: {
        type: String,
        required: 'must include symbol/ticker'
    },
    name: String,
    logo: String,
    earnings:[],
    financials:[],
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
