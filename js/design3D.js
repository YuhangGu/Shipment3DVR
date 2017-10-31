/**
 * Created by Aero on 23/02/2017.
 */

function designInit() {
    initialize();
    //drawBisicElements();
    //drawFlows();
    drawSTC();
}

var graphics3D = {
    //doc div parameters
    windowdiv_width: $("#height").width(),
    windowdiv_height: 600,

    camera: null,
    glScene: null,
    glRenderer: null,
    controls: null,

    //2D graphic
    map_length: 2800,
    map_width: 2400,
    map_height: 2400
}

function initialize() {

    graphics3D.camera = new THREE.PerspectiveCamera( 50,
        graphics3D.windowdiv_width / graphics3D.windowdiv_height, 0.1, 10000);

    graphics3D.camera.position.set(0, -5000, 3000)

    //reate two renders
    graphics3D.glRenderer = createGlRenderer();
    graphics3D.cssRenderer = createCssRenderer();


    var mapdiv = document.getElementById("height");
    mapdiv.appendChild(graphics3D.cssRenderer.domElement);

    graphics3D.cssRenderer.domElement.appendChild(graphics3D.glRenderer.domElement);
    graphics3D.glRenderer.shadowMap.enabled = true;
    graphics3D.glRenderer.shadowMap.type = THREE.PCFShadowMap;
    graphics3D.glRenderer.shadowMapAutoUpdate = true;


    graphics3D.glScene = new THREE.Scene();
    graphics3D.cssScene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight(0x445555);
    graphics3D.glScene.add(ambientLight);
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1000, -2, 30).normalize();
    graphics3D.glScene.add(directionalLight);
    var directionalLight1 = new THREE.DirectionalLight(0xffffff);
    directionalLight1.position.set(-1000, -2, 3000).normalize();
    graphics3D.glScene.add(directionalLight1);

    graphics3D.controls = new THREE.TrackballControls(graphics3D.camera, graphics3D.cssRenderer.domElement);
    graphics3D.controls.rotateSpeed = 2;
    graphics3D.controls.minDistance = 30;
    graphics3D.controls.maxDistance = 8000;

    var visualizationMesh = new THREE.Object3D();
    graphics3D.glScene.add(visualizationMesh);

    update();
}

function drawBisicElements() {

    var material = new THREE.MeshBasicMaterial({
        color: "#1c554d",
        opacity: 2,
        side: THREE.DoubleSide,
        //blending : THREE.NoBlending
    });

    var geometry = new THREE.PlaneGeometry(graphics3D.map_length, graphics3D.map_width);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    mesh.receiveShadow = true;

    graphics3D.glScene.add(mesh);

    //-------
    var material = new THREE.LineBasicMaterial({
        color: "#ffc835"
    });

    //add aixs
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3( -1400, -1200, 0 ),
        new THREE.Vector3( -1400, 1200, 0 ),
        new THREE.Vector3( 1400, 1200, 0 ),
        new THREE.Vector3( -1400, 1200, 0 ),
        new THREE.Vector3( -1400, 1200, 2000 )

    );
    var line = new THREE.Line( geometry, material );
    graphics3D.glScene.add( line );

}


function drawFlows(){

    var curve = new THREE.CatmullRomCurve3( [
        new THREE.Vector3( 0, 0, 0 ),
        new THREE.Vector3( 600,  0, 1000),
        new THREE.Vector3( 1200, 0, 0 )
    ] );


    //TubeGeometry(path, tubularSegments, radius, radiusSegments, closed)
    var geometry = new THREE.TubeGeometry( curve, 1000, 50, 300, false );

    var material = new THREE.MeshLambertMaterial( { color: "#1cb6e2" } );
    var mesh = new THREE.Mesh( geometry, material );

    graphics3D.glScene.add( mesh );



}

function createGlRenderer() {
    var glRenderer = new THREE.WebGLRenderer({alpha: true});
    glRenderer.setClearColor(0x3D3252);
    glRenderer.setPixelRatio(window.devicePixelRatio);
    glRenderer.setSize(graphics3D.windowdiv_width, graphics3D.windowdiv_height);
    glRenderer.domElement.style.position = 'absolute';
    glRenderer.domElement.style.zIndex = 1;
    glRenderer.domElement.style.top = 0;
    return glRenderer;
}

function createCssRenderer() {
    var cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(graphics3D.windowdiv_width, graphics3D.windowdiv_height);
    graphics3D.glRenderer.domElement.style.zIndex = 0;
    cssRenderer.domElement.style.top = 0;
    return cssRenderer;
}


