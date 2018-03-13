var Vis = {
    zoom: null,
    linerValueScale: null, // to be changed

    //base map
    projection: null,
    path_geo: null,

    //flow map
    g_basemap2D: null,
    g_flowContainer: null,
    g_flows: null,
    g_ports: null,

    //pie chart
    g_pie: null,
    path_Pie: null,
    pie: null,
}

//------------------------------ main ------------------------------
function visualizeIn2D() {

    initializeUI(
        initializeFlowmap(
            initBarChart,
            /*initPieChart,*/
            initChordChart)
    )

}

function initializeUI(callback) {
   
    var yearArray = yearStatisticsData.keys();
    var countarray = yearStatisticsData.values();

    mySlider = $('#ex1').bootstrapSlider({
        max: countarray.length - 1,
        tooltip_position: "bottom",
        formatter: function (value) {
            return 'Year ' + yearArray[value];
        },
    }).on('slide', function (e) {
        var value = mySlider.bootstrapSlider('getValue');
        var yearselected = yearArray[value];
        //console.log(yearselected);
        updateViews(yearselected, "all");
    });

    $('#sliderbarcontainer').css({
        'bottom': '10%'
    });

    setTimeout(callback, 200);
}


function initializeFlowmap(callback1, callback2, callback3) {

    var map_width =  window.innerWidth;
    var map_height = window.innerHeight;

    Vis.zoom = d3.zoom()
        .scaleExtent([1, 5])
        .translateExtent([[ -map_width/2, -map_height/2], [ 3* map_width/2 , 3*map_height /2]])
        .on("zoom", zoomed);

    Vis.linerValueScale = d3.scaleLinear().domain([0, maxshiplines]).range([0, 20]);

    //initiate projection
    Vis.projection = d3.geoMercator()
        .scale(170)
        .translate([map_width / 2, map_height / 2])
        .precision(.1);

    //create geo path function
    Vis.path_geo = d3.geoPath().projection( Vis.projection );

    //init svg component
    var svg_FlowMap = d3.select("#migration-flowmap-2D").append("svg")
        .attr("width", map_width)
        .attr("height", map_height)
        .attr("transform", "rotate(0,180,180)").call(Vis.zoom);

    Vis.g_basemap2D = svg_FlowMap.append("g")
                        .attr("class", "basemap")
                        .call(Vis.zoom);

    Vis.g_flowContainer = svg_FlowMap.append("g")
                        .call(Vis.zoom);

    //set the gradient color
    var g_gradient = Vis.g_flowContainer.append("defs")
        .append("linearGradient")
        .attr("id", "svgGradient")
        .attr("x1", "100%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "100%");

    g_gradient.append("stop")
        .attr('class', 'start')
        .attr("offset", "0%")
        .attr("stop-color", "#ffd60d")
        .attr("stop-opacity", 1);

    g_gradient.append("stop")
        .attr('class', 'end')
        .attr("offset", "100%")
        .attr("stop-color", "#a20ddd")
        .attr("stop-opacity", 1);

    Vis.g_flows = Vis.g_flowContainer.selectAll("g")
                .data(dataShipment).enter();

    Vis.g_ports = Vis.g_flowContainer.selectAll("g")
        .data(allports).enter();

    //bind data to
    drawBaseMap();

    drawFlowsOnMap(0, "all");

    drawRingSymbolsOnMap(0, "all");

    setTimeout(callback1, 200);

    setTimeout(callback2, 200);

    setTimeout(callback3, 200);

    function drawBaseMap() {
        Vis.g_basemap2D.selectAll("path")
            .data(dataWorldGeo.features).enter()
            .append("path")
            .attr("d", Vis.path_geo)
            .attr("class", "basemap");
    }
}

function initBarChart() {

    var yearArray = yearStatisticsData.keys();

    var countarray = yearStatisticsData.values();

    //console.log("yearArray", yearArray, "countarray", countarray );

    var width = $("#barchartcontainer").width();
    var height = $("#barchartcontainer").height();

    var barcount = yearArray.length - 1;

    var unit = width / barcount;

    var scaleBarChart = d3.scaleBand().domain(yearArray)
        .paddingInner(0.5).paddingOuter(0).range([0, width]).round(0.5);

    width = width + unit;

    var yScale = d3.scaleLinear().range([0, height])
        .domain([0, d3.max(countarray)]);

    var svg_barchart = d3.select("#barchartcontainer").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + (- scaleBarChart.step() / 2) + "," + 0 + ")");

    var bars = svg_barchart.selectAll(".bar")
        .data(yearArray)
        .enter()
        .append("g");

    bars.append("rect")
        .attr("width", scaleBarChart.step())
        .attr("height", function (d,i ) {
            return  yScale(   countarray[i] );
        })
        .attr("x", function (d,i) {
            return scaleBarChart( yearArray[i]) ;
        })
        .attr("y", function (d, i) {
            return height - yScale( countarray[i] );
        })
        .attr('class',  'bar')
        .attr("name", function (d, i) {
            return yearArray[i];
        });
}

