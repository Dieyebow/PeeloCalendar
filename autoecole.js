let express = require("express");
let bodyParser = require("body-parser");
let session = require("express-session");
let fs = require("fs");
let cors = require("cors");
let dotenv = require('dotenv');

let axios = require("axios").default





let slugify = require("slugify");

let _ = require("lodash");


let Mongo = require("./models/mongocar");
let ObjectId = require("mongodb").ObjectID;

const jwt = require('jsonwebtoken');


let app = express();

let path_public = "/public";


dotenv.config({});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(path_public, express.static(__dirname + "/public"));



app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);



app.use(
  cors({
    origin: "*",
  })
);



app.use(session({
  secret: process.env.SECRET_KEY_SESSION,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 3600 * 1000 // 1 week 
  },
  rolling: true // important part  
}));


const requireLogin = (req, res, next) => {
  console.log('nous sommes dans le requireLogin', req.session.user);

  if (!req.session.user) {
    return res.redirect('/connexion');
  }
  next();
}

const alreadyLogin = (req, res, next) => {

  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader == null) return res.sendStatus(401);

  jwt.verify(authHeader, process.env.SECRET_KEY_JWT, (err, data) => {
    if (err) return res.sendStatus(403);
    req.user = data.user;
    next();
  });
}


const { google } = require('googleapis');

app.get('/', requireLogin, (req, res) => {

  res.write('nous sommes dans la homepage');
  res.end();

});


//app.get('/dashboard',requireLogin, (req, res) => {
app.get('/dashboard', (req, res) => {

  console.log('nous sommes dans le dashboard', req.session.user);
  //res.write('nous sommes dans le dashboard');
  let user = [{ empty: null }];
  if (req.session.user) {
    let user = req.session.user;
    console.log('user', user);

  }

  res.render('autoecole/dashboard.html', { user: JSON.stringify(user[0]) })
  res.end();

});

app.get('/connexion', alreadyLogin, (req, res) => {

  console.log('  process.env.SECRET_KEY_JWT = ', process.env.SECRET_KEY_JWT)

  const authUrl = 'ceci est juste un test';
  console.log({ 'authUrl': authUrl })
  res.render('autoecole/login.html', { authUrl: authUrl })
  res.end();
});


app.post('/signup/autoecole', authenticateToken, (req, res) => {

  console.log("la  réponse qu'on a ", req.body);
  let dataAutoEcole = req.body;

  let userData = {
    Admin_id: req.user._id,
    Admin_displayName: req.user.displayName,
    Admin_email: req.user.email,
  }
  _.assign(dataAutoEcole, userData);

  console.log('dataAutoEcole', dataAutoEcole);


  Mongo.connect()
    .then((success) => {
      console.log('nous sommes bien connecté')

      const condition = { phoneNumber: dataAutoEcole.phoneNumber }
      console.log('codition ==>', condition);
      Mongo.findAutoEcole(condition)
        .then((autoecole) => {

          console.log('autoecole ==> ', autoecole);
          console.log('autoecole taille ==> ', autoecole.length);

          if (autoecole.length) {
            Mongo.disconnect();
            return res.status(200).send({
              success: false
            });
          } else {

            Mongo.createAutoEcole(dataAutoEcole)
              .then((userCreated) => {
                Mongo.disconnect();
                return res.status(200).send({
                  success: true
                });
              })
              .catch((erroruserCreated) => {
                Mongo.disconnect();
              })
          }
        })
        .catch((error) => {
          console.log("on dirait qu'il y  erreur ", error);
          Mongo.disconnect();
        })

    })
    .catch((error) => {
      console.log('pas de connexion possible', error);
    })

})

app.post('/check/user', (req, res) => {

  if (!req.body.user) {
    return res.status(400).send('Données utilisateur manquantes');
  }

  const { displayName, photoURL, email, stsTokenManager } = req.body.user

  const condition = { email: email }
  Mongo.connect()
    .then((success) => {

      Mongo.findUser(condition)

        .then((user) => {
          if (!user.length) {
            return res.status(401).send({ message: `Vous n'êtes pas autorisé à accèder à cette page !` });
          }
          const token = jwt.sign({ user: user[0] }, process.env.SECRET_KEY_JWT, {
            expiresIn: '1h'
          });

          req.session.user = user
          req.session.token = token
          console.log('req.session.user ====> ', req.session.user);
          Mongo.disconnect();


          return res.status(200).send({
            token: token
          });
        })

        .catch((erroruser) => {
          Mongo.disconnect();
        })
    });

});




// APIS CHECK 

app.get('/get/numbers/autoecoles', authenticateToken, (req, res) => {
  console.log('/get/numbers/autoecoles');
  Mongo.connect()

    .then((success) => {
      console.log('success ==>', success);

      Mongo.countAutoEcole()
        .then((autoecoles) => {
          console.log('autoecole == ' + autoecoles);

          Mongo.disconnect();
          return res.status(200).send({
            countautoecole: autoecoles
          });

        })

        .catch((errorcount) => {
          console.log('errorcount ==>', errorcount)
        })

    })

    .catch((error) => {
      console.log('error ==>', error)

    })

})


app.get('/get/datas/autoecoles', authenticateToken, (req, res) => {
  console.log('/get/datas/autoecoles');
  Mongo.connect()

    .then((success) => {
      const condition = {
        "Admin_email": req.user.email

      };
      console.log('req.user', req.user)

      Mongo.listAutoEcole(condition)
        .then((autoecoles) => {
          console.log('autoecole == ' + autoecoles);

          Mongo.disconnect();
          return res.status(200).send({
            autoecoles: autoecoles
          });

        })

        .catch((errorcount) => {
          console.log('errorcount ==>', errorcount)
        })

    })

    .catch((error) => {
      console.log('error ==>', error)

    })

})

