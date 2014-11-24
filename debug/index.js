(function() {
    var jsonStr = false;
//     jsonStr = "{\"simplelogin1story26\":{\"name\":\"Raphael\",\"type\":\"raphael\",\"visible\":true,\"layerParams\":{\"index\":20,\"type\":\"BezierAnim\",\"attribut\":{\"stroke\":\"blue\",\"stroke-width\":1},\"callbacks\":{},\"objectOptions\":{\"info\":{\"story\":\"simplelogin1story26\"},\"transition\":{\"animationDuration\":1000,\"icon\":{\"url\":\"img/markers/map/pin/circle/tent1.png\",\"size\":[32,51],\"anchor\":[16,51],\"hideOnStop\":true,\"stopAt\":0.5}},\"markersInfos\":[{\"tileID\":\"simplelogin1story26tile0\"},{\"controlID\":0},{\"tileID\":\"simplelogin1story26tile1\"},{\"controlID\":1},{\"tileID\":\"simplelogin1story26tile2\"},{\"controlID\":2},{\"tileID\":\"simplelogin1story26tile3\"},{\"controlID\":3},{\"tileID\":\"simplelogin1story26tile4\"},{\"controlID\":4},{\"tileID\":\"simplelogin1story26tile5\"},{\"controlID\":5},{\"tileID\":\"simplelogin1story26tile6\"},{\"controlID\":6},{\"tileID\":\"simplelogin1story26tile7\"}],\"pathInfo\":{\"storyID\":0},\"startAnimateTimeout\":0},\"markers\":[{\"lat\":53.00763253122568,\"lng\":-123.12302080914378},{\"lat\":47.61198227584828,\"lng\":-118.4700643341057},{\"lat\":48.69111232692376,\"lng\":-113.81710785906762},{\"lat\":51.554875213769265,\"lng\":-116.86100230319425},{\"lat\":52.50946284271777,\"lng\":-115.84637082181871},{\"lat\":47.40213472745381,\"lng\":-122.11464122403413},{\"lat\":48.423600350506604,\"lng\":-120.02521775662899},{\"lat\":50.265956813818775,\"lng\":-118.1909971497953},{\"lat\":50.88007563492283,\"lng\":-116.3567765429616},{\"lat\":52.73224493546877,\"lng\":-120.27283791452646},{\"lat\":53.34963470231742,\"lng\":-118.96748412400484},{\"lat\":55.461546364822425,\"lng\":-128.00670235184953},{\"lat\":56.16551691899076,\"lng\":-124.99362960923463},{\"lat\":59.224630644894205,\"lng\":-127.10775047773495},{\"lat\":60.24433522019535,\"lng\":-126.40304352156818}]}}}";
    
    var map = new L.Map('map');
    var tiles = new L.TileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18
    });
    var adelaide = new L.LatLng(-34.93027490891421, 138.603875041008);
    map.setView(adelaide, 13).addLayer(tiles);
    
    var addLayer = function(bezierPoints, iconsArray, infosArray){
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
    };
    


    
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
    
    if(jsonStr){
        var jsonData = JSON.parse(jsonStr);
        console.log(jsonData);
        map.setView(jsonData.simplelogin1story26.layerParams.markers[0], 5)
        addLayer(jsonData.simplelogin1story26.layerParams.markers,
                 null,
                 jsonData.simplelogin1story26.layerParams.objectOptions.markersInfos
        );
    }
    else{
        
    }
    

    var updateControls = function(){
        map.removeControl(myControls);
        myControls = L.control.layers(baseMaps, overlayMaps);
        map.addControl(myControls);
    };  
        
   
    var onClickEvent = function(e) {
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
            
            addLayer(bezierPoints, iconsArray, infosArray);
            updateControls();
        }
    };

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
   
   
   map.on('click', onClickEvent);

})();