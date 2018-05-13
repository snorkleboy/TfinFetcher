const Stock = require('../stock')
const {
    earningsSchema,
    financialSchema,
    performanceSchema,
    generalSchema,
    analyticsSchema,
} = require('./stockSubDocs');




function mapScreenOptions(queryHash) {
    const schemaQueryObj = {};
    Object.keys(queryHash).forEach(queryKey => {

        let schemaKey = null;
        if (deepIncludes(queryKey, earningsSchema.obj)) {
            schemaKey = `earnings.0.${queryKey}`
        } else if (deepIncludes(queryKey, financialSchema.obj)) {
            schemaKey = `financials.0.${queryKey}`
        } else if (deepIncludes(queryKey, performanceSchema.obj)) {
            schemaKey = `performance.${queryKey}`
        } else if (deepIncludes(queryKey, generalSchema.obj)) {
            schemaKey = `analytics.${queryKey}`
        } else if (deepIncludes(queryKey, analyticsSchema.obj)) {
            schemaKey = `general.${queryKey}`
        } else {
            throw `validation error: ${queryKey} not accepted key`
        }
        schemaQueryObj[schemaKey] = queryHash[queryKey]
    })
    return schemaQueryObj
}

function deepIncludes(dottedKey, schema) {
    const keys = dottedKey.split('.');
    let prop = schema[keys.shift()];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (prop) {
            prop = prop[key]
        } else {
            break;
        }
    }

    return Boolean(prop);
}




function aggregationScreen(queryhash) {
    const schemaKeyObj = mapScreenOptions(queryhash);
    schemaKeys = Object.keys(schemaKeyObj);
    const where = {};
    const select = {
        'symbol': 1,
        "name": 1
    }
    const hasRelativeValue = false;
    schemaKeys.forEach(key => {
        const query = mapQueryValueToMongoose(schemaKeyObj[key], key)
        if (Object.values(query)[0].relativeValue){
            hasRelativeValue=true;
        }
        where[key] = query
        
        let barekey = key.split('.')
        barekey  = barekey[2] || barekey[1]
        select[barekey] = true
    })
    console.log(Object.values(query)[0] ,{
        hasRelativeValue,
        schemaKeyObj,
        where,
        select
    })
    const pipeline = [
        ...lookup(),
        ...ComparisonProjection(),
        ...match()
    ]
            
    return Stock.aggregate(pipeline)
    .limit(2)
    .then(stocks=>console.log(stocks))

}

function mapQueryValueToMongoose(queryString, key) {
    let query = null;
    let value = getValue(queryString, key)
    if (queryString[0] == '<' && !value.relativeValue) {
        query = {
            "$lt": value
        }
    } else if (queryString[0] == '>' && !value.relativeValue) {
        query = {
            "$gt": value
        }
    } else {
        query = value
    }
    return query
}

//queryString Types
// peRatio=<10bsa
// peRatio=<20
// peRatio=20
function getValue(queryString, key) {
    let value;
    const components = queryString.split(/([0-9]+)/)
    //relative query
    if (components[2] && components[2].length > 0) {
        value = makeRelativeRequestObj(components, key)
        //absolute query
    } else if (components[1] && components[1].length > 0) {
        value = parseFloat(components[1])
    }
    return value;
}

function makeRelativeRequestObj(components, key) {
    console.log({components, key})
    let absComp = '=';
    let relComp = null;
    if (components[2][0] === 'a'){
        relComp = '>'
    } else if (components[2][0] === 'b'){
        relComp = '<'
    }
    if (components[0].length>0 ){
        absComp = components[0]
    };

    const amount = components[1]
    return {
        "relativeValue":true,
        absComp,
        relComp,
        amount
    }
}
const lookup = () => [{
        "$lookup": {
            from: "sectors",
            localField: "general.sector",
            foreignField: "sector",
            as: "sectorAvg"
        }
    },
    {
        "$unwind": "$sectorAvg"
    }
]
const ComparisonProjection = () => [{
    "$project": {
        "marketcap": "$performance.marketcap",
        "sectorAvg": "$sectorAvg.performance.marketCap",
        "cmp": {
            "$cmp": [{"$multiply":["$performance.marketcap",1]}, "$sectorAvg.performance.marketCap"]
        }
    }
}]
const match = () => [{
    "$match": {
        "cmp": {
            "$gt": 0
        }
    }
}]

module.exports = aggregationScreen;
/*
db.stocks.aggregate([
    {
        "$lookup":{
            from:"sectors",
            localField:"general.sector",
            foreignField:"sector",
            as:"sectorAvg"
        }
    },
    {
        "$unwind":"$sectorAvg"
    },
    {
        "$project":{
            "marketcap": "$performance.marketcap",
            "sectorAvg":"$sectorAvg.performance.marketCap",
            "cmp":{"$cmp":["$performance.marketcap","$sectorAvg.performance.marketCap"]}
        }
    },
    {
        "$match": {
            "cmp": {
                "$gt": 0
            }
        }
    }
])

*/