/**
*Displays a lap in a random color
**/
function displayLap(lap){
       var color = getColor();
       var length = getDistanceArray(lap);

       length = Math.round(length);

	drawPolyline(lap, color);

       var iDiv = document.createElement('div');

       iDiv.className = "label label-default";
       iDiv.innerHTML = length+" m";
       iDiv.style.color = "white";
       iDiv.style.backgroundColor = color;

       document.getElementById("laps").appendChild(iDiv);
}
function getColor(){
       var colors = ["DeepPink", "DarkOrange", "DodgerBlue","Crimson","Indigo"];
       return colors[lapsCreated-1];
}