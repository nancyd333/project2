//creates base map object used by all other functions in this script
//setView([lat, long], zoom level ) 
// lat and long tell the map the coordinates to use to center the map
var map = L.map('map').setView([40.813600, -96.702610], 5); 

//create variable for the circle object that will be layered on the map
const circle1 = null

//leaflet uses openstreet maps to get the tiles and adds it the map object
//you can set a maxZoom here
function createMap(){
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 10,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

}

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

    // //then the data is retrieved to populate the circles on the map, the circle is creted with addLayer and a popup is populated as well
    // fetch('/api/cities')
    //     .then((res)=>{
    //         return res.json();
    //     })
    //     .then((cities)=>{
    //         for(const aqi of cities.allCities){
    //             addLayer(aqi.lat, aqi.lng,aqi.overall_aqi_color,aqi.overall_aqi_num,aqi.city)
    //             circle1.bindPopup(`AQI: ${aqi.overall_aqi_num} (city: ${aqi.city})`
    //         )}
    //     })
}

renderMap()
