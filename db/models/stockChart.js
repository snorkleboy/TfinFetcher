const mongoose = require('mongoose');

const stockChart = new mongoose.Schema({
    symbol: {
        type: String,
        required: 'must include symbol/ticker'
    },
    name: String,
    chart: [{ }],
    stock_id: mongoose.Schema.Types.ObjectId,
    created_at: {
        type: Date,
        default: Date.now
    }
});
stockChart.index({symbol:1});
const StockChart = mongoose.model('StockChart', stockChart);

module.exports = StockChart