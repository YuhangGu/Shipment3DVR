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

                d3.json( "../data/shipment.json",function(data){
                    brithToResDataVR = data.features;
                    var width = 8, height = 4;

                    var projection = d3.geoMercator().scale( height / Math.PI)
                        .translate([ 0, 0])
                        .rotate([ 0, 0, 0]);


                    for(var i = 0 , j = 0; i <  brithToResDataVR.length; i ++, j ++){

                        var d = brithToResDataVR[i].geometry.coordinates;
                        var dcount = brithToResDataVR[i].count;

                        var num = d.length;


                        if(num>1){

                            if(d[0][0] == d[num-1][0] && d[0][1] == d[num-1][1] ){

                            }
                            else{

                                var pointOrigin         = projection([   parseFloat(d[0][0]),  parseFloat(d[0][1])]);
                                var pointDestination    = projection([   parseFloat( d[num-1][0]),  parseFloat(d[num-1][1]) ]);

                                var origin = new THREE.Vector3( pointOrigin[0] , -pointOrigin[1] , 0);
                                var destination = new THREE.Vector3( pointDestination[0] ,  -pointDestination[1] , 0);

                                var ctrl1 = new THREE.Vector3( pointOrigin[0]/4*3 + pointDestination[0]/4,
                                    - pointOrigin[1]/4*3 -pointDestination[1]/4,
                                    0.1 * dcount );

                                var ctrl2 = new THREE.Vector3(  pointOrigin[0]/4 + pointDestination[0]/4*3,
                                    - pointOrigin[1]/4 -pointDestination[1]/4*3,
                                    0.1 * dcount   );

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

                            }
                        }


                    }

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

        },

        update: function () {

        }

    });

}
