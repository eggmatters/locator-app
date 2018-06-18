appResponse = appResponse || "{}";
if (appResponse === "nodata") {
   appResponse = "{}";
   alert("There are no buses available for your route");
}
var locations = JSON.parse(appResponse);
console.log(locations);

var crd = {};
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function success(pos) {
  renderMap(pos.coords);
}
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);

function renderMap(origin) {
   require([
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "dojo/domReady!"
   ], function (Map, MapView, Graphic) {
      var map = new Map({
         basemap: "streets"
      });

      var view = new MapView({
         container: "viewDiv", // Reference to the scene div created in step 5
         map: map, // Reference to the map object created before the scene
         zoom: 12, // Sets zoom level based on level of detail (LOD)
         center: [-122.762, 45.416]  // Sets center point of view using longitude,latitude
      });

      var point = {
         type: "point", // autocasts as new Point()
         latitude: origin.latitude,
         longitude: origin.longitude
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
      var pointGraphics = setGraphics([pointGraphic]);

      view.graphics.addMany(pointGraphics);

      function setGraphics(pointGraphics) {
         var vehicles = getVehicles(locations);
         vehicles.forEach(function (bus) {
            var point = {
               type: "point",
               latitude: bus.latitude,
               longitude: bus.longitude
            };

            var markerSymbol = {
               type: "simple-marker",
               color: [226, 119, 40],
               outline: {
                  color: [255, 255, 255],
                  width: 2
               }
            };

            var vehicleAttributes = {
               Name: "Route Number: " + bus.routeNumber,
               nextStop: bus.nextLocID,
               info: bus.signMessageLong
            };
            var pointGraphic = new Graphic({
               geometry: point,
               symbol: markerSymbol,
               attributes: vehicleAttributes,
               popupTemplate: {// autocasts as new PopupTemplate()
                  title: "{Name}",
                  content: [{
                        type: "fields",
                        fieldInfos: [{
                              fieldName: "Name"
                           }, {
                              fieldName: "nextStop"
                           }, {
                              fieldName: "info"
                           }]
                     }]
               }
            });
            pointGraphics.push(pointGraphic);
         });
         return pointGraphics;
      }

      function getVehicles(locations) {
         var resultSet = locations.resultSet || {};
         var vehicles = resultSet.vehicle || [];
         return vehicles;
      }
   });
}