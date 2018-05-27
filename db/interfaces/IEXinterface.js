
const iexInitFromSymbols = require('../fetchScripts/iex/iexInitFromSymbols')
const addDetails = require('../fetchScripts/iex/iexDetails')
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
        console.log("init started")
        iexInitFromSymbols()
            .then(() => addFinancialMargins())
            .then(() => addCharts())
            .then(() => addSMARSIBBAND())
            .then(() => moveLatestvaluesFromChartsToStocks())
            .then(() => initSectorsFromStocks())
            .then(() => addSectorAverages())
            .then(()=>console.log("init done"));
            

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