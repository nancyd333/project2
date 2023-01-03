//creates base map object used by all other functions in this script
//setView([lat, long], zoom level ) 
// lat and long tell the map the coordinates to use to center the map
var map = L.map('map').setView([40.813600, -96.702610], 5); 

//leaflet uses openstreet maps to get the tiles and adds it the map object
//you can set a maxZoom here
function createMap(){
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

}

var legend = L.control({ position: "bottomleft" });

function createLegend(){
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<h4>AQI Legend</h4>";
  div.innerHTML += '<i style="background: #7bc950"></i><span>0-50</span><br>';
  div.innerHTML += '<i style="background: #feffbe"></i><span>51-100</span><br>';
  div.innerHTML += '<i style="background: #f06543"></i><span>101-150</span><br>';
  div.innerHTML += '<i style="background: #b80600"></i><span>151-200</span><br>';
  div.innerHTML += '<i style="background: #5d2e8f"></i><span>201-300</span><br>';
  div.innerHTML += '<i style="background: #7e2e10"></i><span>301+</span><br>';
  
  
  return div;
};

legend.addTo(map);
}


//create variable for the circle object that will be layered on the map
let circle1 = null

//function to add circles to map based on city and aqi index number
function addLayer(lat, long, color, aqi, city){
        circle1 = L.circle([lat,long], {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: aqi * 1000, //the aqi index number creates a radius that is too small to see on the map, therefore it's multiplied by 1000
        name: city
    }).addTo(map);
}

//function to render the map, circles, and circle popup data
function renderMap(){
    //first the map is created on the page
    createMap()
    createLegend()

    //then the data is retrieved to populate the circles on the map, the circle is creted with addLayer and a popup is populated as well
    fetch('/api/cities')
        .then((res)=>{
            return res.json();
        })
        .then((cities)=>{
            for(const aqi of cities.allCities){
                addLayer(aqi.lat, aqi.lng,aqi.overall_aqi_color,aqi.overall_aqi_num,aqi.city)
                circle1.bindPopup(`AQI: ${aqi.overall_aqi_num} (city: ${aqi.city})`
            )}
        })
}



renderMap()

