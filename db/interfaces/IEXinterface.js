
const iexInitFromSymbols = require('../fetchScripts/iex/iexInitFromSymbols')
const addDetails = require('../fetchScripts/iex/iexiexDetailsFetch.log')
const addCharts = require('../fetchScripts/iex/chart/addIEXStockChartPI')
const addEarningsGrowth = require('../analysisSripts/addEarningsGrowth')
const addFinancialMargins = require('../analysisSripts/addFinancialMargins')
const addSMARSIBBAND = require('../analysisSripts/addSMARSIBBANDPI') 
const moveLatestvaluesFromChartsToStocks = require('../dbScripts/moveLatestValuesFromChartsToStock')
const initSectorsFromStocks = require('../dbScripts/initSectorsFromStocks')
const addSectorAverages = require('../analysisSripts/addSectorAverages')
//never ran or tested, mostly for documentation
class IexInterface{
    constructor(){

    }
    initialize() {
        iexInitFromSymbols()
            .then(() => this.addDetails())
            .then(() => this.addCharts())
            .then(() => moveLatestvaluesFromChartsToStocks())
            .then(() => initSectorsFromStocks())
            .then(() => addSectorAverages())
            //mostly functional at this point, all of the previous functions need to be 
            //refactored to work like this, probably just put return into highest level function
            //todo
            // .then(()=> cleanup())
            // .then(()=> ensure())
    }
    addDetails(){
        return addDetails()
        .then(() => addEarningsGrowth())
        .then(() => addFinancialMargins())

    }
    addCharts() {
        return addCharts()
            .then(() => addSMARSIBBAND())
    }
    //to do 
    update(){

    }
    
}