(function(){
const FileStream = require('fs');
const mongoose = require('mongoose');

let startTime = 0;
let totalI = null;
let errors = [];
let totalErrors = 0;
let name = "promise iterator"
let startI=0;
let lastLog = -1000;
let lastWrite = -1000;
let _options = {
    fileLogFreq: 10,
    consoleLogFreq:10
}
options = {};
function iterateModel(Model, modify, i=0, batchSize=100, stopAfter=null, optionsIn = {}) {

    startTime = 0;
    totalI = null;
    errors = [];
    totalErrors = 0;
    name = "promise iterator"
    startI = 0;
    lastLog = -1000;
    lastWrite = -1000;
    _options = {
        fileLogFreq: 10,
        consoleLogFreq: 10
    }


    options = Object.assign({}, _options, optionsIn);
    return Model.find({}).count()
        .then(count => {
            startI=i;
            totalI = stopAfter || count
            name = modify.name || name

            console.log(["start", {'name':modify.name, startI, batchSize, totalI, time: Date.now()} ]);
            log(["start", {'name':modify.name, i, batchSize, totalI}, Date.now()])
            startTime = Date.now();
        })
        .then(() => recursiveAddandSave(Model, modify, i, batchSize))
        
}

function recursiveAddandSave(Model, modify, i ,batchSize) {
    if (i < totalI) {
        return Model.find({})
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

function progressReport(saved, i, batchSize) {
    const writeTofile = Boolean(i - lastWrite > options.fileLogFreq)
    const consoleLog = Boolean(i - lastLog > options.consoleLogFreq)
    if (writeTofile || consoleLog){
        const batchNames = saved.map(doc => doc.symbol);
        const elapsedTime = Date.now() - startTime;
        const numDone = i + 1 - startI;
        const averageTimeMinutes = (elapsedTime / (numDone)) / 60000;
        const estimatedTimeMinutes = parseInt(averageTimeMinutes * (totalI - i));
        const percent = `${parseInt(1000*(numDone) / (totalI - startI))/10}%`;
        if (i % 800 === 0){
            console.log('forcing GC');
            forceGC()
        }
        if (consoleLog){
            lastLog = i
            const someNames = [batchNames[0],batchNames[batchNames.length-1]].join("...")
            console.log({
                someNames,
                percent,
                estimatedTimeMinutes,
                'i/totalI': `${i}/${totalI}`,
                averageTimeMinutes,
                'totalErrors': (totalErrors + errors.length)
            })
        }
        if (writeTofile) {
            lastWrite = i

                log({
                    time: Date.now(),
                    batchNames,
                    percent,
                    estimatedTimeMinutes,
                    i,
                    totalI,
                    totalErrors,
                    errors
                })

            totalErrors += errors.length;
            errors= [];
        }
    }
    
}

function log(toLog) {
    try {
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
        const fd = FileStream.appendFileSync(__dirname + `${name}.log`, `\n ${message}`);

    } catch (error) {
        console.log(error);
    } 
}
function forceGC() {
    if (global.gc) {
        console.log("garbage collecting");
        global.gc();
    } else {
        console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
    }
}

module.exports = iterateModel;
})()