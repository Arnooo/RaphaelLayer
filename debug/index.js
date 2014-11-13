(function() {
    var map = new L.Map('map');
    var tiles = new L.TileLayer('http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
        maxZoom: 18
    });

    var adelaide = new L.LatLng(-34.93027490891421, 138.603875041008);
    var m = new R.Marker(adelaide);

    map.setView(adelaide, 13).addLayer(tiles);
    map.addLayer(m);

    setTimeout(function() {
        map.removeLayer(m);
    }, 5000);

    var points = [];

    var drag = false;
        
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
        var p = new R.Pulse( 
            e.latlng, 
            6,
            {'stroke': '#2478ad', 'fill': '#30a3ec'}, 
            {'stroke': '#30a3ec', 'stroke-width': 3}
        );
        map.addLayer(p);
        
        if(points.length >= 4){
            var b = new R.BezierAnim(points, {}, 
                {
                    onAnimationEnd: function(){
                        console.log("onAnimationEnd");
                        var p = new R.Pulse( 
                                e.latlng, 
                                6,
                                {'stroke': '#2478ad', 'fill': '#30a3ec'}, 
                                {'stroke': '#30a3ec', 'stroke-width': 3}
                        );
                        map.addLayer(p);
                    },
                    onHoverControls:function(){
                        drag = true;
                    }
                },
                {
                    transition: {
                        stopAt: 0.7,
                        icon:{
                            url:"libs/leaflet/images/marker-icon.png",
                            size:[32, 51],
                            anchor: [16, 51]
                        }
                    },
                    startAnimateTimeout: 0,
                    animationDuration: 1000,
                    editor:true
                }
            );
            map.addLayer(b);
            points = [];
        }
        
    });

    var geo = new R.GeoJSON(multi_geo);

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
            geo);

})();