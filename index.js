//required packages
require('dotenv').config()
const express = require('express')

//app config
const app = express()
const PORT = process.env.PORT || 8000
app.set('view engine', 'ejs')
//middleware to parse request bodies (req.body) from html forms
app.use(express.urlencoded({extended: false}))


//routes and controllers
app.get('/', (req, res) => {
    res.render('home.ejs')
})

//define users controllers
app.use('/users', require('./controllers/users'))



//listen on a port
app.listen(PORT, () => {
    console.log(`authenticating users on PORT ${PORT}`)
})