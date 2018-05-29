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
        } else if (deepIncludes(queryKey, financialSchema.obj)){
            schemaKey = `financials.0.${queryKey}`
        } else if (deepIncludes(queryKey, performanceSchema.obj)){
            schemaKey = `performance.${queryKey}`
        } else if (deepIncludes(queryKey, generalSchema.obj)){
            schemaKey = `analytics.${queryKey}`
        } else if (deepIncludes(queryKey, analyticsSchema.obj)){
            schemaKey = `general.${queryKey}`
        } else {
            throw `validation error: ${queryKey} not accepted key`
        }
        schemaQueryObj[schemaKey] = queryHash[queryKey]
    })
    return schemaQueryObj
}
function deepIncludes(dottedKey, schema){
    const keys = dottedKey.split('.');
    let prop = schema[keys.shift()];
    for(let i =0;i<keys.length;i++){
        const key = keys[i]
        if (prop){
            prop = prop[key]
        } else{
            break;
        }
    }

    return Boolean(prop);
}

function screen(schemaQueryObj, limit = 30) {
    schemaKeys = Object.keys(schemaQueryObj);
    const where = {};
    const select = {
        'symbol': 1,
        "name": 1
    }
    schemaKeys.forEach(key => {
        const query = mapQueryValueToMongoose(schemaQueryObj[key], key)
        where[key] = query
        select[key.split('.0').join('')] = true
    })
    console.log({"action":"SCREEN", where, select})
    return this.model('Stock')
        .find(where)
        .select(select)
        .limit(limit)
        .exec();
}

function mapQueryValueToMongoose(queryString,key) {
    let query = null;
    let value = getValue(queryString, key)
    if (queryString[0] == '<') {
        query = {
            "$lt": value
        }
    } else if (queryString[0] == '>') {
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
    console.log(components);
    //relative query
    if (components[2] && components[2].length>0) {
        value = getRelativeValue(components[2], key)
    //absolute query
    } else if (components[1] && components[1].length > 0 ){
        value = parseFloat(components[1])
    }
    return value;
}
function getRelativeValue(queryValue, key) {
    console.log({
        'location': "get rel val",
        queryValue,
        key,
        sectors:sectorCache.sectors
    })

    //hope is to do something like 
    // {"performance.sma.20":{"lt":sectorCache.sectors[this.general.sector]}}

    return 666
}
function listKeys(){
    console.log("here", keyList(earningsSchema.obj), [...keyList(earningsSchema.obj), ...keyList(financialSchema.obj)])
    return {
       "validKeys":{ 
            'earnings': keyList(earningsSchema.obj),
            'financial': keyList(financialSchema.obj),
            'performance': keyList(performanceSchema.obj),
            'general': keyList(generalSchema.obj),
            'analytics': keyList(analyticsSchema.obj)
        },
        "validComparisons":{
            'key=<a': "key is less than a",
            'key=>a': "key is more than a",
            'key=a': "key is equal to a"
        },
        "format":{
            "/screen?key1=>a&key2=<b" :"screen for stocks where key1 is more than a and key2 is less than b"
        }
        
    }
}
function keyList(schema){
    listSchema = Object.keys(schema)
    for(let i=0;i<listSchema.length;i++){
        const key = listSchema[i]
        const toExpand = Boolean(typeof schema[key] === 'object' && !schema[key].set)

        if (toExpand){
            schmObj = {};
            schmObj[key] = Object.keys(schema[key])
            listSchema[i] = schmObj
        }

    }
    return listSchema
}
module.exports = {
    mapScreenOptions,
    screen,
    listKeys
}
