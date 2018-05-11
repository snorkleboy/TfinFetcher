
const FileStream = require('fs');
const mongoose = require('mongoose');

let startTime = 0;
let totalI = null;
const errors = [];
let name = "promise iterator"
let startI=0;
function iterateStocks(Model, modify, i=0, batch=100, stopAfter=null) {
    return Model.find({}).count()
        .then(count => {
            startI=i;
            totalI = stopAfter || count
            name = modify.name || name

            console.log(["start", ]);
            log(["start", {name:modify.name, i, batch, totalI}, Date.now()])
            startTime = Date.now();
            recursiveAddandSave(Model, modify, i, batch)
        })
}

function recursiveAddandSave(Model, modify, i ,batch) {
    if (i < totalI) {
        Model.find({})
            .skip(i)
            .limit(batch)
            .then(stocks => modify(stocks))
            .then(stocks => saveStocks(stocks,Model))
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

function saveStocks(stocks, Model) {
    // promises = [];
    // stocks.forEach(stock => promises.push( stock.save( (err,saved)=>console.log(err,saved)) ) )
    // return Promise.all(promises)

    return Model.create(stocks);
}

function progressReport(saved, i) {
    const batchNames = saved.map(stock => stock.symbol);
    const elapsedTime = Date.now() - startTime;
    const numDone = i + 1 - startI;
    const averageTimeMinutes = (elapsedTime / (numDone)) / 60000;
    const estimatedTimeMinutes = parseInt(averageTimeMinutes * (totalI - i));
    const percent = `${parseInt(1000*(numDone) / (totalI - startI))/10}%`;

    console.log({batchNames,percent, estimatedTimeMinutes,i,totalI})
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