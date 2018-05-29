const Stock = require('../stock')
const {
    earningsSchema,
    financialSchema,
    performanceSchema,
    generalSchema,
    analyticsSchema,
} = require('./stockSubDocs');

function mapQueryToSchema(queryHash) {
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

function aggregationScreen(queryhash,limit=20) {
    const pathKeyObj = mapQueryToSchema(queryhash);
    pathKeys = Object.keys(pathKeyObj);
    const where = {};
    const keyToPath = {};
    let hasRelativeValue = false;
    pathKeys.forEach(pathKey => {
        const queryValue = mapQueryValueToMongo(pathKeyObj[pathKey], pathKey)
        if (queryValue.relativeValue) {
            hasRelativeValue=true;
        }
        where[pathKey] = queryValue
        
        let barekey = pathKey.split('.')
        barekey  = barekey[2] || barekey[1]
        keyToPath[barekey] = pathKey
    })
    let pipeline = [];
    pipeline = addUnArrayProjection(pipeline);
    pipeline = addLookup(pipeline, hasRelativeValue);
    pipeline = addProjections(pipeline, where, keyToPath);
    pipeline = addMatches(pipeline, where, keyToPath);
    const screen = JSON.stringify(pipeline)
    console.log({where,screen});
    return this.model('Stock').aggregate(pipeline).limit(20)

}

// the return of mapQueryValueToMongo will eventuall be wrapped in something like
// {schemaKey:{queryvalue}} /==/ {actualEps:{"$lt":12}} or {actualEps:{relativeValue:true, absComp:">",amount:2.3,type:"sa"}}
// 
function mapQueryValueToMongo(queryString, key) {
    let queryValue = null;
    let value = getValue(queryString, key)
    if (queryString[0] == '<' && !value.relativeValue) {
        queryValue = {
            "$lt": value
        }
    } else if (queryString[0] == '>' && !value.relativeValue) {
        queryValue = {
            "$gt": value
        }
    } else {
        queryValue = value
    }
    return queryValue
}

function getValue(queryString, key) {
    let value;
    const components = queryString.split(/([0-9\.]+)/)
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
    const type = components[2]
    return {
        "relativeValue":true,
        absComp,
        amount,
        type
    }
}



//Pipeline
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
            "symbol":1
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
    project["sector"] = "$general.sector";
    project["symbol"]="$symbol";

    const bareKeys = Object.keys(bareKeyToPath);
    bareKeys.forEach(bareKey => {
        let path = bareKeyToPath[bareKey];
        project[bareKey] = '$'+path;
        
        const thisWhere = where[bareKeyToPath[bareKey]]
        if (thisWhere.relativeValue) {
            const originalPath = path;
            path = path.split('.');
            if (path[0] === 'financials' || path[0] === 'earnings') {
                path[0] = 'todays' + capitalize(path[0]);
            }
            path = path.join('.');
            console.log({path})
            project["sector" + bareKey + "Avg"] = "$sectorAvg." + path;
            project["multipliedValue"]={"$multiply": ['$'+"sectorAvg." + path, thisWhere.amount/100]}
            project[bareKey + "comparison"] = {
                "$cmp": ["$"+originalPath,{"$multiply": ['$'+"sectorAvg." + path, thisWhere.amount/100]}]
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
                '$gte'
            :
                '$lte'
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
[{
    "$project": {
        "financials": {
            "$arrayElemAt": ["$financials", 0]
        },
        "earnings": {
            "$arrayElemAt": ["$earnings", 0]
        },
        "performance": 1,
        "general": 1,
        "symbol": 1
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
        "sector": "$general.sector",
        "symbol": "$symbol",
        "grossMargin": "$financials.grossMargin",
        "sectorgrossMarginAvg": "$sectorAvg.todaysFinancials.grossMargin",
        "multipliedValue": {
            "$multiply": ["$sectorAvg.todaysFinancials.grossMargin", 5]
        },
        "grossMargincomparison": {
            "$cmp": ["$financials.grossMargin", {
                "$multiply": ["$sectorAvg.todaysFinancials.grossMargin", 5]
            }]
        }
    }
}, {
    "$match": {
        "grossMargincomparison": {
            "$lte": 0
        }
    }
}]