/**
 * Created by Aero on 08/03/2017.
 */

// for the migration
function loadWorldGeoData(callback){



    d3.json("../data/countries.geojson", function (error, world) {
        dataWorldGeo = world;
    });

    setTimeout(callback,200);
}

function loadWorldGeoDataVR(callback){

    /*
    d3.json("../data/countries.geojson", function (error, world) {
        dataWorldGeo = world;
    });
    */

    setTimeout(callback,200);
}

function loadShipment(callback){

    /*
    d3.json( "../data/flowsByYear-fornest.json",function(data){
        dataShipment = data;
    } );
    */

    d3.json( "../data/BrithToResidence.json",function(data){
        brithToResData = data;
    } );

    setTimeout(callback, 200);
}