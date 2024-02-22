let express = require("express");
let bodyParser = require("body-parser");
let session = require("express-session");
let fs = require("fs");
let cors = require("cors");
let dotenv = require('dotenv');

let axios = require("axios").default





let slugify = require("slugify");

let _ = require("lodash");


let Mongo = require("./models/mongodb");
let ObjectId = require("mongodb").ObjectID;


let app = express();

let path_public = "/public";

//let config = require("./configs/setup.js");

//let Mongo = require("./models/mongodb");
//var ObjectId = require("mongodb").ObjectID;


var moment = require('moment');

const { json } = require("express/lib/response");
const { isUndefined, round } = require("lodash");
const { ObjectID } = require("mongodb");

dotenv.config({});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(path_public, express.static(__dirname + "/public"));

app.set('views', __dirname + '/public/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(
  cors({
    origin: "*",
  })
);


const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
];
const credentials = {
  client_id: '558261511977-2lphgl96vd1lojmcnf1kq8j4dep9u19u.apps.googleusercontent.com',
  client_secret: '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',
  redirect_uris: ['https://calendar.mojay.pro/oauth2callback'],
};


const auth = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URIS
);

console.log('process.env.CLIENT_ID =>',process.env.CLIENT_ID);
console.log('process.env.CLIENT_SECRET =>',  process.env.CLIENT_SECRET);
console.log('process.env.REDIRECT_URIS =>',  process.env.REDIRECT_URIS);
console.log('process.env.API_KEY =>',  process.env.API_KEY);

const calendar = google.calendar({ version: 'v3', auth:   process.env.API_KEY});


const getAuthUrl = () => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
};

// After the user grants access, exchange the authorization code for access token and refresh token
const getAccessToken = async (code) => {
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  return tokens;
};


// Function to get user information


// Function to get user information

const getUserInfo = async () => {
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userinfo = await oauth2.userinfo.get();
    return userinfo.data;
  } catch (err) {
    console.error('Error fetching user information:', err);
    return null;
  }
};



app.get('/', (req, res) => {

  const authUrl = getAuthUrl();
  console.log({ 'authUrl': authUrl })
  res.render('login.html', { authUrl: authUrl })
  res.end();
});

app.get('/oauth2callback', async (req, res) => {

  const { code } = req.query;
  console.log('req.query ==>', req.query);
  console.log('code ==>', code);

  const tokens = await getAccessToken(code);
  console.log('tokens =>', tokens);

  const user = await getUserInfo();
  console.log('user bi ==>', user);


  Mongo.connect()
    .then((success) => {
      Mongo.findOrCreatetokenCalendarUser(user, tokens)
        .then((newUser) => {
             console.log('return user =>', newUser);
        })
        .catch((error) => {
             console.log('error erroring ==>', error);
        })

    });
  // Store the tokens securely for future API calls
  // You can save them in a database or secure storage
  res.send('Authorization successful!');
});

function transformData(events) {

  const formattedData = {};

  events.forEach((event) => {
    const starting = moment(event.start);
    let start = starting.format('YYYY-MM-DDTHH:mm:ss');

    const end = moment(event.end);
    starting.locale('fr');
    const day = starting.format('dddd D');
    const hourRange = starting.format('HH') + 'h-' + end.format('HH') + 'h';

    if (!formattedData[day]) {
      formattedData[day] = {
        title: day,
        rows: [],
      };
    }

    formattedData[day].rows.push({
      id: start,
      title: hourRange,
      description: '',
    });
  });

  return Object.values(formattedData);


}



