var twilio = require('twilio'),
    http = require('http'),
    url = require('url'),
    ninjaBlocks = require('ninja-blocks'),
    sendgrid = require('sendgrid'),
    express = require('express'),
    request = require('request');

// Configuration
var config = {};
    config.port = process.env.PORT || 1337;
    config.voiceSettings = { voice: 'male', language: 'en' };
    config.transcribeCallback = 'http://hellojarvis.azurewebsites.net/command';
    config.recordAction = 'http://hellojarvis.azurewebsites.net/recorded';
    config.init = 'http://hellojarvis.azurewebsites.net/init';
    config.toPhone = '+13477668781';
    config.toMail = 'kunal.batra@sendgrid.com';
    config.sendGridUser = 'felixrieseberg';
    config.sendGridPass = 'simplepass55!';

var app = express();
app.use(express.bodyParser());

// Twilio Setup
var client = require('twilio')('AC438dba1590f2757677556763edf8cf3d', '4aea92d84380c717073d42effeff31c7');

// Ninja Setup
var ninja = ninjaBlocks.app({user_access_token:'jt0N6ClL6m9UFVP5V7yDiE5kx0gUvXA5dTlNSlRVwkA'});
var ninjaReadings = {};
getReadings();

// Things to say
var ttsGreetings = ['Mr Stark, how may I help?', 'Sir, how can I help?', 'Jarvis here, happy to assist Sir'];
var ttsYes = ['Of course, Sir', 'Sure, Mr Stark', 'Yes, Sir'];
var ttsElse = ['Anything else?'];

app.get('/init', function(req, res){
    getReadings();
    // Create a TwiML response
    var resp = new twilio.TwimlResponse();
    var greeting = ttsGreetings[Math.floor(Math.random() * ttsGreetings.length)];

    // The TwiML response object will have functions on it that correspond
    resp.say(config.voiceSettings, greeting)
        .record({
            action: config.recordAction,
            playBeep: 'false',
            timeout: 2,
            transcribe: 'true',
            transcribeCallback: config.transcribeCallback
        });

    //Render the TwiML document using "toString"
    res.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    res.end(resp.toString());
});

app.post('/init', function(req, res){
    getReadings();
    // Create a TwiML response
    var resp = new twilio.TwimlResponse();
    var greeting = ttsGreetings[Math.floor(Math.random() * ttsGreetings.length)];

    // The TwiML response object will have functions on it that correspond
    resp.say(config.voiceSettings, greeting)
        .record({
            action: config.recordAction,
            playBeep: 'false',
            timeout: 2,
            transcribe: 'true',
            transcribeCallback: config.transcribeCallback
        });

    //Render the TwiML document using "toString"
    res.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    res.end(resp.toString());
});

app.get('/presentation', function(req, res){
    // Create a TwiML response
    var resp = new twilio.TwimlResponse();

    // The TwiML response object will have functions on it that correspond
    resp.gather({ timeout:600, action:config.init, numDigits:1  }, function() {
 
        // In the context of the callback, "this" refers to the parent TwiML
        // node.  The parent node has functions on it for all allowed child
        // nodes. For <Gather>, these are <Say> and <Play>.
        this.play({ loop:10}, 'http://hellojarvis.azurewebsites.net/soundtrack2.mp3');
 
    });

    //Render the TwiML document using "toString"
    res.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    res.end(resp.toString());
});

app.post('/recorded', function (req, res) {
    // Create a TwiML response
    var resp = new twilio.TwimlResponse();
    var yes = ttsYes[Math.floor(Math.random() * ttsYes.length)];
    var plus;

    if (!ninjaReadings.temperatureGiven) {
        plus = 'Also, Sir, the current temperature indoors is ' + ninjaReadings.temperature + '.' + ninjaReadings.weatherMessage + 'Do you want me to turn on the heater?';
        ninjaReadings.temperatureGiven = true;
    }
    else {
        plus = ttsElse[Math.floor(Math.random() * ttsElse.length)];
    }

    // The TwiML response object will have functions on it that correspond
    resp.say(config.voiceSettings, yes + ' ' + plus)
            .record({
                action: config.recordAction,
                playBeep: 'false',
                timeout: 2,
                transcribe: 'true',
                transcribeCallback: config.transcribeCallback
            });

    //Render the TwiML document using "toString"
    res.writeHead(200, {
        'Content-Type': 'text/xml'
    });
    res.end(resp.toString());
})

