const {expect} = require("chai")
const chai = require("chai")
const chaiHttp = require("chai-http")
const server = require("../server")

chai.use(chaiHttp)

describe ("Tester første krav", () => {
    describe ("POST/register", () => {

        it("Skal registerer en user", (done) => {
            const user = {
            id: Date.now().toString(),
            name: "Joachim",
            email: "Joachim@Mail.com",
            password : "$2b$10$3c4FAh80Vyzw/P47L07xV.YLPwpO3xrC0ESl0Zl3mb4F9xDt9FEj."
            }
            chai
            .request(server)
            .post("/register")
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.equal(200)
                expect(res.body).to.be.an("object")
                expect(res.body).to.not.be.an("array")
                expect(user).to.have.property("name").eq("Joachim")
                expect(user).to.have.property("email").eq("Joachim@Mail.com")
                expect(user).to.have.property("password").eq("$2b$10$3c4FAh80Vyzw/P47L07xV.YLPwpO3xrC0ESl0Zl3mb4F9xDt9FEj.")
                done()
            })  
        })
    })
})