app.get('/get/timeslot', (req, res) => {

  Mongo.connect()
    .then(async (success) => {

      var newUser = await Mongo.findUserToken({ email: 'dieyebow@gmail.com' })

      const user = newUser[0];
       
       console.log('calendar ==>',calendar);



      const authitdone = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URIS
      );
      
      console.log('authitdone ==>',authitdone);

      const now = new Date();
      const startDateTime = new Date(now);
      startDateTime.setHours(11, 0, 0, 0);

      const endDateTime = new Date(now);
      endDateTime.setDate(startDateTime.getDate() + 7);
      endDateTime.setHours(23, 0, 0, 0);

      const events = await calendar.events.list({
        auth: authitdone,
        calendarId: 'primary',
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });



      const busySlots = await events.data.items.map((event) => {
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        return { start, end };
      });

      console.log('busySlots==>', busySlots);

      const availableSlots = [];
      //let startTime = moment().hour().minute().second(0);
      let startTime = moment().startOf('hour');
      console.log('startTime => ',startTime);

      //let endTime = moment().hour(23).minute(0).second(0);

      const endTime = new Date(now);
      endTime.setDate(startDateTime.getDate() + 7);
      endTime.setHours(23, 0, 0, 0);


      let increment_it = 1;
      let limit_height = 10;
      console.log('availableSlots.length ==>',startTime.isBefore(endTime));
      console.log('endTime ==>',endTime);


      while (startTime.isBefore(endTime) && availableSlots.length < limit_height) {
        const twoHourLater = startTime.clone().add(2, 'hours');
        if (
          busySlots.every(
            (busySlot) =>
              twoHourLater.isBefore(busySlot.start) || startTime.isAfter(busySlot.end)
          )
        ) {

          console.log('(startTime.hour() > 11)',startTime.hour() > 11)
          console.log('(startTime.hour() < 22)',startTime.hour() < 22)

        // Check if startTime is 10 PM or later and handle accordingly
        if ( (startTime.hour() > 11) &&  (startTime.hour() < 22) ) {

          availableSlots.push({ start: startTime.clone(), end: twoHourLater });
        }

          //availableSlots.push({ start: startTime.clone(), end: twoHourLater });

        }
        startTime.add(1, 'hour');
      }
      if (startTime.isAfter(endTime)) {
        console.log('startTime.isAfter(endTime)', startTime.isAfter(endTime));
        startTime = moment().add(increment_it, 'days').hour(11).minute(0).second(0);
        endTime = moment().add(increment_it, 'days').hour(23).minute(0).second(0);
        increment_it++;
      }


      console.log('availableSlots=>', availableSlots);

      let formater = transformData(availableSlots)
      console.log('availableSlots FORMATED =>', formater);


      res.json({
        "type": "list",
        "id_element": "64776a71eeb41a73f1fcf22a_647773e9eeb41a73f1fcf230_list_jfWsl0Nd8DEI",
        "variable_storage": "dayselected",
        "id_previous": "64776a71eeb41a73f1fcf22a_647773e9eeb41a73f1fcf230_text_8ljDMSy3tQZZ",
        "interactive": {

          "type": "list",
          "header": {
            "type": "text",
            "text": "Jours"
          },
          "body": {
            "text": "Super, Quel jour souhaites tu venir pour faire ton enregistrement ? Merci de choisir le jour en cliquant sur le bouton ci-dessous."
          },
          "footer": {
            "text": ""
          },
          "action": {
            "button": "jour enregistrement",
            "sections": [
              formater
            ]
          }
        }
      });
      res.end();

    });



});


function transformTimeToISO8601(dateTime) {


  const datebi = dateTime.split('T')[0]; // Extract date from datetime
    const timebi = dateTime.split('T')[1].split(':')[0]; // Extract hour from datetime

    // Start time
    const startTime =  `${datebi}T${timebi}:00:00`

    // End time: add two hours
    const endHour = (parseInt(timebi, 10) + 2).toString().padStart(2, '0');
    const endTime = `${datebi}T${endHour}:00:00`

/**
 const [startTime, endTime] = horaire.split('-').map(time => {
   const [hour, minute] = time.split('h').map(Number);
   const paddedHour = hour.toString().padStart(2, '0');
   const paddedMinute = minute ? minute.toString().padStart(2, '0') : '00';
   return `${date}T${paddedHour}:${paddedMinute}:00${timeZoneOffset}`;
 * 
 * 
 * 
 */
    // Format single digit hours/minutes to double digits

  return { startTime, endTime };
}

