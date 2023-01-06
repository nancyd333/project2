//leaflet requires this to be client-side to function


//creates base map object used by all other functions in this script
//setView([lat, long], zoom level ) 
// lat and long tell the map the coordinates to use to center the map
var map = L.map('map').setView([39.1238,-94.5541], 5)
//([40.813600, -96.702610], 5); 

//leaflet uses openstreet maps to get the tiles and adds it the map object
//you can set a maxZoom here
function createMap(){
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

}


//provide the aqi number get the rgb number that corresponds, used to populate circles (unable to use class for the color in this case)
//note: this mapping is defined on index.js, style.css and map.js
function getAqiColor(aqiIndexNum){
    if (aqiIndexNum <= 50){
        // return 'green';
        return 'rgb(123,201,80)';
    } else if(aqiIndexNum <= 100){
        // return 'yellow';
      return 'rgb(254, 225, 52)'; 
    }  else if(aqiIndexNum <= 150){
        // return 'orange';
      return 'rgb(255, 170, 51)';
    }  else if(aqiIndexNum <= 200){
        // return 'red';
      return 'rgb(184,6,0)';
    }  else if(aqiIndexNum <= 300){
        // return 'purple';
      return 'rgb(93,46,143)';
    } else if(aqiIndexNum >= 301){
        // return 'maroon';
      return 'rgb(126,46,16)';
    } else {
      return 'grey';
    }
  } 

//legend was copied from https://codepen.io/haakseth/pen/KQbjdO  
//variable for the legend
var legend = L.control({ position: "bottomleft" });

//function to create the legend
//added css class here to get the colors associated with the levels
function createLegend(){
  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>AQI Legend</h4>";
    div.innerHTML += '<i class="green"></i><span>0-50 Good</span><br>';
    div.innerHTML += '<i class="yellow"></i><span>51-100 Moderate</span><br>';
    div.innerHTML += '<i class="orange"></i><span>101-150 Unhealthy for Sensitive Groups</span><br>';
    div.innerHTML += '<i class="red"></i><span>151-200 Unhealthy</span><br>';
    div.innerHTML += '<i class="purple"></i><span>201-300 Very Unhealthy</span><br>';
    div.innerHTML += '<i class="maroon"></i><span>301+ Hazardous</span><br>';
  
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
    class: "leaflet-interactive yellow",
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
                addLayer(aqi.lat, aqi.lng,getAqiColor(aqi.overall_aqi_num),aqi.overall_aqi_num,aqi.city)
                circle1.bindPopup(`AQI: ${aqi.overall_aqi_num} (city: ${aqi.city}, ${aqi.state_abbrv})`
            )}
        })
}


renderMap()

