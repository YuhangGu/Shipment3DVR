/**
 * Created by Aero on 15/02/2017.
 */
var dataWorldGeo;
var dataShipment;
var maxshiplines = 0;
var matrixNameList;
var matrix;
var allports;

var yearStatisticsData;


//-----will be dropped
var citynameIndexMap = [];


var lastSelectedCity = null;
var selectedCity = null;
var drawingallSwith = true;

var cargolistforcolorScale = [];

var mySlider = null;

var maxForScale = 0;

var checkboxStatue = -1;
var currentYear = -1;


var brithToResData = [];

function initShipmentVis2D(e){

    loadWorldGeoData(function(){
        loadShipmentData(visualizeIn2D);

    } );
}


function migrationVis3DStart(e){

    loadWorldGeoData(function(){

        loadShipmentData( function(){
            init3D();
        });

    } );
}



function init3D() {
    visualizeIn3D();
}


//-------------- run time -----------------
function updateVisualizations( selectedCity ){

    var index = citynameIndexMap.indexOf( selectedCity );
    drawingallSwith = false;

    //var thiscityData = migrationmatrix[index];
    Vis.g_flows2D.selectAll("." + Vis.className2Dflows).remove();

    drawFlowsOn2DMap( index );
    //highlightChord(index);
    //draw3DFlows(index);
    //draw3DSankeyFlows(index);
    update();

}