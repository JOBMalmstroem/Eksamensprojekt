if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express') 
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
//Sætter de forselige externe moduler op, samt express og laver en app.

const initializePassport = require('./passport-config') //Bruger funktionen jeg har lavet i passport-config
const { name } = require('ejs')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user=> user.id === id)
) 
const fs = require("fs") //sætter fs op

const users = [] //laver mit users objekt
const products = [] // laver mit products array

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
//fortæller hvilke moduler, der skal bruges på appen.

// laver funktion der omdanner min users data til JSON
const data = (() => {
    let userData = JSON.stringify(users, null, 2);

    fs.writeFile("./Database/users.json", userData, (err) => {
        if (err) throw err
        console.log("data was send")
    })
})

// laver funktion der omdanner min products data til JSON
const pData =  (() => {
    let productData = JSON.stringify(products, null, 2);

    fs.writeFile("./Database/products.json", productData, (err) => {
        if (err) throw err
        console.log("data was send")
    })
})

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name }) // laver route til index siden
})

app.get('/login', checkNotAuthenticated, (req, res) => { // laver route til login siden
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, (passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))) // giver login funktionen noget hjerne

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
}) // laver route til register

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password : hashedPassword
        })
        res.status(200).redirect('/login')
    } catch {
        res.redirect('/register')
    }
    data()
    
}) //skaber brugeren når der bliver oprettet en bruger, og pusher til JSON

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
}) // via passport, blir brugeren logget af, det er logOut der gør dette

app.delete('/', (req,res) => {
    var indexId = req.user.id
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === indexId) {
         users.splice([i], 1)
          break;
        }
      }
    req.logOut()
    res.redirect('/login')
}) // laver et for loop, der sletter den specifikke bruger

app.get('/profile', checkAuthenticated, (req, res) => {
    res.render("profile.ejs")
}) // router til profil siden, hvor det er muligt at ændre sit brugernavn

app.put('/profile', checkAuthenticated, (req,res) => {
    var indexId = req.user.id
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === indexId) {
          users[i].name = req.body.name;
          break;
        }
      }
      res.redirect('/')
}) // sætter funktionen op der gør det muligt at ændre sit navn, via et for loop, lidt ala det der blev gjort i delete metoden.


app.get('/sales/opret', checkAuthenticated, (req, res) => {
    res.render("opret.ejs")
}) // router til sales, opret salg side.

app.post('/sales/opret', checkAuthenticated, (req, res) => {
        products.push({
            id: Date.now().toString(),
            navn: req.body.navn, 
            pris: req.body.price,
            kategori: req.body.category,
            image: req.body.img
        })
        pData()
        res.redirect('/sales')
}) // giver opret funktionen hjerne, så der nu bliver oprettet en vare, og pushet til JSON
app.get('/sales', checkAuthenticated, (req, res) => {
    res.render("sales.ejs", { 
        products: products
    })
})

app.get('/sales/:id', checkAuthenticated, (req, res) => {
    var productId = req.params.id
    console.log(productId)
    res.render("product.ejs", { 
    })
}) //router til det specifikke salgs id, hvor det er min products.ejs fil der bliver vist som side

app.put('/sales/:id', checkAuthenticated, (req,res) => {
try {
    products.push({
            id: Date.now().toString(),
            navn: req.body.navn, 
            pris: req.body.price,
            kategori: req.body.category,
            image: req.body.img
        }) 
        products.splice(0,1)
        res.status(200).redirect('/sales')
}
catch {
    res.status(400).redirect('/')
} // laver en funktion, der pusher en opdateret vare, ind i products objeketet

})

app.delete('/sales', (req,res) => {
    products.splice(0,products.length)
    res.status(200).redirect('/sales')
}) // laver en funktion der sletter salget.

app.get('/kategori/:kategori', (req, res) => {
    const kategorier = products.find(k=> k.kategori === req.params.kategori)
    if (!kategorier)
    return res.send("Forkert kategori")
    res.render('kategori.ejs' , {kategorier: kategorier})
})
//laver en route der viser en tabel over den individuelle kategori, så varene bliver opdelt efter kategeori

function checkAuthenticated(req,res, next) {
    if (req.isAuthenticated()) {
        return next()

    }
    res.redirect('/login')
} // tjekker om brugeren, er autentificeret

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    next() 
}// tjekker om brugeren ej er autentificeret
module.exports = app.listen (3456) //fortæller appen, på hvilken port den skal lytte, samtidig exporter jeg modulet, da jeg bruger det i min unittest.