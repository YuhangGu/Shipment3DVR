//created by Aero

/* IdShip,ShipSource,ShipName,ShipDateMonth,ShipDateYear,ShipTakenLocation,ShipLastage,ShipTonnage,ShipAge,ShipCrewTot,ShipCrewNat,ShipMustPlace,ShipOwnRes,ShipOwnGender,ShipSkipPart,ShipJournEnd,ShipJournBegin,ShipConstrPlace,ShipMustRole,ShipComments,period_coding,OR_place,OR_country,OR_region,OR_northsouth,OR_latitude,OR_longitude,OR_google,OR_coastalKM,OR_coastalclass,OR_placeclass,JE_place,JE_country,JE_region,JE_northsouth,JE_latitude,JE_longitude,JE_google,JE_coastalKM,JE_coastalclass,JE_placeclass,JB_place,JB_country,JB_region,JB_northsouth,JB_latitude,JB_longitude,JB_google,JB_coastalKM,JB_coastalclass,JB_placeclass,SHIP_CONV_TONNAGE,OR_histpol,JE_histpol,JB_histpol,OR_altscan

 */

var fs = require('fs');
var fswirting = require('fs');
const csv = require('csvtojson')

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

    /*
    routeCollection.countriesDic = coordinateDic;

    var arraysize = coordinateDic.length;
    coordinateDic.forEach(function (d, i) {
        var array = new Array(arraysize);
        array.fill(0);
        routeCollection.countriesMatrix.push(array);
    });

    */

    //console.log("coordinateDic",coordinateDic);
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

            //console.log(item.JB_country, "=>", item.JE_country);

            var thisyear = parseInt(item.ShipDateYear);

            var routelinename = item.JB_place+ "=>" +item.JE_place;
            var routeID = -1;


            //the first time this route appears
            if(routeIDCreatingSet.indexOf(routelinename) == -1){

                routeIDCreatingSet.push(routelinename);

                /*
                routeCollection.routes.push([
                    routelinename,
                    parseFloat(item.JB_latitude),
                    parseFloat(item.JB_longitude),
                    parseFloat(item.JE_latitude),
                    parseFloat(item.JE_longitude),
                    1]);
                */

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

                //routeIDCreatingCounts[indexRouteName] = routeIDCreatingCounts[indexRouteName] + 1;
                //routeCollection.routes[indexRouteName][5] = routeCollection.routes[indexRouteName][5] + 1;

                if(routes[indexRouteName].routeID == routeIDCreatingSet.indexOf(routelinename))
                {
                    routes[indexRouteName].count
                        = routes[indexRouteName].count + 1;
                }
                else{
                    console.log("Fucked up!");
                }

                //routeID = routeIDCreatingSet.indexOf(routelinename);
                //store
            }


            /*
            if(routeCollection.allCountryList.indexOf(item.JB_country) == -1){
                routeCollection.allCountryList.push(item.JB_country);
            }
            else if(routeCollection.allCountryList.indexOf(item.JE_country) == -1){
                routeCollection.allCountryList.push(item.JE_country);
            }*/

            // aggregation for countries


            /*
            var routeCountryName = item.JB_country + "=>" + item.JE_country;
            var routeCountryID = -1;
            if(routeCountryIDCreatingSet.indexOf(routeCountryName) == -1){
                routeCountryIDCreatingSet.push(routeCountryName);


                var indexOfCountryDicJB = coordinateDic.indexOf(item.JB_country);
                var indexOfCountryDicJE = coordinateDic.indexOf(item.JE_country);


                if(indexOfCountryDicJB != -1 && indexOfCountryDicJE != -1){
                    routeCollection.routesForCountries.push([
                        routeCountryName,
                        countriesCoordinatesMap[indexOfCountryDicJB][0],
                        countriesCoordinatesMap[indexOfCountryDicJB][1],
                        countriesCoordinatesMap[indexOfCountryDicJE][0],
                        countriesCoordinatesMap[indexOfCountryDicJE][1],
                        1]);
                }
                else{
                    routeCollection.routesForCountries.push([
                        routeCountryName,
                        0,
                        0,
                        0,
                        0,
                        1]);
                }


                routeCountryID = routeCountryIDCreatingSet.indexOf(routeCountryName);
            }
            else{
                var indexRouteCountryName = routeCountryIDCreatingSet.indexOf(routeCountryName);

                routeCollection.routesForCountries[indexRouteCountryName][5]
                = routeCollection.routesForCountries[indexRouteCountryName][5] + 1;
                routeCountryID = routeCountryIDCreatingSet.indexOf(routeCountryName);
            }


            //store route ID to year list
            //if year appers for the first time
            if(routeCollection.yearDic.indexOf(thisyear) == -1){

                routeCollection.yearDic.push(thisyear);

                routeCollection.yearlyList.push([routeID]);
                routeCollection.yearlyListCount.push([1]);

                routeCollection.yearForCountriesList.push([routeCountryID]);
                routeCollection.yearForCountriesListCount.push([1]);

            }
            // if year already exist
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

                var indexOfYearForCountryCount = routeCollection.yearForCountriesList[indexyear].indexOf(routeCountryID);
                if(routeCollection.yearForCountriesList[indexyear].indexOf(indexOfYearForCountryCount) == -1){
                    routeCollection.yearForCountriesList[indexyear].push(routeCountryID);
                    routeCollection.yearForCountriesListCount[indexyear].push(1);

                    // for matrix
                    matrixCountreader = 1;
                }
                else{
                    routeCollection.yearForCountriesListCount[indexyear][indexOfYearForCountryCount]
                        = routeCollection.yearForCountriesListCount[indexyear][indexOfYearForCountryCount] + 1;

                    // for matrix
                    matrixCountreader = routeCollection.yearForCountriesListCount[indexyear][indexOfYearForCountryCount] + 1;
                }

            }
            */


        }

        //building matrix
        /*
        var originIndex = routeCollection.countriesDic.indexOf(item.JB_country);
        var destinationIndex = routeCollection.countriesDic.indexOf(item.JE_country);
        if(originIndex == -1 || destinationIndex == -1){
            console.log(item.JB_country, "",item.JE_country );

        }
        else{

            routeCollection.countriesMatrix[originIndex][destinationIndex]
                = matrixCountreader;
        }
        */

    }).on('done', function (error) {

        //console.log(routeCollection.yearlyListCount);

        fswirting.writeFile('../../data/flowsByYear-fornest.json', JSON.stringify(routes, null, 4), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("JSON saved\n");
            }
        });

    });
}