var brithToResDataVR = [];
var group = new THREE.Group();

var positions = [];
var indices = [];

function init() {

    AFRAME.registerComponent('flows', {
        schema:{
            linewidth : {type: "float", default: 0.5}
        },
        init: function () {

            var el = this.el;

            readData(showdata);


            function readData(callback) {

                d3.json( "../data/BrithToResidence.json",function(data){
                    brithToResDataVR = data;
                    var width = 8, height = 4;


                    var projection = d3.geoMercator().scale( height / Math.PI)
                        .translate([ 0, 0])
                        .rotate([ 0, 0, 0]);


                    var k = 0;


                    for(var i = 0 , j = 0; i <  brithToResDataVR.placesFlows.length; i ++, j ++){

                        var d= brithToResDataVR.placesFlows[i]
                        if(d[0] == d[2] && d[1] == d[3]){

                        }
                        else{

                            var pointOrigin         = projection([   parseFloat(d[1]),  parseFloat(d[0]) ]);
                            var pointDestination    = projection([   parseFloat(d[3]),  parseFloat(d[2]) ]);

                            var origin = new THREE.Vector3( pointOrigin[0] , -pointOrigin[1] , 0);
                            var destination = new THREE.Vector3( pointDestination[0] ,  -pointDestination[1] , 0);

                            var ctrl1 = new THREE.Vector3( pointOrigin[0]/4*3 + pointDestination[0]/4,
                                - pointOrigin[1]/4*3 -pointDestination[1]/4,
                                0.1 * d[4]  );

                            var ctrl2 = new THREE.Vector3(  pointOrigin[0]/4 + pointDestination[0]/4*3,
                                - pointOrigin[1]/4 -pointDestination[1]/4*3,
                                0.1 * d[4]   );

                            var curve = new THREE.CubicBezierCurve3(
                                origin,ctrl1,ctrl2,destination
                            );


                            var geometry = new THREE.Geometry();
                            geometry.vertices = curve.getPoints( 10 );


                            var vx =  curve.getPoints( 10 );


                            for(var k = 0 ; k< 11; k ++){
                                positions.push(vx[k].x, vx[k].y, vx[k].z);
                            }

                            var count = positions.length/3;

                            //console.log("count",count);
                            indices.push(   count - 1 , count - 2,
                                            count - 2 , count - 3,
                                            count - 3 , count - 4,
                                            count - 4 , count - 5,
                                            count - 5 , count - 6,
                                            count - 6 , count - 7,
                                count - 7 , count - 8,
                                count - 8 , count - 9,
                                count - 9 , count - 10,
                                count - 10 , count - 11);


                            /*
                            var material = new THREE.LineBasicMaterial({
                                color: "#2095e2",
                                linewidth: 1
                            });

                            var curveObject = new THREE.Line( geometry, material );
                            group.add(curveObject);
                            */

                        }
                    }

                    /*
                    brithToResDataVR.placesFlows.forEach(function (d, i) {

                        if(d[0] == d[2] && d[1] == d[3]){

                        }
                        else{

                            var pointOrigin         = projection([   parseFloat(d[1]),  parseFloat(d[0]) ]);
                            var pointDestination    = projection([   parseFloat(d[3]),  parseFloat(d[2]) ]);

                            var origin = new THREE.Vector3( pointOrigin[0] , -pointOrigin[1] , 0);
                            var destination = new THREE.Vector3( pointDestination[0] ,  -pointDestination[1] , 0);

                            var ctrl1 = new THREE.Vector3( pointOrigin[0]/4*3 + pointDestination[0]/4,
                                - pointOrigin[1]/4*3 -pointDestination[1]/4,
                                0.5 * d[4]  );

                            var ctrl2 = new THREE.Vector3(  pointOrigin[0]/4 + pointDestination[0]/4*3,
                                - pointOrigin[1]/4 -pointDestination[1]/4*3,
                                0.5 * d[4]   );

                            var curve = new THREE.CubicBezierCurve3(
                                origin,ctrl1,ctrl2,destination
                            );


                            var geometry = new THREE.Geometry();
                            geometry.vertices = curve.getPoints( 10 );


                            var vx =  curve.getPoints( 9 );


                            if(k = 100){

                                console.log(vx);

                            }

                            for(var j = 0 ; j < 10; j ++){
                                positions.push(vx[j].x, vx[j].y, vx[j].z);

                            }

                            // 0-1-2-3-4-5-6-7-8-9

                            indices.push(   k*10 + 0, k*10 + 1,
                                            k*10 + 1, k*10 + 2,
                                            k*10 + 2, k*10 + 3,
                                            k*10 + 3, k*10 + 4,
                                            k*10 + 4, k*10 + 5,
                                            k*10 + 5, k*10 + 6,
                                            k*10 + 6, k*10 + 7,
                                            k*10 + 7, k*10 + 8,
                                            k*10 + 8, k*10 + 9);

                            k++;




                        }

                    });
                    */

                    setTimeout(callback, 200);

                } );


            }

            function showdata() {


                var geometry = new THREE.BufferGeometry();
                var material = new THREE.LineBasicMaterial( {  color: "#2095e2",
                    linewidth: 2} );

                geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
                geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1));

                var mesh = new THREE.LineSegments( geometry, material );

                el.setObject3D('lineSegments',mesh);
            }





            



            /*
            this.geometry = group;


            //this.mesh = new THREE.LineSegments( this.geometry, this.material);

            var el = this.el;
            el.setObject3D('lineSegments',group);
            */

        },

        update: function () {

        }

    });

}
