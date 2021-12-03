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

const initializePassport = require('./passport-config')
const { name } = require('ejs')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user=> user.id === id)
)
const fs = require("fs")

const users = []
const products = []

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

const data = (() => {
    let userData = JSON.stringify(users, null, 2);

    fs.writeFile("./Database/users.json", userData, (err) => {
        if (err) throw err
        console.log("data was send")
    })
})

const pData =  (() => {
    let productData = JSON.stringify(products, null, 2);

    fs.writeFile("./Database/products.json", productData, (err) => {
        if (err) throw err
        console.log("data was send")
    })
})

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, (passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
})))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password : hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    data()
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

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
    console.log(users)
})

app.get('/profile', checkAuthenticated, (req, res) => {
    res.render("profile.ejs")
})

app.put('/profile', checkAuthenticated, (req,res) => {
    var indexId = req.user.id
    for (var i = 0; i < users.length; i++) {
        if (users[i].id === indexId) {
          users[i].name = req.body.name;
          break;
        }
      }
      res.redirect('/')
      console.log(users)
})


app.get('/sales/opret', checkAuthenticated, (req, res) => {
    res.render("opret.ejs")
})

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
        console.log(products)
})
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
})

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
} console.log(products)
})

app.delete('/sales', (req,res) => {
    products.splice(0,products.length)
    res.status(200).redirect('/sales')
})

app.get('/kategori/:kategori', (req, res) => {
    const kategorier = products.find(k=> k.kategori === req.params.kategori)
    if (!kategorier)
    return res.send("Forkert kategori")
    res.render('kategori.ejs' , {kategorier: kategorier})
})


function checkAuthenticated(req,res, next) {
    if (req.isAuthenticated()) {
        return next()

    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()){
       return res.redirect('/')
    }
    next()
}
app.listen (3456)