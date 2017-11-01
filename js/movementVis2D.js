/**
 * Created by Aero on 09/03/2017.
 */

var Vis = {
    //ID & configurations

    color: d3.scaleOrdinal(["#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fecde5", "#ffffb8", "#feb567", "#8ad4c8", "#7fb0d2",
        "#fe8173", "#beb9d9", "#b1df71", "#fe8ca0", "#ffffb8", "#feb567", "#3fd464", "#7fb0d2"])
        .domain(cargolistforcolorScale),

    map_width: window.innerWidth,
    map_height: window.innerHeight,

    //graphic elements
    svgFlows: null,    // parent
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
    cityCenterLocations: d3.map(),


    //_________new_________
    divID: "#migration-flowmap-2D",
    divIDchord: "#chord-chart-migration",

    timeStructureRoutes: [],
    locationStructureRoutes: [],

    yearArr: [],
    scaleStatus: -1,
    maxSingle: 0,
    maxYear:0,
    maxCountry:0,

    svgMap: null,
    svgFlows: null,
    gFlows : null,

}

//--------------- main ---------------
function visualizeIn2D() {

    initDataStucture(
        initializeUI(
            initializeFlowmap(
                initBarChart,
                initChordChart)
        )
    );

}

function initDataStucture(callback) {

    Vis.timeStructureRoutes = d3.nest().key(function (d) {
        return d.year;}).sortKeys(d3.ascending).entries(dataShipment);

    Vis.locationStructureRoutes = d3.nest().key(function (d) {
        return d.originNati;
    }).sortKeys(d3.ascending)
        .entries(dataShipment);

    Vis.yearArr = Vis.timeStructureRoutes.map(function (d) {
        return d.key;
    });

    //console.log("Vis.timeStructureRoutes",Vis.timeStructureRoutes);
    //var maxSingle = 0;

    var arr = Vis.timeStructureRoutes.map(function (d) {
        var arraycount = d.values.map(function (t) {return t.count;});
        return [d3.sum(arraycount),d3.max(arraycount)];
    });

    //console.log(arr);
    Vis.maxSingle = d3.max( arr.map(function (d) {
        return d[1];
    }));

    Vis.maxYear = d3.max( arr.map(function (d) {
        return d[0];
    }))

    setTimeout(callback , 200);
}

function initializeUI(callback){

    mySlider = $('#ex1').bootstrapSlider({
        max : Vis.yearArr.length - 1,
        tooltip_position : "bottom",
        formatter: function(value) {
            return 'Year ' + Vis.yearArr[value];
        },
    }).on('slide', function (e) {
        var value = mySlider.bootstrapSlider('getValue');
        var yearslected = Vis.yearArr[value];
        //console.log(yearslected);
        //drawFlowsByYear(yearslected, checkboxStatue);
        updateViews(yearslected, checkboxStatue);
        currentYear = yearslected;
    });

    $('#sliderbarcontainer').css({
        'bottom' : '10%'
    });

    $(".radio").click(function(e) {

        // 0 -- port, 1 -- country, 2 -- continent
        if(e.currentTarget.id == "chck0"){
            Vis.scaleStatus = 0;

            //drawFlowsByYear(currentYear, Vis.scaleStatus);
        }
        else if (e.currentTarget.id == "chck1"){
            Vis.scaleStatus = 1;
            //drawFlowsByYear(currentYear, Vis.scaleStatus);
        }

    });

    Vis.zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
    
    setTimeout(callback , 200);
}

