const saveDayChart = require('./iexChart');
const axios = require('axios');
const Stock = require('../db/models/stock')


const rateLimit = 10;
const limitedChartFetcha = ()=>{
    let locked = false;

    Stock.find({})
    .then((stocks)=>{
        let i = 1;
        const intId = setInterval(()=>{
            if (i< stocks.length){
                console.log('fetching 5y charts', stocks[i].symbol, i, `%${i / stocks.length * 100}`)
                saveDayChart(stocks[i])
                .catch(err=>{
                    console.log("ERROR FETCHING 5Y CHARTS",err);
                    clearInterval(intId);
                })
                i++;
            } else{
                clearInterval(intId);
                console.log("finished 5y charts, saving");
                saveCharts(stocks);
                console.log("saved charts");
                
            }
        }, 1000/rateLimit)

    })
}
function saveCharts(stocks,i=1){
    stocks[i].save()
    .then(()=>saveCharts(stocks,++i))
}
const limitedChartFetch=()=>{
    Stock.find({},(err,stocks)=>{
        recFetch(stocks)
    })
}
function recFetch(stocks,i=1,start=0){
    if (i>=stocks.length){
        return stocks;
    }
    console.log('fetching 5y charts',i, stocks[i].symbol, `%${i / stocks.length * 100}`)
    saveDayChart(stocks[i])
        .then(()=>{
            recFetch(stocks, ++i)
        })
        .catch((err)=>console.log("ERROR",err))

}
function wait(time){
    return new Promise(resolve=>setTimeout(resolve,time));
}



module.exports = limitedChartFetch;