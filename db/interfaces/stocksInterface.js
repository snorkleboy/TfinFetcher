import { BADFLAGS } from 'dns';

const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const Iex = require('./IEXinterface')
const FileStream = require('fs');


const addSectorAverages = require('../analysisSripts/addSectorAverages')


const _options = {

};
let connected = false;

export default class StocksInterface{
    constructor(options){
        this.Interface = new Iex();
        this.options = Object.assign([],_options,options);
        this.busy=false;
        connectToMongoose();
    }
    run(){
        const daysSince = checkUpdate();
        if (daysSince && daysSince>0){
            return this.update(daysSince);
        }else if (daysSince>0){
            return this.init();
        }else{
            return "up to date"+ Date.now();
        }
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
        fs.writeFile(__dirname+'/stocksInterFaceUpdate.log', Date.now(), function (err) {
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
            const daysSince = getDays(lastRan,now);
            return daysSince;
        }else{
            return false;
        }

    }
}
function getLastRan(){
    const lastRan = readLastRan();
    if (lastRan){
        return new Date(lastRan)
    }else{
        undefined;
    }
}
function readLastRan(){
    return Promise(function (res,rej){
        fs.readFile(__dirname+'/stocksInterFaceUpdate.log', function(err, data){
            if(err){
                console.log("STOCKS INTERFACE DID NOT READ LAST LOG FILE");
                rej(err);
            }else{
                resolve(data);
            }
        });
    })
}
StocksInterface.prototype.afterStockUpdate = function afterStockUpdate(){
    Boolean(now.getHours() > this.Interface.updateTime);
}
function connectToMongoose(uristring  = uristring || process.env.MONGOLAB_URI || process.env.MONGODB_URI || process.env.MONGOHQ_URL || `mongodb://localhost/test`){
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
