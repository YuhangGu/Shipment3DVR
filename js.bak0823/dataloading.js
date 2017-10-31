/**
 * Created by Aero on 08/03/2017.
 */

// for the migration
function loadWorldGeoData(callback){

    /*
    d3.json("../data/world-110m.json", function (error, world) {
        dataWorldGeo = world;
    });
    */

    d3.json("data/worldmap2017.json", function (error, world) {
        dataWorldGeo = world;
    });

    setTimeout(callback,200);

}

function loadShipment(callback){

    d3.json( "data/flowsByYear-fornest.json",function(data){
        dataShipment = data;
        //countriesMatrix = matrixComputing(data.routesForCountries);
    } );

    setTimeout(callback, 200);

}

/*
function matrixComputing(data) {
    var matrix;

    console.log(data);
    return matrix;
}
*/