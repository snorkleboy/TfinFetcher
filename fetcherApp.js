const StocksInterface = require('./db/interfaces/stocksInterface')
const interface = new StocksInterface();

console.log("FETCHER INIT " , Date.now());
let running = false;
setInterval(()=>{
    const nowHours = new Date().getHours();

    if (nowHours > (12+3) && !interface.busy && !running){
        console.log("FETCHER CHECK", Date.now())
        running = true;
        interface.run()
            .then((res)=>{
                running = false;
                console.log(res, "finished run");
            })
    }
},1000)
