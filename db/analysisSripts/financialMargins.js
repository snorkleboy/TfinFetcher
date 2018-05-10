const Stock = require('../db/models/stock')
const StockChart = require('../db/models/stockChart')



const numStocks=null;
function addFinancialMargins(){
    Stock.find({}).count()
    .then(count=>{
        numStocks = count
        recursiveAddandSave()
    })
}

function recursiveAddandSave(i=0,batch = 10){
    if (i < numStocks){
        Stock.find({},{financial:1})
        .skip(i)
        .limit(batch)
            .then(stocks=>addmargins(stocks))
            .then(stocks=>saveStocks(stocks))
            .then(saved=> progressReport(saved))
            .then(()=> recursiveAddandSave(i+batch, batch));
    } else {
        console.log("DONE adding margins");
    }
}

function addmargins(stocks){
    stocks.forEach(stock=>{
        stocks.financial.forEach(report=>{
            console.log(report);
        })
    })
}
function saveStocks(saveStocks){

}
function progressReport(saved){

}

module.exports = addFinancialMargins;