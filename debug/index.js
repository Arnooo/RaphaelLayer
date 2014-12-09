var CURRENT_DRAWING = "BezierAnim";

function onChangeDrawing(value){
    CURRENT_DRAWING = value;
};  

var OMap = {
    _map: null,
    _baseMaps: {},
    _overlayMaps: {},
    getMap: function(){
        return this._map;
    },
    init: function(jsonData){
        var self = this;
        self._map = new L.Map('map');

        var tiles = new L.TileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '',
            maxZoom: 18
        });  
        var adelaide = new L.LatLng(-34.93027490891421, 138.603875041008);
        self._map.setView(adelaide, 13).addLayer(tiles);  


        var myControls = L.control.layers(self._map._baseMaps, self._map._overlayMaps);
        self._map.addControl(myControls);
        
        if(jsonData){
            for(var key in jsonData.layers.overlays){
                var obj = jsonData.layers.overlays[key];
                self._map.setView(obj.layerParams.markers[0], 4)
                self.addLayer(obj.layerParams.markers,
                         obj.layerParams.objectOptions.markers,
                         obj.layerParams.objectOptions.markersInfos
                );
            }
        }
    },
    on:function(eventName, callback){
		var self = this;
        self._map.on(eventName, callback);
	},
    off:function(eventName, callback){
		var self = this;
        self._map.off(eventName, callback);
	},
    update: function(){
        var self = this;
        self._map.removeControl(myControls);
        myControls = L.control.layers(self._map._baseMaps, self._map._overlayMaps);
        self._map.addControl(myControls);
    },
    addLayer: function(bezierPoints, iconsArray, infosArray){
        var self = this;
		if(CURRENT_DRAWING === "BezierAnim"){
            var bezierAnim = new R.BezierAnim(bezierPoints, {stroke: "red", "stroke-width": 4}, 
                {
                    onAnimationEnd: function(){
                        console.log("onAnimationEnd");
                    },
                    onHoverControls:function(){
                        console.log("onHoverControls");
                    },
                    onClickMarker:function(data){
                        console.log(data);
                    },
                    onClickPath:function(data){
                        console.log(data);
                    },
                    onDragControls:function(dataObject){
                       /* for(var data in dataObject){
                            var currentData = dataObject[data];
                            if(currentData.info){
                                if(currentData.info.tileID >= 0 ){
                                    points[currentData.info.tileID].lat = currentData.latlng.lat;
                                    points[currentData.info.tileID].lng = currentData.latlng.lng;
                                }
                                else if(currentData.info.controlID >= 0){
                                    controlsArray[currentData.info.controlID].lat = currentData.latlng.lat;
                                    controlsArray[currentData.info.controlID].lng = currentData.latlng.lng;
                                }
                            }
                        }*/
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
                    editor: true,
                    renderLastOnly: true
                }
            );
            self._map.addLayer(bezierAnim);
            self._overlayMaps["BezierAnim"] = bezierAnim;
        }
        else if(CURRENT_DRAWING === "TrackAnim"){
            var bezierAnim = new R.TrackAnim(bezierPoints, {stroke: "red", "stroke-width": 4}, 
                {
                    onAnimationEnd: function(){
                        console.log("onAnimationEnd");
                    },
                    onHoverControls:function(){
                        console.log("onHoverControls");
                    },
                    onClickMarker:function(data){
                        console.log(data);
                    },
                    onClickPath:function(data){
                        console.log(data);
                    },
                    onDragControls:function(dataObject){
                       /* for(var data in dataObject){
                            var currentData = dataObject[data];
                            if(currentData.info){
                                if(currentData.info.tileID >= 0 ){
                                    points[currentData.info.tileID].lat = currentData.latlng.lat;
                                    points[currentData.info.tileID].lng = currentData.latlng.lng;
                                }
                                else if(currentData.info.controlID >= 0){
                                    controlsArray[currentData.info.controlID].lat = currentData.latlng.lat;
                                    controlsArray[currentData.info.controlID].lng = currentData.latlng.lng;
                                }
                            }
                        }*/
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
                    editor: true,
                    renderLastOnly: true
                }
            );
            self._map.addLayer(bezierAnim);
            self._overlayMaps["BezierAnim"] = bezierAnim;
        }
	}
};

var OMapEvent = {
	_oMap:null,
	_oMapModel:null,
	init:function(oMap, oMapModel){
		var self = this;
		self._oMap = oMap;
		self._oMapModel = oMapModel;
		
	    self._oMap.on('click', self._onClickEvent);
	},
	_onClickEvent: function(event){
		OMapModel.pushPoint(event.latlng);
	},
	_onMouseMoveEvent: function(event){
		OMapModel.pushPoint(event.latlng);
	},
	onChangeDrawing:function(value){
		var self = this;
		CURRENT_DRAWING = value;
		if(CURRENT_DRAWING === "TrackAnim"){
			self._oMap.on('mousemove', self._onMouseMoveEvent);
		}
		else{	
			self._oMap.off('mousemove', self._onMouseMoveEvent);
		}
	}
};

var OMapModel = {
	_oMap:null,
	_oMapEvent:null,
	_points:[],
	init:function(){
		var self = this;
		var jsonStr = false;
		jsonStr = "{\"editor\":false,\"stories\":{},\"currentStoryID\":\"-JbXTzwEzB5O_hyP_Rll\",\"tiles\":{\"url\":\"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}\",\"options\":{\"attribution\":\"<a href=\\\"#/wavel/conditions\\\">Conditions</a> | © <a href=\\\"http://www.openstreetmap.org/copyright\\\">OpenStreetMap</a> contributors\"}},\"layers\":{\"baselayers\":{\"topo\":{\"name\":\"Topography map\",\"type\":\"xyz\",\"visible\":true,\"url\":\"https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}\",\"layerParams\":{\"zIndex\":1,\"opacity\":0.6},\"layerOptions\":{\"zIndex\":1,\"opacity\":0.6}}},\"overlays\":{\"-JbY_ttBpztGpHpYsk8c\":{\"name\":\"Raphael\",\"type\":\"raphael\",\"visible\":true,\"layerParams\":{\"index\":20,\"type\":\"BezierAnim\",\"attribut\":{\"stroke\":\"blue\",\"stroke-width\":4},\"callbacks\":{},\"objectOptions\":{\"info\":{\"story\":\"-JbXTzwEzB5O_hyP_Rll\"},\"transition\":{\"animationDuration\":1000,\"icon\":{\"url\":\"img/markers/map/pin/circle/favourite1.png\",\"size\":[32,51],\"anchor\":[16,51],\"hideOnStop\":true,\"stopAt\":1}},\"markers\":[{\"latlng\":{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},\"icon\":{\"anchor\":[16,47],\"size\":[32,47],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/adding.png\"}},{\"latlng\":{\"lat\":16.50985588954216,\"lng\":-8.1298828125}},{\"latlng\":{\"lat\":16.551961721972525,\"lng\":-1.669921875},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/air2.png\"}},{\"latlng\":{\"lat\":37.20367920167702,\"lng\":-3.3837890625}},{\"latlng\":{\"lat\":44.08758502824518,\"lng\":-2.8125},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/favourite1.png\"}}],\"markersInfos\":[{\"tileID\":\"-JbYEAsO4BrFlINhsXsT\"},{\"controlID\":0},{\"tileID\":\"-JbYEEN-FF_6ZFgO87st\"},{\"controlID\":1},{\"tileID\":\"-JbY_ttBpztGpHpYsk8c\"}],\"pathInfo\":{\"storyID\":0},\"editor\":false},\"markers\":[{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},{\"lat\":16.50985588954216,\"lng\":-8.1298828125},{\"lat\":16.551961721972525,\"lng\":-1.669921875},{\"lat\":37.20367920167702,\"lng\":-3.3837890625},{\"lat\":44.08758502824518,\"lng\":-2.8125}]},\"layerOptions\":{\"index\":20,\"type\":\"BezierAnim\",\"attribut\":{\"stroke\":\"blue\",\"stroke-width\":4},\"callbacks\":{},\"objectOptions\":{\"info\":{\"story\":\"-JbXTzwEzB5O_hyP_Rll\"},\"transition\":{\"animationDuration\":1000,\"icon\":{\"url\":\"img/markers/map/pin/circle/favourite1.png\",\"size\":[32,51],\"anchor\":[16,51],\"hideOnStop\":true,\"stopAt\":1}},\"markers\":[{\"latlng\":{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},\"icon\":{\"anchor\":[16,47],\"size\":[32,47],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/adding.png\"}},{\"latlng\":{\"lat\":16.50985588954216,\"lng\":-8.1298828125}},{\"latlng\":{\"lat\":16.551961721972525,\"lng\":-1.669921875},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/air2.png\"}},{\"latlng\":{\"lat\":37.20367920167702,\"lng\":-3.3837890625}},{\"latlng\":{\"lat\":44.08758502824518,\"lng\":-2.8125},\"icon\":{\"anchor\":[16,51],\"size\":[32,51],\"type\":\"tile\",\"url\":\"img/markers/map/pin/circle/favourite1.png\"}}],\"markersInfos\":[{\"tileID\":\"-JbYEAsO4BrFlINhsXsT\"},{\"controlID\":0},{\"tileID\":\"-JbYEEN-FF_6ZFgO87st\"},{\"controlID\":1},{\"tileID\":\"-JbY_ttBpztGpHpYsk8c\"}],\"pathInfo\":{\"storyID\":0},\"editor\":false},\"markers\":[{\"lat\":16.720385051693988,\"lng\":-14.589843749999998},{\"lat\":16.50985588954216,\"lng\":-8.1298828125},{\"lat\":16.551961721972525,\"lng\":-1.669921875},{\"lat\":37.20367920167702,\"lng\":-3.3837890625},{\"lat\":44.08758502824518,\"lng\":-2.8125}]}}}},\"autoCenter\":false}";
		var jsonData = JSON.parse(jsonStr);
		self._oMap = OMap;
		self._oMapEvent = OMapEvent;
		self._oMap.init(jsonData);
		self._oMapEvent.init(self._oMap, OMapModel);
	},
	pushPoint:function(point){
		var self = this;
        self._points.push(point);
        
		if(self._points.length >= 1){
			var iconsArray = [];
            var bezierPoints = [];
            var infosArray = [];
			var controlsArray = [];
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

            addPoint(self._points[0], {tileID:0}, true);
            for(var i = 1; i < self._points.length; i++){
                //Compute controls points
                var firstControl = Object.create(self._points[i-1]);
                var secondControl = Object.create(self._points[i]);
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
                addPoint(self._points[i], {tileID:i}, true);
            }
            
            self._oMap.addLayer(bezierPoints, iconsArray, infosArray);
           // updateControls();
		}
	}
};

//----------------------
// MAIN 
OMapModel.init();


   
   
