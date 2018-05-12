const Sector = require("../models/sector");

let initialized = false;
class sectorCache{
    constructor(){
    }
    init(){
        if (initialized){
            throw "already initialized sector cache"
        }
        const that = this;
        return Sector.find({})
            .then(sectors => {
                that.sectors = sectors
                initialized=true;
            })

    }
}

module.exports = new sectorCache();