function update() {
    graphics3D.controls.update();
    graphics3D.glRenderer.render(graphics3D.glScene, graphics3D.camera);
    graphics3D.cssRenderer.render(graphics3D.cssScene, graphics3D.camera);
    requestAnimationFrame(update);
}

function drawSTC() {

    var controls, camera, glScene, cssScene, glRenderer, cssRenderer;
    var map_length, map_width, map_height;
    map_length = 2800;
    map_width = 2400;
    map_height = 2000;
    var map_center = {lat: 54.875 , lng: 30.9};
    var map_scale = 8;

    function createMap() {

        var material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        var geometry = new THREE.PlaneGeometry(map_length, map_width);
        var mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;
        mesh.receiveShadow	= true;
        glScene.add(mesh);

        var mapstyles = ["mapbox.streets",
            "mapbox.light",
            "mapbox.dark",
            "mapbox.satellite",
            "mapbox.streets-satellite",
            "mapbox.wheatpaste",
            "mapbox.streets-basic",
            "mapbox.comic",
            "mapbox.outdoors",
            "mapbox.run-bike-hike",
            "mapbox.pencil",
            "mapbox.pirates",
            "mapbox.emerald",
            "mapbox.high-contrast"
        ];

        d3.selectAll('.map-div')
            .data([1]).enter()
            .append("div")
            .attr("class", "map-div")
            .attr("id","mappad")
            .each(function (d) {

                var map = L.mapbox.map("mappad", "mapbox.emerald").setView([map_center.lat, map_center.lng],map_scale);

                theMap = map;
            });

        var mapcontener = document.getElementById("mappad");
        var cssObject = new THREE.CSS3DObject(mapcontener);
        cssObject.position.x = 0;
        cssObject.position.y = 0;
        cssObject.position.z = 0;
        cssObject.receiveShadow	= true;
        //cssObject.rotation.x = 100;
        //cssObject.rotation.y = 100;
        //cssObject.rotation.z = 100;
        cssScene.add(cssObject);

    }

    function creatTheAixs(){


        var material = new THREE.LineBasicMaterial({
            color: "#08090b"
        });

        //add aixs
        var geometry = new THREE.Geometry();

        geometry.vertices.push(
            new THREE.Vector3( -map_length/2, map_width/2, map_height),
            new THREE.Vector3( -map_length/2, map_width/2, 0),
            new THREE.Vector3(  map_length/2, map_width/2, 0),
            new THREE.Vector3(  map_length/2, map_width/2, map_height),
            new THREE.Vector3( -map_length/2, map_width/2, map_height),
            new THREE.Vector3( -map_length/2, - map_width/2, map_height),
            new THREE.Vector3( -map_length/2, - map_width/2, 0)

        );
        var line = new THREE.Line( geometry, material );

        glScene.add( line );

    }

    function convert(vertex) {
        return new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
    }

    function drawCylinderLines(vertices,troops,temperatures,coor) {

        var vertex, geometry, material, mesh;

        var max = 96000;
        var min = 1;

        //set the range of troops
        var trooplinear = d3.scale.linear().domain([min, max]).range([2, 20]);
        var temperaturelinear = d3.scale.linear().domain([d3.min(temperatures), d3.max(temperatures)])
            .range([ "blue","red"]);

        var segments = new THREE.Object3D();
        vertices = vertices.map(convert);

        var polyline_options = { color: '#000' ,weight: 20};
        var line_points = [];
        for (var i = 1, len = vertices.length - 1; i < len; i++) {

            var path = new THREE.CatmullRomCurve3([vertices[i-1],vertices[i], vertices[i+1]]);
            var color = temperaturelinear(temperatures[i]);
            vertex = vertices[i];

            geometry = new THREE.TubeGeometry(path, 4 ,trooplinear(troops[i]) ,16);
            material = new THREE.MeshLambertMaterial({
                opacity: 1,
                transparent: true,
                color: color
            });

            mesh = new THREE.Mesh(geometry, material)
            mesh.castShadow = true;

            segments.add(mesh);

            /*
            var point1 = coor[i-1];
            var point2 = coor[i];
            line_points.push(point2);
            */
        }

        //var polyline = L.polyline(line_points, polyline_options).addTo(theMap);

        return segments;
    }

    function drawLinesOnPlane(troops,coor){

        var max = 96000;
        var min = 1;

        var trooplinear = d3.scale.linear().domain([min, max]).range([2, 20]);

        var polyline_options = { color: '#000' ,weight: 20};
        var line_points = [];
        for (var i = 1, len = coor.length - 1; i < len; i++) {

            var point1 = coor[i-1];
            var point2 = coor[i];
            line_points.push(point2);
        }

        var polyline = L.polyline(line_points, polyline_options).addTo(theMap);

        return polyline;
    }

    function createFlows() {
        //mapbox polyline options

        d3.json("data/minardData.json", function(error, data){
            //console.log("data",data);
            var pointOrigin = theMap.getPixelOrigin();

            var point_center = theMap.project(L.latLng(map_center.lat, map_center.lng));
            console.log("point_center",point_center,"pointOrigin",pointOrigin);

            var point = new THREE.Vector3(0,0,0);

            data.features.forEach(function(feature){

                var coor = [];

                var geometry = new THREE.Geometry();

                var points = [], troops = [], temperatures = [], count = feature.attribute.length;

                for(var i = 0; i < count; i++)
                {
                    var stop = feature.attribute[i];

                    var temp_point =  theMap.project( L.latLng(stop.Latitude, stop.Longitude));

                    point.x = temp_point.x - pointOrigin.x - map_length/2;
                    point.y = 2* point_center.y - temp_point.y - pointOrigin.y - map_width/2 ;
                    point.z = stop.Day*10;

                    geometry.vertices.push(
                        new THREE.Vector3(point.x - pointOrigin.x, 2* point_center.y - point.y - pointOrigin.y , i*10 )
                    );

                    coor.push({lat:stop.Latitude, lng:stop.Longitude });
                    points.push([point.x, point.y, point.z]);
                    troops.push(feature.attribute[i].Troops);
                    temperatures.push(feature.attribute[i].Temperature);

                }

                //console.log("coor", coor);

                var lineflyying = drawCylinderLines(points,troops,temperatures,coor);
                lineflyying.castShadow = true;
                lineflyying.receiveShadow = true;
                glScene.add(lineflyying);

                drawLinesOnPlane(troops,coor);

            });
        });

    }

    function initialize() {

        camera = new THREE.PerspectiveCamera(
            85,
            graphics3D.windowdiv_width / graphics3D.windowdiv_height,
            0.1,
            8000);
        camera.position.set(0, -3000, 5000)
        glRenderer = createGlRenderer();
        cssRenderer = createCssRenderer();

        cssRenderer.domElement.appendChild(glRenderer.domElement);
        glRenderer.shadowMap.enabled = true;
        glRenderer.shadowMap.type = THREE.PCFShadowMap;
        glRenderer.shadowMapAutoUpdate = true;
        cssRenderer.shadowMapEnabled = true;
        cssRenderer.shadowMapType = THREE.PCFShadowMap;
        cssRenderer.shadowMapAutoUpdate = true;


        var mapdiv = document.getElementById("time");
        mapdiv.appendChild(cssRenderer.domElement);

        glScene = new THREE.Scene();
        cssScene = new THREE.Scene();
        var ambientLight = new THREE.AmbientLight(0x555555);
        glScene.add(ambientLight);
        var directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set( 1000, -2, 10 ).normalize();
        glScene.add(directionalLight);

        var directionalLight_3 = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        directionalLight_3.position.set(1400, 800, 2300);
        directionalLight_3.target.position.set( 1400, 800, 0 );
        directionalLight_3.castShadow = true;
        directionalLight_3.shadow.camera.near	= 0.01;
        directionalLight_3.shadow.camera.far	= 3000;
        directionalLight_3.shadow.camera.top = 800;
        directionalLight_3.shadow.camera.bottom = -800;
        directionalLight_3.shadow.camera.left  = -1400;
        directionalLight_3.shadow.camera.right = 1400;


        glScene.add(directionalLight_3);


        L.mapbox.accessToken = 'pk.eyJ1IjoiaXRjYWVybyIsImEiOiJjaWxuZmtlOHQwMDA2dnNseWMybHhvMXh0In0.DObc4iUf1_86LxJGF0RHog';
        var theMap = null;

        creatTheAixs();

        createMap();

        createFlows();


        controls = new THREE.TrackballControls(camera,cssRenderer.domElement);
        controls.rotateSpeed = 2;
        controls.minDistance = 30;
        controls.maxDistance = 8000;

        update();
    }

    function update() {
        controls.update();
        glRenderer.render(glScene, camera);
        cssRenderer.render(cssScene, camera);
        requestAnimationFrame(update);
    }

    $(document ).ready(function() {
        initialize();
    });
}