function initPieChart() {

    var map_width = $("#pieChart").width();
    var map_height = $("#pieChart").height();

    var svg_piechart = d3.select("#pieChart").append("svg")
        .attr("id", "svg_chordchart")
        .attr("width", map_width)
        .attr("height", map_height);

    var margin = {top: 5, right: 5, bottom: 5, left: 5},
        width =  svg_piechart.attr("width") - margin.left - margin.right,
        height = svg_piechart.attr("height") - margin.top - margin.bottom;

    Vis.g_pie =  svg_piechart.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var innerRadius = height / 4;
    var outerRadius = height / 2;

    Vis.path_Pie = d3.arc().outerRadius(outerRadius - 10).innerRadius(innerRadius);
    Vis.pie = d3.pie().value(function(d) { return d.value; });

    drawPieArcsOnPiechart(0);

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


    var innerRadius = height / 2.7;
    var outerRadius = height / 2.5;

    Vis.arc = d3.arc().innerRadius(innerRadius)
        .outerRadius(outerRadius);

    Vis.ribbon = d3.ribbon()
        .radius(innerRadius);

    Vis.g_chord = Vis.svg_chordchart.append("g")
        .attr("transform", "translate(" + map_width / 2 + "," + map_height / 2 + ")");

    drawRibbonsOnChord(0);
}

function drawFlowsOnMap(yearslected, portname) {

    if(yearslected ==0 && portname == "all"){
        Vis.g_flows.append("path")
            .attr("d", Vis.path_geo)
            .attr("class", "flows")
            .attr("stroke", "url(#svgGradient)")
            .attr("stroke-width", function (d) {
                return  Vis.linerValueScale(d.count);
            });
    }
    else{
        Vis.g_flows.each(function (d) {
            if(portname == "all"){
                if(d.year == yearslected ){

                    d3.select(this).append("path")
                        .attr("d", Vis.path_geo)
                        .attr("class", "flows")
                        .attr("stroke-width", function (d) {
                            return  Vis.linerValueScale(d.count);
                        })
                        .attr("stroke", "url(#svgGradient)");
                }
            }
            else if(d.year == yearslected && d.origin == portname || d.dest ==portname){
                d3.select(this).append("path")
                    .attr("d", Vis.path_geo)
                    .attr("class", "flows")
                    .attr("stroke-width", function (d) {
                        return  Vis.linerValueScale(d.count);
                    })
                    .attr("stroke", "url(#svgGradient)");
            }
        });
    }
}

