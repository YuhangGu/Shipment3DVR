//created by Aero

/* IdShip,ShipSource,ShipName,ShipDateMonth,ShipDateYear,ShipTakenLocation,ShipLastage,ShipTonnage,ShipAge,ShipCrewTot,ShipCrewNat,ShipMustPlace,ShipOwnRes,ShipOwnGender,ShipSkipPart,ShipJournEnd,ShipJournBegin,ShipConstrPlace,ShipMustRole,ShipComments,period_coding,OR_place,OR_country,OR_region,OR_northsouth,OR_latitude,OR_longitude,OR_google,OR_coastalKM,OR_coastalclass,OR_placeclass,JE_place,JE_country,JE_region,JE_northsouth,JE_latitude,JE_longitude,JE_google,JE_coastalKM,JE_coastalclass,JE_placeclass,JB_place,JB_country,JB_region,JB_northsouth,JB_latitude,JB_longitude,JB_google,JB_coastalKM,JB_coastalclass,JB_placeclass,SHIP_CONV_TONNAGE,OR_histpol,JE_histpol,JB_histpol,OR_altscan

 */

var fs = require('fs');
var fswirting = require('fs');
const csv = require('csvtojson')

var routes = [];

var coordinateDic = [];
var countriesCoordinatesMap = [];

readCountryCoordinates(readFlowsByYear);


function readCountryCoordinates(callback) {

    var content = fs.readFileSync("../../data/portsCountryCoordinates.json");
    var jsonContent = JSON.parse(content);

    jsonContent.forEach(function (d) {

        if(coordinateDic.indexOf(d.name) == -1){
            coordinateDic.push(d.name);
            countriesCoordinatesMap.push([d.latitude, d.latitude]);
        }
        else{
            console.log("duplicated",d);
        }
    });
    setTimeout(callback, 200);
}

function readFlowsByYear(){

    //console.log(countriesCoordinatesMap);

    var routeIDCreatingSet = [];

    csv().fromFile('../../data/TBL_ship_final.csv').on('json', function (item) {

        var matrixCountreader = 0;

        if(item.ShipDateYear.length == 4 && item.ShipDateMonth > 0 && item.ShipDateMonth < 13
            && item.JB_latitude.length != 0 && item.JB_longitude.length != 0 &&
            item.JE_latitude.length!=0 && item.JE_longitude.length != 0 &&
            item.JB_latitude.length <20 && item.JB_longitude.length <20 &&
            item.JE_latitude.length<20 && item.JE_longitude.length <20 &&
            parseFloat(item.JB_latitude) < 90 && parseFloat(item.JE_latitude) < 90 &&
            parseFloat(item.JB_longitude) < 180 &&  parseFloat(item.JE_longitude) < 180 &&
            parseFloat(item.JB_longitude) > -180 &&  parseFloat(item.JE_longitude) > -180){


            var routelinename = item.JB_place+ "=>" +item.JE_place;
            var routeID = -1;

            //the first time this route appears
            if(routeIDCreatingSet.indexOf(routelinename) == -1){

                routeIDCreatingSet.push(routelinename);


                routeID = routeIDCreatingSet.indexOf(routelinename);

                routes.push({
                    routeID     :   routeID,
                    year        :   item.ShipDateYear,
                    originPort  :   item.JB_place,
                    destPort    :   item.JE_place,
                    originNati  :   item.JB_country,
                    destNati    :   item.JE_country,
                    geometry    :   [   parseFloat(item.JB_latitude), parseFloat(item.JB_longitude),
                                        parseFloat(item.JE_latitude), parseFloat(item.JE_longitude) ],
                    count       : 1
                });

            }
            else{

                var indexRouteName = routeIDCreatingSet.indexOf(routelinename);

                if(routes[indexRouteName].routeID == routeIDCreatingSet.indexOf(routelinename))
                {
                    routes[indexRouteName].count
                        = routes[indexRouteName].count + 1;
                }
                else{
                    console.log("Fucked up!");
                }

            }

        }


    }).on('done', function (error) {
        fswirting.writeFile('../../data/flowsByYear-fornest.json', JSON.stringify(routes, null, 4), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved\n");
            }
        });

    });
}