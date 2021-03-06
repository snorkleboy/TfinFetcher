const cron = require("node-cron");
const StocksInterface = require('../db/interfaces/stocksInterface')
const interface = new StocksInterface();

module.exports = function setupCron(){
    console.log("setting up cron job")
    interface.checkTimeAndConnection()
        .then(() => {
            interface.run();
        })
    cron.schedule("0 15 * * 1,2,3,4,5", function() {
    console.log("running update", )
        interface.checkTimeAndConnection()
        .then(()=>{
            setTimeout(() => {
                interface.run();
            }, 1000 * 60 * 15)
        })


    });

}
