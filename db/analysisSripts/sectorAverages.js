
const validNumber = {"$ne":NaN, "$gt":0, "$ne":Infinity}
db.stocks.aggregate([
    {
        "$project": {
            "report": {
                "$arrayElemAt": ["$financials", 0]
            }
        },
    },
    {
        "$match": {
            "report.grossMargin": validNumber,
            "report.profitMargin":validNumber,
            "report.operatingMargin":validNumber,
            "report.currentRatio":validNumber,
            "report.shareholderEquity":validNumber,
        }
    },
    {
        "$group": {
            "_id": "margin",
            "grossMarginAverage": {
                "$avg": "$report.grossMargin"
            },
            "profitMarginAvg":{
                "$avg": "$report.profitMargin"

            },
            "operatingMarginAvg":{
                "$avg": "$report.operatingMargin"

            },
            "grossMarginAvg":{
                "$avg": "$report.currentRatio"

            },
            "currentRatioAvg":{
                "$avg": "$report.shareholderEquity"

            }
        }
    }]
)
profitMargin
operatingMargin
grossMargin
currentRatio
shareholderEquity