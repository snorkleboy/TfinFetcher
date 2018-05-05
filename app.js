const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
// const router = require('./routes/router');

const getIEXCharts = require('./fetchScripts/iex/chart/iexChart');
// const getIEXDetails = require("./fetchScripts/iex/iexDetails")
const alphaVantageAnalytics = require('./fetchScripts/alpha/alphaVantageDetails')

//mongoose
//
const uristring = process.env.MONGOLAB_URI || process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/stocks';
mongoose.connect(uristring, {
    promiseLibrary: require('bluebird'),
    keepAlive: 120 
}, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
        getIEXCharts();
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