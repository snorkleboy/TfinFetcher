
const FileStream = require('fs');

let startTime = 0;
let max = null;
const errors = [];
let name = "promise iterator"
function iterateStocks(Model, modify, i=0, batch=100, stopAfter=null) {
    name = modify.name || name
    log(["start",modify.name, Date.now()])
    return Model.find({}).count()
        .then(count => {
            startTime = Date.now();
            max = stopAfter ? stopAfter + i : count
            recursiveAddandSave(Model, modify, i = 0, batch = 0)
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
            .then(() => recursiveAddandSave(i + batch, batch));
    } else {
        console.log("DONE adding earnings change", `errors:${errors.length}`);
        log(errors)
        log(["done",Date.now()])
    }
}

function saveStocks(stocks) {
    promises = [];
    stocks.forEach(stock => promises.push(stock.save()))
    return Promise.all(promises)
}

function progressReport(saved, i) {
    const names = saved.map(stock => stock.symbol);
    const elapsedTime = Date.now() - startTime;
    const averageTime = elapsedTime / (i + 1);
    const estimatedTimeMinutes = parseInt(averageTime / 60000 * (max - i));
    const percent = parseInt(i / max);
    console.log(names, `${percent}%`, `estimated time left:${estimatedTimeMinutes} minutes`)
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