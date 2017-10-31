/**
 * Created by Aero on 09/03/2017.
 */

var Vis = {
    //ID & configurations
    divID: "#migration-flowmap-2D",
    divIDchord: "#chord-chart-migration",


    color: d3.scaleOrdinal(["#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fe8ca0", "#ffffb8", "#feb567", "#3fd464", "#7fb0d2"])
        .domain(cargolistforcolorScale),

    map_width: window.innerWidth,
    map_height: window.innerHeight,

    //graphic elements
    svg_migration2D: null,    // parent
    g_basemap2D: null,
    g_flows2D: null,
    className2Dflows: "flows2D",

    svg_barchart: null,
    svg_chordchart: null,

    //color
    g_gradient : null,

    svg_chord: null,
    g_chord: null,
    arc: null,
    ribbon: null,
    classNameChord: "chord",

    //cartography
    projection: null,
    linerValueScale: null,
    mapscale: 800,
    icelandCenter: [-0, 0],

    //util & settings
    zoom: null,
    //data utilities
    cityCenterLocations: d3.map()
}

//--------------- main ---------------
function visualizeIn2D() {

    initializeUI();
    initializeFlowmap();
    //initializeBarChart();
    drawNestedBarChart();
    //initializeChordChart();
    
    //initializeNonGeoGraphics();
}

function initializeUI(){

    var yearlist = dataShipment.yearDic;
    yearlist.sort();

    mySlider = $('#ex1').bootstrapSlider({
        max : yearlist.length-1,
        tooltip_position : "bottom",
        formatter: function(value) {
            return 'Year ' + yearlist[value];
        },
    }).on('slide', function (e) {
        var value = mySlider.bootstrapSlider('getValue');
        var yearslected = yearlist[value];
        //console.log(yearslected);
        drawFlowsByYear(yearslected, checkboxStatue);
        currentYear = yearslected;
    });

    $('#sliderbarcontainer').css({
        'bottom' : '10%'
    });

    //for check box

    $(".radio").click(function(e) {

        // 0 -- port, 1 -- country, 2 -- continent
        if(e.currentTarget.id == "chck0"){
            checkboxStatue = 0;
            drawFlowsByYear(currentYear, checkboxStatue);
        }
        else if (e.currentTarget.id == "chck1"){
            checkboxStatue = 1;
            drawFlowsByYear(currentYear, checkboxStatue);
        }
        else if (e.currentTarget.id == "chck2"){
            checkboxStatue = 2;
            drawFlowsByYear(currentYear, checkboxStatue);
        }

    });

}

