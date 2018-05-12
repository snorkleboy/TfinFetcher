
const FileStream = require('fs');
const mongoose = require('mongoose');

let startTime = 0;
let totalI = null;
let errors = [];
let name = "promise iterator"
let startI=0;
function iterateModel(Model, modify, i=0, batchSize=100, stopAfter=null) {
    return Model.find({}).count()
        .then(count => {
            startI=i;
            totalI = stopAfter || count
            name = modify.name || name

            console.log(["start", {'name':modify.name, startI, batchSize, totalI} ]);
            log(["start", {'name':modify.name, i, batchSize, totalI}, Date.now()])
            startTime = Date.now();
            recursiveAddandSave(Model, modify, i, batchSize)
        })
}

function recursiveAddandSave(Model, modify, i ,batchSize) {
    if (i < totalI) {
        Model.find({})
            .skip(i)
            .limit(batchSize)
            .then(stocks => modify(stocks))
            .then(stocks => saveStocks(stocks,Model))
            .then(saved => progressReport(saved, i))
            .catch(err => {
                console.log(err.message, err.symbol, err.missing);
                errors.push([err, i])
            })
            .then(() => recursiveAddandSave(Model, modify,i + batchSize, batchSize));
    } else {
        console.log("DONE",name, `errors:${errors.length}`);
        log(["done",Date.now(),{name,errors}])
    }
}

function saveStocks(stocks, Model) {
    promises = [];
    stocks.forEach(stock => promises.push( stock.save()))
    return Promise.all(promises)

    // return Model.create(stocks);
}

function progressReport(saved, i) {
    const batchNames = saved.map(stock => stock.symbol);
    const elapsedTime = Date.now() - startTime;
    const numDone = i + 1 - startI;
    const averageTimeMinutes = (elapsedTime / (numDone)) / 60000;
    const estimatedTimeMinutes = parseInt(averageTimeMinutes * (totalI - i));
    const percent = `${parseInt(1000*(numDone) / (totalI - startI))/10}%`;

    console.log({batchNames,percent, estimatedTimeMinutes,i,totalI})
    if (i%200===0){
        log({percent, estimatedTimeMinutes,i,totalI,errors})
        errors= [];
    }
}

function log(toLog) {
    const cache = [];

    const message = JSON.stringify(toLog, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    });
    const fd = FileStream.appendFile(__dirname + `${name}.log`, `\n ${message}`, function (err) {
        if (err) {
            console.log('err!', err, Date.now);
            throw err;
        }
    });
}


module.exports = iterateModel;