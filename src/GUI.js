function gui(){
    placeSearch();
}
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
function newLocation(){
    console.log("SEARCH!!!!!!!!");
    var place = searchBox.getPlace();
    var pos = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
    };
    clearMap();
    handler(pos);
}
function clearMap(){
    polylines = [];
    document.getElementById('laps').innerHTML = "";
    lapsCreated = 0;
}