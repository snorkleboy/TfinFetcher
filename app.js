const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// const router = require('./routes/router');

const saveSymbols = require('./fetchScripts/iexSymbols.js');
const saveChartLimited = require('./fetchScripts/iexChartFetchLimited');


//mongoose
//
const uristring = process.env.MONGOLAB_URI || process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/stocks';
mongoose.connect(uristring, {
    promiseLibrary: require('bluebird')
}, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
        // saveSymbols()
        saveChartLimited();

    }
});




app.use(logger('dev'));
// gets parameters out of body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
// router- all api nested under router
// app.use(router);



var port = process.env.PORT || process.argv[2] || '3000';
app.set('port', port);
const server = app.listen(port);