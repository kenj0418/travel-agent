const Alexa = require("ask-sdk-core")
const {
  DynamoDbPersistenceAdapter,
} = require("ask-sdk-dynamodb-persistence-adapter")
const persistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: "TravelAgentUserInfo",
  createTable: true,
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
      .speak("Sorry, I can't understand the command. Please say again.")
      .reprompt("Sorry, I can't understand the command. Please say again.")
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
    PriceFlightIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .withPersistenceAdapter(persistenceAdapter)
  .addErrorHandlers(ErrorHandler)
  .lambda()
