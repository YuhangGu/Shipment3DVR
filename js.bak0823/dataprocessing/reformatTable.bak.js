//created by Aero



/* IdShip,ShipSource,ShipName,ShipDateMonth,ShipDateYear,ShipTakenLocation,ShipLastage,ShipTonnage,ShipAge,ShipCrewTot,ShipCrewNat,ShipMustPlace,ShipOwnRes,ShipOwnGender,ShipSkipPart,ShipJournEnd,ShipJournBegin,ShipConstrPlace,ShipMustRole,ShipComments,period_coding,OR_place,OR_country,OR_region,OR_northsouth,OR_latitude,OR_longitude,OR_google,OR_coastalKM,OR_coastalclass,OR_placeclass,JE_place,JE_country,JE_region,JE_northsouth,JE_latitude,JE_longitude,JE_google,JE_coastalKM,JE_coastalclass,JE_placeclass,JB_place,JB_country,JB_region,JB_northsouth,JB_latitude,JB_longitude,JB_google,JB_coastalKM,JB_coastalclass,JB_placeclass,SHIP_CONV_TONNAGE,OR_histpol,JE_histpol,JB_histpol,OR_altscan

 */


var fs = require('fs');
var fswirting = require('fs');
const csv = require('csvtojson')


var yearSet = new Set();
var monthSet = new Set();
var morthsouthSet = new Set();
var regionSet = new Set();
var countrySet = new Set();
var routeSet = new Set();

var routeIDCreatingSet = [];

/*
var routeCollection = {
 yearDic : [ 1990, 1991],
 yearlyList : [ [for 1990 IDs ],
 [for 1991 IDs] ],
 monthDic : [ ],
 monthlyList:[
 [ ],
 [ ],
 ],
 contryDic : [ ],
 contryList : [ ],
 regionDic : [ ],
 regionList:[ ],

 routes: [
 [ "O - D", "JB_lat", "JB_lon", "JE_lat", "JE_lon", "count in total", [cargolist],],
 [ , , , , ],
 ]

}
*/

var routeCollection = {
    //categoryDic : [],
    yearDic : [ ],
    yearlyList : [ ],
    yearlyListCount : [ ],
    monthDic : [ ],
    monthlyList:[ ],
    contryDic : [ ],
    contryList : [ ],
    regionDic : [ ],
    regionList:[ ],
    routes: [ ]

};

var routeCountMax = 1;
var routeCountMin = 1;

readFlowsByYearandCategory();

function readFlowsByYearandCategory(){

    csv().fromFile('../../data/TBL_ship_final.csv').on('json', function (item) {

        if(item.ShipDateYear.length == 4 && item.ShipDateMonth > 0 && item.ShipDateMonth < 13
            && item.JB_latitude.length != 0 && item.JB_longitude.length != 0 &&
            item.JE_latitude.length!=0 && item.JE_longitude.length != 0 &&
            item.JB_latitude.length <20 && item.JB_longitude.length <20 &&
            item.JE_latitude.length<20 && item.JE_longitude.length <20 &&
            parseFloat(item.JB_latitude) < 90 && parseFloat(item.JE_latitude) < 90 &&
            parseFloat(item.JB_longitude) < 180 &&  parseFloat(item.JE_longitude) < 180 &&
            parseFloat(item.JB_longitude) > -180 &&  parseFloat(item.JE_longitude) > -180
        )
        {

            var thisyear = parseInt(item.ShipDateYear);
            //console.log("from ",item.JB_place ,"to",item.JE_place );

            //store data to route list
            //console.log(item);


            var routelinename = item.JB_place+ "=>" +item.JE_place;
            var routeID = -1;

            if(routeIDCreatingSet.indexOf(routelinename) == -1){

                routeIDCreatingSet.push(routelinename);

                routeCollection.routes.push([
                    routelinename,
                    parseFloat(item.JB_latitude),
                    parseFloat(item.JB_longitude),
                    parseFloat(item.JE_latitude),
                    parseFloat(item.JE_longitude),
                    1]);

                routeID = routeIDCreatingSet.indexOf(routelinename);

            }
            else{
                var indexRouteName = routeIDCreatingSet.indexOf(routelinename);

                //routeIDCreatingCounts[indexRouteName] = routeIDCreatingCounts[indexRouteName] + 1;
                routeCollection.routes[indexRouteName][5] = routeCollection.routes[indexRouteName][5] + 1;
                routeID = routeIDCreatingSet.indexOf(routelinename);
                //store
            }

            //store route ID to year list

            if(routeCollection.yearDic.indexOf(thisyear) == -1){

                routeCollection.yearDic.push(thisyear);
                routeCollection.yearlyList.push([routeID]);
                routeCollection.yearlyListCount.push([1]);

            }
            else{

                var indexyear = routeCollection.yearDic.indexOf(thisyear);
                var indexyearcount = routeCollection.yearlyList[indexyear].indexOf(routeID);

                if(routeCollection.yearlyList[indexyear].indexOf(routeID) == -1){

                    routeCollection.yearlyList[indexyear].push(routeID);
                    routeCollection.yearlyListCount[indexyear].push(1);

                }
                else{
                    routeCollection.yearlyListCount[indexyear][indexyearcount] = routeCollection.yearlyListCount[indexyear][indexyearcount] + 1;
                    //console.log(routeID, " already exist");
                }

            }

        }

    }).on('done', function (error) {

        //console.log(routeCollection.yearlyListCount);

        fswirting.writeFile('../../data/flowsByYearAndCategory.json', JSON.stringify(routeCollection, null, 4), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved\n");
            }
        });

    });
}