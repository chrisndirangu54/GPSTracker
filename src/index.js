'use strict';

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var file_name = 'tracked-data.json'
var date = new Date();

var data = {};

/*const records = [
    {
        startLocation: '1212-12312(05:00)',
        movement: '12312312-312312(05:01),12312312-1231231231(05:02),1231231231-123(05:03),123123-123123(05:04)',
        destinationLocation: '12312312-123123(05:05)'
    },
    {
        startLocation: '12123112-1232(05:00)',
        movement: '12312-3122(05:01),12312-12311231(05:02),1231231-12773(05:03),123-145233(05:04)',
        destinationLocation: '12312-123(05:05)'
    },
    {
        startLocation: '1212-1312(05:00)',
        movement: '12312-31312(05:01),12312-12331(05:02),121231-123(05:03),1231-12323(05:04)',
        destinationLocation: '18312-31883(05:05)'
    }
]*/

var app = express();
app.use(bodyParser.json());

app.use(function(req, res, next) {
    console.log(req.method + ' ' + req.url);
    next();
});

function writeToFile() {
    updateStopLocation();
    fs.writeFile(file_name, JSON.stringify(data), (err) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log('Updated file with data');
    });
    data = {};
}

function updateStopLocation() {
    var location = data.locations.pop();
    data.stopLocation = location;
    data.stopLocation.timeStamp = timeStamp();
}

function collectData(location) {
    if(Object.keys(data).length == 0) {
        data.startLocation = location;
        data.startLocation.timeStamp = timeStamp();
        data.locations = [];
    }
    else {
        location = location;
        location.timeStamp = timeStamp();
        data.locations.push(location);
    }
}

function timeStamp() {
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

// Method 1 get all locations and write to csv
app.post('/locations', function(req, res, next) {
    var locations = req.body.locations;
    data = locations; // Add if clause to return error if array is empty
    res.status(200).json("Locations Received");
});

// Method 2 get location on multiple request and push them to an array
app.post('/location', function(req, res, next) {
    var location = req.body.location;
    collectData(location);
    res.status(200).json("Location Received");
});
// Finally save the obtained locations
app.get('/save-locations', function(req, res, next) {
    var locations = data;
    writeToFile();
    var query = '?';
    var startLocation = 'startLocation=' + locations.startLocation.lat + ',' + locations.startLocation.lng + ';' + locations.startLocation.timeStamp;
    query += startLocation + '&';
    var locationsQuery = 'locations=';
    locations.locations.forEach((location) => {
        locationsQuery += '{ ' + location.lat + ',' + location.lng + ';' + location.timeStamp + ' },';
    });
    locationsQuery = locationsQuery.substring(0, locationsQuery.length-1);
    var stopLocation = 'stopLocation=' + locations.stopLocation.lat + ',' + locations.stopLocation.lng + ';' + locations.stopLocation.timeStamp;
    query += locationsQuery + '&' + stopLocation;
    res.redirect('/show-map' + query);
    //res.status(200).json("Saved locations");
});
// View locations on map
app.get('/show-map', function(req, res, next) {
    fs.readFile('static/map-view.html', (err, data) => {
        if(err) {
            return err;
        }
        res.send(data.toString());
    });
});

app.listen(3000);