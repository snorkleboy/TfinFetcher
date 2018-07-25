const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const os = require('os');

const Iex = require('./IEXinterface')
const FileStream = require('fs');


const addSectorAverages = require('../analysisSripts/addSectorAverages')


const _options = {

};
let connected = false;

class StocksInterface{
    constructor(options){
        this.Interface = new Iex();
        this.options = Object.assign([],_options,options);
        this.busy=false;
        connectToMongoose();
    }
    run(){
        return new Promise((res,rej)=>{
            const daysSince = this.checkUpdate();
            console.log("Run stocksinterface", {daysSince})
            if (daysSince && daysSince>.8){
                res(this.update(daysSince))
            }else if (!daysSince){
                res(this.init())
            }else{
                res( "up to date"+ Date.now())
            }
        })
    }
    init(){
        this.busy=true;
        const that = this;
        return this.Interface.init()
        .then(()=>{
            that.writeDate();
            that.busy=false;
        });
    }
    update(daysSince){
        this.busy=true;
        const that = this;
        return this.Interface.update(daysSince)
        .then(()=>{
            that.writeDate();
            that.busy=false;
        });
    }

    writeDate(){
        FileStream.writeFile(os.homedir()+'/tfinLogs/interface/stocksInterfaceUpdate.log', Date.now(), function (err) {
            if (err) {
                console.log("STOCKS INTERFACE DID NOT SAVE ITS LAST UPDATE TIME");
                throw err;
            }
        });
    }
    checkUpdate(){
        const lastRan = getLastRan();
        if (lastRan){
            const now = new Date(Date.now());
            console.log("CHECK UPDATE", {lastRan,now})
            const daysSince = getDays(lastRan,now);
            return daysSince;
        }else{
            return false;
        }

    }
}
module.exports = StocksInterface;
function getLastRan(){
    const lastRan = readLastRan()
    console.log("raw date",{lastRan})
    if (lastRan && lastRan !== ""){
        return new Date(lastRan)
    }else{
        undefined;
    }
}
function readLastRan(){
    return FileStream.readFileSync(os.homedir()+'/tfinLogs/interface/stocksInterFaceUpdate.log',{flag:'w+'}).toString();
}

function connectToMongoose(uristring  = process.env.MONGOLAB_URI || process.env.MONGODB_URI || process.env.MONGOHQ_URL || `mongodb://localhost/development`){
    mongoose.connect(uristring, {
        promiseLibrary: require('bluebird'),
        keepAlive: 120
    }, function (err, res) {
        if (err) {
            console.log('ERROR connecting to: ' + uristring + '. ' + err);
        } else {
            console.log('Succeeded connected to: ' + uristring);
            connected = true;
        }
    });
}
const getDays =(dateA,dateB)=> msToDays(dateB-dateA);

const msToDays = (val)=>val/(1000*3600*24);
const daysFromNow = (days)=>new Date(new Date().setDate(new Date().getDate()+days))