function drawRingSymbolsOnMap(yearslected, portName){

    //&&portName == "all"
    if(yearslected == 0 ){
        var entriesByO = d3.nest()
            .key(function(d) { return d.origin;})
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .map(dataShipment);

        var entriesByD = d3.nest()
            .key(function(d) { return d.dest;})
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .map(dataShipment);


        var arr = entriesByO.values();
        arr.push( entriesByD.values());


        var scaleRing  = d3.scaleLinear().domain([0, d3.max(arr)]).range([2,15]);

        Vis.g_ports.each(function (d) {

            var oCount = entriesByO.get(d.portName); if(! oCount) oCount =0;
            var dCount = entriesByD.get(d.portName); if(! dCount) dCount =0;

            var color = d3.scaleOrdinal(["#ffd60d", "#a20ddd",])
                .domain([oCount, dCount]);

            var path = d3.arc()
                .outerRadius(  scaleRing( oCount + dCount) )
                .innerRadius( scaleRing( oCount + dCount)/3);
            var pie = d3.pie();


            d3.select(this).selectAll(".arc")
                .data(pie( [oCount, dCount]))
                .enter().append("path")
                .attr("d", path)
                .attr("fill", function (t, i) {
                    return color(i);
                })
                .attr("class", "ring")
                .attr("transform", "translate(" +  Vis.projection([d.log, d.lat])[0] + ","
                    +Vis.projection([d.log, d.lat])[1] + ")");
        });
    }
    else{

        var entriesByYear = d3.nest()
            .key(function (d) { return d.year; })
            .map(dataShipment);

        var entriesYearlyByO = d3.nest()
            .key(function (d) { return d.origin; })
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .map(entriesByYear.get(yearslected));


        var entriesYearlyByD = d3.nest()
            .key(function (d) { return d.dest; })
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .map(entriesByYear.get(yearslected));


        var arr = entriesYearlyByO.values();
        arr.push( entriesYearlyByD.values() );

        Vis.g_ports = Vis.g_flowContainer.selectAll("g")
            .data(allports).enter();

        var scaleRing  = d3.scaleLinear().domain([0, d3.max(arr)]).range([2, 15]);

        Vis.g_ports.each(function (d) {

            var oCount = entriesYearlyByO.get(d.portName); if(! oCount) oCount = 0;
            var dCount = entriesYearlyByD.get(d.portName); if(! dCount) dCount = 0;

            var color = d3.scaleOrdinal(["#ffd60d", "#a20ddd",])
                .domain([oCount, dCount]);

            var path = d3.arc().outerRadius(  scaleRing( oCount + dCount) ).innerRadius( scaleRing( oCount + dCount)/3);
            var pie = d3.pie();


            var arc = d3.select(this).selectAll(".arc")
                .data(pie( [oCount, dCount]))
                .enter().append("path")
                .attr("d", path)
                .attr("fill", function (t, i) {
                    return color(i);
                })
                .attr("class", "ring")
                .attr("transform", "translate(" +  Vis.projection([d.log, d.lat])[0] + ","
                    +Vis.projection([d.log, d.lat])[1] + ")");
        });
    }

}

function drawPieArcsOnPiechart(yearselected) {

    if(yearselected == 0){

        var entriesByPlace = d3.nest()
            .key(function(d) { return d.origin;})
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(dataShipment)
            .sort(function(a, b){ return d3.descending(a.value, b.value); });

        /*
        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(entriesByPlace.slice(0,10).map(function (d) {
            return d.key;
        }));
        */


        var color = d3.scaleOrdinal(
            ["#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#43a047",
                "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e",]
        ).domain(entriesByPlace.slice(0,10).map(function (d) {
            return d.key;
        }));


        var arc = Vis.g_pie.selectAll(".arc")
            .data(Vis.pie(entriesByPlace.slice(0,10)))
            .enter().append("g")
            .attr("class", "piechart");

        arc.append("path")
            .attr("d", Vis.path_Pie)
            .attr("fill", function (d) {
                return color(d.data.key);
            })
            .on("click", function (d) {

                updataFlowMap("all", d.data.key);
            });
    }
    else{


        var entriesByPlace = d3.nest()
            .key(function(d) { return d.year;})
            .key(function(d) { return d.origin;})
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(dataShipment);

        entriesByPlace.forEach(function (d) {

            if(d.key == yearselected){

                d.values.sort(function(a, b){ return d3.descending(a.value, b.value); });

                /*
                var color = d3.scaleOrdinal(d3.schemeCategory10)
                    .domain(  d.values.slice(0,10).map(function (f) { return f.key; }) );
                    */

                var color = d3.scaleOrdinal(
                    ["#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#43a047",
                        "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e",]
                ).domain(entriesByPlace.slice(0,10).map(function (d) {
                    return d.key;
                }));


                var arc = Vis.g_pie
                    .selectAll(".arc")
                    .data( Vis.pie(d.values.slice(0,10)))
                    .enter()
                    .append("g")
                    .attr("class", "piechart");

                arc.append("path")
                    .attr("d", Vis.path_Pie)
                    .attr("fill", function (d) {
                        return color(d.data.key);
                    })
                    .on("click", function (d) {
                        updataFlowMap(yearselected, d.data.key);
                    });
            }
        });
    }


}

