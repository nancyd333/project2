//leaflet requires this to be client-side to function


//creates base map object used by all other functions in this script
var map = L.map('map',{
  center: [ 37.1238, -95.8758 ],
  zoom: 5,
  scrollWheelZoom: false
})

//leaflet uses openstreet maps to get the tiles and adds it the map object
//you can set a maxZoom here
function createMap(){
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

}

//legend was copied from https://codepen.io/haakseth/pen/KQbjdO  
//variable for the legend
var legend = L.control({ position: "bottomleft" });

//function to create the legend
//background colors are associated with the AQI levels
function createLegend(){
  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>AQI Legend</h4>";
    div.innerHTML += '<i style="background: green"></i><span>0-50 Good</span><br>';
    div.innerHTML += '<i style="background: yellow"></i><span>51-100 Moderate</span><br>';
    div.innerHTML += '<i style="background: orange"></i><span>101-150 Unhealthy for Sensitive Groups</span><br>';
    div.innerHTML += '<i style="background: red"></i><span>151-200 Unhealthy</span><br>';
    div.innerHTML += '<i style="background: purple"></i><span>201-300 Very Unhealthy</span><br>';
    div.innerHTML += '<i style="background: maroon"></i><span>301+ Hazardous</span><br>';
  
    return div;
  };

  legend.addTo(map);
}


//variable for the circle object that will be layered on the map
let circle1 = null

//function to add circles to map based on city and aqi index number
function addLayer(lat, long, color, aqi, city){
  circle1 = L.circle([lat,long], {
    color: color,
    class: "leaflet-interactive",
    fillColor: color,
    fillOpacity: 0.5,
    radius: aqi * 1000, //the aqi index number creates a radius that is too small to see on the map, therefore it's multiplied by 1000
    name: city
  }).addTo(map);
}

//function to render the map, circles, and circle popup data
function renderMap(){
    //map is created on the page
    createMap()
    
    //legend is created
    createLegend()

    //fetch call to get cities from client-side, data is jsonified and iterated through
    //data is retrieved to populate the circles on the map
    //circle is created with 'addLayer' and a popup is populated using 'bindPopup'
    fetch('/api/cities')
        .then((res)=>{
            return res.json();
        })
        .then((cities)=>{
            for(const aqi of cities.allCities){
                addLayer(aqi.lat, aqi.lng,aqi.overall_aqi_color,aqi.overall_aqi_num,aqi.city)
                circle1.bindPopup(`AQI: ${aqi.overall_aqi_num} (city: ${aqi.city}, ${aqi.state_abbrv})`
            )}
        })
}


renderMap()

