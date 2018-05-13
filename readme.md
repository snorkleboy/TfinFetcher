status:
    2.5gb stock data, of which 2.4 is chart data. collections are stock, stockCharts, sectors. stock charts are
    seperated to make stocks searching faser, sectors have sector averages

    /stock/:ticker returns you stock data
    /screen?parameter1=>5&paremeter2=>120sa returns stocks with (parameter1 > 5 and parameter 2 1.2* the sector average parameter 2).

    not too much fenangling needed to be done other than running the scripts
    init would look something like
        iexInitFromSymbols()                        //seconds
            .then(() => fetchFinancials())          //20min(rough)
            .then(() => fetchCharts())              //2-4 hrs
            .then(() => addChartAnalysis())         //30min(rough)
            .then(() => moveChartValuesToStocks())  //10min(rough)
            .then(() => initSectorsFromStocks())    //seconds
            .then(() => addSectorAverages())        //seconds

    
    
todo:


-check values agianst finfiz

-consider going sql

-forgot to get volume from charts into stocks and sectors

-need to get earnings averages and volume averages

-put in earnings change

-mabybe put whole chart day into stock

-sector averages are currently marketcap weighted, maybe need a better weighting system

-industry averages

-chart db validations, validations and db magic in general

-stock weights added to each stock

-add range functionality to screener for something like parameter1=>2&parameter1=<3
        -check if query[key] has multiple values
        - probably turn the where into a {} like with relativeValues


-**before deployment, init scripts need to be refactored and an interface created for them
        - iexInit needs to also init stockCharts
        -charts and financials and earings should be batched together
        - need a good way to retry or prune failed stocks
        - need a good way to ensure values, some seem to come in as NaN

-no update scripts are really written yet, should be much much faster than the intializeation scripts which already should finish in hours. 

-deploy first so I can test and then test away with local db