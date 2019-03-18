const Alexa = require("alexa-sdk")
const flightServices = require("../services/flightServices")

const APP_ID = "amzn1.ask.skill.f000006c-c911-492b-bdf8-df0499442b9c"

const handlers = {
  LaunchRequest: function() {
    this.emit("WelcomeIntent")
  },

  WelcomeIntent: async function() {
    const welcome = "Welcome to Travel Agent."
    const firstVisit = "It looks like this is your first visit." //todo later check to see if they are a returning user
    const whatICanDo = "I can help with locating air travel prices."
    const helpInfo = "Ask for help at any time for assistance."
    const userPrompt = "What would you like to know?"
    this.response.speak(
      `${welcome} ${firstVisit} ${whatICanDo} ${helpInfo} ${userPrompt}`
    )
    this.emit(":responseReady")
  },

  WhatDidILearnIntent: async function() {
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
  },

  "AMAZON.HelpIntent": function() {
    const flightPrice = "How much is a flight to Chicago"
    const flightExists = "Are there any non-stop flights from Orlando to Seatle"
    const say = `You can say things like ${flightPrice} or ${flightExists}`

    this.response.speak(say).listen(say)
    this.emit(":responseReady")
  },
  "AMAZON.CancelIntent": function() {
    this.response.speak("Goodbye!")
    this.emit(":responseReady")
  },
  "AMAZON.StopIntent": function() {
    this.response.speak("Goodbye!")
    this.emit(":responseReady")
  },
}

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.appId = APP_ID
  alexa.registerHandlers(handlers)
  alexa.execute()
}
