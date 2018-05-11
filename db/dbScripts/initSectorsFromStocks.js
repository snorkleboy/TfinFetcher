const Stock = require('../models/stock')
const Sector = require('../models/sector')

function initSectorsFromStocks() {
    console.log("Starting initSectors")
    Stock.distinct("general.sector")
    .then(sectors=> validate(sectors))
    .then(sectors=>createSectors(sectors))
    .then(saved=>console.log(saved));
}
function validate(sectors){
    const ans = [];
    sectors.forEach(sector=>{
        if (sector && sector.length>0){
            ans.push(sector);
        }
    })
    return ans;
}
function createSectors(sectors){
    const promises = [];
    sectors.forEach(sector=>{
        promises.push(
            Sector.create({sector})
        )
    })
    return Promise.all(promises)
}
module.exports = initSectorsFromStocks;