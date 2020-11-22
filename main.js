
var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", "http://localhost:3000" ); // false for synchronous request
      xmlHttp.send();
      geofences= xmlHttp.responseText;
      var vectorSource = new VectorSource({
        features: new  GeoJson().readFeatures(geofences)
      });
      var styles = {
        'LineString': new Style({
          stroke: new Stroke({
            color: 'green',
            width: 1,
          }),
        }),
      }
      var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
      };
      var vectorLayer = new VectorLayer({
        source:vectorSource,
        style:styleFunction
      })

        var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          vectorLayer
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([11.345486640930176,44.49313799932412]),
          zoom: 15
        })
      });
