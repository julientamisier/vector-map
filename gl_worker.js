importScripts('lib/libtess.cat.js');
importScripts('gl.js');
importScripts('gl_builders.js');
importScripts('styles.js'); // TODO: a better way to pass styles, doing this because functions can't be passed to workers

var debug = false;

this.addEventListener('message', function (event) {
    var tile = event.data.tile;

    var layers = event.data.layers;
    var styles = gl_styles;

    var layer, style;
    var triangles = [];
    var lines = [];

    // Build raw geometry arrays
    for (var ln=0; ln < layers.length; ln++) {
        layer = layers[ln];
        style = styles[layer.name] || {};

        if (tile.layers[layer.name] != null) {
            var num_features = tile.layers[layer.name].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = tile.layers[layer.name].features[f];

                if (feature.geometry.type == 'Polygon') {
                    GL.buildPolygons([feature.geometry.coordinates], feature, layer, style, tile, triangles);
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    GL.buildPolygons(feature.geometry.coordinates, feature, layer, style, tile, triangles);
                }
                else if (feature.geometry.type == 'LineString') {
                    GL.buildPolylines([feature.geometry.coordinates], feature, layer, style, tile, triangles, lines);
                }
                else if (feature.geometry.type == 'MultiLineString') {
                    GL.buildPolylines(feature.geometry.coordinates, feature, layer, style, tile, triangles, lines);
                }
            }
        }
    }

    triangles = new Float32Array(triangles);
    lines = new Float32Array(lines);

    this.postMessage({ key: tile.key, triangles: triangles, lines: lines }, [triangles.buffer, lines.buffer]);
});