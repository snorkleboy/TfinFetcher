const express = require('express');
const ScreenController = express.Router();


ScreenController.get('/',(req,res)=>{
    res.send("screenController");
})

module.exports = ScreenController;