function drawRibbonsOnChord(yearselected, portname) {

    if( yearselected == 0){

        var entriesByO = d3.nest()
            .key(function(d) { return d.origin;})
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(dataShipment)
            .sort(function(a, b){ return d3.descending(a.value, b.value); });

        var entriesByD = d3.nest()
            .key(function(d) { return d.dest;})
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(dataShipment)
            .sort(function(a, b){ return d3.descending(a.value, b.value); });


        var matirx = [];

        var top10  = entriesByO.slice(0,10);


        var size = top10.length;

        top10.forEach(function (d) {
            var array = new Array(size);
            array.fill(0);
            matirx.push(array);
        });

        var countryList = top10.map(function (d) {
            return d.key;
        })

        dataShipment.forEach(function (d) {

            var i = countryList.indexOf(d.origin);
            var j = countryList.indexOf(d.dest);

            if(i!= -1 && j != -1){

                matirx[i][j] = matirx[i][j] + d.count;
            }

        });


        var color = d3.scaleOrdinal(
            ["#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#43a047",
                "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e",]
        ).domain(countryList);


        var chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        var group = Vis.g_chord
            .datum(chord(matirx))
            .append("g")
            .attr("class", "chordgroups")
            .selectAll("g")
            .data(function (chords) {
                return chords.groups;
            })
            .enter().append("g");

        var chordPath = group.append("path")
            .style("fill", function (d) {
                return color(d.index);
            })
            .style("stroke", function (d) {
                return d3.rgb(color(d.index)).darker();
            })
            .attr("class", "chordarcs")
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
            .attr("class", "chordribbons")
            .attr("source", function (d) {
                return d.source.index;
            })
            .attr("target", function (d) {
                return d.target.index;
            })
            .style("fill", function (d) {
                return color(d.source.index);
            })
            .style("stroke", function (d) {
                return d3.rgb( color(d.target.index)).darker();
            });


        drawlabels();

    }
    else{

        var entriesByYear = d3.nest()
            .key(function (d) {
                return d.year; })
            .map(dataShipment);

        var entriesYearlyByO = d3.nest()
            .key(function (d) { return d.origin; })
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(entriesByYear.get(yearselected))
            .sort(function(a, b){ return d3.descending(a.value, b.value); });

        var entriesYearlyByD = d3.nest()
            .key(function (d) { return d.dest; })
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(entriesByYear.get(yearselected))
            .sort(function(a, b){ return d3.descending(a.value, b.value); });


        var top10_0  = entriesYearlyByO.slice(0,10).map(function (d) {
            return d.key;
        });
        var top10_D  = entriesYearlyByD.slice(0,10).map(function (d) {
            return d.key;
        });


        var intersectArray = top10_0.filter(function(n) {
            return top10_D.indexOf(n) !== -1;
        });



        if(intersectArray.length > 2){

            var matirx = [];

            intersectArray.forEach(function (d) {
                var array = new Array(intersectArray.length);
                array.fill(0);
                matirx.push(array);
            });


            var countryList = intersectArray;

            entriesByYear.get(yearselected).forEach(function (d) {
                if(d.year == yearselected){
                    var i = countryList.indexOf(d.origin);
                    var j = countryList.indexOf(d.dest);

                    if(i!= -1 && j != -1){
                        matirx[i][j] = matirx[i][j] + d.count;
                    }
                }
            });

            var test = matirx.map(function (d) {
                return d3.sum(d);
            }).reduce(function(a,b){return a*b;});
            //console.log( test);

            if(test != 0 ){

                var color = d3.scaleOrdinal(
                    ["#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#43a047",
                        "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e",]
                ).domain(countryList);

                var chord = d3.chord()
                    .padAngle(0.05)
                    .sortSubgroups(d3.descending);

                var group = Vis.g_chord
                    .datum(chord(matirx))
                    .append("g")
                    .attr("class", "chordgroups")
                    .selectAll("g")
                    .data(function (chords) {
                        return chords.groups;
                    })
                    .enter().append("g");

                var chordPath = group.append("path")
                    .style("fill", function (d) {
                        return color(d.index);
                    })
                    .style("stroke", function (d) {
                        return d3.rgb(color(d.index)).darker();
                    })
                    .attr("class", "chordarcs")
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
                    .attr("class", "chordribbons")
                    .attr("source", function (d) {
                        return d.source.index;
                    })
                    .attr("target", function (d) {
                        return d.target.index;
                    })
                    .style("fill", function (d) {
                        return color(d.source.index);
                    })
                    .style("stroke", function (d) {
                        return d3.rgb( color(d.target.index)).darker();
                    });

                drawlabels();
            }
            else{
                console.log( " matrix contains 0 row");
            }



        }
        else{
            console.log("too small: intersectArray.length ", intersectArray.length );
        }

    }

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
            .attr("dy", function (d, i) {

                if (d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2 && d.startAngle != 0) {
                    return 17;
                }
                else {
                    return - 11;
                }
            })
            .append("textPath")
            .attr("startOffset", "50%")
            .attr("xlink:href", function (d, i) {
                return "#donutArc" + i;
            })
            .text(function (d) {
                return countryList[d.index];
            })
            .attr("fill","#ffffff");

    }

}


