require([
  "esri/Map",
   "esri/views/MapView",
   "esri/Graphic",
   "dojo/domReady!"
], function(Map, MapView, Graphic){
  var map = new Map({
    basemap: "streets"
  });

  var view = new MapView({
    container: "viewDiv",  // Reference to the scene div created in step 5
    map: map,  // Reference to the map object created before the scene
    zoom: 15,  // Sets zoom level based on level of detail (LOD)
    center: [-122.762, 45.416]  // Sets center point of view using longitude,latitude
  });

  var point = {
        type: "point", // autocasts as new Point()
        longitude: -122.762,
        latitude: 45.416
   };

   // Create a symbol for drawing the point
   var markerSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: [40, 119, 226],
      outline: {// autocasts as new SimpleLineSymbol()
         color: [255, 255, 255],
         width: 2
      }
   };

   // Create a graphic and add the geometry and symbol to it
   var pointGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol
   });

   view.graphics.addMany([pointGraphic]);
});