const Alexa = require('alexa-sdk');
const request = require("superagent")

// Replace with your app ID (OPTIONAL).
// You can find this value at the top of your skill's page on http://developer.amazon.com.
// Make sure to enclose your value in quotes,
// like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = 'amzn1.ask.skill.f000006c-c911-492b-bdf8-df0499442b9c';

const handlers = {
  'LaunchRequest' : function () {
    this.emit('WhatDidILearnIntent');
  },

  'WhatDidILearnIntent': async function () {
    try {
      const res = await request.get('https://www.buxfer.com/api/accounts?token=0evu76vsrdta40saruamvhr8v9')
  
      if (res.status === 200) {
        const body = JSON.parse(res.body.toString())
        if (body && body.response && body.response.accounts) {
          const accounts = body.response.accounts
          const carLoan = accounts.find((acct) => {return acct.name === "CapOne-Sonic"})
          if (carLoan) {
            const say = `The car loan balance is ${-carLoan.balance}`
            this.response.speak(say);
            this.emit(':responseReady');
          } else {
            const say = `Sorry, I couldn't find the car loan`
            this.response.speak(say);
            this.emit(':responseReady');
          }
        } else {
          const say = `Sorry, I didn't understand the response from the API`
          this.response.speak(say);
          this.emit(':responseReady');
        }
      } else {
        const say = `Sorry, I couldn't connect.  I received a status code of ${res.status}`
        this.response.speak(say);
        this.emit(':responseReady');
      }
    } catch (ex) {
      const say = `Sorry, I failed`
      console.error(say, ex)
  }

  },

  'AMAZON.HelpIntent': function () {
    const say = 'You can say what did I learn, or, you can say exit... How can I help you?';

    this.response.speak(say).listen(say);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function () {
    this.response.speak('Bye!');
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function () {
    this.response.speak('Bye!');
    this.emit(':responseReady');
  }
};

exports.handler = function (event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

handlers['WhatDidILearnIntent']()