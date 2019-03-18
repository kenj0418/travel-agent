const vax = require("virtual-alexa")
const expect = require("chai").expect
const sinon = require("sinon")
const randomNumber = require("random-number").generator({
  min: 2,
  max: 10000,
  integer: true,
})
const randomString = require("random-string")
const flightServices = require("../../../lib/services/flightServices")

xdescribe("travelAgent alexa handler", () => {
  let alexa
  let mockGetRoutes

  beforeEach(() => {
    mockGetRoutes = sinon.stub(flightServices, "getRoutesForPairAndDate")

    alexa = vax.VirtualAlexa.Builder()
      .applicationID("amzn1.ask.skill.f000006c-c911-492b-bdf8-df0499442b9c")
      .handler("lib/alexa/travelAgent.handler")
      .interactionModelFile("test/model/travelAgent.json")
      .create()
  })

  afterEach(() => {
    mockGetRoutes.restore()
  })

  xit("need to figure out how to mock out the database persistence") //todo
  //todo also update skill info here from other project when its ready

  it("Startup, Intro", async () => {
    let reply = await alexa.launch()
    let replySSML = reply.response.outputSpeech.ssml
    expect(replySSML).to.include.string("Welcome to Travel Agent")
    expect(replySSML).to.include.string(
      "I can help with locating air travel prices."
    )
    expect(replySSML).to.include.string(
      "Ask for help at any time for assistance"
    )
    expect(replySSML).to.include.string("What would you like to know?")
  })

  xit("Startup, Returning User")

  it("Help", async () => {
    await alexa.launch()

    const helpReply = await alexa.utter("Help")
    let replySSML = helpReply.response.outputSpeech.ssml
    expect(replySSML).to.include("You can say")
    expect(replySSML).to.include("How much is a flight to Chicago")
    expect(replySSML).to.include(
      "Are there any non-stop flights from Orlando to Seatle"
    )
  })

  it("Stop", async () => {
    await alexa.launch()
    const stopReply = await alexa.utter("Stop")
    let replySSML = stopReply.response.outputSpeech.ssml
    expect(replySSML).to.include("Goodbye")
  })

  it("Cancel", async () => {
    await alexa.launch()
    const cancelReply = await alexa.utter("Cancel")
    let replySSML = cancelReply.response.outputSpeech.ssml
    expect(replySSML).to.include("Goodbye")
  })

  it("Both cities and date specified", async () => {})

  xit("No routes", async function() {
    mockGetRoutes.returns([])

    let reply = await alexa.launch()
    expect(reply.response.outputSpeech.ssml).to.include.string(
      "Sorry, I could not find any flights for you."
    )
  })

  xit("Found a route", async function() {
    const testPrice = randomNumber()
    mockGetRoutes.returns([{ MinPrice: testPrice }])

    let reply = await alexa.launch()
    expect(reply.response.outputSpeech.ssml).to.include.string(
      `I found a route that cost ${testPrice} dollars`
    )
  })

  xit("Error looking up routes", async function() {
    mockGetRoutes.throws(randomString())

    let reply = await alexa.launch()
    expect(reply.response.outputSpeech.ssml).to.include.string(
      "Sorry, there was a problem looking up flights."
    )
  })
})