function initBarChart() {

    var width   =   $("#barchartcontainer").width();
    var height  =   $("#barchartcontainer").height();

    var barcount = Vis.timeStructureRoutes.length-1;
    var unit = width/barcount;

    var scaleBarChart = d3.scaleBand().domain(Vis.yearArr)
        .paddingInner(0.5).paddingOuter(0).range([0,width]).round(0.5);


    width = width + unit;
    var yScale = d3.scale.linear().range([ 0 ,height])
        .domain([0, Vis.maxYear]);

    Vis.svg_barchart = d3.select("#barchartcontainer").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform","translate("+ (-scaleBarChart.step()/2) +","+ 0+")" );

    var bars = Vis.svg_barchart.selectAll(".bar")
        .data(Vis.timeStructureRoutes).enter()
        .append("g").attr("class","bar");

    //console.log("scaleBarChart.bandwidth()", scaleBarChart.bandwidth());

    bars.append("rect")
        .attr("width", scaleBarChart.step() )
        .attr("height", function (d) {
            var arr = d.values.map(function (t) {
                return t.count;
            });
            //console.log(d3.sum(arr));
            return yScale(d3.sum(arr));
        })
        .attr("x", function (d,i) { return scaleBarChart(d.key); })
        .attr("y", function (d, i) {
            return height - yScale(d.values.length);
        })
        .attr("name", function (d) {
            return d.key;
        })
        .on("mouseover", function (d) {
            d3.select(this).attr("fill", "#E74C3C");

            updateViews(parseInt(d.key), checkboxStatue);
            //drawFlowsByYear(parseInt(d.key),Vis.scaleStatus);
            //mySlider.setValue(d,"change" ,"change");
        })
        .on("mouseout", function (d) {
            d3.select(this).attr("fill", "#2980B9");
        });

    /*
    bars.append("text")
        .attr("x", function (d,i) {return i * unit;})
        .attr("y", function (d, i) {
            return height - yScale(d.values.length);
        })
        .attr("class", "label")
        .text( function (d) {
            return d.key;
        } );*/

}

//--------------- init flowmap ------------------
function initializeFlowmap(callback1,callback2) {

    //console.log(brithToResData);


    //console.log(Vis.locationStructureRoutes.object());

    Vis.linerValueScale = d3.scaleLinear().domain([0,maxForScale]).range([0,20]);

    //initiate
    Vis.projection = d3.geoMercator()
        .scale(170)
        .translate([Vis.map_width / 2, Vis.map_height / 2])
        .precision(.1);

    Vis.svgFlows = d3.select(Vis.divID).append("svg")
        .attr("width", Vis.map_width)
        .attr("height", Vis.map_height)
        .attr("transform", "rotate(0,180,180)");

    // interaction
    /*
    Vis.zoom = d3.behavior.zoom()
        .translate([0, 0])
        .scale(1)
        .scaleExtent([1, 8])
        .on("zoom", zoomed);
        */

    Vis.zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", zoomed);

    Vis.g_basemap2D = Vis.svgFlows.append("g").attr("class", "basemap");

    Vis.g_flows2D = Vis.svgFlows.append("g");


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
        .attr("stop-color", "yellow")
        .attr("stop-opacity", 1);

    Vis.g_gradient.append("stop")
        .attr('class', 'end')
        .attr("offset", "100%")
        .attr("stop-color", "blue")
        .attr("stop-opacity", 1);


    var bezierLine = d3.line()
        .x(function (d) {
            return d[0];
        })
        .y(function (d) {
            return d[1];
        });



    // the flows of ships
    //modified 2017 10th Oct.
/*
    Vis.gFlows = Vis.svgFlows.selectAll("g").data(dataShipment)
        .enter().append("g");

    Vis.gFlows.append("path")
        .attr("d", function (d) {
            //console.log(d);
            var p2 = Vis.projection([ d.geometry[1], d.geometry[0] ]);
            var p0 = Vis.projection([ d.geometry[3], d.geometry[2] ]);
            //console.log(p2, p0);
            var p1 = interplayPoint(p0, p2);
            return bezierLine([p0, p1, p2]);
        })
        .attr("stroke", "url(#svgGradient)")
        .attr("stroke-width", 2)
        .attr("class", "flows")
        .attr("id", function (d) {
            //console.log(d.year);
            return "id" + d.year;
        });
*/


   Vis.gFlows = Vis.svgFlows.selectAll("g").data(brithToResData.placesFlows)
       .enter().append("g");



   Vis.gFlows.each(function ( el) {

       if(el[5] === el[6]){

           d3.select(this).append("circle")
               .attr("class", "nodes")
               .attr("cx", Vis.projection([parseFloat(el[1]) , parseFloat(el[0])])[0] )
               .attr("cy", Vis.projection([parseFloat(el[1]) , parseFloat(el[0])])[1] );
       }
       else{

           d3.select(this).append("path")
               .attr("d", function (d) {
                   //console.log(d);
                   var p2 = Vis.projection([  parseFloat(d[1]) , parseFloat(d[0]) ]);
                   var p0 = Vis.projection([ parseFloat(d[3]) , parseFloat(d[2]) ]);

                   return bezierLine([p0, p2]);
               })
               .attr("stroke", "url(#svgGradient)")
               .attr("stroke-width", 2)
               .attr("class", "flows")
               .attr("id", function (d) {
                   //console.log(d.year);
                   return "id" + d.year;
               });
       }

   });



   /*

   Vis.gFlows.append("path")
       .attr("d", function (d) {
           //console.log(d);
           var p2 = Vis.projection([  parseFloat(d[1]) , parseFloat(d[0]) ]);
           var p0 = Vis.projection([ parseFloat(d[3]) , parseFloat(d[2]) ]);

           return bezierLine([p0, p2]);
       })
       .attr("stroke", "url(#svgGradient)")
       .attr("stroke-width", 2)
       .attr("class", "flows")
       .attr("id", function (d) {
           //console.log(d.year);
           return "id" + d.year;
       });

   */

    draw2DBasemapWorld();

    Vis.svgFlows.append("rect")
        .attr("class", "overlay")
        .attr("width", Vis.map_width)
        .attr("height", Vis.map_height)
        .call(Vis.zoom);


    setTimeout(callback1 , 200);
    setTimeout(callback2 , 200);
}

