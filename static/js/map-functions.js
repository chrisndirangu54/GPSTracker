var url = window.location.href;
url = new URL(url);
var zoomSize = Number(url.searchParams.get('zoom'));
var centerLat = parseFloat(url.searchParams.get('lat'));
var centerLng = parseFloat(url.searchParams.get('lng'));
var map;

var data = {};
var dataArray = [];

function locationsToArray(locations) {
    var locationsArray = [];
    locationsArray.push({ lat: parseFloat(locations.startLocation.lat), lng: parseFloat(locations.startLocation.lng) });
    locations.locations.forEach(function(location) {
        locationsArray.push({lat: parseFloat(location.lat), lng: parseFloat(location.lng) });
    });
    locationsArray.push({ lat: parseFloat(locations.stopLocation.lat), lng: parseFloat(locations.stopLocation.lng) });
    return locationsArray;
}

function getPaths() {
    var domain = url.toString().split('/')[0];
    var pathsUrl = domain + '/get-locations';
    $.get(pathsUrl, function(locations) {
        if(locations) {
            locations = JSON.parse(locations);
            data = locations;
            var locationsArray = locationsToArray(locations);
            if(locationsArray != dataArray) {
                var locations = locationsArray.slice(dataArray.length, locationsArray.length);
                var i;
                var pathArray = [];
                for(i=0;i<locationsArray.length;i++) {
                    if(!dataArray.includes(locationsArray[i])) {
                        pathArray.push(locationsArray[i]);
                        dataArray.push(locationsArray[i]);
                    }
                }
                drawLine(pathArray);
            }
        }
    });
}

function drawLine(pathArray) {
    var locationsPath = new google.maps.Polyline({
        path: pathArray,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });
    locationsPath.setMap(map);
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: centerLat, lng: centerLng },
        zoom: zoomSize
    });
    setInterval(function() {
        getPaths();
        console.log('Getting paths');
    }, 5000);
}