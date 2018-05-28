
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
        console.log("init started")
        iexInitFromSymbols()
            .then(() => console.log("stocks instantiated"))        
            .then(() => addDetails())
            .then(() => console.log("stocks details fetched downloaded"))
            .then(() => addCharts())
            .then(() => console.log("stocks charts downloaded"))
            .then(() => addFinancialMargins())
            .then(() => console.log("done adding Financial margins"))
            .then(() => addSMARSIBBAND())
            .then(() => console.log("stock analysis added"))
            .then(() => moveLatestvaluesFromChartsToStocks())
            .then(() => console.log("latest values moved from stocks"))            
            .then(() => initSectorsFromStocks())
            .then(saved => console.log(saved.length, "made sectors"))            
            .then(() => addSectorAverages())
            .then(saved => console.log(saved.length, "added sector average aggregates"))            
            .then(()=>console.log("init done"))
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