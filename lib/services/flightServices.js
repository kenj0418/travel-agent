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
    throw new Error("Error connecting to flight API")
  }
}

const getRoutesForPairAndDate = async (fromLoc, toLoc, flightDate) => {
  const result = await request
    .get(
      `https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/${fromLoc}/${toLoc}/anytime?inboundpartialdate=${flightDate}`
    )
    .set("X-RapidAPI-Key", getAPIKey())

  return parseResponse(result).Quotes
}

module.exports = {
  getRoutesForPairAndDate,
}
