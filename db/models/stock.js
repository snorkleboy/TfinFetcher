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
    analytics:{},
    general:{

    },
    created_at: {
        type: Date,
        default: Date.now
    }
});
const Stock = mongoose.model('Stock', stock);

module.exports = Stock
