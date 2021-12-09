const {expect} = require("chai")
const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../server")
// bruger de nødvendige moduler, samt serveren, da det er her testen skal finde sted.
chai.use(chaiHttp)

describe ("Tester første krav", () => { // laver unit test funktionenerne 
    describe ("POST/register", () => {

        it("Skal registerer en user", (done) => {
            const user = { // opretter en bruger
            id: Date.now().toString(), //giver random id
            name: "Bruger", // sætter navn til "Bruger"
            email: "Bruger@Mail.com", //sætter mail til "Bruger@Mail.com"
            password : "$2b$10$3c4FAh80Vyzw/P47L07xV.YLPwpO3xrC0ESl0Zl3mb4F9xDt9FEj." //hashed password
            }
            chai
            .request(server)
            .post("/register")
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an("object") //forventer at bodyen er et objekt
                expect(res.body).to.not.be.an("array") //forventer ikke det er et array
                expect(user).to.have.property("name").eq("Bruger") // forventer navnet på user er lig det jeg satte det som
                expect(user).to.have.property("email").eq("Bruger@Mail.com") // forventer mail er lig det jeg satte den som
                expect(user).to.have.property("password").eq("$2b$10$3c4FAh80Vyzw/P47L07xV.YLPwpO3xrC0ESl0Zl3mb4F9xDt9FEj.") //forventer password er det samme som fortalt
                done()
            })  
        })
    })
})