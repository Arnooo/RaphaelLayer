(function() {
    var map = new L.Map('map');
    var tiles = new L.TileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18
    });
    var adelaide = new L.LatLng(-34.93027490891421, 138.603875041008);
    map.setView(adelaide, 13).addLayer(tiles);


   // var m = new R.Marker(adelaide);
   // map.addLayer(m);

    var baseMaps = {};
    var overlayMaps = {};
    var myControls = L.control.layers(baseMaps, overlayMaps);
    map.addControl(myControls);

    var points = [];
    var drag = false;
    var bezierAnim = null;
    var pulseArray = [];

    var updateControls = function(){
        map.removeControl(myControls);
        myControls = L.control.layers(baseMaps, overlayMaps);
        map.addControl(myControls);
    };  
        
    map.on('click', function(e) {
        if(drag){
            drag = false;
            return;
        }
        points.push(e.latlng);

//         if(points.length == 4) {
//             var p = new R.Polygon(points);
//             map.addLayer(p);
//             p.hover(function() {
// 
//             },
//             function() {
//                 p.animate({opacity: 0}, 1000, function() { map.removeLayer(p); });
// 
//             });
// 
//             points = [];
//         }
        pulseArray.push(new R.Pulse( 
            e.latlng, 
            6,
            {'stroke': '#2478ad', 'fill': '#30a3ec'}, 
            {'stroke': '#30a3ec', 'stroke-width': 3}
        ));
        map.addLayer(pulseArray[pulseArray.length-1]);
        
        if(points.length >= 4){
            if(bezierAnim){
                map.removeLayer(bezierAnim);
            }
            bezierAnim = new R.BezierAnim(points, {}, 
                {
                    onAnimationEnd: function(){
                        console.log("onAnimationEnd");
                        for(var i = 0; i < pulseArray.length; i++){
                            map.removeLayer(pulseArray[i]);
                        }
                    },
                    onHoverControls:function(){
                        drag = true;
                    },
                    onDragControls:function(data){
                        console.log(data);
                    }
                },
                {
                    transition: {
                        startAnimateTimeout: 0,
                        animationDuration: 1000,
                        icon:{
                            url:"libs/leaflet/images/marker-icon.png",
                            size:[32, 51],
                            anchor: [16, 51],
                            hideOnStop: false,
                            stopAt: 0.7
                        }
                    },
                    editor:true
                }
            );
            map.addLayer(bezierAnim);
            overlayMaps["BezierAnim"] = bezierAnim;
            updateControls();
            points = [];
        }
        
    });

   /* var geo = new R.GeoJSON(multi_geo);

    map.addLayer(geo);
    geo.hover(
        function() { 

        }, 
        function() { 
            geo.animate(
                {opacity: 0}, 
                1000, 
                function() { 

                })}, 
            geo, 
            geo);*/

})();