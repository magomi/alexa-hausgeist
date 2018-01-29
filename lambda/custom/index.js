/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/

'use strict';

const Alexa = require('alexa-sdk');
const awsSDK = require('aws-sdk');

const docClient = new awsSDK.DynamoDB.DocumentClient();

const APP_ID = undefined;

const languageStrings = {
    'de': {
        translation: {
            SKILL_NAME:      'Alles Wisser',
            START_MESSAGE:   'Hallo, was möchtest du wissen?',
            HELP_MESSAGE:    'Ich kann mir merken, wann ein Familienmitglied an ' + 
                             'einem Wochentag nach Hause kommt. Sage zum Beispiel ' +
                             '\"Sag Alles Wisser, Mama kommt montags um sechzehn ' + 
                             'Uhr nach Hause?\" oder \"Frage Alles Wisser, wann ' + 
                             'Karla am Freitag nach hause kommt.\"',
            HELP_REPROMPT:   'Was möchtest du wissen?',
            STOP_MESSAGE:    'Auf Wiederhören!',
            ANSWER_OK_SHORT: '{{time}} Uhr',
            ANSWER_OK_LONG:  '{{person}} kommt am {{day}} um {{time}} Uhr nach hause.',
            ANSWER_MISSING:  'Das weiß ich leider nicht. Aber wenn du es mir sagst, ' + 
                             'dann merke ich es mir. Wann kommt {{person}} am {{day}} nach hause?',
            REPLY_REMEMBER:  'Ok, jetzt weiss ich, dass {{person}} am {{day}} um {{time}} Uhr ' +
                             'nach Hause kommt.'
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', this.t('START_MESSAGE'));
    },
    'FrageIntent': function () {
        var person = this.event.request.intent.slots.person.value;
        var day = this.event.request.intent.slots.day.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        if (this.attributes[person] && this.attributes[person][day]) {
            this.emit(':ask', this.t('ANSWER_OK_LONG', {person: person, day: day, time: this.attributes[person][day]}));
        } else {
            this.emit(':ask', this.t('ANSWER_MISSING', {person: person, day: day}));
        };
    },
    'SageIntent': function () {
        var person = this.event.request.intent.slots.person.value;
        var day = this.event.request.intent.slots.day.resolutions.resolutionsPerAuthority[0].values[0].value.name;
        var time = this.event.request.intent.slots.time.value;
        var data = {};
        if (this.attributes[person]) {
            data = this.attributes[person];
        };
        data[day] = time;
        this.attributes[person] = data;
        this.emit(':tell', this.t('REPLY_REMEMBER', {person: person, day: day, time: time}));
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_REPROMPT');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.NoIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.dynamoDBTableName = 'HausgeistData';
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
