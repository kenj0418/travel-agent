const Alexa = require("alexa-sdk")
const flightServices = require("../services/flightServices")

const APP_ID = "amzn1.ask.skill.f000006c-c911-492b-bdf8-df0499442b9c"

const handlers = {
  LaunchRequest: function() {
    this.emit("WhatDidILearnIntent")
  },

  WhatDidILearnIntent: async function() {
    // const request = require("superagent")
    // try {
    //   const res = await request.get(
    //     "https://www.buxfer.com/api/accounts?token=x"
    //   )
    //   if (res.status === 200) {
    //     const body = JSON.parse(res.body.toString())
    //     if (body && body.response && body.response.accounts) {
    //       const accounts = body.response.accounts
    //       const carLoan = accounts.find((acct) => {
    //         return acct.name === "CapOne-Sonic"
    //       })
    //       if (carLoan) {
    //         const say = `The car loan balance is ${-carLoan.balance}`
    //         this.response.speak(say)
    //         this.emit(":responseReady")
    //       } else {
    //         const say = `Sorry, I couldn't find the car loan`
    //         this.response.speak(say)
    //         this.emit(":responseReady")
    //       }
    //     } else {
    //       const say = `Sorry, I didn't understand the response from the API`
    //       this.response.speak(say)
    //       this.emit(":responseReady")
    //     }
    //   } else {
    //     const say = `Sorry, I couldn't connect.  I received a status code of ${
    //       res.status
    //     }`
    //     this.response.speak(say)
    //     this.emit(":responseReady")
    //   }
    // } catch (ex) {
    //   const say = `Sorry, I failed`
    //   console.error(say, ex)
    //   this.response.speak(say)
    //   this.emit(":responseReady")
    // }
    ////////////////////
    try {
      /*
          Welcome to MySkill. Looks like this is your first visit. I’ll explain a couple things you can do and keep in mind, you can ask for ‘help’ any time for assistance. MySkill can provide info on best practices, suggestions on how to do things and much more. What would you like to do?

          
      */
      const routes = await flightServices.getRoutesForPairAndDate(
        "STL",
        "ORD",
        "2019-04-01"
      )
      if (!routes || !routes.length) {
        this.response.speak("Sorry, I could not find any flights for you.")
        this.emit(":responseReady")
      } else {
        this.response.speak(
          `I found a route that cost ${routes[0].MinPrice} dollars`
        )
        this.emit(":responseReady")
      }
    } catch (ex) {
      console.error("Error getting routes", ex)
      this.response.speak("Sorry, there was a problem looking up flights.")
      this.emit(":responseReady")
    }
    ////////////////////
    // const say =
    //   "Congratulations! You have learned how to build your first Alexa skill."
    // this.response.speak(say)
    // this.emit(":responseReady")
  },

  "AMAZON.HelpIntent": function() {
    const say =
      "You can say what did I learn, or, you can say exit... How can I help you?"

    this.response.speak(say).listen(say)
    this.emit(":responseReady")
  },
  "AMAZON.CancelIntent": function() {
    this.response.speak("Bye!")
    this.emit(":responseReady")
  },
  "AMAZON.StopIntent": function() {
    this.response.speak("Bye!")
    this.emit(":responseReady")
  },
}

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.appId = APP_ID
  alexa.registerHandlers(handlers)
  alexa.execute()
}
