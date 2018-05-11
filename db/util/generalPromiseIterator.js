
const FileStream = require('fs');

let startTime = 0;
let max = null;
const errors = [];
let name = "promise iterator"
let startI=0;
function iterateStocks(Model, modify, i=0, batch=100, stopAfter=null) {
    name = modify.name || name
    log(["start",modify.name, Date.now()])
    console.log(["start", modify.name, i,batch,stopAfter]);
    return Model.find({}).count()
        .then(count => {
            startI=i;
            startTime = Date.now();
            max = stopAfter || count
            recursiveAddandSave(Model, modify, i, batch)
        })
}

function recursiveAddandSave(Model, modify, i ,batch) {
    if (i < max) {
        Model.find({})
            .skip(i)
            .limit(batch)
            .then(stocks => modify(stocks))
            .then(stocks => saveStocks(stocks))
            .then(saved => progressReport(saved, i))
            .catch(err => {
                console.log(err);
                errors.push([errors, i])
            })
            .then(() => recursiveAddandSave(Model, modify,i + batch, batch));
    } else {
        console.log("DONE",name, `errors:${errors.length}`);
        log([name,errors])
        log(["done",Date.now()])
    }
}

function saveStocks(stocks) {
    promises = [];
    stocks.forEach(stock => promises.push(stock.save()))
    return Promise.all(promises)
}

function progressReport(saved, i) {
    const batchNames = saved.map(stock => stock.symbol);
    const elapsedTime = Date.now() - startTime;
    const numDone = i + 1 - startI;
    const averageTimeMinutes = (elapsedTime / (numDone)) / 60000;
    const estimatedTimeMinutes = parseInt(averageTimeMinutes * (max - i));
    const percent = parseInt((numDone) / (max - startI));

    console.log({batchNames,percent, estimatedTimeMinutes,i,max})
}

function log(toLog) {
    const fd = FileStream.appendFile(__dirname + `${name}.log`, `\n ${JSON.stringify(toLog)}`, function (err) {
        if (err) {
            console.log('err!', err, Date.now);
            throw err;
        }
    });
}


module.exports = iterateStocks;