function updateViews(yearslected, checkboxStatue) {

    d3.selectAll(".flows")
        .attr("class", "flowsMute");

    var id = "id" + yearslected;
    d3.selectAll("#"+id).attr("class", "flows");

}

function initChordChart(){

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

function draw2DBasemapWorld() {

    var path = d3.geoPath().projection(Vis.projection);


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
            return d.properties.ADMIN;
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
/*
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
*/

function drawChord() {

    var country = dataShipment.map(function ( d) {
        return {
            country: d.originNati,
            count: d.count
        }
    });

    var countryNest = d3.nest().key(function (d) {
        return d.country;
    }).sortValues(d3.descending).entries(country);

    var countforcountry = countryNest.map(function (d) {
        var arr = d.values.map(function (t) {return t.count;})
        return{ name: d.key, count: d3.sum(arr) }
    });

    var sorted = countforcountry.sort(function(x, y){
        return d3.descending(x.count, y.count);
    })


    sorted = sorted.slice(0,25);
    //console.log("sorted", sorted);


    var matirx = [];


    sorted.forEach(function (d) {

        var array = new Array(25);
        array.fill(0);
        matirx.push(array);

    });

    var countryList = sorted.map(function (d) {
        return d.name;
    })
    //console.log(countryList);

    //choose the top 25;

    dataShipment.forEach(function (d) {
        var i = countryList.indexOf(d.originNati);
        var j = countryList.indexOf(d.destNati);

        if(i!= -1 && j != -1){

            matirx[i][j] = matirx[i][j] + d.count;
        }
    });
    //console.log(matirx);
    var chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    var group = Vis.g_chord
        .datum(chord(matirx))
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
    Vis.gFlows.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

    Vis.g_basemap2D.select(".basemap").style("stroke-width", 1 / d3.event.scale + "px");
    Vis.gFlows.select(".flows").style("stroke-width", 1 / d3.event.scale + "px");
    Vis.gFlows.select(".flowsMute").style("stroke-width", 1 / d3.event.scale + "px");
    Vis.gFlows.select(".nodes").style("r", 4 / d3.event.scale + "px");


}