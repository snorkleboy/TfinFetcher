const express = require('express');
const router = express.Router();
const ScreenController = require('./screenController');
const StockController = require('./stockController');
router.get('/',(req,res)=>{
    res.send('stocksAPI')
})
router.use('/screen', ScreenController);
router.use('/stock', StockController);
module.exports = router;
