# Locator Service

The locator Service is a working web application to show real time bus positions 
for the Portland Tri-Met system.

The web application consists of a simple form for an existing TriMet Route. The form submission
will render your location and the locations of all the buses on the route you selected
on a feature rich GIS-based map.

# Integrations

There are 3 services this app utilizes:

* Esri / ArcGIS
* Tri Met
* Location Service engine

## Esri ArcGis

Provided by https://developers.arcgis.com/ This is a free service which provides Javascript API's
to access most of the features of ArcGIS software in a robust web application environment.

This application loads a 2-dimensional map, rendering the user's position location and 
the locations of buses on the selected route with popup legends for each bus on the line showing
additional details

## Tri Met

Provided by https://developer.trimet.org/ Tri Met offers a rich API for fetching real-time 
tranist data. While Tri Met does supply KMS (GIS Layer data) files, the endpoint chosen
for this application returns JSON providing details for each bus (namely, lat & long coordinates)

## Location Service Engine

This is a service to provide a real-time conduit for transit data. This service reads from a 
Redis Message queue and makes API calls to the Trim-Met service, posting the results on
a resulting queue. 

The client can monitor the queue and force updates at specified intervals.

This service is still in development. The locator-client currently has the responsibility of
making API calls to Tri Met to fetch data.

See integration notes below.

# Installation

## Locally

from both `locator-client` & `locator-service` directories, run

```
$ npm install -g nodemon && npm install
```

To accept web requests locally, run

```
$ npm run start
```

## Docker container build

Run `$ docker-compose up --build` from the top-level directory.

From either installation, navigate to `localhost:3000` in your browser.

# Integration Notes & Next steps

In order to integrate the locator-service with the web-client, POST requests will
initiate reads from a Redis request queue. The request queue will only need to have
a unique message id (called by `incr()` on the redis client), and the route number.

Once initiated, the client will wait on reads from the queue. The locator service will
make an api calls to the TriMet api on any incoming queue messages. These payloads shall
then be written to the outbound queue for consumption by clients.

The web-client may then establish a socket.io session with the requestor, maintaining 
real-time updates of locations at some specified interval. Ideally a seamless re-rendering 
of the locations view layer will occur. 

# Future Enhancements

* Middleware for server-side validation
* Additional Service integrations (nearest Stop, Arrival times, etc)
* Enhanced view features (icons for locations, etc.)
* Port to react-native as an application experience.