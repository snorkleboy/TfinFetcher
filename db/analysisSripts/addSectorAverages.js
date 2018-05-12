const Stock = require('../models/stock')
const Sector = require('../models/sector');


let sectors;
const defaultSectorName = "other"
function addSectorAverages() {
    let sectorObjs;
    Sector.find({})
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
                sector = sectorHash[aggregate.sector]
                sector.financials[0] = sector.financials[0] || {}
                sector.performance = sector.performance || {}

                sector.financials[0].grossMargin = aggregate.grossMarginAverage
                sector.financials[0].profitMargin = aggregate.profitMarginAverage
                sector.financials[0].operatingMargin = aggregate.operatingMarginAverage
                sector.financials[0].shareholderRatio = aggregate.shareholderRatioAverage
                sector.financials[0].quickRatio = aggregate.quickRatioAverage
                sector.financials[0].currentRatio = aggregate.currentRatioAverage
                sector.performance.marketCapMax = aggregate.marketCapMax
                sector.performance.marketCap = aggregate.marketCapAverage
                sector.performance.numStocks = aggregate.count
            }
        })        
        return sectorObjs
    })
    .then(sectorsToSave=>{
        return Promise.all(sectorsToSave.map(sector=>sector.save()));
    })
    .then(saved=>console.log(saved));
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
             "marketCapMax":{
                "$max": "$performance.marketcap"
             },
             "marketCapAverage":{
                "$avg": "$performance.marketcap"
             },
             "count": {
                 $sum: 1
             },
             "pricePerEarningNumerator": {
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

