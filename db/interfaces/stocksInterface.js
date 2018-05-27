const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const IexInterface = require('./IEXinterface')
const iexInterface = new IexInterface()

const uristring = process.env.MONGOLAB_URI || process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/stocksTestDepoloy';


mongoose.connect(uristring, {
    promiseLibrary: require('bluebird'),
    keepAlive: 120
}, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
        iexInterface.init();
    }
});