app.post('/set/appointment', (req, res) => {

  console.log('/set/appointment',req.body);

  let {datas} = req.body;


  const received = datas.reduce((acc, item) => {

    console.log('item.value ==>', item.value);
    if(item.value == null){
        acc[item.idvariable] = null;
    }else{
        if (item.value.hasOwnProperty("value")) {
            if (item.value.type === 'variable_declared') {
                acc[item.idvariable] = item.value.value['variable_declared']['data']
            } else if (item.value.type === 'text') {
                acc[item.idvariable] = item.value.value['text']['body']
            } else {
                acc[item.idvariable] = item.value.value[item.value.type]
            }
        } else {
            acc[item.idvariable] = item.value;
        }
    }


    return acc;
}, {});

console.log(
  {
    received : received
   }
);
const {first_name, dayselected, reply_phone} = received;
  console.log(
      {
        first_name : first_name, dayselected : dayselected[dayselected.type]['id'], reply_phone: reply_phone
      }
    );
  let true_date = dayselected[dayselected.type]['id'];
  Mongo.connect()
    .then(async (success) => {

      var newUser = await Mongo.findUserToken({ email: 'dieyebow@gmail.com' })

      const user = newUser[0];
      const oauth2Client = new google.auth.OAuth2();

      oauth2Client.setCredentials({ access_token: user.access_token });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      
      const date = true_date;
      let the_appointment = transformTimeToISO8601(date);

      console.log('the_appointment ==>',the_appointment);

      const event = {
        summary: 'Appointment',
        location: 'Studio Enregistrement pour Neegurap',
        description: '',
        start: {
          dateTime: the_appointment.startTime,
          timeZone: 'Africa/Dakar',
        },
        end: {
          dateTime: the_appointment.endTime,
          timeZone: 'Africa/Dakar',
        },
        attendees: [{ email: 'Neegurap@gmail.com' }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };

      console.log('Event ==>', event);

      calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      }, (err, event) => {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event);
        res.json({
          "type": "text",
          "id_element": null,
          "id_previous": "64776a71eeb41a73f1fcf22a_64c91bbcbb0d87a3dfd21a66_request_lGmZfubj124T",
          "message": "votre rendez-vous a été booké avec succès",
          "preview_url": true
        });
        res.end();
      });

      //res.end();

    });



});


app.get('/set/appointment', (req, res) => {

  console.log('/set/appointment');




  Mongo.connect()
    .then(async (success) => {

      var newUser = await Mongo.findUserToken({ email: 'dieyebow@gmail.com' })

      const user = newUser[0];
      const oauth2Client = new google.auth.OAuth2();

      oauth2Client.setCredentials({ access_token: user.access_token });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      
      const date = '2023-08-01T13:00:00.301Z' 
      let the_appointment = transformTimeToISO8601(date);

      console.log('the_appointment ==>',the_appointment);

      const event = {
        summary: 'Appointment',
        location: 'Studio Enregistrement pour Neegurap',
        description: '',
        start: {
          dateTime: the_appointment.startTime,
          timeZone: 'Africa/Dakar',
        },
        end: {
          dateTime: the_appointment.endTime,
          timeZone: 'Africa/Dakar',
        },
        attendees: [{ email: 'zeuzkilla@gmail.com' }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      };

      console.log('Event ==>', event);

      calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      }, (err, event) => {
        if (err) {
          console.log('There was an error contacting the Calendar service: ' + err);
          return;
        }
        console.log('Event created: %s', event.htmlLink);
      });

      res.end();

    });

});

