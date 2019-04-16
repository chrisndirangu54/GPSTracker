'use strict';

var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var file_name = 'tracked-data.json'
var date = new Date();

var data = {
    startLocation: {},
    locations: [],
    stopLocation: {}
};


// Functions
function writeToFile(file_name, data) {
    fs.writeFile(file_name, JSON.stringify(data), (err) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log('Updated file with data');
    });
}

function addData(locations) {
    locations.forEach(function(location) {
        location.timeStamp = timeStamp();
        if(_.isEmpty(data.startLocation)) {
            data.startLocation = location;
        } else {
            if(_.isEmpty(data.stopLocation)) {
                data.stopLocation = location;
            } else {
                data.locations.push(data.stopLocation);
                data.stopLocation = {};
                data.stopLocation = location;
            }
        }
    });
}

function timeStamp() {
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}


// Routes
var app = express();
app.use(bodyParser.json());

// HTML files
app.use('/static', express.static('static'));

app.use(function(req, res, next) {
    console.log(req.method + ' ' + req.url);
    next();
});

app.post('/locations', function(req, res, next) {
    var locations = req.body.locations;
    addData(locations);
    writeToFile(file_name, data);
    res.status(200).json('Locations received');
});

app.post('/location', function(req, res, next) {
    var location = req.body.location;
    addData([location]);
    writeToFile(file_name, data);
    res.status(200).json('Location received');
});

app.get('/get-locations', function(req, res, next) {
    fs.readFile('tracked-data.json', function(err, data) {
        if(err) {
            res.status(404).json({Error: err});
        } else {
            res.json(data.toString());
        }
    });
});

//Get start location and redirect
/*app.get('/show-map', function(req, res, next) {
    res.redirect('/static/html/map-view.html?zoom=10&lat=' + '&lng=');
});*/

app.listen(3000);