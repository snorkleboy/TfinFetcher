
const FileStream = require('fs');
const mongoose = require('mongoose');

let startTime = 0;
let totalI = null;
let errors = [];
let totalErrors = 0;
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
            .then(docs => modify(docs))
            .then(docs => saveDocs(docs,Model))
            .then(saved => progressReport(saved, i, batchSize))
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

function saveDocs(docs, Model) {
    promises = [];
    docs.forEach(doc => promises.push( doc.save()))
    return Promise.all(promises)

    // return Model.create(docs);
}
let lastLog=-1000;
let lastWrite=-1000;
function progressReport(saved, i, batchSize) {
    const writeTofile = Boolean(i - lastWrite > 30 * batchSize)
    const consoleLog = Boolean(i - lastLog > 3 * batchSize)
    if (writeTofile || consoleLog){
        const batchNames = saved.map(doc => doc.symbol);
        const elapsedTime = Date.now() - startTime;
        const numDone = i + 1 - startI;
        const averageTimeMinutes = (elapsedTime / (numDone)) / 60000;
        const estimatedTimeMinutes = parseInt(averageTimeMinutes * (totalI - i));
        const percent = `${parseInt(1000*(numDone) / (totalI - startI))/10}%`;
        if (consoleLog){
            lastLog = i
            console.log({batchNames,percent, estimatedTimeMinutes,'i/totalI':`${i}/${totalI}`,'totalErrors':(totalErrors+errors.length)})
        }
        if (writeTofile) {
            lastWrite = i
            log({time:Date.now(),percent, estimatedTimeMinutes,i,totalI,totalErrors,errors})
            totalErrors += errors.length;
            errors= [];
        }
    }
    
}

function log(toLog) {
    const cache = [];

    const message = JSON.stringify(toLog, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
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