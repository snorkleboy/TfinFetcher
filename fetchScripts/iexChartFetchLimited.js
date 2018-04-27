const saveDayChart = require('./iexChart');
const axios = require('axios');
const Stock = require('../db/models/stock')

const limitedChartFetch = ()=>{
    Stock.find({}).forEach((el)=>console.log(el));
}
module.exports = limitedChartFetch;