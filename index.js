const flightServices = require("./lib/services/flightServices")

const main = async () => {
  const routes = await flightServices.getRoutesForPairAndDate(
    "STL",
    "ORD",
    "2019-04-01"
  )
  console.log(JSON.stringify(routes, null, 2))
}

main()
  .then(() => {
    console.log("***")
  })
  .catch((err) => {
    console.error("Error received", err)
  })
