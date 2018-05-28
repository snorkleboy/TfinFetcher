
const iexInitFromSymbols = require('../fetchScripts/iex/iexInitFromSymbols')
const addDetails = require('../fetchScripts/iex/iexDetailsPI')
const addCharts = require('../fetchScripts/iex/addIEXStockChartPI')
// const addEarningsGrowth = require('../analysisSripts/addEarningsGrowth')
const addFinancialMargins = require('../analysisSripts/addFinancialMargins')
const addSMARSIBBAND = require('../analysisSripts/addSMARSIBBANDPI') 
const moveLatestvaluesFromChartsToStocks = require('../dbScripts/moveLatestValuesFromChartsToStockPI')
const initSectorsFromStocks = require('../dbScripts/initSectorsFromStocks')
const addSectorAverages = require('../analysisSripts/addSectorAverages')
//never ran or tested, mostly for documentation

module.exports = class IexInterface{
    constructor(){
        console.log("construct")
    }
    init(options) {

        // iexInitFromSymbols()
        //     .then(() => {forceGC();console.log("stocks instantiated")})        
        //     .then(() => addCharts())
        //     .then(() => {forceGC();console.log("stocks charts downloaded")})
        //     .then(() => addDetails())
        //     .then(() => {forceGC();console.log("stocks details fetched downloaded")})
        //     .then(() => addFinancialMargins())
        //     .then(() => {forceGC();console.log("done adding Financial margins")})
        //     .then(() => addSMARSIBBAND())
        //     .then(() => {forceGC();console.log("stock analysis added")})
            // .then(() => moveLatestvaluesFromChartsToStocks())
            moveLatestvaluesFromChartsToStocks()
            .then(() => {forceGC();console.log("latest values moved from stocks")})            
            .then(() => initSectorsFromStocks())
            .then(() => {forceGC();console.log( "made sectors")})            
            .then(() => addSectorAverages())
            .then(() => {forceGC();console.log( "added sector average aggregates")})            
            .then(() => console.log("init done"))
            .catch(e=>console.log(e))
            

            //mostly functional at this point, all of the previous functions need to be 
            //refactored to work like this, probably just put return into highest level function
            //todo
            // .then(()=> cleanup())
            // .then(()=> ensure())
    }

    //to do 
    update(){

    }
    
}

function forceGC(){
    if (global.gc) {
        console.log("garbage collecting");
        global.gc();
    } else {
        console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
    }
}