const Stock = require('../models/stock')
const Sector = require('../models/sector');


let sectors;
const defaultSectorName = "other"
function addSectorAverages() {
    console.log("adding sector averages");
    let sectorObjs;
    return Sector.find({})
    .then(allSectors=>{
        sectorObjs = allSectors;
        sectors = allSectors.map(el => el.sector).sort()
    })
    .then(sectors=> Stock.aggregate([projection(), bucket(), finalProjection() ] ))
    .then(aggregates => {
        sectorHash ={};
        sectorObjs.forEach((sector=>sectorHash[sector.sector]=sector))
        aggregates.forEach(aggregate => {
            if (aggregate.sector !== defaultSectorName){
                let sector = sectorHash[aggregate.sector]
                sector.financials[0] = sector.financials[0] || {}
                sector.todaysFinancials = sector.financials[0] || {}
                sector.earnings[0] = sector.earnings[0] || {}
                sector.todaysEarnings = sector.earnings[0] || {}
                sector.performance = sector.performance || {}

                sector.financials[0].grossMargin = aggregate.grossMarginAverage
                sector.financials[0].profitMargin = aggregate.profitMarginAverage
                sector.financials[0].operatingMargin = aggregate.operatingMarginAverage
                sector.financials[0].shareholderRatio = aggregate.shareholderRatioAverage
                sector.financials[0].quickRatio = aggregate.quickRatioAverage
                sector.financials[0].currentRatio = aggregate.currentRatioAverage

                sector.performance.marketcapMax = aggregate.marketcapMax
                sector.performance.marketcap = aggregate.marketcapAverage
                sector.performance.peRatio = aggregate.peRatioAverage ;
                sector.performance.numStocks = aggregate.count
            }
        })        
        return sectorObjs
    })
    .then(sectorsToSave=>{
        return Promise.all(sectorsToSave.map(sector=>sector.save()));
    })
}

const validNumber = {
     "$ne": NaN,
     "$gt": 0,
     "$ne": Infinity
 }

const projection = ()=>({
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
})


 const bucket = ()=>({
     "$bucket": {
         groupBy: "$sector",
         boundaries: sectors,
         default: defaultSectorName,
         output: {
             "marketcapMax":{
                "$max": "$performance.marketcap"
             },
             "marketcapAverage":{
                "$avg": "$performance.marketcap"
             },
             "count": {
                 $sum: 1
             },
             "peRatioNumerator": {
                 "$avg": { "$multiply": [ "$performance.peRatio", "$performance.marketcap" ] }
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
 })
const finalProjection = ()=>({
    "$project": {
        "peRatioAverage":{"$divide": ["$peRatioNumerator", "$marketcapAverage"]},
        "grossMarginAverage": {"$divide": ["$grossMarginNumerator", "$marketcapAverage"]},
        "profitMarginAverage":{"$divide": ["$profitMarginNumerator", "$marketcapAverage"]},
        "operatingMarginAverage":{"$divide": ["$operatingMarginNumerator", "$marketcapAverage"]},
        "shareholderRatioAverage":{"$divide": ["$shareholderEquityNumerator", "$marketcapAverage"]},
        "quickRatioAverage":  {"$divide": ["$quickRatioNumerator", "$marketcapAverage"]},
        "currentRatioAverage": {"$divide": ["$currentRatioNumerator", "$marketcapAverage"]},
        "marketcapMax":  "$marketcapMax",
        "marketcapAverage":"$marketcapAverage",
        "count":"$count",
        "sector": "$_id"
    }
})

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

