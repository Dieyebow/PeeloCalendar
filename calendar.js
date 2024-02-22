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
const OAuth2 = google.auth.OAuth2;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
];

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URIS
);


const authorizeUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
};




app.get('/auth/google', (req, res) => {
  console.log('/auth/google');
  const link = authorizeUrl();
  console.log('link ==>', link + '&prompt=consent');
  res.status(302).header('Location', authorizeUrl()).send();
  res.end();
});











// Function to get user information


// Function to get user information

const getUserInfo = async () => {
  return new Promise((resolve, reject) => {
    try {
      const client = google.oauth2('v2');
      client.userinfo.get({ auth: oauth2Client }, (err, info) => {
        if (err) {
          // let done  = handleError(err)
          reject(err)
        }
        resolve(info.data)
      });
    } catch (err) {
      reject(err)
    }
  });
};


function refreshAccessToken(oauth2Client, user) {
  return new Promise((resolve, reject) => {
    // Refresh the access token
    oauth2Client.refreshAccessToken(async (err, tokens) => {

      if (err) {
        // Handle error  
        console.log('refreshAccessToken ==>', err)
        reject(new Error(err))

      }
      // Updated tokens    
      oauth2Client.setCredentials(tokens);

      // Store new refresh token
      //await db.updateRefreshToken(userEmail, tokens.refresh_token); 

      const condition = {
        "email": user.email
      }
      const newdata = {
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "expiry_date": new Date(tokens.expiry_date)
      }


      Mongo.connect()
        .then((success) => {

          Mongo.updateUserToken(condition, newdata)

            .then((updated) => {
              Mongo.disconnect();

              resolve({
                type: "updated_user",
                datas: updated
              });
            })
            .catch((errorupdate) => {
              reject(new Error(errorupdate))
              Mongo.disconnect();

            })
        });
      // Available for API calls
    });
  });
}


app.get('/oauth2callback', async (req, res) => {

  oauth2Client.getToken(req.query.code, async (err, tokens) => {
    // Store tokens in oauth2Client
    oauth2Client.setCredentials(tokens);
    // Store refresh token to reuse later
    const user = getUserInfo()
      .then((user) => {
        Mongo.connect()
          .then((success) => {
            Mongo.findOrCreatetokenCalendarUser(user, tokens)
              .then((newUser) => {
              })
              .catch((error) => {
              })

          });
      })
      .catch((error) => {
      });

    res.send('Authentication successful!')
  });

});




async function getListEvent(oauth2Client) {



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

  const availableSlots = [];
  //let startTime = moment().hour().minute().second(0);
  let startTime = moment().startOf('hour');

  //let endTime = moment().hour(23).minute(0).second(0);

  const endTime = new Date(now);
  endTime.setDate(startDateTime.getDate() + 7);
  endTime.setHours(23, 0, 0, 0);


  let increment_it = 1;
  let limit_height = 10;


  while (startTime.isBefore(endTime) && availableSlots.length < limit_height) {
    const twoHourLater = startTime.clone().add(2, 'hours');
    if (
      busySlots.every(
        (busySlot) =>
          twoHourLater.isBefore(busySlot.start) || startTime.isAfter(busySlot.end)
      )
    ) {

      //  console.log('(startTime.hour() > 11)',startTime.hour() > 11)
      // console.log('(startTime.hour() < 22)',startTime.hour() < 22)

      // Check if startTime is 10 PM or later and handle accordingly
      if ((startTime.hour() > 11) && (startTime.hour() < 22)) {

        availableSlots.push({ start: startTime.clone(), end: twoHourLater });
      }

      //availableSlots.push({ start: startTime.clone(), end: twoHourLater });

    }
    startTime.add(1, 'hour');
  }


  if (startTime.isAfter(endTime)) {
    //console.log('startTime.isAfter(endTime)', startTime.isAfter(endTime));
    startTime = moment().add(increment_it, 'days').hour(11).minute(0).second(0);
    endTime = moment().add(increment_it, 'days').hour(23).minute(0).second(0);
    increment_it++;
  }
  return availableSlots;


}

async function transformData(events) {

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

function get_timeslot(res, req){
  Mongo.connect()
  .then(async (success) => {

    var user = await Mongo.findUserToken({ email: 'dieyebow@gmail.com' })
    Mongo.disconnect();
    console.log('user ', user[0]);
    if (user.length) {
      user = user[0];
      oauth2Client.setCredentials({
        refresh_token: user.refresh_token
      });
      refreshAccessToken(oauth2Client, user)
        .then(async (newUserToken) => {

          console.log('newUserToken ===>',newUserToken);

          let availableSlots = await getListEvent(oauth2Client)

          let formater = await transformData(availableSlots)

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

        })
        .catch((error) => {
          console.log('error refreshAccessToken => ', error)

        });
    }


 

  });
}

app.get('/get/timeslot', (req, res) => {

  get_timeslot(res, req);
 
});


app.post('/get/timeslot', (req, res) => {

  get_timeslot(res, req);
 
});


function transformTimeToISO8601(dateTime) {


  const datebi = dateTime.split('T')[0]; // Extract date from datetime
  const timebi = dateTime.split('T')[1].split(':')[0]; // Extract hour from datetime

  // Start time
  const startTime = `${datebi}T${timebi}:00:00`

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
       Mongo.disconnect();
      const user = newUser[0];
 
      oauth2Client.setCredentials({
         access_token: user.access_token
         });
      const calendar = google.calendar({ 
        version: 'v3', auth: oauth2Client 
      });

      
      const date = true_date;
      let the_appointment = transformTimeToISO8601(date);

      console.log('the_appointment ==>',the_appointment);
      //Neegurap@gmail.com
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
          console.log ('There was an error contacting the Calendar service: ' + err);
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

      oauth2Client.setCredentials({ 
        access_token: user.access_token 
      });
      const calendar = google.calendar({
         version: 'v3',
          auth: oauth2Client 
      });


      const date = '2023-12-29T19:00:00'
      let the_appointment = transformTimeToISO8601(date);

      console.log('the_appointment ==>', the_appointment);

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
        console.log('Event created: %s', event);
      });

      res.end();

    });

});

app.post('/post/code', (req, res) => {
  console.log('/post/code');
  console.log('req.body.stringify =>', JSON.stringify(req.body));

  let { datas } = req.body;


  const received = datas.reduce((acc, item) => {

    if (item.value == null) {
      acc[item.idvariable] = null;
    } else {
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




app.listen(2211);
