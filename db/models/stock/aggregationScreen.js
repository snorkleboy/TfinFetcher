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
            schemaKey = `earnings.${queryKey}`
        } else if (deepIncludes(queryKey, financialSchema.obj)) {
            schemaKey = `financials.${queryKey}`
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
    const bareKeys = {
    }
    let hasRelativeValue = false;
    schemaKeys.forEach(key => {
        const query = mapQueryValueToMongoose(schemaKeyObj[key], key)
        if (query.relativeValue){
            hasRelativeValue=true;
        }
        where[key] = query
        
        let barekey = key.split('.')
        barekey  = barekey[2] || barekey[1]
        bareKeys[barekey] = key
    })
    
    let pipeline = [];
    pipeline = addUnArrayProjection(pipeline);
    pipeline = addLookup(pipeline, hasRelativeValue);
    pipeline = addProjections(pipeline, where, bareKeys);
    pipeline = addMatches(pipeline, where, bareKeys);
    
    console.log(`db.stocks.aggregate(${JSON.stringify(pipeline)})`);
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
    const components = queryString.split(/([0-9\.]+)/)
        // console.log({components, key})
    console.log({components},key)
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
    let absComp = '=';

    if (components[0].length>0 ){
        absComp = components[0]
    };

    const amount = parseFloat(components[1])
    return {
        "relativeValue":true,
        absComp,
        amount
    }
}
function addUnArrayProjection(pipeline, where, bareKeyToPath) {
    return [{
        "$project": {
            "financials": {
                "$arrayElemAt": ["$financials", 0]
            },
            'earnings': {
                "$arrayElemAt": ["$earnings", 0]
            },
            'performance': 1,
            "general": 1,
        },
    }]
}
const addLookup = (pipeline,hasRelativeValue) => {
    return hasRelativeValue? 
        [
            ...pipeline,
            {
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
    :
        pipeline
    ;
}
const addProjections = (pipeline, where, bareKeyToPath) => {
    const project = {}
    const returnObj = {"$project": project};
    // console.log({
    //     pipeline,
    //     where,
    //     bareKeyToPath
    // })
    
    const bareKeys = Object.keys(bareKeyToPath);
    bareKeys.forEach(bareKey => {
        let path = bareKeyToPath[bareKey];
        project[bareKey] = '$'+path;
        const thisWhere = where[bareKeyToPath[bareKey]]
        if (thisWhere.relativeValue) {
            path = path.split('.');
            if (path[0] === 'financials' || path[0] === 'earnings') {
                path[0] = capitalize(path[0]);
                path = 'todays' + path.join('.');
            }
            project["sector" + bareKey + "Avg"] = "$sectorAvg." + path;
            project[bareKey + "comparison"] = {
                "$cmp": [{"$multiply": ['$'+path, thisWhere.amount/100]}, "$sectorAvg." + path]
            }
        }
    })
    return [...pipeline,returnObj]
}
function capitalize(word) {
        return word[0].toUpperCase() + word.substr(1);
    }
const addMatches = (pipeline, where, bareKeyToPath) => {
    const match = {};
    const returnObj = {"$match":match}
    const bareKeys = Object.keys(bareKeyToPath);

    bareKeys.forEach(bareKey=>{
        const thisWhere = where[bareKeyToPath[bareKey]]
        if (thisWhere.relativeValue){
            const comp = thisWhere.absComp === '>' ?
                '$gt'
            :
                '$lt'
            ;
            const compObj = {};
            compObj[comp] = 0;
            match[bareKey + "comparison"] = compObj
        }else{
            match[bareKey] = thisWhere;
        }
    })
    return [...pipeline, returnObj]
}

module.exports = aggregationScreen;
/*
[{
    "$project": {
        "financials": {
            "$arrayElemAt": ["$financials", 0]
        },
        "earnings": {
            "$arrayElemAt": ["$earnings", 0]
        },
        "performance": 1,
        "general": 1
    }
}, {
    "$lookup": {
        "from": "sectors",
        "localField": "general.sector",
        "foreignField": "sector",
        "as": "sectorAvg"
    }
}, {
    "$unwind": "$sectorAvg"
}, {
    "$project": {
        "grossMargin": "$financials.grossMargin",
        "profitMargin": "$financials.profitMargin",
        "sectorprofitMarginAvg": "$sectorAvg.todaysFinancials.profitMargin",
        "profitMargincomparison": {
            "$cmp": [{
                "$multiply": ["$todaysFinancials.profitMargin", 1.3]
            }, "$sectorAvg.todaysFinancials.profitMargin"]
        },
        "peRatio": "$performance.peRatio"
    }
}]
*/
