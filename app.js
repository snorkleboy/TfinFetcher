const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const router = require('./express/controllers/router');
const cronSetup = require('./cron/cron')
const tempScreen = require('./db/models/stock/aggregationScreen')
const addSectorAverages = require('./db/analysisSripts/addSectorAverages')
const axios = require('axios');

//mongoose
//
const uristring = process.env.MONGOLAB_URI || process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/development';
mongoose.connect(uristring, {
    promiseLibrary: require('bluebird'),
    keepAlive: 120 
}, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        cronSetup();
        console.log('Succeeded connected to: ' + uristring);
    }
});




app.use(logger('dev'));
// gets parameters out of body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    'extended': 'true'
}));
// router- all api nested under router
app.use('/',router);



var port = process.env.PORT || process.argv[2] || '3000';
app.set('port', port);
function listenHandler(){console.log(`bound to port ${port} and listening`)}
const server = app.listen(port, listenHandler);
