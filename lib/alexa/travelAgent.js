const Alexa = require("alexa-sdk")

// Replace with your app ID (OPTIONAL).
// You can find this value at the top of your skill's page on http://developer.amazon.com.
// Make sure to enclose your value in quotes,
// like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = "amzn1.ask.skill.f000006c-c911-492b-bdf8-df0499442b9c"

const handlers = {
  LaunchRequest: function() {
    this.emit("WhatDidILearnIntent")
  },

  WhatDidILearnIntent: function() {
    const say =
      "Congratulations! You have learned how to build your first Alexa skill."

    this.response.speak(say)
    this.emit(":responseReady")
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

exports = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback)
  alexa.APP_ID = APP_ID
  alexa.registerHandlers(handlers)
  alexa.execute()
}
