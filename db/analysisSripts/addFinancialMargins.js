const Stock = require('../models/stock')


let startTime = 0;
let numStocks=null;
const errors = [];
function addFinancialMargins(){
    console.log("adding financial margin information")
    return Stock.find({}).count()
    .then(count=>{
        startTime = Date.now();
        numStocks = count
        recursiveAddandSave()
    })
}

function recursiveAddandSave(i=0,batch = 100){
    if (i < numStocks){
        return Stock.find({},{symbol:true,financials:true})
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
            report.grossMargin = numberOrUndefinedPercent(report.grossProfit / report.totalRevenue);
            report.operatingMargin = numberOrUndefinedPercent(report.operatingIncome / report.operatingRevenue);
            report.profitMargin = numberOrUndefinedPercent(report.netIncome / report.totalRevenue);
            report.currentRatio = numberOrUndefinedPercent(report.totalAssets / report.totalLiabilities);
            report.quickRatio = numberOrUndefinedPercent(report.currentAssets / report.totalLiabilities);

        })
    })
    return stocks
}
function numberOrUndefinedPercent(value){
    if (typeof value !== "number" || isNaN(value) || value === Infinity || value === -Infinity){
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
    const somenames = [names[0],names[names.length-1]].join('...');
    const elapsedTime = Date.now()-startTime;
    const averageTime = elapsedTime/(i+1);
    const estimatedTimeMinutes = parseInt(averageTime/60000 * (numStocks - i) );
    const percent = parseInt(i/numStocks);
    console.log({somenames, percent, estimatedTimeMinutes})
}


module.exports = addFinancialMargins;