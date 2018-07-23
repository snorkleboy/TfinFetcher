const StocksInterface = require('../../db/interfaces/stocksInterface')
const interface = new StocksInterface();

console.log("FETCHER INIT " , Date.now());
const running = false;
setInterval(()=>{
    const nowHours = new Date().getHours();
    console.log("FETCHER CHECK",nowHours, Date.now())

    if (nowHours > (12+3) && !interface.busy && !running){
        running = true;
        interface.run()
            .then((res)=>{
                running = false;
                console.log(res);
            })
        console.log("FETCHER CHECK",res, Date.now())
    }
},1000*60*60)
