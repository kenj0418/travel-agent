const Alexa = require("ask-sdk-core")
// const Alexa = require("alexa-sdk")
const flightServices = require("../services/flightServices")

const APP_ID = "amzn1.ask.skill.f000006c-c911-492b-bdf8-df0499442b9c"

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest"
  },

  handle(handlerInput) {
    const welcome = "Welcome to Travel Agent."
    const firstVisit = "It looks like this is your first visit." //todo later check to see if they are a returning user
    const whatICanDo = "I can help with locating air travel prices."
    const helpInfo = "Ask for help at any time for assistance."
    const userPrompt = "What would you like to know?"
    const speechText = `${welcome} ${firstVisit} ${whatICanDo} ${helpInfo} ${userPrompt}`

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard("Travel Agent", speechText)
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
      .withSimpleCard("Travel Agent", speechText)
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
      .withSimpleCard("Travel Agent", speechText)
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
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
