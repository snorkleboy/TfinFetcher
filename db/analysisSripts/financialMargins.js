const Stock = require('../models/stock')


let startTime = 0;
let numStocks=null;
const errors = [];
function addFinancialMargins(){
    Stock.find({}).count()
    .then(count=>{
        startTime = Date.now();
        numStocks = count
        recursiveAddandSave()
    })
}

function recursiveAddandSave(i=0,batch = 100){
    if (i < numStocks){
        Stock.find({},{symbol:true,financials:true})
        .skip(i)
        .limit(batch)
            .then(stocks=>addmargins(stocks))
            .then(stocks=>saveStocks(stocks))
            .then(saved=> progressReport(saved,i))
            .catch(err=>{console.log(err);errors.push([errors,i])})
            .then(()=> recursiveAddandSave(i+batch, batch));
    } else {
        console.log("DONE adding margins", `errors:${errors.length}`);
    }
}

function addmargins(stocks){
    stocks.forEach(stock=>{
        stock.financials.forEach(report=>{
            report.grossMargin = numberOrUndefined(report.grossProfit / report.totalRevenue);
            report.operatingMargin = numberOrUndefined(report.operatingIncome/report.operatingRevenue);
            report.profitMargin =  numberOrUndefined(report.netIncome/report.operatingRevenue);
            report.currentRatio = numberOrUndefined(report.totalAssets / report.totalLiabilities);
        })
    })
    return stocks
}
function numberOrUndefined(value){
    if (typeof value !== "number" || isNaN(value)){
        return undefined
    }
    return value
}
function saveStocks(stocks){
    promises=[];
    stocks.forEach( stock => promises.push(stock.save()) )
    return Promise.all(promises)
}
function progressReport(saved,i){
    const names = saved.map(stock=>stock.symbol);
    const elapsedTime = Date.now()-startTime;
    const averageTime = elapsedTime/(i+1);
    const estimatedTimeMinutes = parseInt(averageTime/60000 * (numStocks - i) );
    const percent = parseInt(i/numStocks);
    console.log(names, `${percent}%`, `estimated time left:${estimatedTimeMinutes} minutes`)
}

module.exports = addFinancialMargins;