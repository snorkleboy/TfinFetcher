const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const os = require('os');
var cmd=require('node-cmd');
const axios = require('axios');
const moment = require('moment');

const Iex = require('./IEXinterface')
const FileStream = require('fs');
const StockChart = require('../models/stockChart')

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
            this.checkUpdate()
            .then(daysSince=>{
                console.log("Run stocksinterface", {daysSince})
                if (daysSince && daysSince>.9){
                    res(this.update(daysSince))
                }else if (!daysSince){
                    res(this.init())
                }else{
                    res( "up to date"+ Date.now())
                }
            })
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
    checkTimeAndConnection(){
         
        const promises = [
            axios({
                url: `http://worldclockapi.com/api/json/est/now`,
                method: "GET"
            })
            .then(res=>{
                if (res.status == 200){
                    const time = new Date(res.data.currentDateTime);
                    const dayofWeek = res.data.dayOfTheWeek;
                    const timeZone = res.data.timeZoneName;
                    return `starting tfin database update in 15min. current time from worldclockapi is \n${time} ${dayofWeek}  ${timeZone}\n current system time is ${new Date()}`
                }
            }),
            this.checkUpdate()
        ]
        return Promise.all(promises)
        .then(res=>{
            let message = res[0]
            const daysSince = res[1]; 
            message +=message + `\n\n daysSince last ran:${daysSince}`
            const toField = "To:someone@txt.att.net"
            const fromField = "From:timkharshan@hotmail.com"
            const subjectField = "Subject: TFINUPDATE"
            const ssmtp = "ssmtp 9253305948@txt.att.net"
            const command = `echo ${toField}\n${fromField}\n${subjectField}\n\n${message}'| ${ssmtp} ` 
            cmd.run(command);
            return time;
        })
        .catch(err=>{
            console.log("NO CONNECTION OR CANNOT GET DATE",err);
            throw err;
        })
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
        console.log("checking update");
        return getLastRan()
        .then(lastRan=>{
            if (lastRan){
                const now = new Date(Date.now());
                console.log("CHECK UPDATE", {lastRan,now})
                const daysSince = workday_count(moment(lastRan),moment(now));
                console.log(daysSince);
                return daysSince;
            }else{
                return false;
            }
        })
    }
}

module.exports = StocksInterface;


function workday_count(start,end) {
    var first = start.clone().endOf('week'); // end of first week
    var last = end.clone().startOf('week'); // start of last week
    var days = last.diff(first,'days') * 5 / 7; // this will always multiply of 7
    var wfirst = first.day() - start.day(); // check first week
    if(start.day() == 0) --wfirst; // -1 if start with sunday 
    var wlast = end.day() - last.day(); // check last week
    if(end.day() == 6) --wlast; // -1 if end with saturday
    return wfirst + days + wlast; // get the total
  }
function getLastRan(){
    return readLastRan()
    .then(lastRan=>{
        console.log("raw date",{lastRan})
        if (lastRan && lastRan !== ""){
            return new Date(lastRan)
        }else{
            undefined;
        }
    })
}
function readLastRan(){
    return StockChart.find().limit(1)
    .then(docs=>{
        if (docs.length>0){
            const doc = docs[0]
            const date = doc.chart[doc.chart.length-1].date
            if (date.includes("T")){
                return date
            }else{
                return date+"T12:00";
            }
        }else{
            return false;
        }

    })
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

