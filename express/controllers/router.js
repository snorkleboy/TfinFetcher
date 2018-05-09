const express = require('express');
const router = express.Router();
const ScreenController = require('./screenController');
router.get('/',(req,res)=>{
    res.send('stocksAPI')
})
router.use('/screen', ScreenController);

module.exports = router;