app.post('/command', function (req, res) {
    var textBody = req.body.TranscriptionText || 'Nothing said...';

    if (textBody.indexOf("light") !== -1 || textBody.indexOf("lamp") !== -1 || textBody.indexOf("mike") !== -1 || textBody.indexOf("like") !== -1 || textBody.indexOf("life") !== -1 ) {
        if (textBody.indexOf("on") !== -1 || textBody.indexOf(" activate") !== -1) {
            sendSMS('Lights on!');
            var cmd = {
                on: true
            };
            ninja.device('2712BB000734_13_0_1008').actuate(JSON.stringify(cmd), function (err) {
                if (err) { res.json(err) };
            });
        } else if (textBody.indexOf("off") !== -1 || textBody.indexOf("deactivate") !== -1) {
            sendSMS('Lights off!');
            var cmd = {
                on: false
            };
            ninja.device('2712BB000734_13_0_1008').actuate(JSON.stringify(cmd), function (err) {
                if (err) { res.json(err) };
            });
        }
    } else if (textBody.indexOf("headlines") !== -1 || textBody.indexOf("e-mail") !== -1) {
        sendSMS('Headlines!');
        sendMail('Headlines, Sir!');
    }

    sendSMS(textBody);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Thanks!');
});

app.get('/ninja/devices', function (req, res) {
    ninja.devices(function (err, devices) {
      res.json(devices);
    })
});

app.get('/ninja/temperature', function (req, res) {
    ninja.device('2712BB000734_0101_0_31').last_heartbeat(function (err, data) {
        res.json(data);
    });
});

app.get('/ninja/temperature/data', function (req, res) {
    res.send(ninjaReadings.temperature);
});

app.get('/ninja/weather', function (req, res) {
    request('http://maidlab.com:8335/jarvisapp/weather/', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.json(body)
      }
    })
});

app.get('/ninja/weather/data', function (req, res) {
    res.send(ninjaReadings.weatherMessage);
});

app.use(express.static(__dirname + '/public'));
app.listen(config.port);

/////////////////////////////////////////////////////////////////////////////////////////

function getReadings() {
    ninja.device('2712BB000734_0101_0_31').last_heartbeat(function (err, data) {
        var temperature = data.DA * 9 / 5 + 32;
        ninjaReadings.temperature = temperature;
    });
    request('http://maidlab.com:8335/jarvisapp/weather/', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        ninjaReadings.weatherMessage = body.substring(1, body.length - 1);
      }
    })
};

function sendSMS(text) {
    client.sendSms({

        to: config.toPhone, // Any number Twilio can deliver to
        from: '+13475072834', // A number you bought from Twilio and can use for outbound communication
        body: text // body of the SMS message

    }, function (err, responseData) { //this function is executed when a response is received from Twilio

        if (!err) { // "err" is an error received during the request, if any

            // "responseData" is a JavaScript object containing data received from Twilio.
            // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
            // http://www.twilio.com/docs/api/rest/sending-sms#example-1

            console.log(responseData.from); // outputs "+14506667788"
            console.log(responseData.body); // outputs "word to your mother."

        }
    });
}

function sendMail(text) {
    var text = text || '';
    var SendGrid = require('sendgrid').SendGrid;
    var sendgrid = new SendGrid(config.sendGridUser, config.sendGridPass);
    sendgrid.send({
        to: config.toMail,
        from: 'jarvis@starkindustries.com',
        subject: 'Here are todays headlines',
        text: text
        }, function(success, message) {
           if (!success) {
               console.log(message);
           }
       });
}