//required packages
require('dotenv').config()
const express = require('express')
const methodOverride = require('method-override');
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


//example custom middleware (incoming request logger)
app.use((req, res, next) => {
    //our code goes here
    //this is similar to 'morgan'
    // console.log('hello from inside the middleware')
    console.log(`incoming request: ${req.method} - ${req.url}`)
    //res.locals are a place we can put data to share with 'downstream routes' (routes under this route)
    // res.locals.myData = 'hello i am data'
    //invoke next to go to the next route or middleware
    next()
})


//routes and controllers
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