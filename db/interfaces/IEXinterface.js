
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


_options = {

}
_updateOptions={

}
module.exports = class IexInterface{
    constructor(options){
        this.options = Object.assign({},_options, options);
        this.updateTime=12+5;
    }
    init(InitOptions = {}) {
        const options = Object.assign({}, this.options, InitOptions);
        const steps = options.steps ||[
            iexInitFromSymbols,
            addCharts.bind(null,{}),
            addDetails,
            addFinancialMargins,
            addSMARSIBBAND.bind(null,{}),
            moveLatestvaluesFromChartsToStocks,
            initSectorsFromStocks,
            addSectorAverages,
        ];
        let funIndex = false;
        if (options.startFunction){
            funIndex = findFunctionByName(steps,options.startFunction);
        }
        
        function doSteps(i=options.startI || funIndex || 0){
            console.log(steps, i, steps[i], steps[i].name)
            return doFunctionThenclean(steps[i], "starting="+steps[i].name)
            .then(() => {
                    
                if (i < steps.length) {
                    return doSteps(i + 1)
                }
            })
           
        }
        const doFunctionThenclean = (fun, message) => {
            console.log({message})
            return fun()
                .then(() => {
                    forceGC();
                    console.log("finished",{message})
                })
        }
        
        return doSteps().then(()=>{console.log("init done");return "init done"});
    }
    update(daysSince,options={}){
        const theseOptions = Object.assign({},this.options,_updateOptions,options); 
        const steps = options.steps ||[
            addCharts.bind(null,{range:daysSince+"d"}),
            addDetails,
            addFinancialMargins,
            addSMARSIBBAND.bind(null,{range:daysSince}),
            moveLatestvaluesFromChartsToStocks,
            addSectorAverages,
        ];
        
        let i = options.startI || 0;
        function doSteps(){
            console.log(steps, i, steps[i], steps[i].name)
            doFunctionThenclean(steps[i], steps[i].name)
            .then(() => {
                    i = i + 1;
                if (i < steps.length) {
                    return doSteps()
                }
            })
        }
        const doFunctionThenclean = (fun, message) => {
            console.log("start",{message})
            return fun()
                .then(() => {
                    forceGC();
                    console.log("finished",{message})
                })
        }
        
        return doSteps().then(()=>{console.log("update done",daysSince,Date.now());"update done "+ daysSince + "   " + Date.now()});

    }
    
}
function findFunctionByName(functions, func){
    for(let i =0;i<functions.length; i++){
        if (functions[i].name === func.name){
            return i
        }
    }
    return false;
}
function forceGC(){
    if (global.gc) {
        console.log("garbage collecting");
        global.gc();
    } else {
        console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
    }
}