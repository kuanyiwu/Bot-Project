var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');


//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var recognizer = new cognitiveservices.QnAMakerRecognizer({
	knowledgeBaseId: '37941069-bdd5-4022-a4e5-21be4d064e83', 
	subscriptionKey: 'dedd894dbd124ab5961165ac2e2e754c'});
	
var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({ 
	recognizers: [recognizer],
	defaultMessage: 'No match! Try changing the query terms!',
	qnaThreshold: 0.3});


//=========================================================
// Bots Dialogs
//=========================================================

var intents = new builder.IntentDialog();
bot.dialog('/', intents);

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);



intents.matches(/^chem/i, [
    function(session){
        session.send('I have nuclear chemistry for you today!');
        session.beginDialog('/review');
    }
   
]);

intents.matches(/^biology/i, [
    function(session){
        session.send('Really? You have a chem midterm next week, so lets study chem instead!');
        session.beginDialog('/review');
    } 
]);

intents.matches(/^programming/i, [
    function(session){
        session.send('Really? You have a chem midterm next week, so lets study chem instead!');
        session.beginDialog('/review');
    } 
]);

intents.matches(/^physics/i, [
    function(session){
        session.send('Really? You have a chem midterm next week, so lets study chem instead!');
        session.beginDialog('/review');
    } 
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, args, results) {
        session.send('Hello %s! I am your personized study bot.', session.userData.name);
        if (!session.userData.botname) {
            session.beginDialog('/botprofile');
        } else {
            next();
        }
    },
   
    
    function (session, results) {
        session.send('Hi, my name is %s! What do you want to study today?', session.userData.botname);
    }

]);



bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/botprofile', [
    function (session) {
        builder.Prompts.text(session, 'Can you name me something cool?');
    },
    function (session, results) {
        session.userData.botname = results.response;
        session.endDialog();
    }
]);


bot.dialog('/review', basicQnAMakerDialog);



