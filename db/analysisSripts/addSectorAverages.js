const Stock = require('../models/stock')




function addSectorAverages() {
    Stock.aggregate([
            projection,
            bucket,
            finalProjection
        ])
        .then(buckets => console.log(buckets))
}

const validNumber = {
     "$ne": NaN,
     "$gt": 0,
     "$ne": Infinity
 }
 const sectors = [
     "Consumer Cyclical",
     "Basic Materials",
     "Healthcare",
     "Financial Services",
     "Utilities",
     "Energy",
     "Industrials",
     "Technology",
     "Real Estate",
     "Consumer Defensive",
     "Communication Services",
 ].sort()

const projection = {
    "$project": {
        "financials": {
            "$arrayElemAt": ["$financials", 0]
        },
        'earnings': {
            "$arrayElemAt": ["$earnings", 0]
        },
        'performance': 1,
        "sector": "$general.sector"
    },
}


 const bucket = {
     "$bucket": {
         groupBy: "$sector",
         boundaries: sectors,
         default: "other",
         output: {
             "marketCapMax":{
                "$max": "$performance.marketcap"
             },
             "marketCapAverage":{
                "$avg": "$performance.marketcap"
             },
             "count": {
                 $sum: 1
             },
             "grossMarginNumerator": {
                 "$avg": { "$multiply": [ "$financials.grossMargin", "$performance.marketcap" ] }
             },
             "profitMarginNumerator": {
                 "$avg": { "$multiply": [ "$financials.profitMargin", "$performance.marketcap" ] } 
             },
             "operatingMarginNumerator": {
                 "$avg": { "$multiply": ["$financials.operatingMargin", "$performance.marketcap"] }
             },
             "currentRatioNumerator": {
                 "$avg": { "$multiply": [ "$financials.currentRatio", "$performance.marketcap" ] } 
             },
             "quickRatioNumerator": {
                 "$avg": { "$multiply": ["$financials.quickRatio", "$performance.marketcap"]  }
             },
             "shareholderEquityNumerator": {
                 "$avg": { "$multiply": [ "$financials.shareholderEquity", "$performance.marketcap" ] } 
             }

         }
     }
 }
const finalProjection = {
    "$project": {
        "grossMarginAverage": {"$divide": ["$grossMarginNumerator", "$marketCapAverage"]},
        "profitMarginAverage":{"$divide": ["$profitMarginNumerator", "$marketCapAverage"]},
        "operatingMarginAverage":{"$divide": ["$operatingMarginNumerator", "$marketCapAverage"]},
        "shareholderRatioAverage":{"$divide": ["$shareholderEquityNumerator", "$marketCapAverage"]},
        "quickRatioAverage":  {"$divide": ["$quickRatioNumerator", "$marketCapAverage"]},
        "currentRatioAverage": {"$divide": ["$currentRatioNumerator", "$marketCapAverage"]},
        "marketCapMax":  "$marketCapMax",
        "marketCapAverage":"$marketCapAverage",
        "count":"$count",
        "sector": "$_id"
    }
}

module.exports = addSectorAverages



// const match = {
//     "$match": {
//         "financials.grossMargin": validNumber,
//         "financials.profitMargin": validNumber,
//         "financials.operatingMargin": validNumber,
//         "financials.currentRatio": validNumber,
//         "financials.shareholderEquity": validNumber,
//         "earnings.actualEPS": validNumber,
//         "performance.week52change": validNumber,
//         "performance.consensusEPS": validNumber,
//         "performance.revenuePerShare": validNumber,
//         "performance.shortRatio": validNumber,
//         "performance.year5ChangePercent": validNumber,
//         "performance.year2ChangePercent": validNumber,
//         "performance.year1ChangePercent": validNumber,
//         "performance.ytdChangePercent": validNumber,
//         "performance.month6ChangePercent": validNumber,
//         "performance.month3ChangePercent": validNumber,
//         "performance.month1ChangePercent": validNumber,
//         "performance.day5ChangePercent.": validNumber,
//         "performance.day30ChangePercent": validNumber,
//     }
// }
//first way of doing it
// const group = {
//     "$group":{
//         "_id":"_id",
//         "grossMarginAverage": {"$avg": "$report.grossMargin"},
//         "profitMarginAvg": {"$avg": "$report.profitMargin" },
//         "operatingMarginAvg": {"$avg": "$report.operatingMargin" },
//         "grossMarginAvg": {"$avg": "$report.currentRatio" },
//         "currentRatioAvg": {"$avg": "$report.shareholderEquity"}
//     }
// }