//, authenticateToken
app.get('/get/list/eleves', authenticateToken, (req, res) => {

  let condition = {};

  Mongo.connect()
    .then((success) => {

      Mongo.findAutoEcoleStudent(condition)
        .then((eleves) => {
          console.log('autoecole == ' + eleves);

          Mongo.disconnect();
          return res.status(200).send({
            eleves: eleves
          });
        })
        .catch((errorcount) => {
          console.log('errorcount ==>', errorcount)
        })
    })
    .catch((error) => {
      console.log('error ==>', error)
    })

})


app.post('/autobot/signup/user', (req, res) => {

  console.log('/get/datas/autoecoles', req.body.datas);


  const extractedData = _.reduce(req.body.datas, (result, { idvariable, value }) => {
    if (idvariable && value !== null) {
      console.log('the value zerr ==>>', value.value);
      //result[idvariable] = value.value.text.body;
      if (_.isObject(value.value)) {
        if (_.has(value.value, 'variable_declared')) {
          result[idvariable] = value.value.variable_declared.data;
        } else {
          result[idvariable] = value.value.text.body;
        }
      } else {
        result[idvariable] = value;
      }
    }
    return result;
  }, {});

  console.log(extractedData);
  const { reply_phone } = extractedData;

  let user_template = {
    fullname: extractedData.fullname_ae,
    tel: extractedData.tel_ae,
    name_autoecole: '',
    id_autoecole: '',
    tel_autoecole: _.slice(extractedData.bot_number, 3).join(''),
  }
  console.log('user_template ==> ', user_template);



  Mongo.connect()
    .then((success) => {
      let telit = _.slice(extractedData.bot_number, 3);
      telit = telit.join('');

      console.log('telit ===>', telit);

      Mongo.findAutoEcoleStudent({
        tel: extractedData.tel_ae
      })
        .then((StudentFound) => {

          if (StudentFound.length) {
            let message_backup = `Un Elève est déjà enregistré avec ce numéro`;

            res.json({
              "id_element": "notification_eleve",
              "id_previous": null,
              "type": "text",
              "message": message_backup,
              "preview_url": true
            });
            res.end();
            return true;
          } else {

            const condition = {
              phoneNumber: telit
            }
            Mongo.findAutoEcole(condition)
              .then((autoecole) => {
                if (autoecole.length) {

                  user_template.name_autoecole = autoecole[0]['nomAutoecole']
                  user_template.id_autoecole = autoecole[0]['_id']
                  Mongo.createAutoEcoleStudent(user_template)
                    .then((newStudent) => {
                      let message_backup = `Elève enregistré avec succès`;

                      res.json({
                        "id_element": "notification_eleve",
                        "id_previous": null,
                        "type": "text",
                        "message": message_backup,
                        "preview_url": true
                      });
                      res.end();
                      return true;
                    })
                    .catch((errorStudent) => {
                      console.log('errorStudent ==>', errorStudent);
                    })

                }
              })
              .catch((error) => {
                console.log("on dirait qu'il y  erreur ", error);
                Mongo.disconnect();
              })

          }
        })
        .catch((errorStudentFound) => {

        })


    })
    .catch((error) => {
      console.log('pas de connexion possible', error);
    })



});
/**/

/*
app.post('/autobot/signup/user', async (req, res) => {
  console.log('/autobot/signup/user async')
  try {
    // Extract only necessary data directly
    const extractedData = _.reduce(req.body.datas, (result, { idvariable, value }) => {
      if (idvariable && value !== null) {
        console.log('the value zerr ==>>', value.value);
        //result[idvariable] = value.value.text.body;
        if (_.isObject(value.value)) {
          if (_.has(value.value, 'variable_declared')) {
            result[idvariable] = value.value.variable_declared.data;
          } else {
            result[idvariable] = value.value.text.body;
          }
        } else {
          result[idvariable] = value;
        }
      }
      return result;
    }, {});

    console.log('extractedData ==>',extractedData);

    const { fullname_ae, tel_ae, bot_number } = extractedData
    console.log(' fullname_ae, tel_ae, bot_number ', fullname_ae, tel_ae, bot_number )
    const telit = bot_number.slice(3).join('');

    const studentFound = await Mongo.findAutoEcoleStudent({ tel: tel_ae });
    if (studentFound.length) {
      res.json({
        id_element: "notification_eleve",
        id_previous: null,
        type: "text",
        message: "Un Elève est déjà enregistré avec ce numéro",
        preview_url: true,
      });
      res.end();
      return;
    }

    const autoecole = await Mongo.findAutoEcole({ phoneNumber: telit });
    if (autoecole.length) {
      const student = await Mongo.createAutoEcoleStudent({
        fullname: fullname_ae,
        tel: tel_ae,
        name_autoecole: autoecole[0]['nomAutoecole'],
        id_autoecole: autoecole[0]['_id'],
        tel_autoecole: telit,
      });
      res.json({
        id_element: "notification_eleve",
        id_previous: null,
        type: "text",
        message: "Elève enregistré avec succès",
        preview_url: true,
      });
      res.end();
    } else {
      console.log("Auto-école non trouvée");
    }
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).send("Une erreur est survenue");
  } finally {
    await Mongo.disconnect(); // Ensure disconnection
  }
});
*/


app.listen(7568);
