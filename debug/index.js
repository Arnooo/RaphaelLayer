(function() {
    var jsonStr = false;
    jsonStr = "{\"editor\":false,\"stories\":{},\"currentStoryID\":\"-JbXTzwEzB5O_hyP_Rll\",\"tiles\":{\"url\":\"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}\",\"options\":{\"attribution\":\"<a href=\\\"#/wavel/conditions\\\">Conditions</a> | © <a href=\\\"http://www.openstreetmap.org/copyright\\\">OpenStreetMap</a> contributors\"}},\"layers\":{\"baselayers\":{\"topo\":{\"name\":\"Topography map\",\"type\":\"xyz\",\"visible\":true,\"url\":\"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}\",\"layerParams\":{\"zIndex\":1,\"opacity\":0.6},\"layerOptions\":{\"zIndex\":1,\"opacity\":0.6}}},\"overlays\":{\"-JbY_ttBpztGpHpYsk8c\":{\"name\":\"Raphael\",\"type\":\"raphael\",\"visible\":true,\"layerParams\":{\"index\":20,\"type\":\"BezierAnim\",\"attribut\":{\"stroke\":\"blue\",\"stroke-width\":4},\"callbacks\":{},\"objectOptions\":{\"info\":{\"story\":\"-JbXTzwEzB5O_hyP_Rll\"},\"transition\":{\"animationDuration\":1000,\"icon\":{\"url\":\"img/markers/map/pin/circle/favourite1.png\",\"size\":[32,51],\"anchor\":[16,51],\"hideOnStop\":true,\"stopAt\":1}},\"markers\":[{\"latlng\":{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},\"icon\":{\"anchor\":[16,47],\"size\":[32,47],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/adding.png\"}},{\"latlng\":{\"lat\":16.50985588954216,\"lng\":-8.1298828125}},{\"latlng\":{\"lat\":16.551961721972525,\"lng\":-1.669921875},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/air2.png\"}},{\"latlng\":{\"lat\":37.20367920167702,\"lng\":-3.3837890625}},{\"latlng\":{\"lat\":44.08758502824518,\"lng\":-2.8125},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/favourite1.png\"}}],\"markersInfos\":[{\"tileID\":\"-JbYEAsO4BrFlINhsXsT\"},{\"controlID\":0},{\"tileID\":\"-JbYEEN-FF_6ZFgO87st\"},{\"controlID\":1},{\"tileID\":\"-JbY_ttBpztGpHpYsk8c\"}],\"pathInfo\":{\"storyID\":0},\"editor\":false},\"markers\":[{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},{\"lat\":16.50985588954216,\"lng\":-8.1298828125},{\"lat\":16.551961721972525,\"lng\":-1.669921875},{\"lat\":37.20367920167702,\"lng\":-3.3837890625},{\"lat\":44.08758502824518,\"lng\":-2.8125}]},\"layerOptions\":{\"index\":20,\"type\":\"BezierAnim\",\"attribut\":{\"stroke\":\"blue\",\"stroke-width\":4},\"callbacks\":{},\"objectOptions\":{\"info\":{\"story\":\"-JbXTzwEzB5O_hyP_Rll\"},\"transition\":{\"animationDuration\":1000,\"icon\":{\"url\":\"img/markers/map/pin/circle/favourite1.png\",\"size\":[32,51],\"anchor\":[16,51],\"hideOnStop\":true,\"stopAt\":1}},\"markers\":[{\"latlng\":{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},\"icon\":{\"anchor\":[16,47],\"size\":[32,47],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/adding.png\"}},{\"latlng\":{\"lat\":16.50985588954216,\"lng\":-8.1298828125}},{\"latlng\":{\"lat\":16.551961721972525,\"lng\":-1.669921875},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/air2.png\"}},{\"latlng\":{\"lat\":37.20367920167702,\"lng\":-3.3837890625}},{\"latlng\":{\"lat\":44.08758502824518,\"lng\":-2.8125},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/favourite1.png\"}}],\"markersInfos\":[{\"tileID\":\"-JbYEAsO4BrFlINhsXsT\"},{\"controlID\":0},{\"tileID\":\"-JbYEEN-FF_6ZFgO87st\"},{\"controlID\":1},{\"tileID\":\"-JbY_ttBpztGpHpYsk8c\"}],\"pathInfo\":{\"storyID\":0},\"editor\":false},\"markers\":[{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},{\"lat\":16.50985588954216,\"lng\":-8.1298828125},{\"lat\":16.551961721972525,\"lng\":-1.669921875},{\"lat\":37.20367920167702,\"lng\":-3.3837890625},{\"lat\":44.08758502824518,\"lng\":-2.8125}]}}}},\"autoCenter\":false}";
   
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
        for(var key in jsonData.layers.overlays){
			var obj = jsonData.layers.overlays[key];
			map.setView(obj.layerParams.markers[0], 4)
			addLayer(obj.layerParams.markers,
					 obj.layerParams.objectOptions.markers,
					 obj.layerParams.objectOptions.markersInfos
			);
		}
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
