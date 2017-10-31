//created by Aero

/* IdShip,ShipSource,ShipName,ShipDateMonth,ShipDateYear,ShipTakenLocation,ShipLastage,ShipTonnage,ShipAge,ShipCrewTot,ShipCrewNat,ShipMustPlace,ShipOwnRes,ShipOwnGender,ShipSkipPart,ShipJournEnd,ShipJournBegin,ShipConstrPlace,ShipMustRole,ShipComments,period_coding,OR_place,OR_country,OR_region,OR_northsouth,OR_latitude,OR_longitude,OR_google,OR_coastalKM,OR_coastalclass,OR_placeclass,JE_place,JE_country,JE_region,JE_northsouth,JE_latitude,JE_longitude,JE_google,JE_coastalKM,JE_coastalclass,JE_placeclass,JB_place,JB_country,JB_region,JB_northsouth,JB_latitude,JB_longitude,JB_google,JB_coastalKM,JB_coastalclass,JB_placeclass,SHIP_CONV_TONNAGE,OR_histpol,JE_histpol,JB_histpol,OR_altscan

 */

var fs = require('fs');
var fswirting = require('fs');
const csv = require('csvtojson')


var placesDic = [];
var placesCoordinatesMap = [];
var flowIDsList = [];



var movementlistDic = [];
var movementFlows = [];


var countrieslistDic = [];
var countryiesFlows = [];


readFlows();


function readFlows(){

    csv().fromFile('../../data/TBL_crew_final.csv').on('json', function (item) {


        if( item.BPL_place != "" && item.BPL_country &&
            item.BPL_latitude != "" && item.BPL_longitude != "" &&
            item.RES_place != "" && item.RES_country != "" &&
            item.RES_latitude!= "" && item.RES_longitude!= "" ){


            var flowname = item.BPL_place + item.RES_place;

            var index = movementlistDic.indexOf(flowname);

            if(index == -1){

                movementlistDic.push(flowname);

                movementFlows.push([
                    item.BPL_latitude,
                    item.BPL_longitude,
                    item.RES_latitude,
                    item.RES_longitude,
                    1,
                    item.BPL_place,
                    item.RES_place]);
            }
            else{

                movementFlows[index][4] =  movementFlows[index][4] + 1;
            }


            // for countries
            var flowCountryName = item.BPL_country + item.RES_country;
            var indexcountriesFlow =  countrieslistDic.indexOf(flowCountryName);
            if(indexcountriesFlow == -1){

                countrieslistDic.push(flowCountryName);

                countryiesFlows.push([
                    1,
                    item.BPL_country,
                    item.RES_country]);
            }
            else{
                countryiesFlows[indexcountriesFlow][0] =  countryiesFlows[indexcountriesFlow][0] + 1;
            }




        }


    }).on('done', function (error) {

        //console.log(placeCoorsMap);

        var flows = {
            placesFlows : movementFlows,
            countriesFlows : countryiesFlows
        }



        fswirting.writeFile('../../data/BrithToResidence.json', JSON.stringify(flows, null, 4), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved\n");
            }
        });

    });
}