app.post('/post/code', (req, res) => {
  console.log('/post/code');
  console.log('req.body.stringify =>', JSON.stringify(req.body));

  let {datas} = req.body;


  const received = datas.reduce((acc, item) => {

    if(item.value == null){
        acc[item.idvariable] = null;
    }else{
        if (item.value.hasOwnProperty("value")) {
            if (item.value.type === 'variable_declared') {
                acc[item.idvariable] = item.value.value['variable_declared']['data']
            } else if (item.value.type === 'text') {
                acc[item.idvariable] = item.value.value['text']['body']
            } else {
                acc[item.idvariable] = item.value.value[item.value.type]
            }
        } else {
            acc[item.idvariable] = item.value;
        }
    }
    return acc;
}, {});

console.log('req.body.received =>', received);

res.json({
  "type": "text_button",
  "id_element": "64ccd8179c66552ba0730427_64ccd9a79c66552ba073042d_text_button_OFTDjexKTk9l",
  "id_previous": "64ccd8179c66552ba0730427_64ccd9a79c66552ba073042d_request_lKf4QWBLLLEM",
  "message": "Votre code est bien valide. Merci de cliquer sur le bouton ci-dessous pour continuer",
  "buttons": [
    {
      "id": "infos_user",
      "title": "Poursuivre",
      "payload": "{{hash}}=$2b$10$nPLj58tb7b1TmstHAkiF2Of.pfRJFs.6gCo/KK1MTa5Zt.QFUcun."
    }
  ]
});

  res.end();
});


app.post('/get/timeslot', (req, res) => {

  console.log('/get/timeslot');
  console.log('req.params =>', req.params);

  Mongo.connect()
  .then(async (success) => {

    var newUser = await Mongo.findUserToken({ email: 'dieyebow@gmail.com' })

    const user = newUser[0];
    //console.log('user==>',user);
    //const oauth2Client = new google.auth.OAuth2();

    //oauth2Client.setCredentials({ access_token: user.access_token });
    //const calendar = google.calendar({ version: 'v3', auth:   process.env.API_KEY});

    const now = new Date();
    const startDateTime = new Date(now);
    startDateTime.setHours(11, 0, 0, 0);

    const endDateTime = new Date(now);
    endDateTime.setDate(startDateTime.getDate() + 7);
    endDateTime.setHours(23, 0, 0, 0);

    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDateTime.toISOString(),
      timeMax: endDateTime.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });



    const busySlots = await events.data.items.map((event) => {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      return { start, end };
    });

    console.log('busySlots==>', busySlots);

    const availableSlots = [];
    //let startTime = moment().hour().minute().second(0);
    let startTime = moment().startOf('hour');
    console.log('startTime => ',startTime);

    //let endTime = moment().hour(23).minute(0).second(0);

    const endTime = new Date(now);
    endTime.setDate(startDateTime.getDate() + 7);
    endTime.setHours(23, 0, 0, 0);


    let increment_it = 1;
    let limit_height = 10;
    console.log('availableSlots.length ==>',startTime.isBefore(endTime));
    console.log('endTime ==>',endTime);


    while (startTime.isBefore(endTime) && availableSlots.length < limit_height) {
      const twoHourLater = startTime.clone().add(2, 'hours');
      if (
        busySlots.every(
          (busySlot) =>
            twoHourLater.isBefore(busySlot.start) || startTime.isAfter(busySlot.end)
        )
      ) {

        console.log('(startTime.hour() > 11)',startTime.hour() > 11)
        console.log('(startTime.hour() < 22)',startTime.hour() < 22)

      // Check if startTime is 10 PM or later and handle accordingly
      if ( (startTime.hour() > 11) &&  (startTime.hour() < 22) ) {

        availableSlots.push({ start: startTime.clone(), end: twoHourLater });
      }

        //availableSlots.push({ start: startTime.clone(), end: twoHourLater });

      }
      startTime.add(1, 'hour');
    }
    if (startTime.isAfter(endTime)) {
      console.log('startTime.isAfter(endTime)', startTime.isAfter(endTime));
      startTime = moment().add(increment_it, 'days').hour(11).minute(0).second(0);
      endTime = moment().add(increment_it, 'days').hour(23).minute(0).second(0);
      increment_it++;
    }


    console.log('availableSlots=>', availableSlots);

    let formater = transformData(availableSlots)
    console.log('availableSlots FORMATED =>', formater);


    res.json({
      "type": "list",
        "id_element": "64776a71eeb41a73f1fcf22a_64c28218d59b986c4f4844cd_request_RIbk32yK0pZC",
      "variable_storage": "dayselected",
        "id_previous": "64776a71eeb41a73f1fcf22a_64c28218d59b986c4f4844cd_text_Rp2AjzhEfBAD",

      "interactive": {

        "type": "list",
        "header": {
          "type": "text",
          "text": "Jours"
        },
        "body": {
          "text": "Super, Quel jour souhaites tu venir pour faire ton enregistrement ? Merci de choisir le jour en cliquant sur le bouton ci-dessous."
        },
        "footer": {
          "text": ""
        },
        "action": {
          "button": "jour enregistrement",
          "sections": formater
        }
      }
    });
    res.end();

  });
  
