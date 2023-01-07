//--REQUIRED packages--//
require('dotenv').config()
const express = require('express')
const methodOverride = require('method-override');
const axios = require('axios');
const cookieParser = require('cookie-parser')
const db = require('./models')
const { defaults } = require('pg');
const { DATEONLY } = require('sequelize');
const crypto = require('crypto-js');
const city = require('./models/city');
const { sequelize } = require('./models');

//--APP config--//
const app = express()
const PORT = process.env.PORT || 3000
const API_KEY = process.env.API_KEY //key for aqi api data
app.set('view engine', 'ejs')
app.use(methodOverride('_method')) //middleware to allow for delete method in HTTP request
app.use(express.urlencoded({extended: false})) //middleware to parse request bodies (req.body) from html forms
app.use(cookieParser()) //tell express to parse incoming cookies
app.use(express.static('public')) //tells express there are static files stored in folder named public


//--FUNCTIONS--//

//get cities from database
//gets result set to populate map
//limit is used for testing, since the API data has a limit (and the results depend on the cities returned)
async function getCities(){
    try{  
        allCities = await db.city.findAll({
            raw: true,
            limit: 20 
        })
        
        return allCities;

    } catch(err){
        console.log('error message ', err)
    }
}

//get all cities from database
//gets result set for the search autocomplete (used for individual city searches)
//NOTE: keeping the calls for getting cities separate (getAllCitites vs getCities) made the API call more reliable
async function getAllCities(){
    try{
    allCities = await db.city.findAll({
            raw: true,
        })
        //console.log(allCities)
        return allCities;
    } catch (err){
        console.log('error message ', err)
    }
}

//get AQI data from API for one city
async function getAqiApiData(city, state, country){
    const aqiRequest = await axios({
      method: 'get',
      url:  `https://api.api-ninjas.com/v1/airquality?city=${city}&state=${state}&country=${country}`,
      headers: {'X-Api-Key': API_KEY},
    }) 
    
    const aqiResponse = await aqiRequest
    const aqiData = await aqiResponse.data
    //console.log(aqiData)
    return aqiData;
}

//returns supplemental information associated with AQI
async function getAqiInfo(aqiIndexNum){
    try{ 
        if (aqiIndexNum <= 50){
            aqiColor = 'green';
    
        } else if(aqiIndexNum <= 100){
            aqiColor = 'yellow';

        }  else if(aqiIndexNum <= 150){
            aqiColor = 'orange';

        }  else if(aqiIndexNum <= 200){
            aqiColor = 'red';

        }  else if(aqiIndexNum <= 300){
            aqiColor = 'purple';

        } else if(aqiIndexNum >= 301){
            aqiColor = 'maroon';

        } else {
            aqiColor = 'grey'; // this is a catch all for when it can't find an associated color
        }
        const aqiInfo = await db.air_quality_index_desc.findOne({
            where: {color: aqiColor}
        })

        //console.log(aqiInfo.dataValues)
        return aqiInfo.dataValues;
    } catch(err){
        console.log("getAqiInfo error : ", err)
    }
}

//returns data about city, including longitude and latitude, and combines it with AQI data
async function getMapData(){
    try {
        allCities = await getCities()
        //console.log(typeof allFav[0].changed) // this shows the type of object being returned
    
        for(const city of allCities){
            const aqiData = await getAqiApiData(city.city, city.state_abbrv, city.country)
            const aqiInfo = await getAqiInfo(aqiData.overall_aqi)
            city.overall_aqi_num = aqiData.overall_aqi
            city.overall_aqi_color = aqiInfo.color
        }
        //console.log(allCities[0])
        //console.log(allCities)

        //returns data in json format to the browser for the map.js to consume and make AQI cicles
        return allCities;
    } catch(err){
        console.log("ERROR MESSAGE getMapData: ", err)
    }
 }

 //gets user favorites and returns the results sorted
 async function getUserFavorites(userId, sort_col, order, assocDb){
    try{
        if(assocDb){
            const allFav = await db.favorite.findAll({
                where: {userId: userId},
                include: [db.user,db.city],
                order: [[assocDb,sort_col, order]]
            })
            for(const fav of allFav){
                const aqiInfo = await getAqiInfo(fav.aqi)
                fav.overall_aqi_color = aqiInfo.color
                fav.level = aqiInfo.level
                fav.healthImplications = aqiInfo.health_implications
            }
            return allFav;
        } else {
            const allFav = await db.favorite.findAll({
                where: {userId: userId},
                include: [db.user,db.city],
                order: [[sort_col, order]]
            })
            for(const fav of allFav){
                const aqiInfo = await getAqiInfo(fav.aqi)
                fav.overall_aqi_color = aqiInfo.color
                fav.level = aqiInfo.level
                fav.healthImplications = aqiInfo.health_implications
            }
            return allFav;  
        }
       
    } catch(err) {
        console.log("getFavorites error :", err)
    }
    
}

//-- ROUTES & CONTROLLERS -- //

