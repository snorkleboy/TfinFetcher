        init = [           iexInitFromSymbols,
            addCharts,
            addDetails,
            addFinancialMargins,
            addSMARSIBBAND,
            moveLatestvaluesFromChartsToStocks,
            initSectorsFromStocks,
            addSectorAverages,
        ];


//to do

        update = [
                addCharts.bind(null,days since update),
                addSMARSIBBAND.bind(null,days since update),
                moveLatestvaluesFromChartsToStocks.bind(null,days since update),
                addDetails.bind(null,days since update),
                addSectorAverages.bind(null,days since update, (added Financials or Earnigns reports));
        ]
