
const iexInitFromSymbols = require('../fetchScripts/iex/iexInitFromSymbols')
const addDetails = require('../fetchScripts/iex/iexiexDetailsFetch.log')
const addCharts = require('../fetchScripts/iex/chart/addIEXStockChartPI')
const addEarningsGrowth = require('../analysisSripts/addEarningsGrowth')
const addFinancialMargins = require('../analysisSripts/addFinancialMargins')
const addSMARSIBBAND = require('../analysisSripts/addSMARSIBBAND') 

//never ran or tested, mostly for documentation
class IexInterface{
    constructor(){

    }
    initialize() {
        iexInitFromSymbols
            .then(() => this.addDetails())
            .then(() => this.addCharts())
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
    
}