/**
*Displays a lap in a random color
**/
function displayLap(lap){
    polylinesArr.push(lap);
    var color = getColor();
    var length = getDistanceArray(lap);

    if(lapsCreated > 1){
        checkForOverlap();
    }

    length = Math.round(length);

    drawPolyline(lap, color);

    var iDiv = document.createElement('div');

    iDiv.className = "label label-default";
    iDiv.innerHTML = length+" m";
    iDiv.style.color = "white";
    iDiv.style.backgroundColor = color;

    document.getElementById("laps").appendChild(iDiv);
}
/**
*predefined colors that work with the map. Uses the global lapsCreated to return one we have not used so far..
*And yes, this limits the number of laps to 5, if you were going to comment on that
**/
function getColor(){
    var colors = ["DeepPink", "DarkOrange", "DodgerBlue","Crimson","Indigo"];
    return colors[lapsCreated-1];
}
function checkForOverlap(){
    var longest = 0;
    var longestValue = 0;

    for(var i = 0; i < polylinesArr.length -1; i++){
        var arr1 = polylinesArr[i];
        var arr2 = polylinesArr[polylinesArr.length -1];
        for(var j = 0; j < arr2.length; j++){
            for(var k = 0; k < arr1.length; k++){
                if(getDistance(arr2[j], arr1[k]) < 5){
                    //you are here
                }
                k = k +1; // used to for speedup
            }
            j = j +1; // used to for speedup
        }
    }
}
function offset(p, bearing){

}