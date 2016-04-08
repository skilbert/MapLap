//functions for various things that are not essential to the function of the webpage, but is used during debug or to calculate something.

/**
*Mark the snapped points on the map
**/
function markSnapped(snappedCoordinates){
	console.log(snappedCoordinates.length);
	for(var i = 0; i < snappedCoordinates.length -1; i++){
		placeAMarker(snappedCoordinates[i], 0);
	}
}
/**
*place a marker at this position. Can be marked with U(1) and S(else)
**/
function placeAMarker(position, flag){
	var lab;
	if(flag == 1){
		lab = "u";
	}else{
		lab = "s";
	}
	marker = new google.maps.Marker({
		position: position,
		label: lab,
		map: map,
	});
}
/**
*print this array by placing a marker at each point. 
*this bugs right now....
**/
function printArray(array){
	var i;
	for(i = 0; i < array.length; i++){
		placeAMarker(array[i], 1);
	}
}
/**
*translate degrees til rad
**/
function rad (x) {
	return x * Math.PI / 180;
}
/**
*get the distance between two latlng positions
**/
function getDistance(p1, p2) {
	var R = 6378137; // Earth’s mean radius in meter
	var dLat = rad(p2.lat() - p1.lat());
	var dLong = rad(p2.lng() - p1.lng());
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
		Math.sin(dLong / 2) * Math.sin(dLong / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d; // returns the distance in meter
}
/**
*calculates the distance for a path given as an array
**/
function getDistanceArray(array){
	var totDistance = 0;
	for(var i = 1; i < array.length; i++){
		totDistance = totDistance + getDistance(array[i-1], array[i]);
	}
	return totDistance;
}
/**
*find the points that did not snap to a road
**/
function findUnsnapped(pathvalues, originalIndexes){
	var i = 0;
	var bol = 0;

	for( i = 0; i < pathValues.length; i++){
		if(originalIndexes.indexOf(i) < 0){
			console.log('Denne finnes ikke:' +i);
			placeAMarker(pathValues[i], 1);
			if(bol == 0 && i != 0){
				placeAMarker(getClosest(pathValues[i-1]), 0);
				bol = 1;
			}
			continue;
		}
		if(bol == 1){
			placeAMarker(getClosest(pathValues[i-1]), 0);
			bol = 0;
		}
	}
}
/**
*select 8 numbers of snapped points distributed evenly over the lap
**/
function selectSnapped(snappedCoordinates){
	var processedCordinates = [];
	var length = snappedCoordinates.length;
	var interval = Math.round(length / 8);
	var tmp = 0;
	for(i = 0; i < 8 && i < snappedCoordinates.length; i++){
		processedCordinates.push({
			location: snappedCoordinates[tmp],
			stopover: false
		});
		tmp = tmp + interval;
	}
	return processedCordinates;
}

/**
*Draws the snapped polyline (after processing snap-to-road response).
*this might need map as a parameter, have not used it here yet
**/
function drawPolylineUrl(Coordinates) {
	var snappedPolyline = new google.maps.Polyline({
		path: Coordinates.join('|'),
		strokeColor: 'black',
		strokeWeight: 2
	});
	snappedPolyline.setMap(map);
	polylines.push(snappedPolyline);
}
/**
*draws the snapped polyline
**/

function drawPolyline(Coordinates, color) {
	var Polyline = new google.maps.Polyline({
		path: Coordinates,
		strokeColor: color,
		strokeWeight: 3,
		map: map
	});
	Polyline.setMap(map);
	polylines.push(Polyline);
}
/**
*calculate the distance between snapped points. if it is more than the sens we need to look at that path
**/
function checkRoute(snappedCoordinates){
	for(var i = 0; i < snappedCoordinates.length -1; i++){
		if (getDistance(snappedCoordinates[i], snappedCoordinates[i+1]) > sens){
			placeAMarker(snappedCoordinates[i], 1);
			placeAMarker(snappedCoordinates[i+1], 0);
		}
	}
}

/**
*get the closest snapped point for this coordinate
**/
function getClosest (latlng, snappedCoordinates){
	var shortestD = 0;
	var shortestLL;
	for(var i = 0; i < snappedCoordinates.length; i++){
		if(i == 0){
			shortestD = getDistance(latlng, snappedCoordinates[i]);
			shortestLL = snappedCoordinates[i];
		}else{
			if(shortestD > getDistance(latlng, snappedCoordinates[i])){
				shortestD = getDistance(latlng, snappedCoordinates[i]);
				shortestLL = snappedCoordinates[i];
			}
		}
	}
	return shortestLL;
}

/**
*find pos via html geolocation
*@callback with the result
**/
function findPos(callback, callback2){
	console.log("trying to find pos..");

	var pos;

	// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			pos = {
				lat: position.coords.latitude,
				lng: position.coords.longitude
			};

			if(typeof callback == 'function'){
			      callback(pos, callback2);
			}

		},     function() {
				//can not find pos
				handleLocationError(true, infoWindow, map.getCenter());
				if(typeof callback == 'function'){
					callback(pos, callback2);
				}
			});
	} else {
		// Browser doesn't support Geolocation. This needs to be taken care of
		handleLocationError(false, infoWindow, map.getCenter());
		if(typeof callback == 'function'){
			callback(pos, callback2);
		}
	}
}
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(browserHasGeolocation ?
		'Error: The Geolocation service failed.' :
		'Error: Your browser doesn\'t support geolocation.');
}

/**
*returns a URL with pathvalues with a circle around the origo provided
**/
function circle(origoLat, origoLng){

	var i = 0;
	var j = 0;

	var marker;
	var newPosLng;
	var newPosLat;

	var tmpPathValuesUrl = [];
	var tmpPathValues = [];


	for (i = 0; i < 100; i++){ // google only accepts 100 points at the time
		j = i * 3.6;
		newPosLat =  size * 0.001 * Math.cos(j*(Math.PI / 180)) + origoLat;
		newPosLng =  size * 0.002 * Math.sin(j*(Math.PI / 180)) + origoLng;

		var position = new google.maps.LatLng(newPosLat, newPosLng);
		//tmpPathValues.push(position);
		tmpPathValuesUrl.push(position.toUrlValue());
		//placeAMarker(position, 1); // for debug    
	}
	return tmpPathValuesUrl;
}
/**
*calls googles snapToRoads. Takes myPos only to pass it to callback
*@callback is used to return the data and avoid the code to run away without us
**/
function snapToRoads(pathValuesUrl, callback, myPos, callback2){
	$.get('https://roads.googleapis.com/v1/snapToRoads', {
		interpolate: true,
		key: apiKey,
		path: pathValuesUrl.join('|')
	}, function(data) {
		callback(data, myPos, callback2)
	});
}
/**
*Generates a random hex color
**/
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}