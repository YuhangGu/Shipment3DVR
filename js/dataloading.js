/**
 * Created by Aero on 08/03/2017.
 */

// for the migration
function loadWorldGeoData(callback){

    d3.json("../data/countries.json", function (error, world) {
        dataWorldGeo = world;
    });

    setTimeout(callback,200);
}


function loadShipmentData(callback){


    d3.csv( "../data/allports.csv",function(data){
        allports = data;
    } );


    d3.json( "../data/shipment.json",function(data){

        /*
        dataShipment = data;
        */

        var arr = data.features.map(function (d) {
            return d.properties.counts;
        })

        dataShipment = data.features.map(function (d) {
            return {
                type: "Feature",
                geometry: d.geometry,
                year: d.properties.year,
                origin: d.properties.JB_place,
                dest: d.properties.JE_place,
                count: d.properties.counts,
                //locOrigin: [d.properties.JB_longitude, d.properties.JB_latitude],
                //locDest: [d.properties.JE_longitude, d.properties.JE_latitude]
            }
        });

        yearStatisticsData = d3.nest()
            .key(function (d) {
                return d.year; })
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .map(dataShipment);

        maxshiplines = d3.max(arr);

    } );




    setTimeout(callback, 200);
}

