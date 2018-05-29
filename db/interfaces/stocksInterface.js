const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const IexInterface = require('./IEXinterface')
const iexInterface = new IexInterface()

const uristring = `mongodb://tfindb:y0VePVh17nXkUXH9HVn3BZ8svCmS9JJadyIfLdLDmFk3zGFj1Yc3rYHtAt7QeCgxDJChx6foiePvgdDOQwD41A==@tfindb.documents.azure.com:10255/?ssl=true&replicaSet=globaldb`
|| `mongodb://localhost/test`;
const moveLatestvaluesFromChartsToStocks = require('../dbScripts/moveLatestValuesFromChartsToStockPI')

mongoose.connect(uristring, {
    promiseLibrary: require('bluebird'),
    keepAlive: 120
}, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);

        // iexInterface.init();
    }
});
