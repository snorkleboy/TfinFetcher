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
        if (Object.keys(earningsSchema.obj).includes(queryKey)) {
            schemaKey = `earnings.0.${queryKey}`
        } else if (Object.keys(financialSchema.obj).includes(queryKey)) {
            schemaKey = `financials.0.${queryKey}`
        } else if (Object.keys(performanceSchema.obj).includes(queryKey)) {
            schemaKey = `performance.${queryKey}`
        } else if (Object.keys(generalSchema.obj).includes(queryKey)) {
            schemaKey = `analytics.${queryKey}`
        } else if (Object.keys(analyticsSchema.obj).includes(queryKey)) {
            schemaKey = `general.${queryKey}`
        } else {
            throw `validation error: ${queryKey} not accepted key`
        }
        schemaQueryObj[schemaKey] = queryHash[queryKey]
    })
    return schemaQueryObj
}


function screen(schemaQueryObj, limit = 30) {
    schemaKeys = Object.keys(schemaQueryObj);
    const where = {};
    const select = {
        'symbol': 1,
        "name": 1
    }
    schemaKeys.forEach(key => {
        const query = mapQueryValueToMongoose(schemaQueryObj[key])
        where[key] = query
        select[key.split('.0').join('')] = true
    })
    console.log("SCREEN", schemaQueryObj, where, select)
    return this.model('Stock')
        .find(where)
        .select(select)
        .limit(limit)
        .exec();
}


function mapQueryValueToMongoose(queryString) {
    let query = null;
    let value = parseFloat(queryString.slice(1, queryString.length))
    if (queryString[0] == '<') {
        query = {
            "$lt": value
        }
    } else if (queryString[0] == '>') {
        query = {
            "$gt": value
        }
    } else {
        query = queryString
    }
    return query
}
function listKeys(){
    return {
        'earnings': Object.keys(earningsSchema.obj),
        'financial': Object.keys(financialSchema.obj),
        'performance': Object.keys(performanceSchema.obj),
        'general': Object.keys(generalSchema.obj),
        'analytics': Object.keys(analyticsSchema.obj)
    }
}
module.exports = {
    mapScreenOptions,
    screen,
    listKeys
}