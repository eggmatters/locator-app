
var locations = appResponse || {};
var pointGraphics = [];
var crd = {};
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
var socketEvents = new Events();

var socket = io();

socket.on('locations', function(locations) {
   data = { locations: locations, pgs: pointGraphics };
   socketEvents.trigger('locations-update', data);
});

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
         center: [origin.longitude, origin.latitude]  // Sets center point of view using longitude,latitude
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
      view.graphics.add(pointGraphic);
      var pointGraphics = setGraphics([pointGraphic], locations);

      view.graphics.addMany(pointGraphics);

      socketEvents.on('locations-update', function(event, data) {
         if (data.pgs.length > 0) {
            view.graphics.removeMany(data.pgs);
         }
         if (pointGraphics.length > 0) {
           view.graphics.removeMany(pointGraphics);
         }
         pointGraphics = setGraphics([], data.locations);
         view.graphics.addMany(pointGraphics);
      });

      function setGraphics(pointGraphics, locations) {
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