//--------------- init flowmap ------------------
function initializeFlowmap() {

    Vis.linerValueScale = d3.scaleLinear().domain([0,maxForScale]).range([0,20]);

    //initiate
    Vis.projection = d3.geoMercator()
        .scale(170)
        .translate([Vis.map_width / 2, Vis.map_height / 2])
        .precision(.1);

    Vis.svg_migration2D = d3.select(Vis.divID).append("svg")
        .attr("width", Vis.map_width)
        .attr("height", Vis.map_height)
        .attr("transform", "rotate(0,180,180)");

    // interaction
    Vis.zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    Vis.g_basemap2D = Vis.svg_migration2D.append("g").attr("class", "basemap");

    Vis.g_flows2D = Vis.svg_migration2D.append("g");

    Vis.svg_migration2D.append("rect")
        .attr("class", "overlay")
        .attr("width", Vis.map_width)
        .attr("height", Vis.map_height)
        .call(Vis.zoom);


    // set the gradient color
    Vis.g_gradient = Vis.g_flows2D.append("defs")
        .append("linearGradient")
        .attr("id", "svgGradient")
        .attr("x1", "100%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    Vis.g_gradient.append("stop")
        .attr('class', 'start')
        .attr("offset", "0%")
        .attr("stop-color", "blue")
        .attr("stop-opacity", 1);

    Vis.g_gradient.append("stop")
        .attr('class', 'end')
        .attr("offset", "100%")
        .attr("stop-color", "yellow")
        .attr("stop-opacity", 1);

    draw2DBasemapWorld2017();
    //draw2DBasemapWorld110();
    //drawFlowsByYear(-1, checkboxStatue);

    //drawFlowsOn2DMap(1);
}

function initializeBarChart() {

    var width = $("#barchartcontainer").width();

    var height = 180;

    var x = $("#barchartcontainer").width();

    var barcount = dataShipment.yearDic.length;
    var unit = width/barcount;


    var yearlist = dataShipment.yearDic;
    yearlist.sort();
    var yearlyStatistics = dataShipment.yearForCountriesListCount.map(function (d) {
        var sum = d.reduce(add, 0);
        function add(a, b) {
            return a + b;
        }
        return sum;
    });


    console.log("max",d3.max(yearlyStatistics) );


    var yScale = d3.scale.linear().range([ 0 ,height])
        .domain([0, d3.max(yearlyStatistics)]);

    Vis.svg_barchart = d3.select("#barchartcontainer").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform","translate("+ 0 +","+ 0+")" );

    var bars = Vis.svg_barchart.selectAll(".bar").data(dataShipment.yearDic).enter()
        .append("g").attr("class","bar");


    bars.append("rect")
        .attr("width", unit - 2)
        .attr("height", function (d, i) {
            var indexofyear = dataShipment.yearDic.indexOf(d);
            //return yearlyStatistics[indexofyear];
            return yScale(yearlyStatistics[indexofyear]);
        })
        .attr("x", function (d,i ) {
            return i * unit;})
        .attr("y", function (d, i) {

            var indexofyear = dataShipment.yearDic.indexOf(d);
            //return yearlyStatistics[indexofyear];
            return 190 - yScale(yearlyStatistics[indexofyear]);
        })
        .attr("name", function (d) {
            return d;
        })
        .on("mouseover", function (d) {

            var indexofyear = dataShipment.yearDic.indexOf(d);
            console.log(d,yearlyStatistics[indexofyear]);
            d3.select(this).attr("fill", "#E74C3C");
            drawFlowsByYear(d,checkboxStatue);
            //mySlider.setValue(d,"change" ,"change");
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("fill", "#2980B9");
        });
}

function drawNestedBarChart() {


    var width = $("#barchartcontainer").width();
    var height = 180;

    var routesRaw = dataShipment.routes;
    var entries = d3.nest().key(function (d) {
        return d.year;
    }).sortKeys(d3.ascending)
        .entries(routesRaw);


    var barcount = entries.length;
    var unit = width/barcount;


    var arr = entries.map(function (d) {
        var arraycount = d.values.map(function (t) {
            return t.count;
        });
        console.log(d.key, arraycount);
        var sum = d3.sum(arraycount);
        //console.log("this item: ",d);
        return sum;
    })

    var yScale = d3.scale.linear().range([ 0 ,height])
        .domain([0, d3.max(arr)]);

    //console.log("max", d3.max(arr));

    Vis.svg_barchart = d3.select("#barchartcontainer").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform","translate("+ 0 +","+ 0+")" );

    var bars = Vis.svg_barchart.selectAll(".bar")
        .data(entries).enter()
        .append("g").attr("class","bar");

    bars.append("rect")
        .attr("width", unit - 2)
        .attr("height", function (d) {
            return yScale(d.values.length);
        })
        .attr("x", function (d,i) {return i * unit;})
        .attr("y", function (d, i) {
            return 200 - yScale(d.values.length);
        })
        .attr("name", function (d) {
            return d.key;
        })
        .on("mouseover", function (d) {
            console.log(d.key, d3.sum(d.values.map(function (t) {
                return t.count;
            }))   );
            d3.select(this).attr("fill", "#E74C3C");
            drawFlowsByYear(parseInt(d.key),checkboxStatue);
            //mySlider.setValue(d,"change" ,"change");
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("fill", "#2980B9");
        });
}

function initializeChordChart(){

    var map_width = $("#chrodChart").width();
    var map_height = $("#chrodChart").height();

    Vis.svg_chordchart = d3.select("#chrodChart").append("svg")
        .attr("id", "svg_chordchart")
        .attr("width", map_width)
        .attr("height", map_height);

    var margin = {top: 5, right: 5, bottom: 5, left: 5},
        width = + Vis.svg_chordchart.attr("width") - margin.left - margin.right,
        height = + Vis.svg_chordchart.attr("height") - margin.top - margin.bottom;

    var innerRadius = height / 2.2;
    var outerRadius = height / 2;

    Vis.arc = d3.arc().innerRadius(innerRadius)
        .outerRadius(outerRadius);

    Vis.ribbon = d3.ribbon()
        .radius(innerRadius);

    Vis.g_chord = Vis.svg_chordchart.append("g")
        .attr("transform", "translate(" + map_width / 2 + "," + map_height / 2 + ")");

    drawChord();
}

//world-110 version
function draw2DBasemapWorld110() {
    var path = d3.geo.path().projection(Vis.projection);

    Vis.g_basemap2D.append("path")
        .datum(topojson.object(dataWorldGeo, dataWorldGeo.objects.land))
        .attr("class", "basemap")
        .attr("d", path);

    d3.selectAll("path").each(function (d, i) {
        var center = path.centroid(d);

        //console.log(center);
        var named = d3.select(this).attr("name");
        //record the center of path
        Vis.cityCenterLocations[named] = center;

        /*
        Vis.g_basemap2D.append("text")
            .attr("x", center[0])
            .attr("y", center[1])
            .attr("class", "label")
            .text(named);
            */
    });
}


function draw2DBasemapWorld2017() {

    var path = d3.geo.path().projection(Vis.projection);


    Vis.g_basemap2D.selectAll("path")
        .data(dataWorldGeo.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "basemap")
        .attr("fill", function(d,i){
            /*
            var name = d.properties.VARNAME_1;
            var index = name.indexOf("|");
            if(index != -1){
                name = name.substr(0,index);
            }
            return Vis.color(name);*/
        })
        .attr("name",function(d,i){
            var name = d.properties.name;
            var index = name.indexOf("|");
            if(index != -1){
                name = name.substr(0,index);
            }
            return name;
        })
        .on("click", function (){

            selectedCity = d3.select(this).attr("name");

            if(lastSelectedCity != selectedCity){
                lastSelectedCity = selectedCity;
                updateVisualizations(selectedCity);
            }
            console.log("name is:", name);

        });

    Vis.g_basemap2D.selectAll("path").each(function(d,i){

        var center = path.centroid(d);
        var named = d3.select(this).attr("name");
        //record the center of path
        Vis.cityCenterLocations[named] = center;

        /*
        Vis.g_basemap2D.append("text")
            .attr("x",center[0])
            .attr("y",center[1])
            .attr("class", "label")
            .text( named );
            */
    });


}


function drawFlowsOn2DMap(index) {

    var bezierLine = d3.svg.line()
        .x(function (d) {
            return d[0];
        })
        .y(function (d) {
            return d[1];
        })
        .interpolate("basis");


    dataShipment.routes.forEach(function (d, i) {

        Vis.g_flows2D.append('g')
            .append('path')
            .attr("d", function () {
                var b = 1;

                var p2 = Vis.projection([ d[2], d[1] ]);
                var p0 = Vis.projection([ d[4], d[3] ]);

                //console.log(p2, p0);
                //var p1 = interplayPoint(p0, p2, b);
                return bezierLine([p0, p2])

            })
            .attr("stroke", "yellow")
            .attr("stroke-width", 2)
            .attr("class", Vis.className2Dflows);


    });

}


function drawFlowsByYear(year, checkboxStatue) {

    var indexofyear = dataShipment.yearDic.indexOf(year);

    var thisyearflow = null;
    var thisyearcountArr = null;
    //console.log(checkboxStatue);

    var dataForGraphic = null;

    if(checkboxStatue == 0 || checkboxStatue == -1){
        dataForGraphic = dataShipment.routes;
        thisyearflow = dataShipment.yearlyList[indexofyear];
        thisyearcountArr = dataShipment.yearlyListCount[indexofyear];
    }
    else if (checkboxStatue == 1){
        dataForGraphic = dataShipment.routesForCountries;
        thisyearflow = dataShipment.yearForCountriesList[indexofyear];
        thisyearcountArr = dataShipment.yearForCountriesListCount[indexofyear];
    }

    drawGraphic(dataForGraphic);


    function drawGraphic(dataForGraphic) {
        if(dataForGraphic != null){

            if(year == -1){ //draw all years here

                var bezierLine = d3.svg.line()
                    .x(function (d) {
                        return d[0];
                    })
                    .y(function (d) {
                        return d[1];
                    })
                    .interpolate("basis");

                dataForGraphic.forEach(function (d, i) {

                    Vis.g_flows2D.append('g')
                        .append('path')
                        .attr("d", function () {
                            var p2 = Vis.projection([ d[2], d[1] ]);
                            var p0 = Vis.projection([ d[4], d[3] ]);

                            //console.log(p2, p0);
                            var p1 = interplayPoint(p0, p2);
                            return bezierLine([p0, p1, p2])

                        })
                        .attr("stroke", "url(#svgGradient)")
                        .attr("stroke-width", Vis.linerValueScale( d[5] ))
                        .attr("class", Vis.className2Dflows);

                });

            }
            else{ // draw choosen year here

                Vis.g_flows2D.selectAll(".flows2D").remove();



                var bezierLine = d3.svg.line()
                    .x(function (d) {
                        return d[0];
                    })
                    .y(function (d) {
                        return d[1];
                    })
                    .interpolate("basis");

                thisyearflow.forEach(function (d, i) {

                    var thiscolor = Vis.color(d.cargoName);

                    var thisroute = dataShipment.routes[d];

                    Vis.g_flows2D.append('g')
                        .append('path')
                        .attr("d", function () {

                            var p2 = Vis.projection([ thisroute[2], thisroute[1] ]);
                            var p0 = Vis.projection([ thisroute[4], thisroute[3] ]);

                            var p1 = interplayPoint(p0, p2);
                            return bezierLine([p0, p1, p2])

                        })
                        .attr("stroke", "url(#svgGradient)")
                        .attr("stroke-width", Vis.linerValueScale( thisyearcountArr[i] ))
                        .attr("class", Vis.className2Dflows);

                });

            }
        }

    }




}

//
function interplayPoint(p1, p2) {

    var x1 = p1[0], y1 = p1[1],
        x2 = p2[0], y2 = p2[1];

    if(y2 >= y1 && x2 >= x1){
        var x3 = x1 * 3 / 4 + x2 / 4, y3 = y1 * 3 / 4 + y2 / 4;
        var k = (y2 - y1) / (x2 - x1);
        var l_raw = (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
        var l = Math.sqrt(l_raw) / 4;
        // x4 = x3 +/- ()
        // y4 = y3 +/- ()
        var x4 = x3 +  k * l / Math.sqrt(1 + k * k);
        var y4 = y3 + l / Math.sqrt(1 + k * k);
        var p = [x4, y4];
        return p;

    }
    else if (y2 >= y1 && x2 < x1){
        var x3 = x1 * 3 / 4 + x2 / 4, y3 = y1 * 3 / 4 + y2 / 4;
        var k = (y2 - y1) / (x2 - x1);
        var l_raw = (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
        var l = Math.sqrt(l_raw) / 4;
        // x4 = x3 +/- ()
        // y4 = y3 +/- ()
        var x4 = x3 + k * l / Math.sqrt(1 + k * k);

        var y4 = y3 - l / Math.sqrt(1 + k * k);
        var p = [x4, y4];
        return p;
    }
    else if (y2 < y1 && x2 >= x1){
        var x3 = x1 * 3 / 4 + x2 / 4, y3 = y1 * 3 / 4 + y2 / 4;
        var k = (y2 - y1) / (x2 - x1);
        var l_raw = (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
        var l = Math.sqrt(l_raw) / 4;
        // x4 = x3 +/- ()
        // y4 = y3 +/- ()
        var x4 = x3 - k * l / Math.sqrt(1 + k * k);

        var y4 = y3 + l / Math.sqrt(1 + k * k);
        var p = [x4, y4];
        return p;
    }
    else if (y2 < y1 && x2 < x1){
        var x3 = x1 * 3 / 4 + x2 / 4, y3 = y1 * 3 / 4 + y2 / 4;
        var k = (y2 - y1) / (x2 - x1);
        var l_raw = (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
        var l = Math.sqrt(l_raw) / 4;
        // x4 = x3 +/- ()
        // y4 = y3 +/- ()
        var x4 = x3 - k * l / Math.sqrt(1 + k * k);

        var y4 = y3 - l / Math.sqrt(1 + k * k);
        var p = [x4, y4];
        return p;
    }


}

// curve in 1/4

//--------------- init nonGeo ------------------
function initializeNonGeoGraphics() {

    var map_width = $(Vis.divIDchord).width();
    var map_height = 400;

    Vis.svg_chord = d3.select(Vis.divIDchord).append("svg")
        .attr("id", "svg_chord")
        .attr("width", map_width)
        .attr("height", map_height);

    var margin = {top: 30, right: 30, bottom: 10, left: 30},
        width = +Vis.svg_chord.attr("width") - margin.left - margin.right,
        height = +Vis.svg_chord.attr("height") - margin.top - margin.bottom;

    var innerRadius = height / 2.2;
    var outerRadius = height / 2;

    Vis.arc = d3.arc().innerRadius(innerRadius)
        .outerRadius(outerRadius);

    Vis.ribbon = d3.ribbon()
        .radius(innerRadius);

    Vis.g_chord = Vis.svg_chord.append("g")
        .attr("transform", "translate(" + map_width / 2 + "," + map_height / 2 + ")");

    drawChordMigration();
}

function drawChord() {

    var matrix = dataShipment.countriesMatrix;

    var chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    var group = Vis.g_chord
        .datum(chord(matrix))
        .append("g")
        .attr("class", "groups")
        .selectAll("g")
        .data(function (chords) {
            //console.log("chords is :", chords);
            return chords.groups;
        })
        .enter().append("g");

    var chordPath = group.append("path")
        .style("fill", function (d) {
            return Vis.color(d.index);
        })
        .style("stroke", function (d) {
            return d3.rgb(Vis.color(d.index)).darker();
        })
        .attr("class", "arcs")
        .attr("d", Vis.arc)
        .attr("id", function (d) {
            return "ID" + d.index;
        })
        .on("click", function (d) {
            /*
            selectedCity = citynameIndexMap[d.index];
            console.log("selectedCity: ", selectedCity);
            if (lastSelectedCity != selectedCity) {
                console.log("lastSelectedCity: ", lastSelectedCity);
                lastSelectedCity = selectedCity;
                updateVisualizations(selectedCity);
            }
            */
        });

    Vis.g_chord.append("g")
        .attr("id", "chordRibbonGourp")
        .selectAll("path")
        .data(function (chords) {
            return chords;
        })
        .enter().append("path")
        .attr("d", Vis.ribbon)
        .attr("class", "ribbons")
        .attr("source", function (d) {
            return d.source.index;
        })
        .attr("target", function (d) {
            return d.target.index;
        })
        .style("fill", function (d) {
            return Vis.color(d.source.index);
        })
        .style("stroke", function (d) {
            return d3.rgb(Vis.color(d.target.index)).darker();
        });

    /*
    drawlabels();

    function drawlabels() {
        chordPath.each(function (d, i) {
            //Search pattern for everything between the start and the first capital L
            var firstArcSection = /(^.+?)L/;
            //Grab everything up to the first Line statement
            var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
            //Replace all the commas so that IE can handle it
            newArc = newArc.replace(/,/g, " ");

            //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2)
            //flip the end and start position
            if (d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2 && d.startAngle != 0) {
                var startLoc = /M(.*?)A/,		//Everything between the capital M and first capital A
                    middleLoc = /A(.*?)0 0 1/,	//Everything between the capital A and 0 0 1
                    endLoc = /0 0 1 (.*?)$/;	//Everything between the 0 0 1 and the end of the string (denoted by $)
                //Flip the direction of the arc by switching the start and end point (and sweep flag)
                var newStart = endLoc.exec(newArc)[1];
                var newEnd = startLoc.exec(newArc)[1];
                var middleSec = middleLoc.exec(newArc)[1];
                //Build up the new arc notation, set the sweep-flag to 0
                newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
            }//if

            //Create a new invisible arc that the text can flow along
            group.append("path")
                .attr("class", "hiddenDonutArcs")
                .attr("id", "donutArc" + i)
                .attr("d", newArc)
                .style("fill", "none");

        });

        group.append("text")
            .attr("class", "chordlabel")
            //.attr("dy", -10)
            .attr("dy", function (d, i) {

                if (d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2 && d.startAngle != 0) {
                    return 17;
                }
                else {
                    return -11;
                }
            })
            .append("textPath")
            .attr("startOffset", "50%")
            .attr("xlink:href", function (d, i) {
                return "#donutArc" + i;
            })
            .text(function (d) {
                return citynameIndexMap[d.index];
            });

    }

    */

}

//--------------- utilities ------------------
function zoomed() {
    Vis.g_basemap2D.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    Vis.g_basemap2D.select(".basemap").style("stroke-width", .5 / d3.event.scale + "px");
    Vis.g_flows2D.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    Vis.g_flows2D.select(".flows2D").style("stroke-width", .5 / d3.event.scale + "px");
}

