const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if(user==Null){
            return done(null, false, {message: 'Ingen bruger med den mail'})
        }

        try {
            if (await bcrypt.compare(password, user.password)){

            }else {
                return done(null, false, {message: 'Forkert adgangskode'})
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => { 
        return done(null, getUserById(id))
    })
}

module.exports = initialize