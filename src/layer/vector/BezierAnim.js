R.BezierAnim = R.Layer.extend({
    initialize: function(latlngs, attr, cb, options) {
        R.Layer.prototype.initialize.call(this, options);

        this._latlngs = latlngs;
        this._attr = attr;
        this._cb = cb;


    },
    _reset:function(){
        if(this._path) this._path.remove();
                              if(this._sub) this._sub.remove();
                              if(this._sub2) this._sub2.remove();
                              
                              if(this._pathBezier) this._pathBezier.remove();
                              if(this._pathBezierAnimated) this._pathBezierAnimated.remove();
                              if(this._markerAnimated) this._markerAnimated.remove();
                              if(this._circleControls) this._circleControls.remove();
                              
                              this._arrayWithControls = [];
        this._arrayBezier = [];
    },
    onRemove: function (map) {
        R.Layer.prototype.onRemove.call(this, map);
        this._reset();
    },
    projectLatLngs: function() {
        var self = this;
        self._reset();
        var discattr = {fill: "#fff", stroke: "#000", cursor:"pointer"};
        var discattrFollow = {fill: "#fff", stroke: "#000",  followBezier: 0};
        var pathAttrAnimated = {stroke: "blue", "stroke-width": 4, alongBezier:0};
        var pathAttrFix = {stroke: "blue", "stroke-width": 4, "stroke-linecap": "round", cursor:"pointer"};
        
        this._paper.customAttributes.alongBezier = function(a) {
            var r = this.data('reverse');
            var len = this.data('pathLength');
            if(a > 0)
                return {path: this.data('bezierPath').getSubpath(r ? (1-a)*len : 0, r ? len : a*len)};
        };
        
        this._paper.customAttributes.followBezier = function(a) {
            this.show();
            var r =  this.data('reverse');
            var len = this.data('pathLength');
            var point = this.data('bezierPath').getPointAtLength(r ? len : a*len);
            var radius = 0;
            if(a > 0){
                radius = 5;
            }
            return {
                href:self.options.transition.icon.url, 
                x: point.x - self.options.transition.icon.anchor[0], 
                y: point.y - self.options.transition.icon.anchor[1], 
                width:self.options.transition.icon.size[0], 
                height: self.options.transition.icon.size[1]
            };
        };

        function move(dx, dy) {
            this.update(dx - (this.dx || 0), dy - (this.dy || 0));
            this.dx = dx;
            this.dy = dy;
        }
        function up() {
            this.dx = this.dy = 0;
        }
        
        if(self.options.editor){
            self._circleControls = self._paper.set();
        }

        var bezierNumber = self._latlngs.length / 4;
        for(var bezierID = 0; bezierID < bezierNumber; bezierID++){
            var start = self._map.latLngToLayerPoint(self._latlngs[bezierID*4]);
            var controlOne = self._map.latLngToLayerPoint(this._latlngs[1+bezierID*4]);
            var controlTwo = self._map.latLngToLayerPoint(this._latlngs[2+bezierID*4]);
            var end = self._map.latLngToLayerPoint(self._latlngs[3+bezierID*4]);
            self._arrayBezier.push(["M", start.x, start.y]);
            self._arrayBezier.push(["C", controlOne.x, controlOne.y, controlTwo.x, controlTwo.y, end.x, end.y]);
            
//                 pathWithControls.push(["M", start.x, start.y]);
//                 pathWithControls.push(["L", start.x+controlOne.x, start.y+controlOne.y]);
//                 pathWithControls.push(["M", end.x+controlTwo.x, end.y+controlTwo.y]);
//                 pathWithControls.push(["L", end.x, end.y]);
            
            
            if(self._circleControls){
                var controls = [
                    ["M", start.x, start.y],
                    ["L", controlOne.x, controlOne.y],
                    ["M", controlTwo.x, controlTwo.y],
                    ["L", end.x, end.y]
                ];
                self._arrayWithControls.push(controls);
                var pathWithControls = self._paper.path(controls);
//                     pathWithControls.hover(function(){
//                         console.log("HOVER IN");
//                         self._map.dragging.disable();
//                     },function(){
//                         console.log("onDragPathControls");
//                         self._map.dragging.enable();
//                         if(self._cb && self._cb.onDragPathControls){
//                             var dataToSend = self.options.info;
// //                             dataToSend.controls = [
// //                                 [controls[1][1] - controls[0][1], controls[1][2] - controls[0][2]],
// //                                 [controls[2][1] - controls[0][1], controls[2][2] - controls[0][2]]
// //                             ];
//                             self._cb.onDragPathControls(dataToSend);
//                         }
//                     });
                pathWithControls.attr({stroke: "#000", "stroke-dasharray": "- "});
                
                self._circleControls.push(
                    pathWithControls,
                    self._paper.circle(start.x, start.y, 5).attr(discattr),
                    self._paper.circle(controlOne.x, controlOne.y, 5).attr(discattr),
                    self._paper.circle(controlTwo.x, controlTwo.y, 5).attr(discattr),
                    self._paper.circle(end.x, end.y, 5).attr(discattr)
                );
                self._circleControls.hover(function(){
                    console.log("HOVER IN");
                    self._map.dragging.disable();
                    
                    if(self._cb && self._cb.onHoverControls){
                        self._cb.onHoverControls();
                    }
                },function(){
                    self._map.dragging.enable();
                    if(self._cb && self._cb.onDragControls){
                        var dataToSend = self.options.info;
                        self._cb.onDragControls(dataToSend);
                    }
                });
                self._circleControls[bezierID*5+1].update = function (x, y) {
                    var X = this.attr("cx") + x,
                            Y = this.attr("cy") + y;
                            this.attr({cx: X, cy: Y});
                            var currentBezierID = this.data("bezierID");
                            self._arrayBezier[currentBezierID*2+0][1] = X;
                            self._arrayBezier[currentBezierID*2+0][2] = Y;
                            self._arrayWithControls[currentBezierID][0][1] = X;
                            self._arrayWithControls[currentBezierID][0][2] = Y;
                            self._circleControls[currentBezierID*5+2].update(x, y);
                };
                self._circleControls[bezierID*5+1].data("bezierID", bezierID);
                self._circleControls[bezierID*5+2].update = function (x, y) {
                    var X = this.attr("cx") + x,
                            Y = this.attr("cy") + y;
                            this.attr({cx: X, cy: Y});
                            var currentBezierID = this.data("bezierID");
                            self._arrayBezier[currentBezierID*2+1][1] = X;
                            self._arrayBezier[currentBezierID*2+1][2] = Y;
                            self._arrayWithControls[currentBezierID][1][1] = X;
                            self._arrayWithControls[currentBezierID][1][2] = Y;
                            self._pathBezier.attr({path: self._arrayBezier});
                            self._circleControls[currentBezierID*5+0].attr({path: self._arrayWithControls[currentBezierID]});
                };
                self._circleControls[bezierID*5+2].data("bezierID", bezierID);
                self._circleControls[bezierID*5+3].update = function (x, y) {
                    var X = this.attr("cx") + x,
                            Y = this.attr("cy") + y;
                            this.attr({cx: X, cy: Y});
                            var currentBezierID = this.data("bezierID");
                            self._arrayBezier[currentBezierID*2+1][3] = X;
                            self._arrayBezier[currentBezierID*2+1][4] = Y;
                            self._arrayWithControls[currentBezierID][2][1] = X;
                            self._arrayWithControls[currentBezierID][2][2] = Y;
                            self._pathBezier.attr({path: self._arrayBezier});
                            self._circleControls[currentBezierID*5+0].attr({path: self._arrayWithControls[currentBezierID]});
                };
                self._circleControls[bezierID*5+3].data("bezierID", bezierID);
                self._circleControls[bezierID*5+4].update = function (x, y) {
                    var X = this.attr("cx") + x,
                            Y = this.attr("cy") + y;
                            this.attr({cx: X, cy: Y});
                            var currentBezierID = this.data("bezierID");
                            self._arrayBezier[currentBezierID*2+1][5] = X;
                            self._arrayBezier[currentBezierID*2+1][6] = Y;
                            self._arrayWithControls[currentBezierID][3][1] = X;
                            self._arrayWithControls[currentBezierID][3][2] = Y;
                            self._circleControls[currentBezierID*5+3].update(x, y);
                };
                self._circleControls[bezierID*5+4].data("bezierID", bezierID);
            }
        }
        
        if(self._circleControls){
            self._circleControls.drag(move, up);
            self._circleControls.hide();
        }
        
        self._pathBezier = this._paper.path(self._arrayBezier).hide();
        self._pathBezier.click(function(){
            if(self._cb){
                self._cb.onClickPath(self.options.info);
            }
        });
        
        self._pathBezierAnimated = self._paper.path()
        .data('bezierPath', self._pathBezier)
        .data('pathLength', self._pathBezier.getTotalLength())
        .data('reverse', false)
        .attr(pathAttrAnimated);
        
        self._markerAnimated = self._paper.image(self.options.transition.icon.url)
        .data('bezierPath', self._pathBezier)
        .data('pathLength', self._pathBezier.getTotalLength())
        .data('reverse', false)
        .attr(discattrFollow);
        self._markerAnimated.hide();
        

            
        setTimeout(function(){
            self._markerAnimated.stop().animate({
                followBezier: self.options.transition.stopAt
            }, 
            self.options.animationDuration, 
            function() {
//                     self._markerAnimated.hide();
            });
        
            self._pathBezierAnimated.stop().animate({
                alongBezier: 1
            }, 
            self.options.animationDuration, 
            function() {
                self._pathBezierAnimated.hide(); 
                self._pathBezier.attr(pathAttrFix);
                self._pathBezier.show();
                if(self._circleControls){
                    self._circleControls.toFront();
                    self._circleControls.show();
                }
                
                if(self._cb && self._cb.onAnimationEnd){
                    self._cb.onAnimationEnd();
                }
            });
        }, self.options.startAnimateTimeout);
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