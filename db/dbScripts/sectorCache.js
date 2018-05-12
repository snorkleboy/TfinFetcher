const Sector = require("../models/sector");

class sectorCache{
    constructor(){
        console.log('constructor')
    }
    init(){
        console.log("init")
        const that = this;
        return Sector.find({})
            .then(sectors => {
                that.sectors = sectors
            })

    }
}

module.exports = sectorCache;