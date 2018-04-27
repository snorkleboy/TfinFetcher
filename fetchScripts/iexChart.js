const axios = require('axios');
const Stock = require('../db/models/stock')

const saveDayChart = (ticker,id) => axios.get(`https://api.iextrading.com/1.0/stock/${ticker}/chart/5y`)
    .then(response => {
        const chartObj = { chart: { "daily": [{ dateFetched: Date.now(), series: "5y daily", data: response.data}] } }
        Stock.findByIdAndUpdate(id, { $set: chartObj}, { new: true }, function (err, updated) {})
    })
module.exports = saveDayChart;