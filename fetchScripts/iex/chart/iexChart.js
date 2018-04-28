const axios = require('axios');
const Stock = require('../db/models/stock')
const http = require('http')
const https = require('https')

const saveDayChart = (stock) => axios({
        url:`https://api.iextrading.com/1.0/stock/${stock.symbol}/chart/5y`,
        method:"GET",
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true })
    })
    .then(response => {
        stock.set({chart : { "daily": [{ dateFetched: Date.now(), series: "5y daily", data: response.data }] }});
        stock.save()
    })


const saveDayChartb = (stock) => axios({
        url: `https://api.iextrading.com/1.0/stock/${stock.symbol}/chart/5y`,
        method: "GET",
        httpAgent: new http.Agent({ keepAlive: true }),
        httpsAgent: new https.Agent({ keepAlive: true })
    })
    .then(response => {
        stock.chart = { "daily": [{ dateFetched: Date.now(), series: "5y daily", data: response.data }] };
    })



    
module.exports = saveDayChart;