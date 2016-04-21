function gui(){
    placeSearch();
}
/*
* Used for searching for a new location
*/
function placeSearch(){
    var btn = document.getElementById('place-search-btn');
    var input = document.getElementById('place-search');
    searchBox = new google.maps.places.Autocomplete(input, {types: ['geocode']});

    // Bias the SearchBox results towards current map's viewport
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener('place_changed', newLocation);
}
function lengthSearch(myPos){
    if(myPos != undefined){
        var btn = document.getElementById('length-search-btn');
        var input = document.getElementById('length-search');

        input.addEventListener('change', function() {
            newLength(input.value, myPos);
        });
    }else{
        console.log("can not call lengthSearch without knowing the position")
    }
}
/*
* new location is found (searchbox has it)
*/
function newLocation(){
    //console.log("SEARCH!!!!!!!!");
    var place = searchBox.getPlace();
    var pos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
    };
    clearMap();
    handler(pos);
}
function newLength(length, myPos){

    console.log("THE USER SEARCHED FOR A NEW LENGTH: \n");
    var call = {
        desiredLength: length,
        size: undefined
    }
    clearMap();
    handler(myPos, call)
}
/*
*resets the map so we can make laps at a new location in one session
*/
function clearMap(){
    for(var i = 0; i < polylines.length; i++){
        polylines[i].setMap(null);
    }
    polylines = [];
    polylinesArr = [];
    document.getElementById('laps').innerHTML = "";
    lapsCreated = 0;
    lengthSearchEnabled = false;
}