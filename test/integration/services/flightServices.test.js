const flightServices = require("../../../lib/services/flightServices")
const expect = require("chai").expect

describe("fightServices integration tests", function() {
  this.timeout(5000)

  const tomorrow = () => {
    return new Date().toISOString().split("T")[0]
  }

  it("invalid airports throws error", async () => {
    let exceptionThrown = false
    try {
      await flightServices.getRoutesForPairAndDate("KJJ", "TST", tomorrow())
    } catch (ex) {
      exceptionThrown = true
    }
    expect(exceptionThrown).to.equal(true)
  })

  it("STL-ORD has routes for tomorrow", async () => {
    const routes = await flightServices.getRoutesForPairAndDate(
      "STL",
      "ORD",
      tomorrow()
    )
    expect(routes).to.exist
    expect(routes.length).to.be.at.least(1)
  })
})
