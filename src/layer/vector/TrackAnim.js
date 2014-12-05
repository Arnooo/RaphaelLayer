R.TrackAnim = R.Layer.extend({
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
    onRemove: function (map) {
        R.Layer.prototype.onRemove.call(this, map);
        this._reset();
    },
    projectLatLngs: function() {
        var self = this;
        self._reset();
        if(self._latlngs.length > 0){

            //Init sets
            self._setMarkers = self._paper.set();

            //Parse all points
            for(var pointID = 0; pointID < self._latlngs.length; pointID++){
                var symetricPoint = false;
                var currentPoint = self._map.latLngToLayerPoint(self._latlngs[pointID]);
                if(pointID === 0){
                    self._arrayBezier.push("M");
                }
                else if(pointID > 0) {
                    self._arrayBezier.push("L"); 
                }
                self._arrayBezier.push([currentPoint.x, currentPoint.y]);
            }

            //Draw markers
            for(var markerID = 0; markerID < self.options.markers.length; markerID++){
                self._addMarker(markerID);      
            }

            //Convert array to path 
            self._pathBezier = self._paper.path(self._arrayBezier).hide();
            if(self.options.renderLastOnly && self._arrayBezier.length > 2){
                self._pathBezierFixed = self._paper.path(self._arrayBezier.slice(0, self._arrayBezier.length - 3));
                self._pathBezierFixed.attr(self._attr);
                self._startNormalized = self._pathBezierFixed.getTotalLength() / self._pathBezier.getTotalLength();
            }

            //Set all attributs
            self._pathBezier.attr(self._attr);
            self._pathBezier.attr({"stroke-linecap": "round", cursor: "pointer"});

            //Connect mouse event
            self._pathBezier.click(function(){
                if(self._cb && self._cb.onClickPath && self.options.pathInfo){
                    self._cb.onClickPath(self.options.pathInfo);
                }
            });

            self._addAnimatedPath();
            self._addAnimatedMarker();
        }
    },
    _reset:function(){
        
        if(this._pathBezier) this._pathBezier.remove();
        if(this._setMarkers) this._setMarkers.remove();
        if(this._pathBezierAnimated) this._pathBezierAnimated.remove();
        if(this._markerAnimated) this._markerAnimated.remove();
        if(this._pathBezierFixed) this._pathBezierFixed.remove();
        this._arrayBezier = [];
        this._startNormalized = 0;
    },
    _addMarker: function(pointID){
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
                element.data("pointID", pointID);
                if(self.options.markersInfos){
                    element.data("info", self.options.markersInfos[pointID]);
                }
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
    }
});