function drawRibbonsOnChord_bak(yearselected, portname) {

    if( yearselected == 0){

        var entriesByPlace = d3.nest()
            .key(function(d) { return d.origin;})
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(dataShipment)
            .sort(function(a, b){ return d3.descending(a.value, b.value); });

        var top10ports = entriesByPlace.slice(0,10);

        var matirx = [];

        var size = top10ports.length;
        top10ports.forEach(function (d) {
            var array = new Array(size);
            array.fill(0);
            matirx.push(array);
        });

        var countryList = top10ports.map(function (d) {
            return d.key;
        })

        dataShipment.forEach(function (d) {

            var i = countryList.indexOf(d.origin);
            var j = countryList.indexOf(d.dest);

            if(i!= -1 && j != -1){

                matirx[i][j] = matirx[i][j] + d.count;
            }

        });


        var color = d3.scaleOrdinal(
            ["#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#43a047",
                "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e",]
        ).domain(countryList);


        var chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        var group = Vis.g_chord
            .datum(chord(matirx))
            .append("g")
            .attr("class", "chordgroups")
            .selectAll("g")
            .data(function (chords) {
                return chords.groups;
            })
            .enter().append("g");

        var chordPath = group.append("path")
            .style("fill", function (d) {
                return color(d.index);
            })
            .style("stroke", function (d) {
                return d3.rgb(color(d.index)).darker();
            })
            .attr("class", "chordarcs")
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
            .attr("class", "chordribbons")
            .attr("source", function (d) {
                return d.source.index;
            })
            .attr("target", function (d) {
                return d.target.index;
            })
            .style("fill", function (d) {
                return color(d.source.index);
            })
            .style("stroke", function (d) {
                return d3.rgb( color(d.target.index)).darker();
            });


        drawlabels();

    }
    else{

        var entriesByYear = d3.nest()
            .key(function (d) {
                return d.year; })
            .map(dataShipment);

        var entriesYearlyByO = d3.nest()
            .key(function (d) { return d.origin; })
            .rollup(function (v) {
                return d3.sum(v, function(k) {return k.count; }) })
            .entries(entriesByYear.get(yearselected))
            .sort(function(a, b){ return d3.descending(a.value, b.value); });


        if(entriesYearlyByO.length > 2){

            var matirx = [];

            if (entriesYearlyByO.length > 10){

                var top10ports = entriesYearlyByO.slice(0,10);

                top10ports.forEach(function (d) {
                    var array = new Array(10);
                    array.fill(0);
                    matirx.push(array);

                });

                var countryList = top10ports.map(function (d) {
                    return d.key;
                })

                entriesByYear.get(yearselected).forEach(function (d) {
                    if(d.year == yearselected){
                        var i = countryList.indexOf(d.origin);
                        var j = countryList.indexOf(d.dest);

                        if(i!= -1 && j != -1){

                            matirx[i][j] = matirx[i][j] + d.count;
                        }
                    }
                });

            }
            else{

                entriesYearlyByO.forEach(function (d) {
                    var array = new Array( entriesYearlyByO.length );
                    array.fill(0);
                    matirx.push(array);
                });


                var countryList = entriesYearlyByO.map(function (d) {
                    return d.key;
                })

                entriesByYear.get(yearselected).forEach(function (d) {

                    if(d.year == yearselected){
                        var i = countryList.indexOf(d.origin);
                        var j = countryList.indexOf(d.dest);

                        if(i!= -1 && j != -1){
                            matirx[i][j] = matirx[i][j] + d.count;
                        }
                    }

                });
            }

            var color = d3.scaleOrdinal(
                ["#d81b60", "#8e24aa", "#5e35b1", "#3949ab", "#1e88e5", "#039be5", "#43a047",
                    "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00", "#f4511e",]
            ).domain(countryList);

            var chord = d3.chord()
                .padAngle(0.05)
                .sortSubgroups(d3.descending);

            var group = Vis.g_chord
                .datum(chord(matirx))
                .append("g")
                .attr("class", "chordgroups")
                .selectAll("g")
                .data(function (chords) {
                    return chords.groups;
                })
                .enter().append("g");

            var chordPath = group.append("path")
                .style("fill", function (d) {
                    return color(d.index);
                })
                .style("stroke", function (d) {
                    return d3.rgb(color(d.index)).darker();
                })
                .attr("class", "chordarcs")
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
                .attr("class", "chordribbons")
                .attr("source", function (d) {
                    return d.source.index;
                })
                .attr("target", function (d) {
                    return d.target.index;
                })
                .style("fill", function (d) {
                    return color(d.source.index);
                })
                .style("stroke", function (d) {
                    return d3.rgb( color(d.target.index)).darker();
                });

            drawlabels();

        }

    }

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
            .attr("dy", function (d, i) {

                if (d.endAngle > Math.PI / 2 && d.endAngle < 3 * Math.PI / 2 && d.startAngle != 0) {
                    return 17;
                }
                else {
                    return - 11;
                }
            })
            .append("textPath")
            .attr("startOffset", "50%")
            .attr("xlink:href", function (d, i) {
                return "#donutArc" + i;
            })
            .text(function (d) {
                return countryList[d.index];
            })
            .attr("fill","#ffffff");

    }

}

function updateViews(yearselected, portName) {
    updataFlowMap( yearselected, portName);
    //updatePieChart(yearselected, portName);
    updateChordChart(yearselected, portName);
}

function updataFlowMap(yearslected, portname) {

    d3.selectAll(".flows").remove();
    drawFlowsOnMap(yearslected, portname);

    d3.selectAll(".ring").remove();
    drawRingSymbolsOnMap(yearslected, portname);
}

function updatePieChart(yearselected, portName){
    Vis.g_pie.selectAll(".piechart").remove();
    drawPieArcsOnPiechart(yearselected);
}

function updateChordChart(yearselected, portName) {
    d3.selectAll(".chordarcs").remove();
    d3.selectAll(".chordribbons").remove();
    d3.selectAll(".chordlabel").remove();
    d3.selectAll(".chordgroups").remove();
    drawRibbonsOnChord(yearselected, portName);
}
//--------------- utilities ------------------
function zoomed() {
    Vis.g_basemap2D.attr("transform", d3.event.transform);
    d3.selectAll(".flows").attr("transform", d3.event.transform);
    d3.selectAll(".port").attr("transform", d3.event.transform);
}
