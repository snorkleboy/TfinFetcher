const saveDayChart = require('./iexChart');
const axios = require('axios');
const Stock = require('../db/models/stock')


const rateLimit = 100;
const limitedChartFetch = ()=>{
    Stock.find({})
    .then((stocks)=>{
        let i = 1;
        // saveDayChart(stocks[i].symbol, stocks[i].id).then(()=>Stock.findById(stocks[i].id)).then((res)=>console.log(res));
        const intId = setInterval(()=>{
            console.log(i, stocks[i])
            if (i< stocks.length){
                saveDayChart(stocks[i].symbol,stocks[i].id)
                i++;
            } else{
                clearInterval(intId);
            }
        }, 1000/rateLimit)

    })
}

module.exports = limitedChartFetch;