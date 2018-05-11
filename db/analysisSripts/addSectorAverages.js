const Stock = require('../db/models/stock')




function addSectorAverages() {
    Stock.aggregate([
            ...projection,
            bucket
        ])
        .then(buckets => console.log(buckets))
}

const validNumber = {
     "$ne": NaN,
     "$gt": 0,
     "$ne": Infinity
 }
 sectors = [
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
// actualEPS
// estimatedEPS
const projection = [
    {
        "$project": {
            "financials": {"$arrayElemAt": ["$financials", 0]}, 
            'earnings': {"$arrayElemAt": ["$earnings", 0]},
            'performance':1,
            "sector": "$general.sector"
        },
    },
    {
        "$match": {
            "financials.grossMargin": validNumber,
            "financials.profitMargin": validNumber,
            "financials.operatingMargin": validNumber,
            "financials.currentRatio": validNumber,
            "financials.shareholderEquity": validNumber,
            "earnings.actualEPS": validNumber,
            "performance.week52change": validNumber,
            "performance.consensusEPS": validNumber,
            "performance.revenuePerShare": validNumber,
            "performance.shortRatio": validNumber,
            "performance.year5ChangePercent": validNumber,
            "performance.year2ChangePercent": validNumber,
            "performance.year1ChangePercent": validNumber,
            "performance.ytdChangePercent": validNumber,
            "performance.month6ChangePercent": validNumber,
            "performance.month3ChangePercent": validNumber,
            "performance.month1ChangePercent": validNumber,
            "performance.day5ChangePercent.": validNumber,
            "performance.day30ChangePercent": validNumber,
        }
    }
]


 const bucket = {
     "$bucket": {
         groupBy: "$sector",
         boundaries: sectors,
         default: "other",
         output: {
             "count": {
                 $sum: 1
             },
             "grossMarginAverage": {
                 "$avg": "$report.grossMargin"
             },
             "profitMarginAvg": {
                 "$avg": "$report.profitMargin"

             },
             "operatingMarginAvg": {
                 "$avg": "$report.operatingMargin"

             },
             "grossMarginAvg": {
                 "$avg": "$report.currentRatio"

             },
             "currentRatioAvg": {
                 "$avg": "$report.shareholderEquity"

             }

         }
     }
 }


module.exports = addSectorAverages()




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