// custom auth middleware that checks the cookies for a user id
// and if it finds one, looks up the user in the db
// tells all downstream routes about this user
app.use(async (req, res, next) =>{
    try{
        if(req.cookies.userId){
            //decrypt the userId and turn it into a string, userId is already a string so we dont need to .toString()
            const decryptedId = crypto.AES.decrypt(req.cookies.userId, process.env.SECRET)
            //convert decryptedId to string
            const decryptedString = decryptedId.toString(crypto.enc.Utf8)
            //the user is logged in, lets find these in the db
            //pass the descryptedString to find by Pk
            const user = await db.user.findByPk(decryptedString)
            //mount the logged in user in the res.locals
            res.locals.user = user
        } else {
            //set the logged in user to be null for conditional rendering
            res.locals.user = null
        }
        //move on to the next middleware/route
        next()
    } catch (err){
        console.log('error in auth middleware: ', err)
        //explicitely set user to null if there is an error
        res.locals.user = null
        next() //go to the next thing
    }
})

//list of cities in database combined with AQI data used to populate map
//leaflet map is a static js, this is to provide data to that file to populate the circles client-side
app.get('/api/cities', async (req, res)=>{ 
    try{
        allCities = await getMapData() 
        res.json({allCities})
    //console.log(res.json({allCities}))
    } catch (e){
        if (e.response.status == 502 ){
            console.log("502 error")
        } else {
            console.log("other error")
        }

    }
})

//gets data from all cities and makes it available to all views
//primarily used to create the autocomplete list for bootstrap in the nav view
app.use(async(req, res, next)=>{
    try{
        cityList = await getAllCities()
        res.locals.list = cityList
        //console.log(res.locals.list)
        next()
    } catch(e){
        console.log("cityList error : ", e)
        next()
    }
})


//gets city and aqi data for city searched for use in view
app.get('/search', async (req,res)=>{
    try{
        let cityName = req.query.city
        cityName = cityName.split(',') 
        let aqiData = await getAqiApiData(cityName[0].trim(), cityName[1].trim(), cityName[2].trim()) 
        let aqiInfo =  await getAqiInfo(aqiData.overall_aqi)
        
        res.render('search',{ 
            aqiData: aqiData,
            aqiColor: aqiInfo.color,
            aqiLevel: aqiInfo.level,
            aqiHealthImplications: aqiInfo.health_implications,
            city: cityName[0].trim(),
            state: cityName[1].trim(),
            country: cityName[2].trim()
        })
    } catch (err){
        console.log("error", err)
    }
})

//saves city and aqi data for the user (and day) to favorites database
app.post('/search', async(req,res)=>{
    try{ 
        let cityName = req.body.city
        cityName = cityName.split(',')       
        let aqiData = await getAqiApiData(cityName[0].trim(), cityName[1].trim(), cityName[2].trim())  
        const dbCity = await db.city.findOne({
            where:{city: cityName[0].trim()}
        })
        const newFavorite = await db.favorite.findOrCreate({
            where:{
                cityId: dbCity.id,
                date: new DATEONLY
            },
            defaults:{
                userId: res.locals.user.id,
                aqi: aqiData.overall_aqi,
                aqi_co: aqiData.CO.aqi,
                aqi_pm10: aqiData.PM10.aqi,
                aqi_so2: aqiData.SO2.aqi,
                aqi_pm2_5: aqiData["PM2.5"].aqi,
                aqi_o3: aqiData.O3.aqi,
                aqi_no2: aqiData.NO2.aqi,
                comments: ''
            }
        })
        const allFav = await db.favorite.findAll({
            where: {userId: res.locals.user.id},
            include: [db.user,db.city],
            order: [['id', 'DESC']]
        })
        
        for(const fav of allFav){
            aqiInfo = await getAqiInfo(fav.aqi)
            fav.overall_aqi_color = aqiInfo.color
            fav.level = aqiInfo.level
            fav.healthImplications = aqiInfo.health_implications
        }

        await res.render('favorite',{allFav})
       
    } catch(err){
        console.log("error",err)
    }
})

//lists favorites, with additional AQI info, for a particular user
//data is storted by date
app.get('/favorite', async (req,res)=>{
    try{
        const allFav = await getUserFavorites(res.locals.user.id,'createdAt', 'DESC')
        res.render('favorite',{allFav})
    
    } catch(err){
        console.log("error",err)
    }
})

//lists favorites, with additional AQI info, for a particular user
//data is storted by city
app.get('/favorite/city', async (req,res)=>{
    try{
        const allFav = await getUserFavorites(res.locals.user.id,'city', 'DESC',db.city)
        res.render('favorite',{allFav})
    } catch(err){
        console.log("error",err)
    }
})

//lists favorites, with additional AQI info, for a particular user
//data is storted by AQI number
app.get('/favorite/aqi', async (req,res)=>{
    try{
        const allFav = await getUserFavorites(res.locals.user.id,'aqi', 'DESC')
        res.render('favorite',{allFav})
    } catch(err){
        console.log("error",err)
    }
})

//saves comments to users saved favorite
app.post('/favorite',async(req,res)=>{
    try{
        await db.favorite.update({comments: req.body.comment}, {
            where: {
                id: req.body.id
            }
        })
  
    res.redirect('/favorite')
    
    } catch(err){
        console.log("error",err)
    }
})

//deletes favorite from users list of favorites (and database)
app.delete('/favorite', async (req,res)=>{
    await db.favorite.destroy({
        where: {
            id: req.body.deleteId
        }
    })
    res.redirect('/favorite')
})

//route for home page which displays map
app.get('/', async (req, res) => {
    try{
        await res.render('map', {
            user: res.locals.user
        })
    } catch(err){
        console.log('error message : ', err)
    }
})

//define users controllers
app.use('/users', require('./controllers/users'))

//listen on a port
app.listen(PORT, () => {
    console.log(`authenticating users on PORT ${PORT}`)
})