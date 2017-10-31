/**
 * Created by Aero on 16/4/18.
 */
var fs = require("fs");
var Promise = require('bluebird');
var request = require("request");
Promise.promisifyAll(request);
var util = require('../../lib/util.js');

var geocoderProvider = 'google';
var httpAdapter = 'https';
// optional
var extra = {
    //apiKey: 'AIzaSyAWH1FkKvSFgyg6crBz-2HfIzMrL_8m_hk', // yuhang
    //"AIzaSyAmwI-z4Zv0nuit4tXW6D8rl-gt3yAYziQ" yuhang2
    //"AIzaSyAA4DkksiDF6TeAgYisPUzgg4WwpvJB1IA" tianyuan
    //"AIzaSyDjcMlZeVS2XfZQsCtBe3Yz_vHfHonuM5o" mengmeng
    //"AIzaSyBJF9x0Odm9oNhYjLyef1ShdiI6nvB8kQE" guogge
    apiKey: 'AIzaSyBJF9x0Odm9oNhYjLyef1ShdiI6nvB8kQE',
    formatter: null         // 'gpx', 'string', ...
};


var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

console.log("\n *START* \n");

var content = fs.readFileSync("contryList.json");
var jsonContent = JSON.parse(content);
var stationinfoSaver = new util.ArraySaver("data/portsCountryCoordinates.json");
var errorstationSaver = new util.ArraySaver("data/portsCountryError.json");
//console.log(stationinfoSaver);

var errors = new Object([]);
var number = Object.keys(jsonContent).length;

var requestCount = 0;

var i = 0;

function geocode(jsonContent)
{

    if(i < number)
    {
        var stationObj = jsonContent[i];

        console.log(stationObj);
        var stationname = stationObj;


        //geocoder.geocode({address:stationname , region :'nl'})
        geocoder.geocode({address:stationname})
            .then(function(res) {
                //console.log(res);

                if(typeof res[0].latitude === "undefined" | typeof res[0].longitude === "undefined" )
                {
                    console.log("can't find port:",stationname);
                    errors.push(stationname);
                    setTimeout(function() {

                        console.log("the",requestCount++,"portname: ",stationname);
                        var newitem = {
                            "name"      :   stationObj,
                            latitude    :   null,
                            longitude   :   null
                        };
                        stationinfoSaver.add(newitem);
                        i++;
                        geocode(jsonContent);

                    }, 20);

                }
                else
                {

                    setTimeout(function() {

                        console.log("the",requestCount++,"portname: ",stationname);
                        //console.log("fuction here 2\n");
                        var newitem = {
                            "name"      :   stationObj,
                            latitude    :   res[0].latitude,
                            longitude   :   res[0].longitude
                        };
                        stationinfoSaver.add(newitem);
                        i++;
                        geocode(jsonContent);

                    }, 20);

                }


            })
            .catch(function(err) {
                console.log("cannot find this port",stationObj);
                console.log(err);
                errorstationSaver.add(stationObj);
                i++;

                setTimeout(function() {
                    geocode(jsonContent);
                }, 20);


            });



    }

}

geocode(jsonContent);

//util.saveData('errorStations.json', JSON.stringify(errors, null, 4));

