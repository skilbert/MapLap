//everything needed to produce a lap. In the order that it is executed. Please only call the handler genLap, or else it will feel bad about itself 

var originalIndexes = [];
var placeIdArray = [];
var processedCordinates = [];

var lapsCreated = 0;

/**
*handler for generating a lap
*
**/
function genLap(myPos, callback){
	var snappedCoordinates = [];
	var pathValuesUrl = [];

	if(myPos == undefined){
		//if we are not given the position we ask the browser for it
		getPos(callback);
	}else{
		addPos(myPos, callback);
	}
}

/**
*feches the position from findPos. Uses callback to genLap
*@callback to genLap to try again, this time with the right position
**/
function getPos(callback){
	findPos(genLap, callback);
}
/*
**adds the position to the screen. zoom and text
*@calls where() with myPos
**/
function addPos(myPos, callback){

	if(myPos == undefined){
		console.log("did not find pos, you would need to search");
		//We should never need this
	}else{
		console.log("pos found. zooming and centering");

		infoWindow.setPosition(myPos);
		infoWindow.setContent('We think you are here');
		map.setCenter(myPos);
		map.setZoom(15);
	}
	where(myPos, callback);
}
/**
*where should the lap go? We find an origo to start the lap, the circle we generate contains the same start and ending point
*the method can make 4 different laps and makes a different each time it is called. It counts with lapsCreated
*@calls genPath with pathValuesUrl and myPos
**/
function where(myPos, callback){
	console.log("generating alfa path");
	var myPosLng = myPos["lng"]; // = 59.9622808; //for debug
	var myPosLat = myPos["lat"]; //= 10.760098; // for debug

	var origoLat;
	var origoLng;

	var pathValuesUrl = [];
	var i = lapsCreated;
	var j = 0;

	j = i * 90;

	origoLat = size * 0.001 * Math.sin(j*(Math.PI / 180)) + myPosLat;
	origoLng = size * 0.002 * Math.cos(j*(Math.PI / 180)) + myPosLng;

	pathValuesUrl = circle(origoLat, origoLng);

	lapsCreated = lapsCreated + 1;

	genPath(pathValuesUrl, myPos, callback)
}

/**
*takes a path for a circle and we then try to snap to roads via snapToRoads
*@calls prossesSnapToRoadRespons via callback to handle the respons from snapToRoads
**/
function genPath(pathValuesUrl, myPos, callback){
	console.log("snapping alfa path to road");
	snapToRoads(pathValuesUrl, processSnapToRoadResponse, myPos, callback);
}
/**
*prosseses the respons from snapp to roads. We find, and separate the points that was snapped to a road from the rest. We hold on to the pos it was snapped to, not the orginal
*@calls calcRoute with the final respons
**/
function processSnapToRoadResponse(data, myPos, callback) {
	console.log("processes snapToRoads respons")
	var snappedCoordinates = [];

	console.log("number of snapped points." + data.snappedPoints.length);
	for (var i = 0; i < data.snappedPoints.length; i++) {
		var latlng = new google.maps.LatLng(
		data.snappedPoints[i].location.latitude,
		data.snappedPoints[i].location.longitude);
		snappedCoordinates.push(latlng);
		placeIdArray.push(data.snappedPoints[i].placeId);

		if(data.snappedPoints[i].originalIndex != undefined){
			originalIndexes.push(data.snappedPoints[i].originalIndex);
		}
	}
	calcRoute(snappedCoordinates, myPos, callback);
}
/**
*takes all the snappedCordinats we have calculated by now and selects a few of these that we send to directionsService
*The result is pushed to the map. We should do something about that.
*this method has the directions we should use later if the user wants it on there phone or something. Remember this
**/
function calcRoute(snappedCoordinates, myPos, callback){
	var processedCordinates = selectSnapped(snappedCoordinates);

	//printArray(processedCordinates); // for debug

	console.log("we chosed "+ processedCordinates.length+" points among the snappedCoordinates");

	console.log("generates the final path via directionsService");
	var request = {
		origin:myPos,
		destination:myPos,
		waypoints: processedCordinates,
		avoidHighways: true,
		travelMode: google.maps.TravelMode.WALKING
	};
	directionsService.route(request, function(result, status){

		if(status == google.maps.DirectionsStatus.OK){
			var finalPoints = [];
			var legs = result.routes[0].legs;
			for(i = 0; i < legs.length; i++){
				var steps = legs[i].steps;
				for(j = 0; j < steps.length; j++){
					nextSegment = steps[j].path;
					for(k = 0; k < nextSegment.length; k++){
						finalPoints.push(nextSegment[k]);
					}
				}
			}
			console.log('Returning to handler');
			callback(finalPoints, lapsCreated);
		}else{
			window.alert('Directions request failed due to ' + status);
		}
	});
}