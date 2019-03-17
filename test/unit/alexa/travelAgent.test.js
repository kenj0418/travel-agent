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

describe("travelAgent alexa handler", () => {
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

  xit("Startup, Intro", async () => {
    let reply = await alexa.launch()
    expect(reply.response.outputSpeech.ssml).to.include.string(
      "Welcome to Travel Agent"
    )
    expect(reply.response.outputSpeech.ssml).to.include.string(
      "Ask for help at any time for assistance"
    )
    expect(reply.response.outputSpeech.ssml).to.include.string(
      "look up flight costs"
    )
  })

  xit("Help")
  xit("Stop")

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
