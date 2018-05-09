const mongoose = require('mongoose');
const earningsSchema = new mongoose.Schema({
    actualEPS: Number,
    consensusEPS: Number,
    estimatedEPS: Number,
    announceTime: String,
    numberOfEstimates: Number,
    EPSSurpriseDollar: Number,
    EPSReportDate: String,
    fiscalPeriod: String,
    fiscalEndDate: String,
    yearAgo: Number,
    yearAgoChangePercent: Number,
    estimatedChangePercent: Number,
    symbolId: Number
})
const financialSchema = new mongoose.Schema({

})
const performanceSchema = new mongoose.Schema({

})
const analyticsSchema = new mongoose.Schema({

})
const generalSchema = new mongoose.Schema({

})
const stock = new mongoose.Schema({
    symbol: {
        type: String,
        required: 'must include symbol/ticker'
    },
    name: String,
    logo: String,
    earnings: [earningsSchema],
    financials: [financialSchema],
    performance: performanceSchema,
    analytics: analyticsSchema,
    chart:[{}],
    general: generalSchema,
    created_at: {
        type: Date,
        default: Date.now
    }
});
//todo 
//this should validate user inputed query string matches to keys in the stock schema and values to possible values
stock.statics.validateScreenOptions = function(queryHash){
    return queryHash
}
stock.statics.screen = function (queryHash) {
    keys = Object.keys(queryHash);

    const where = {};
    const select = {'symbol':1}
    keys.forEach(key=>{
        const query = convertQueryToMongoose(queryHash[key])
        const param = key
        where[param] = query
        // select[key]=true
    })
    console.log("SCREEN",queryHash,keys,where)
    return this.model('Stock').find(where);
}
//eps: earnings[0].actualEPS

function convertQueryToMongoose(queryString){
    let query = null;
    let value = queryString.slice(1, queryString.length)
    if (queryString[0]=='<'){
        query = {"$lt":value}
    } else if (queryString[0] == '>'){
        query = {"$gt":value}
    } else{
        query = queryString
    }
    return query
} 

stock.index({symbol:1});

const Stock = mongoose.model('Stock', stock);

module.exports = Stock
