const Alexa = require("ask-sdk")
const {
  DynamoDbPersistenceAdapter,
} = require("ask-sdk-dynamodb-persistence-adapter")
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: "TravelAgentUserInfo",
  createTable: true,
})
const googleMapsClient = require("@google/maps").createClient({
  key: process.env.GOOGLE_PLACES_API_KEY,
})
const flightServices = require("../services/flightServices")

const CARD_TITLE = "Travel Agent"

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest"
  },

  async handle(handlerInput) {
    let attributes = await handlerInput.attributesManager.getPersistentAttributes()

    let speechText
    if (attributes.lastVisit) {
      const welcome = "Welcome back to Travel Agent."
      const userPrompt = "What would you like to know?"
      speechText = `${welcome} ${userPrompt}`
    } else {
      const welcome = "Welcome to Travel Agent."
      const firstVisit = "It looks like this is your first visit."
      const whatICanDo = "I can help with locating air travel prices."
      const helpInfo = "Ask for help at any time for assistance."
      const userPrompt = "What would you like to know?"
      speechText = `${welcome} ${firstVisit} ${whatICanDo} ${helpInfo} ${userPrompt}`
    }

    attributes.lastVisit = new Date()
    handlerInput.attributesManager.setPersistentAttributes(attributes)
    handlerInput.attributesManager.savePersistentAttributes()

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse()
  },
}

const getSlotValue = (request, slotName) => {
  return request.intent.slots[slotName] && request.intent.slots[slotName].value
}

//todo change other Intents to all use async/await

const randomElement = (arr) => {
  if (!arr || !arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

const util = require("util")
const findPlace = util.promisify(googleMapsClient.findPlace)
const place = util.promisify(googleMapsClient.place)
const placesPhoto = util.promisify(googleMapsClient.placesPhoto)

const getCityPlace = async (city) => {
  console.log(`Looking up ${city}`)
  const result = await findPlace({ input: city, inputtype: "textquery" })
  if (result.status !== 200) {
    throw new Error(`Invalid response code ${result.status}`)
  } else if (
    !result.json ||
    !result.json.candidates ||
    !result.json.candidates.length
  ) {
    throw new Error(`Could not find anything for ${city}`)
  }

  const candidatePlaceId = result.json.candidates[0].place_id
  console.log(`getting place for id ${candidatePlaceId}`)
  const photosResponse = await place({
    placeid: candidatePlaceId,
    fields: ["photo"],
  })
  if (photosResponse.status !== 200) {
    throw new Error(`Invalid response code ${photosResponse.status}`)
  } else if (
    !photosResponse.json ||
    !photosResponse.json.result ||
    !photosResponse.json.result.photos ||
    !photosResponse.json.result.photos.length
  ) {
    throw new Error(`Could not find photos for ${candidatePlaceId}`)
  }

  const selectedPhoto = randomElement(photosResponse.json.result.photos)

  console.log(`selectedPhoto: ${JSON.stringify(selectedPhoto)}`)
  console.log(`getting photo for reference ${selectedPhoto.photo_reference}`)
  const photoResult = await placesPhoto({
    photoreference: selectedPhoto.photo_reference,
    maxwidth: 1920,
  })
  if (photoResult.status !== 200) {
    throw new Error(`Invalid response code ${photoResult.status}`)
  }

  const photoURL =
    "https://" + photoResult.req.socket._host + photoResult.req.path
  console.log(`returning photo url ${photoURL}`)
  return photoURL
}

const CityInfoIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    console.log("request", JSON.stringify(request, null, 2))

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "CityInfoIntent"
    )
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request

    const city = getSlotValue(request, "city")

    try {
      await callDirectiveService(handlerInput, city)
    } catch (err) {
      // if it failed we can continue, just the user will wait longer for first response
      console.log("There was an error calling the directive service", err)
    }

    try {
      const cityUrl = await getCityPlace(city)

      if (cityUrl) {
        console.log(`Returning URL: ${cityUrl}`)
        const foundMsg = `Here is an photo of ${city}`
        return handlerInput.responseBuilder
          .speak(foundMsg)
          .withStandardCard(CARD_TITLE, city, null, cityUrl)
          .getResponse()
      } else {
        console.log(`No image found for ${city}`)
        const noImageMsg = `Sorry, I couldn't find an image for ${city}`
        return handlerInput.responseBuilder
          .speak(noImageMsg)
          .withSimpleCard(CARD_TITLE, noImageMsg)
          .getResponse()
      }
    } catch (ex) {
      console.error("Unable to query google places", ex)
      const errMsg = "Sorry, I had trouble looking that up."
      return handlerInput.responseBuilder
        .speak(errMsg)
        .withSimpleCard(CARD_TITLE, errMsg)
        .getResponse()
    }
  },
}

const PersonThinkingIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "PersonThinkingIntent"
    )
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    const name = getSlotValue(request, "name").toUpperCase()

    let url
    if (name === "GABE" || name === "GABRIEL") {
      url =
        "https://d253b1eioa5z7b.cloudfront.net/venue_images/medium_a0df2ab1-b498-4f2d-97a3-3d8a9de3c7a1.jpg"
    } else if (name === "PHILLIP" || name === "PHIL" || name === "PHILIP") {
      url =
        "https://pm1.narvii.com/6299/3e8e76f063d0026d98ba28c82a4045fd7b96012d_hq.jpg"
    } else if (
      name === "KEN" ||
      name === "KENNETH" ||
      name === "DAD" ||
      name === "JESSE" ||
      name === "JESSIE"
    ) {
      url =
        "https://compote.slate.com/images/60016f5f-f866-4fb3-8060-c3b5f47f349b.jpeg?width=780&height=520&offset=0x0&rect=1560x1040"
    } else if (name === "CLARE" || name === "CLAIRE" || name === "CLAIR") {
      url =
        "https://www.dogbreedinfo.com/images30/ToyAustralianShepherdLewisLeweyPurebredDog1HalfYearsOld1.jpg"
    } else if (name === "AUDREY" || name === "AUDIE") {
      url =
        "https://lh3.googleusercontent.com/-fZOPAdvNWC0/U4dZhrrbnDI/AAAAAAAAOJY/H7dWZSzL8ZsMgY-1sSt_fgDggChppY7DQCHMYBhgL/s1280/104.jpg"
    } else if (name === "LENA" || name === "LINA") {
      url = "https://i.ytimg.com/vi/zr1bH0xIGgg/maxresdefault.jpg"
    } else {
      url = null
    }

    if (url) {
      return handlerInput.responseBuilder
        .speak(`I think I can see into the mind of ${name}`)
        .withStandardCard(CARD_TITLE, `The mind of ${name}`, null, url)
        .getResponse()
    } else {
      return handlerInput.responseBuilder
        .speak(`The mind of ${name} is a mystery to me`)
        .withStandardCard(
          CARD_TITLE,
          `${name} is a mystery to me`,
          null,
          "https://behindtheuniverse.files.wordpress.com/2014/12/maxresdefault.jpg?w=783&h=446"
        )
        .getResponse()
    }
  },
}

function callDirectiveService(handlerInput, city) {
  // Call Alexa Directive Service.
  const requestEnvelope = handlerInput.requestEnvelope
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient()

  const requestId = requestEnvelope.request.requestId
  const endpoint = requestEnvelope.context.System.apiEndpoint
  const token = requestEnvelope.context.System.apiAccessToken

  // build the progressive response directive
  const directive = {
    header: {
      requestId,
    },
    directive: {
      type: "VoicePlayer.Speak",
      speech: `Please wait while I look up ${city}...`,
    },
  }

  // send directive
  directiveServiceClient.enqueue(directive, endpoint, token)
}

const PriceFlightIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    console.log("request", JSON.stringify(request, null, 2))

    return (
      request.type === "IntentRequest" &&
      request.intent.name === "PriceFlightIntent"
    )
  },
  handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request
    googleMapsClient
    //todo debugging message
    const startingCity = getSlotValue(request, "startingCity")
    const endingCity = getSlotValue(request, "endingCity")
    let debugMessage = "price test "
    if (startingCity) {
      debugMessage += "from " + startingCity
    }
    if (endingCity) {
      debugMessage += "to " + endingCity
    }

    //todo should prompt user for starting city if we don't already know it (either from response or their home city)

    return handlerInput.responseBuilder
      .speak(debugMessage)
      .withSimpleCard(CARD_TITLE, debugMessage)
      .getResponse()
  },
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    )
  },
  handle(handlerInput) {
    const flightPrice = "How much is a flight to Chicago"
    const flightExists = "Are there any non-stop flights from Orlando to Seatle"
    const speechText = `You can say things like ${flightPrice} or ${flightExists}`

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse()
  },
}

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.CancelIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.StopIntent")
    )
  },
  handle(handlerInput) {
    const speechText = "Goodbye!"

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(CARD_TITLE, speechText)
      .getResponse()
  },
}

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log(`Looking for handler for ${JSON.stringify(handlerInput)}`)
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest"
  },
  handle(handlerInput) {
    console.log(
      `Session ended with reason: ${
        handlerInput.requestEnvelope.request.reason
      }`
    )

    return handlerInput.responseBuilder.getResponse()
  },
}

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`)

    return handlerInput.responseBuilder
      .speak("Sorry, and error occured")
      .getResponse()
  },
}

////////////////////
// try {
//   /*
//       Welcome to MySkill. Looks like this is your first visit. I’ll explain a couple things you can do and keep in mind, you can ask for ‘help’ any time for assistance. MySkill can provide info on best practices, suggestions on how to do things and much more. What would you like to do?
//   */
//   const routes = await flightServices.getRoutesForPairAndDate(
//     "STL",
//     "ORD",
//     "2019-04-01"
//   )
//   if (!routes || !routes.length) {
//     this.response.speak("Sorry, I could not find any flights for you.")
//     this.emit(":responseReady")
//   } else {
//     this.response.speak(
//       `I found a route that cost ${routes[0].MinPrice} dollars`
//     )
//     this.emit(":responseReady")
//   }
// } catch (ex) {
//   console.error("Error getting routes", ex)
//   this.response.speak("Sorry, there was a problem looking up flights.")
//   this.emit(":responseReady")
// }

const skillBuilder = Alexa.SkillBuilders.custom()
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    CityInfoIntentHandler,
    PriceFlightIntentHandler,
    PersonThinkingIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .withPersistenceAdapter(persistenceAdapter)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda()
