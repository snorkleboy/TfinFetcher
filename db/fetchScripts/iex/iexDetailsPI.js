const axios = require('axios');
const Stock = require('../../models/stock')
const FileStream = require('fs');

const promiseIterator = require('../../util/generalPromiseIterator')
const unprocessed = [];


function iexDetails(startI = 0, batchSize = 25, stopAt = null) {
    console.log("started fetching details");
    return promiseIterator(
            Stock,
            fetchStockDetails,
            startI,
            batchSize,
            stopAt
        )
        // .then(() => log(unprocessed))
}

function fetchStockDetails(stocks){
    return FetchDetails(stocks.map(stock=>stock.symbol))
        .then((res)=>{
            if (res.status == 200){
                return processStocks(stocks,res)
            }else{
                throw (["Fetch Failed",stocks,res])
            }
        })
}
function processStocks(stocks,res){
    stocks.forEach(stock => {
        try {
            const slice = res.data[stock.symbol]
            try {
                stock.set({
                    earnings: slice.earnings.earnings,
                })
            } catch (error) {
                unprocessed.push([stock.symbol, "earnings not loaded"]);
            }
            try {
                stock.set({
                    financials: slice.financials.financials,
                })
            } catch (error) {
                unprocessed.push([stock.symbol, "financials not loaded"]);
            }
            try {
                stock.set({
                    performance: slice.stats,
                })
            } catch (error) {
                unprocessed.push([stock.symbol, "performance not loaded"]);
            }
            try {
                stock.set({
                    general: slice.company
                })
            } catch (error) {
                unprocessed.push([stock.symbol, "general not loaded"]);
            }
        } catch (error) {
            console.log(stock, error);
            unprocessed.push([stock.symbol, error]);
        }

    })
    return stocks;
}
const FetchDetails = (stocks) => axios({
    url: `https://api.iextrading.com/1.0/stock/market/batch?symbols=${stocks.join(',')}&types=logo,earnings,financials,stats,company`,
    method: "GET"
})
function log(toLog) {
    const fd = FileStream.appendFile(__dirname + 'iexDetailsFetch.log', `\n ${JSON.stringify(toLog)}`, function (err) {
        if (err) {
            console.log('err!', err, Date.now);
            throw err;
        }
    });
}

module.exports = iexDetails;
/*
//https://api.iextrading.com/1.0/stock/aapl/batch?types=logo,earnings,financials,stats,company
//https://api.iextrading.com/1.0/stock/market/batch?symbols=aapl,fb&types=logo,earnings,financials,stats,company
batch
multi symbol batch

https://api.iextrading.com/1.0/stock/aapl/logo
image url

// https://api.iextrading.com/1.0/stock/aapl/earnings
actualEPS	number
consensusEPS	number
estimatedEPS	number
announceTime	string
numberOfEstimates	number
EPSSurpriseDollar	number
EPSReportDate	string
fiscalPeriod	string
fiscalEndDate   string
// https://api.iextrading.com/1.0/stock/aapl/financials

reportDate	string
grossProfit	number
costOfRevenue	number
operatingRevenue	number
totalRevenue	number
operatingIncome	number
netIncome	number
researchAndDevelopment	number
operatingExpense	number
currentAssets	number
totalAssets	number
totalLiabilities	number
currentCash	number
currentDebt	number
totalCash	number
totalDebt	number
shareholderEquity	number
cashChange	number
cashFlow	number
operatingGainsLosses	string

// https://api.iextrading.com/1.0/stock/aapl/stats

Key	Type	Description
companyName	string
marketcap	number	is not calculated in real time.
beta	number
week52high	number
week52low	number
week52change	number
shortInterest	number
shortDate	string
dividendRate	number
dividendYield	number
exDividendDate	string
latestEPS	number	(Most recent quarter)
latestEPSDate	string
sharesOutstanding	number
float	number
returnOnEquity	number	(Trailing twelve months)
consensusEPS	number	(Most recent quarter)
numberOfEstimates	number	(Most recent quarter)
symbol	string
EBITDA	number	(Trailing twelve months)
revenue	number	(Trailing twelve months)
grossProfit	number	(Trailing twelve months)
cash	number	reers to total cash. (Trailing twelve months)
debt	number	refers to total debt. (Trailing twelve months)
ttmEPS	number	(Trailing twelve months)
revenuePerShare	number	(Trailing twelve months)
revenuePerEmployee	number	(Trailing twelve months)
peRatioHigh	number
peRatioLow	number
EPSSurpriseDollar	number	refers to the difference between actual EPS and consensus EPS in dollars.
EPSSurprisePercent	number	refers to the percent difference between actual EPS and consensus EPS.
returnOnAssets	number	(Trailing twelve months)
returnOnCapital	number	(Trailing twelve months)
profitMargin	number
priceToSales	number
priceToBook	number
day200MovingAvg	number
day50MovingAvg	number
institutionPercent	number	represents top 15 institutions
insiderPercent	number
shortRatio	number
year5ChangePercent	number
year2ChangePercent	number
year1ChangePercent	number
ytdChangePercent	number
month6ChangePercent	number
month3ChangePercent	number
month1ChangePercent	number
day5ChangePercent	number

//https://api.iextrading.com/1.0/stock/aapl/company
symbol	string
companyName	string
exchange	string
industry	string
website	string
description	string
CEO	string
issueType	string	refers to the common issue type of the stock.
ad – American Depository Receipt (ADR’s)
re – Real Estate Investment Trust (REIT’s)
ce – Closed end fund (Stock and Bond Fund)
si – Secondary Issue
lp – Limited Partnerships
cs – Common Stock
et – Exchange Traded Fund (ETF)
(blank) = Not Available, i.e., Warrant, Note, or (non-filing) Closed Ended Funds
sector	string

*/