//OLD
/*
  Mongo.connect()
    .then(async (success) => {

      var newUser = await Mongo.findUserToken({ email: 'dieyebow@gmail.com' })

      const user = newUser[0];
      //console.log('user==>',user);
      const oauth2Client = new google.auth.OAuth2();

      oauth2Client.setCredentials({ access_token: user.access_token });
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const now = new Date();
      const startDateTime = new Date(now);
      startDateTime.setHours(11, 0, 0, 0);

      const endDateTime = new Date(now);
      endDateTime.setDate(startDateTime.getDate() + 7);
      endDateTime.setHours(23, 0, 0, 0);

      const events = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });



      const busySlots = await events.data.items.map((event) => {
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        return { start, end };
      });

      console.log('busySlots==>', busySlots);

      const availableSlots = [];
      let startTime = moment().hour(11).minute(0).second(0);
      let endTime = moment().hour(23).minute(0).second(0);
      let increment_it = 1;
      let limit_height = 5;
      console.log('availableSlots.length ==>')
      while (startTime.isBefore(endTime) && availableSlots.length < limit_height) {
        const twoHourLater = startTime.clone().add(2, 'hours');
        if (
          busySlots.every(
            (busySlot) =>
              twoHourLater.isBefore(busySlot.start) || startTime.isAfter(busySlot.end)
          )
        ) {
          //while ( availableSlots.length < limit_height ) {

          availableSlots.push({ start: startTime.clone(), end: twoHourLater });
          //}
        }
        startTime.add(1, 'hour');
      }
      if (startTime.isAfter(endTime)) {
        console.log('startTime.isAfter(endTime)', startTime.isAfter(endTime));
        startTime = moment().add(increment_it, 'days').hour(11).minute(0).second(0);
        endTime = moment().add(increment_it, 'days').hour(23).minute(0).second(0);
        increment_it++;
      }


      console.log('availableSlots=>', availableSlots);

      let formater = transformData(availableSlots)
      console.log('availableSlots FORMATED =>', formater);


      res.json({
        "type": "list",
        "id_element": "64776a71eeb41a73f1fcf22a_64c28218d59b986c4f4844cd_request_RIbk32yK0pZC",
        "variable_storage": "dayselected",
        "id_previous": "64776a71eeb41a73f1fcf22a_64c28218d59b986c4f4844cd_text_Rp2AjzhEfBAD",
        "interactive": {

          "type": "list",
          "header": {
            "type": "text",
            "text": "Jours"
          },
          "body": {
            "text": "Super, Quel jour souhaites tu venir pour faire ton enregistrement ? Merci de choisir le jour en cliquant sur le bouton ci-dessous."
          },
          "footer": {
            "text": ""
          },
          "action": {
            "button": "jour enregistrement",
            "sections": formater
          }
        }
      });
      res.end();

    });
*/


});


app.listen(2211);
