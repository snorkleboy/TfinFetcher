const axios = require('axios');
const Stock = require('../db/models/stock')

const saveDayChart = (stock) => axios.get(`https://api.iextrading.com/1.0/stock/${stock.symbol}/chart/5y`)
    .then(response => {
        stock.set({chart: { "daily": [{ dateFetched: Date.now(), series: "5y daily", data: response.data }] }});
        stock.save((err,updated)=>{})
    })

const saveDayChartb = (stock) => axios.get(`https://api.iextrading.com/1.0/stock/${stock.symbol}/chart/5y`)
    
module.exports = saveDayChart;