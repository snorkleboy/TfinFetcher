const saveDayChart = require('./iexChart');
const axios = require('axios');
const Stock = require('../db/models/stock')


const rateLimit = 15;
const limitedChartFetcha = ()=>{
    Stock.find({})
    .then((stocks)=>{
        let i = 1;
        // saveDayChart(stocks[i].symbol, stocks[i].id).then(()=>Stock.findById(stocks[i].id)).then((res)=>console.log(res));
        const intId = setInterval(()=>{
            console.log('fetching 5y charts',stocks[i].symbol,`%${i/stocks.length*100}`)
            if (i< stocks.length){
                saveDayChart(stocks[i].symbol,stocks[i].id)
                    .catch(err=>{
                        console.log("ERROR FETCHING 5Y CHARTS",err);
                        clearInterval(intId);
                    })
                i++;
            } else{
                clearInterval(intId);
                console.log("finished 5y charts");
            }
        }, 1000/rateLimit)

    })
}

const limitedChartFetch=()=>{
    Stock.find({})
        .then((stocks) => {recFetch(stocks,1)})
}
function recFetch(stocks,i){
    console.log('fetching 5y charts',i, stocks[i].symbol, `%${i / stocks.length * 100}`)
    saveDayChart(stocks[i])
    i%rateLimit===0 ? 
        wait(1500).then(() => recFetch(stocks, ++i))   
    :
        recFetch(stocks, ++i)

}
function wait(time){
    return new Promise(resolve=>setTimeout(resolve,time));
}
module.exports = limitedChartFetch;