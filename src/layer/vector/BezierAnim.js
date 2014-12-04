R.BezierAnim = R.Layer.extend({
    initialize: function(latlngs, attr, cb, options) {
        R.Layer.prototype.initialize.call(this, options);

        this._latlngs = latlngs;
        if(attr){
            this._attr = attr;
        }
        else{
            this._attr = {stroke: "blue", "stroke-width": 4}
        }
        this._cb = cb;
        this._enablePathAnimation = true;
        this._enableMarkerAnimation = true;
        this._dataToSend = {};
    },
    _reset:function(){
        
        if(this._pathBezier) this._pathBezier.remove();
        if(this._pathControls) this._pathControls.remove();
        if(this._circleControls) this._circleControls.remove();
        if(this._setControls) this._setControls.remove();
        if(this._setMarkers) this._setMarkers.remove();
        if(this._pathBezierAnimated) this._pathBezierAnimated.remove();
        if(this._markerAnimated) this._markerAnimated.remove();
        if(this._pathBezierFixed) this._pathBezierFixed.remove();
        this._arrayBezier = [];
        this._arrayControls = [];
        this._startNormalized = 0;
    },
    onRemove: function (map) {
        R.Layer.prototype.onRemove.call(this, map);
        this._reset();
    },
    projectLatLngs: function() {
        var self = this;
        self._reset();
        if(self._latlngs.length > 0){

            //Init sets
            self._setControls = self._paper.set();
            self._setMarkers = self._paper.set();

            //Parse all points
            for(var pointID = 0; pointID < self._latlngs.length; pointID++){
                var symetricPoint = false;
                var currentPoint = self._map.latLngToLayerPoint(self._latlngs[pointID]);
                if(pointID === 0){
                    self._arrayBezier.push("M");
                }
                else if(pointID > 0 && pointID%2 === 1) {
                    self._arrayBezier.push("S"); 
                }
                else if(pointID > 1){ 
                    var previousPoint = self._arrayBezier[self._arrayBezier.length - 1];
                    var tmp = currentPoint.subtract(previousPoint);
                    symetricPoint = currentPoint.add(tmp);
                }
                self._arrayBezier.push([currentPoint.x, currentPoint.y]);
                var controlID = self._addControlPoint(pointID, currentPoint); 
                self._addMarker(pointID, controlID);               
                if(symetricPoint){
                    self._addControlPoint(pointID - 1, symetricPoint); 
                }
            }
            //Convert array to path 
            self._pathBezier = self._paper.path(self._arrayBezier).hide();
            if(self.options.renderLastOnly && self._arrayBezier.length > 2){
                self._pathBezierFixed = self._paper.path(self._arrayBezier.slice(0, self._arrayBezier.length - 3));
                self._pathBezierFixed.attr(self._attr);
                self._startNormalized = self._pathBezierFixed.getTotalLength() / self._pathBezier.getTotalLength();
            }
            self._pathControls = self._paper.path(self._arrayControls);
            self._setControls.push(self._pathControls);

            //Set all attributs
            self._pathBezier.attr(self._attr);
            self._pathBezier.attr({"stroke-linecap": "round", cursor: "pointer"});
            self._pathControls.attr({stroke: "#000", "stroke-dasharray": "- "});

            //Reorder elements
            if(!self.options.editor){
                self._setControls.hide();
            }
            else{
                self._setControls.show();
                self._setControls.toFront();
                self._pathControls.toBack();
                self._setMarkers.toFront();
            }

            //Connect mouse event
            function move(dx, dy) {
                if(this.update){
                    this.update(dx - (this.dx || 0), dy - (this.dy || 0));
                    this.dx = dx; 
                    this.dy = dy;
                }
            };
            function up() {
                this.dx = this.dy = 0;
            }

            if(self.options.editor){
                self._setControls.drag(move, up);
                self._setMarkers.drag(move, up);
            }

            function hoverIn(){
                if(self._map){
                    self._map.dragging.disable();
                }
                if(self._cb && self._cb.onHoverControls){
                    self._cb.onHoverControls();
                }
            };
            function hoverOut(){
                if(self._map){
                    self._map.dragging.enable(); 
                }
                if(self._cb && self._cb.onDragControls){
                    self._cb.onDragControls(self._dataToSend);
                    self._dataToSend = {};
                }
            }
            self._setControls.hover(hoverIn, hoverOut);
            self._setMarkers.hover(hoverIn, hoverOut);
            self._pathBezier.click(function(){
                if(self._cb && self._cb.onClickPath && self.options.pathInfo){
                    self._cb.onClickPath(self.options.pathInfo);
                }
            });

            self._addAnimatedPath();
            self._addAnimatedMarker();
        }
    },
    _updateLatlngs:function(pointID, newLatlng){
        var self = this;
        if(pointID < self._latlngs.length){
            self._latlngs[pointID] = newLatlng;
            self.options.markers[pointID].latlng = newLatlng;
        }
    },
    _addControlPoint:function(pointID, currentPoint){
        var self = this;
        var controlID = self._setControls.length;
        if(pointID > 0){
            if(self._arrayControls.length % 3 === 0){
                self._arrayControls.push("M");
            }
            else{
                self._arrayControls.push("L");
            }
            self._arrayControls.push([currentPoint.x, currentPoint.y]); 
        }
        var circleElement = self._paper.circle(currentPoint.x, currentPoint.y, 5).attr({fill: "#fff", stroke: "#000", cursor:"pointer"});
        circleElement.data("pointID", pointID);
        circleElement.data("controlID", controlID);
        if(self.options.markersInfos){
            circleElement.data("info", self.options.markersInfos[pointID]);
        }
        self._setControls.push(circleElement);

        if(pointID === 0){
            circleElement.update = function (x, y) {
                var X = this.attr("cx") + x,
                    Y = this.attr("cy") + y;
                this.attr({cx: X, cy: Y});
                var currentPointID = this.data("pointID");
                self._arrayBezier[1][0] = X;
                self._arrayBezier[1][1] = Y;
                var markerPosX = self._setMarkers[currentPointID].attr("x") + x;
                var markerPosY = self._setMarkers[currentPointID].attr("y") + y;
                self._setMarkers[currentPointID].attr({x: markerPosX, y: markerPosY});
                self._pathBezier.attr({path: self._arrayBezier});
            }; 
        } 
        else if(pointID > 0 && (self._arrayControls.length - 1) % 3 === 1){
            
            //MAIN BEZIER CONTROL!!!
            circleElement.update = function (x, y) {
                var X = this.attr("cx") + x,
                    Y = this.attr("cy") + y;
                this.attr({cx: X, cy: Y});
                var currentPointID = this.data("pointID");
                var index = Math.floor((currentPointID+1)/2) * 3;
                self._arrayBezier[index][0] = X;
                self._arrayBezier[index][1] = Y;
                self._pathBezier.attr({path: self._arrayBezier});
                
                var currentControlID = this.data("controlID");
                self._arrayControls[currentControlID * 2 -1][0] = X;
                self._arrayControls[currentControlID * 2 -1][1] = Y;
                self._pathControls.attr({path: self._arrayControls});
                
                self._setControls[currentControlID + 2].updatePosition(-x, -y);

                var latlng = self._map.layerPointToLatLng([X, Y]);
                self._dataToSend[currentControlID] =  { 
                    info : this.data("info"),
                    latlng : latlng
                };
            }; 
            
            circleElement.updatePosition = function (x, y) {
                var X = this.attr("cx") + x,
                    Y = this.attr("cy") + y;
                this.attr({cx: X, cy: Y});
                var currentControlID = this.data("controlID");
                self._arrayControls[currentControlID * 2 -1][0] = X;
                self._arrayControls[currentControlID * 2 -1][1] = Y;
                self._pathControls.attr({path: self._arrayControls});
                
                var currentPointID = this.data("pointID");
                var index = Math.floor((currentPointID+1)/2) * 3;
                self._arrayBezier[index][0] = X;
                self._arrayBezier[index][1] = Y;
                self._pathBezier.attr({path: self._arrayBezier});

                var latlng = self._map.layerPointToLatLng([X, Y]);
                self._dataToSend[currentControlID] =  { 
                    info : this.data("info"),
                    latlng : latlng
                };
            }; 
        }
        else if(pointID > 0 && self._arrayControls.length % 3 === 0){
            //SYMETRIC CONTROL!!!
            circleElement.update = function (x, y) {
                var X = this.attr("cx") + x,
                    Y = this.attr("cy") + y;
                this.attr({cx: X, cy: Y}); 
                var currentPointID = this.data("pointID");
                var currentControlID = this.data("controlID");
                var index = Math.floor((currentPointID+1)/2) * 3;
                self._pathBezier.attr({path: self._arrayBezier});
                
                self._arrayControls[currentControlID * 2 -1][0] = X;
                self._arrayControls[currentControlID * 2 -1][1] = Y;
                self._pathControls.attr({path: self._arrayControls});
                
                self._setControls[currentControlID - 2].updatePosition(-x, -y);
            }; 
            
            circleElement.updatePosition = function (x, y) {
                var X = this.attr("cx") + x,
                    Y = this.attr("cy") + y;
                this.attr({cx: X, cy: Y});
                var currentControlID = this.data("controlID");
                var currentPointID = this.data("pointID");
                var index = Math.floor((currentPointID+1)/2) * 3;
                self._arrayControls[currentControlID * 2 -1][0] = X;
                self._arrayControls[currentControlID * 2 -1][1] = Y;
                self._pathControls.attr({path: self._arrayControls});
            }; 
        }
        else if(pointID > 0 && (self._arrayControls.length - 1) % 3 === 0){
            //PATH CONTROL!!!
            circleElement.update = function (x, y) {
                var X = this.attr("cx") + x,
                    Y = this.attr("cy") + y;
                this.attr({cx: X, cy: Y});
                var currentPointID = this.data("pointID");
                var currentControlID = this.data("controlID");
                var index = 1 + Math.floor(currentPointID/2) * 3;
                self._arrayBezier[index][0] = X; 
                self._arrayBezier[index][1] = Y;
                
                var markerPosX = self._setMarkers[currentPointID].attr("x") + x;
                var markerPosY = self._setMarkers[currentPointID].attr("y") + y;
                self._setMarkers[currentPointID].attr({x: markerPosX, y: markerPosY});

                self._arrayControls[currentControlID * 2 -1][0] = X;
                self._arrayControls[currentControlID * 2 -1][1] = Y;
                self._setControls[currentControlID - 1].updatePosition(x, y); 
                self._setControls[currentControlID + 1].updatePosition(x, y);

                var latlng = self._map.layerPointToLatLng([X, Y]);
                self._dataToSend[currentControlID] =  { 
                    info : this.data("info"),
                    latlng : latlng
                };

                self._updateLatlngs(currentPointID, latlng);
            }; 
        }
        return controlID;
    },
    _addMarker: function(pointID, controlID){
        var self = this;
        if(self._setMarkers && 
            self.options.markers && 
            self.options.markers[pointID]){
            var point = self._map.latLngToLayerPoint(self.options.markers[pointID].latlng);

            var element = null;
            if(self.options.markers[pointID].icon){
                element = self._paper.image(self.options.markers[pointID].icon.url, 
                                      point.x - self.options.markers[pointID].icon.anchor[0], 
                                      point.y - self.options.markers[pointID].icon.anchor[1], 
                                      self.options.markers[pointID].icon.size[0], 
                                      self.options.markers[pointID].icon.size[1]).show();
                element.attr({cursor:"pointer"});
                element.data("controlID", controlID);
                element.data("pointID", pointID);
                if(self.options.markersInfos){
                    element.data("info", self.options.markersInfos[pointID]);
                }
                element.update = function (x, y) {
                    var currentControlID = this.data("controlID");
                    self._setControls[currentControlID].update(x, y);
                }; 
                element.click(function(){
                    if(self._cb && self._cb.onClickMarker){
                        self._cb.onClickMarker(this.data("info"));
                    }
                });
                self._setMarkers.push(element);
            }
            else{
                element = self._paper.circle(0, 0, 0).hide();
                element.update = function (x, y){};
                self._setMarkers.push(element);
            }

        }
    },
    _addAnimatedPath: function(){
        var self = this;
        
        var endAnimPathCallback = function() {
            if(self._pathBezierAnimated){
                self._pathBezierAnimated.hide(); 
            }
            if(self._pathBezierFixed){
                self._pathBezierFixed.hide();
            }
            self._pathBezier.show();
            if(self._circleControls){
                self._circleControls.toFront();
                self._circleControls.show();
            }
            
            if(self._cb && self._cb.onAnimationEnd){
                self._cb.onAnimationEnd();
            }
            
            if(self._markers){
                self._markers.show();
            }
        };
        if(self.options.transition){
            this._paper.customAttributes.alongBezier = function(a) {
                var r = this.data('reverse');
                var len = this.data('pathLength');
                if(a > 0){
                    return {path: this.data('bezierPath').getSubpath(r ? (1-a)*len : 0, r ? len : a*len)};
                }
            };
            self._pathBezierAnimated = self._paper.path()
            .data('bezierPath', self._pathBezier)
            .data('pathLength', self._pathBezier.getTotalLength())
            .data('reverse', false)
            .attr(self._attr)
            .attr({alongBezier:self._startNormalized});

            if(!self._enablePathAnimation){
                endAnimPathCallback();
            }
            else{
                self._enablePathAnimation = false;
                setTimeout(function(){
                    self._pathBezierAnimated.stop().animate({
                        alongBezier: 1
                    }, 
                    self.options.transition.animationDuration, 
                    endAnimPathCallback);
                }, self.options.startAnimateTimeout);
            }
        }
        else{
            endAnimPathCallback();
        }
    },
    _addAnimatedMarker: function(){
        var self = this;
        if(self.options.transition &&
            self.options.transition.icon && 
            self.options.transition.icon.url !== ""
        ){
            this._paper.customAttributes.followBezier = function(a) {
                this.show();
                var r =  this.data('reverse');
                var len = this.data('pathLength');
                var point = this.data('bezierPath').getPointAtLength(r ? len : a*len);
                if(!isNaN(point.x) && a > 0){                
                    return {
//                         href:self.options.transition.icon.url, 
                        x: point.x - self.options.transition.icon.anchor[0], 
                        y: point.y - self.options.transition.icon.anchor[1], 
                        width:self.options.transition.icon.size[0], 
                        height: self.options.transition.icon.size[1]
                    };
                }
            };

            self._markerAnimated = self._paper.image(self.options.transition.icon.url)
            .data('bezierPath', self._pathBezier)
            .data('pathLength', self._pathBezier.getTotalLength())
            .data('reverse', false)
            .attr({fill: "#fff", stroke: "#000", followBezier: self._startNormalized});
            
            self._markerAnimated.click(function(){
                if(self._cb && self._cb.onClickMarker && self.options.pathInfo){
                    self._cb.onClickMarker(self.options.pathInfo);
                }
            });
            
            self._markerAnimated.hide();
            
            var endAnimMarkerCallback = function() {
                self._markerAnimated.attr({followBezier: self.options.transition.icon.stopAt});
                if(self._markerAnimated && self.options.transition.icon.hideOnStop){
                    self._markerAnimated.hide();    
                }
                else{
                    self._markerAnimated.attr({cursor: "pointer"});
                    
                }    
            };
            
            if(!self._enableMarkerAnimation){
                endAnimMarkerCallback();
            }
            else{
                self._enableMarkerAnimation = false;
                setTimeout(function(){
                    self._markerAnimated.stop().animate({
                        followBezier: self.options.transition.icon.stopAt
                    }, 
                    self.options.transition.animationDuration, 
                    endAnimMarkerCallback);
                }, self.options.startAnimateTimeout);
            }
        }
    },
    getControlPoint: function(start, end) {
        var cp = { x: 0, y: 0 };
        cp.x = start.x + (end.x - [start.x]) / 2;
        cp.y = start.y + (end.y - [start.y]) / 2;
        var amp = 0;

        if (this.closeTo(start.x, end.x) && !this.closeTo(start.y, end.y)) {
            amp = (start.x - end.x) * 1 + 15 * (start.x >= end.x ? 1 : -1);
            cp.x = Math.max(start.x, end.x) + amp;
        } else {
            amp = (end.y - start.y) * 1.5 + 15 * (start.y < end.y ? 1 : -1);
            cp.y = Math.min(start.y, end.y) + amp;
        }
        return cp;
    },

    closeTo: function(a, b) {
        var t = 15;
          return (a - b > -t && a - b < t);
    }
});