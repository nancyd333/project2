//required packages
require('dotenv').config()
const express = require('express')
const methodOverride = require('method-override');
const axios = require('axios');
const cookieParser = require('cookie-parser')
const db = require('./models')
const { defaults } = require('pg');
const { DATEONLY } = require('sequelize');
const crypto = require('crypto-js')

//app config
const app = express()
const PORT = process.env.PORT || 8000
const API_KEY = process.env.API_KEY //key for aqi api data
app.set('view engine', 'ejs')
app.use(methodOverride('_method')) //middleware to allow for delete method in HTTP request
app.use(express.urlencoded({extended: false})) //middleware to parse request bodies (req.body) from html forms
app.use(cookieParser()) //tell express to parse incoming cookies
app.use(express.static('public')) //tells express there are static files stored in folder named public

// custom auth middleware that checks the cookies for a user id
// and it finds one, look up the user in the db
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


// //example custom middleware (incoming request logger)
// app.use((req, res, next) => {
//     //our code goes here
//     //this is similar to 'morgan'
//     // console.log('hello from inside the middleware')
//     console.log(`incoming request: ${req.method} - ${req.url}`)
//     //res.locals are a place we can put data to share with 'downstream routes' (routes under this route)
//     // res.locals.myData = 'hello i am data'
//     //invoke next to go to the next route or middleware
//     next()
// })

//functions

//get data from api for one city
async function getAqiApiData(city){
    const aqiRequest = axios({
      method: 'get',
      url:  `https://api.api-ninjas.com/v1/airquality?city=${city}`,
      headers: {'X-Api-Key': API_KEY}
    }) 
    
    const aqiResponse = await aqiRequest
    const aqiData = aqiResponse.data
    return aqiData;
  }

  //returns the color associated with the AQI 
  function getAqiColor(aqiIndexNum){
    if (aqiIndexNum <= 50){
      return 'green';
    } else if(aqiIndexNum <= 100){
      return 'yellow';
    }  else if(aqiIndexNum <= 150){
      return 'orange';
    }  else if(aqiIndexNum <= 200){
      return 'red';
    }  else if(aqiIndexNum <= 300){
      return 'purple';
    } else if(aqiIndexNum >= 301){
      return 'maroon';
    } else {
      return 'grey';
    }
  } 
  

  //routes and controllers

app.get('/search', async (req,res)=>{
    try{
        let aqiData = await getAqiApiData(req.query.city) 
        res.render('search',{ 
        aqiData: aqiData,
        aqiColor: getAqiColor(aqiData.overall_aqi),
        city: req.query.city
    })
    } catch (err){
        console.log("error", err)
    }
})

app.post('/search', async(req,res)=>{
    try{ 
        let cityName = req.body.city
        let titleCaseCityName = cityName.split(" ").reduce( (s, c) => s +""+(c.charAt(0).toUpperCase() + c.slice(1) +" "), '').trim();
        let aqiData = await getAqiApiData(titleCaseCityName)  
        const dbCity = await db.city.findOne({
            where:{city: titleCaseCityName}
        })
        const newFavorite = db.favorite.findOrCreate({
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
    } catch(err){
      console.log("error",err)
    }
})

app.get('/favorite', async (req,res)=>{
    try{
        const allFav = await db.favorite.findAll({
            where: {userId: res.locals.user.id},
            include: [db.user,db.city],
            order: [
            ['id', 'DESC']
            ]
        })
        
        for(const fav of allFav){
            fav.overall_aqi_color = getAqiColor(fav.aqi)
        }
      
        res.render('favorite',{allFav})
    
    } catch(err){
      console.log("error",err)
    }
  })

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
  
app.delete('/favorite', async (req,res)=>{
    await db.favorite.destroy({
        where: {
            id: req.body.deleteId
        }
    })
    
    res.redirect('/favorite')
})

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