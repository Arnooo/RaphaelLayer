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
    var controlsArray = [];
    var drag = false;
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
   /*     pulseArray.push(new R.Pulse( 
            e.latlng, 
            6,
            {'stroke': '#2478ad', 'fill': '#30a3ec'}, 
            {'stroke': '#30a3ec', 'stroke-width': 3}
        ));
        map.addLayer(pulseArray[pulseArray.length-1]);*/
        
        if(points.length >= 1){

            if(overlayMaps["BezierAnim"]){
                map.removeLayer(overlayMaps["BezierAnim"]);
            }
            var iconsArray = [];
            var bezierPoints = [];
            var infosArray = [];
            var addPoint = function(point, info, useIcon){
                bezierPoints.push(point);
                infosArray.push(info);
                if(useIcon){
                    iconsArray.push({
                        latlng:point,
                        icon:{
                            url:"libs/leaflet/images/marker-icon.png",
                            size:[32, 51],
                            anchor: [16, 51]
                        }
                    });
                }
                else{
                    iconsArray.push({
                        latlng:point
                    });
                }
            };

            addPoint(points[0], {tileID:0}, true);
            for(var i = 1; i < points.length; i++){
                //Compute controls points
                var firstControl = Object.create(points[i-1]);
                var secondControl = Object.create(points[i]);
                var offset = {
                    lat: (secondControl.lat - firstControl.lat) / 4.0,
                    lng: (secondControl.lng - firstControl.lng) / 2.0
                };
                firstControl.lat += Math.abs(offset.lat);
                firstControl.lng += Math.abs(offset.lng);
                secondControl.lat -= Math.abs(offset.lat);
                secondControl.lng -= Math.abs(offset.lng);

                //Push points in order
                if(i - 1 < controlsArray.length){
                    addPoint(controlsArray[i-1], {controlID:i-1}, false);
                }
                else{
                    controlsArray.push(secondControl);
                    addPoint(secondControl, {controlID:i-1}, false);
                }
                addPoint(points[i], {tileID:i}, true);
            }

            var bezierAnim = new R.BezierAnim(bezierPoints, {stroke: "red", "stroke-width": 4}, 
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
                    onClickMarker:function(data){
                        console.log(data)
                    },
                    onClickPath:function(data){
                        console.log(data)
                    },
                    onDragControls:function(data){
                        if(data.info){
                            if(data.info.tileID >= 0 ){
                                points[data.info.tileID].lat = data.latlng.lat;
                                points[data.info.tileID].lng = data.latlng.lng;
                            }
                            else if(data.info.controlID >= 0){
                                controlsArray[data.info.controlID].lat = data.latlng.lat;
                                controlsArray[data.info.controlID].lng = data.latlng.lng;
                            }
                        }
                    }
                },
                {
                    transition: {
                        animationDuration: 1000,
                        icon:{
                            url:"libs/leaflet/images/marker-icon.png",
                            size:[32, 51],
                            anchor: [16, 51],
                            hideOnStop: false,
                            stopAt: 0.7
                        }
                    },
                    markers:iconsArray,
                    markersInfos:infosArray,
                    pathInfo:{storyID:0},
                    startAnimateTimeout: 0,
                    editor: false
                }
            );
            map.addLayer(bezierAnim);
            overlayMaps["BezierAnim"] = bezierAnim;
            updateControls();
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