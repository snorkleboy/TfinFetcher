const Stock = require('../models/stock')
const Sector = require('../models/sector')

function initSectorsFromStocks() {
    console.log("Starting initSectors")
    return Stock.distinct("general.sector")
    .then(sectors=> validate(sectors))
    .then(sectors=>createSectors(sectors))
}
function validate(sectors){
    const ans = [];
    sectors.forEach(sector=>{
        if (sector && sector.length>0){
            ans.push(sector);
        } else {
            ans.push("unlisted")
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