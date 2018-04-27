const axios = require('axios');
const Stock = require('../db/models/stock')
const saveSymbols =()=> axios.get('https://api.iextrading.com/1.0/ref-data/symbols')
    .then(response => {
        response.data.forEach((stock)=>{
            // const newStock = new Stock({"symbol" : stock.symbol, "name": stock.name})
            // newStock.save(err=>console.log("ERROR",err))
            Stock.create({ "symbol": stock.symbol, "name": stock.name }, (err, saved) => console.log(err,saved));
        })
    })
module.exports = saveSymbols;