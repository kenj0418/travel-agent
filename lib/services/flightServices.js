const request = require("superagent")

const getAPIKey = () => {
  if (process.env.RAPID_API_KEY) {
    return process.env.RAPID_API_KEY
  } else {
    throw new Error(
      "RAPID_API_KEY environment variable is required but not set"
    )
  }
}

const parseResponse = (result) => {
  if (result.status === 200) {
    return JSON.parse(result.text)
  } else {
    console.error("There was an unexpected response from the API")
    console.log(JSON.stringify(result))
    throw new Error("Error connecting to flight API")
  }
}

const makeGetQuery = async (urlPart, query) => {
  const url = `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices${urlPart}?${query}`
  console.log("Connecting to URL: " + url)
  console.log("with api key: " + getAPIKey())
  const result = await request.get(url).set("X-RapidAPI-Key", getAPIKey())
  console.log("received status of " + result.status)
  return parseResponse(result)
}

const getRoutesForPairAndDate = async (fromLoc, toLoc, flightDate) => {
  const response = await makeGetQuery(
    `/browsequotes/v1.0/US/USD/en-US/${fromLoc}/${toLoc}/anytime`,
    `inboundpartialdate=${flightDate}`
  )
  return response.Quotes
}

const getAirportsForCity = async (city) => {
  const response = await makeGetQuery(
    "/autosuggest/v1.0/US/USD/en-US/",
    `query=${city}`
  )
  return response.Places
}

module.exports = {
  getRoutesForPairAndDate,
  getAirportsForCity,
}
