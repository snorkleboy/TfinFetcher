const Sector = require("../models/sector");

let initialized = false;
class sectorCache{
    constructor(){
        this.sectors = false;
    }
    init(){
        if (initialized){
            throw "already initialized sector cache"
        }
        const that = this;
        return Sector.find({})
            .then(sectors => {
                that.sectors = {};
                sectors.forEach(sector=>that.sectors[sector.sector]=sector)
                initialized=true;
            })

    }
}

module.exports = new sectorCache();