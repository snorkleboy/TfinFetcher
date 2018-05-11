const StockChart = require('../models/stockChart')
const promiseIterator = require('../util/generalPromiseIterator');

function deNestCharts(){
    promiseIterator(StockChart, modify, 0, 1, 2);
}
