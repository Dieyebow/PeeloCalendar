let express = require("express");
let bodyParser = require("body-parser");
let session = require("express-session");
let fs = require("fs");
let cors = require("cors");
let dotenv = require('dotenv');

let axios = require("axios").default



let fileUpload = require("express-fileupload");


let slugify = require("slugify");

let _ = require("lodash");


let Mongo = require("./models/mongocar");

let ObjectId = require("mongodb").ObjectID;

const jwt = require('jsonwebtoken');


const pdf = require('pdf-parse');

const cron = require('node-cron')


let app = express();

let path_public = "/public";


dotenv.config({});

app.use(fileUpload());

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


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


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


async function extractTextFromPDF(pdfPath) {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(pdfPath);

    // Parse the PDF data
    const data = await pdf(dataBuffer);

    // Return the text content
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
  }
}


// Function to find a word in the extracted text
async function findWordInPDF(pdfPath, word) {
  const text = await extractTextFromPDF(pdfPath);
  if (text && text.includes(word)) {
    //console.log(`The word "${word}" was found in the PDF.`);
  } else {
    //console.log(`The word "${word}" was not found in the PDF.`);
  }
}


const { google } = require('googleapis');

app.get('/', async (req, res) => {
  console.log('welcome hoow')
  // Example usage
  const pdfPath = 'path/to/your/pdf/file.pdf';
  const wordToFind = 'example';

  const midway = 'public/assets/uploads/Barzanjiyu.pdf';
  const textlivre = await extractTextFromPDF(midway)
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  res.write('welcone aladji');
  res.end();

});




//app.get('/dashboard',requireLogin, (req, res) => {
app.get('/dashboard', (req, res) => {

  console.log('nous sommes dans le dashboard', req.session.user);
  //res.write('nous sommes dans le dashboard');
  let user = [{ empty: null }];
  if (req.session.user) {
    let user = req.session.user;
    //console.log('user', user);

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
      //console.log('nous sommes bien connecté')

      const condition = { phoneNumber: dataAutoEcole.phoneNumber }
      //console.log('codition ==>', condition);
      Mongo.findAutoEcole(condition)
        .then((autoecole) => {

          //console.log('autoecole ==> ', autoecole);
          //console.log('autoecole taille ==> ', autoecole.length);

          if (autoecole.length) {
            //Mongo.disconnect();
            return res.status(200).send({
              success: false
            });
          } else {

            Mongo.createAutoEcole(dataAutoEcole)
              .then((userCreated) => {
                //Mongo.disconnect();
                return res.status(200).send({
                  success: true
                });
              })
              .catch((erroruserCreated) => {
                //Mongo.disconnect();
              })
          }
        })
        .catch((error) => {
          //console.log("on dirait qu'il y  erreur ", error);
          //Mongo.disconnect();
        })

    })
    .catch((error) => {
      //console.log('pas de connexion possible', error);
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
          //console.log('req.session.user ====> ', req.session.user);
          //Mongo.disconnect();


          return res.status(200).send({
            token: token
          });
        })

        .catch((erroruser) => {
          //Mongo.disconnect();
        })
    });

});


//le nombre deleves
/*
app.get('/get/numbers/eleves', authenticateToken, (req, res) => {
  console.log('/get/numbers/eleves');
  Mongo.connect()

    .then((success) => {
   //console.log('success ==>', success);

      Mongo.countElevesAutoEcole()
        .then((eleves) => {
       //console.log('autoecole == ' + eleves);

          //Mongo.disconnect();
          return res.status(200).send({
            counteleves: eleves
          });

        })

        .catch((errorcount) => {
       //console.log('errorcount ==>', errorcount)
        })

    })

    .catch((error) => {
   //console.log('error ==>', error)

    })

})




// APIS CHECK 

app.get('/get/numbers/autoecoles', authenticateToken, (req, res) => {
  console.log('/get/numbers/autoecoles');
  Mongo.connect()

    .then((success) => {
   //console.log('success ==>', success);

      Mongo.countAutoEcole()
        .then((autoecoles) => {
       //console.log('autoecole == ' + autoecoles);

          //Mongo.disconnect();
          return res.status(200).send({
            countautoecole: autoecoles
          });

        })

        .catch((errorcount) => {
       //console.log('errorcount ==>', errorcount)
        })

    })

    .catch((error) => {
   //console.log('error ==>', error)

    })

})
*/


app.get('/get/numbers/:type', authenticateToken, (req, res) => {
  const { type } = req.params;
  console.log("/get/numbers/:type", type)
  Mongo.connect()
    .then(() => {
      if (type === 'eleves') {

        Mongo.countElevesAutoEcole()
          .then((eleves) => {
            //console.log('Students count: ' + eleves);
            //Mongo.disconnect();
            return res.status(200).json({ count: eleves });
          })
          .catch((errorcount) => {
            console.error('Error:', errorcount);
            return res.status(500).json({ error: 'Internal server error' });
          });

      } else if (type === 'autoecoles') {

        Mongo.countAutoEcole()
          .then((autoecoles) => {
            //console.log('Driving schools count: ' + autoecoles);
            //Mongo.disconnect();
            return res.status(200).json({ count: autoecoles });
          })
          .catch((errorcount) => {
            console.error('Error:', errorcount);
            return res.status(500).json({ error: 'Internal server error' });
          });

      } else if (type === 'quiz') {

        Mongo.countQuizz()
          .then((quizz) => {
            //console.log('Driving schools count: ' + quizz);
            //Mongo.disconnect();
            return res.status(200).json({ count: quizz });
          })
          .catch((errorcount) => {
            console.error('Error:', errorcount);
            return res.status(500).json({ error: 'Internal server error' });
          });

      } else {
        return res.status(400).json({ error: 'Invalid count type' });
      }


    })
    .catch((error) => {
      console.error('Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    });

});


app.get('/get/datas/autoecoles', authenticateToken, (req, res) => {
  console.log('/get/datas/autoecoles');
  Mongo.connect()

    .then((success) => {
      const condition = {
        "Admin_email": req.user.email

      };
      //console.log('req.user', req.user)

      Mongo.listAutoEcole(condition)
        .then((autoecoles) => {
          //console.log('autoecole == ' + autoecoles);

          ////Mongo.disconnect();
          return res.status(200).send({
            autoecoles: autoecoles
          });

        })

        .catch((errorcount) => {
          //console.log('errorcount ==>', errorcount)
        })

    })

    .catch((error) => {
      //console.log('error ==>', error)

    })

})

//, authenticateToken
app.get('/get/list/eleves', authenticateToken, (req, res) => {

  let condition = {};

  Mongo.connect()
    .then((success) => {

      Mongo.findAutoEcoleStudent(condition)
        .then((eleves) => {
          //console.log('autoecole == ' + eleves);

          // //Mongo.disconnect();
          return res.status(200).send({
            eleves: eleves
          });
        })
        .catch((errorcount) => {
          //console.log('errorcount ==>', errorcount)
        })
    })
    .catch((error) => {
      //console.log('error ==>', error)
    })

})



const extractData = (data) => {
  let result = {};
  let dataType = null;
  for (let item of data) {
    if (typeof item.value === 'object' && item.value !== null) {

      console.log('______________DANS LA BOUCLE ______________')
      console.log('item.value.type ==>', item.value.type)

      if (item.value.type === 'interactive') {

        console.log('on a bien une interraction')
        console.log('item.value.type ==>', item.value.type)
        console.log('interraction ??? ==>', item.value?.value?.interactive?.type)
        console.log('interraction  value ??? ==>', item.value?.value?.interactive)

        //res.end();

        //return true;

        if (item.value?.value?.interactive?.type === 'list_reply') {
          result[item.idvariable] = item.value.interactive.list_reply.id;
          dataType = 'list_reply';
        }

        if (item.value?.value?.interactive?.type === 'button_reply') {

          result[item.idvariable] = item.value.value.interactive.button_reply;
          dataType = 'button_reply';
        }

      } else if (item.value.type === 'text') {

        if (_.includes(item.value, 'text')) {
          result[item.idvariable] = item.value?.text?.body || item.value?.value?.text?.body;
        }
        dataType = 'text';

      } else if (item.value.type === 'variable_declared') {

        result[item.idvariable] = item.value.value.variable_declared.data;
      }

    } else {
      result[item.idvariable] = item.value;
    }
  }
  return { datas: result, lastInputType: dataType };
}



app.post('/autobot/signup/user', (req, res) => {

  console.log('/autobot/signup/user', req.body.datas);


  let extractedData = extractData(req.body.datas);

  extractedData = extractedData.datas;

  console.log('extraction ===>', extractedData);
  const { reply_phone } = extractedData;

  let tel_ae = extractedData.reply_phone;


  let adminSubscribeUser = 'adminsubscribuser';
  let telautoecole = _.slice(reply_phone, 3).join('');

  if (_.has(extractedData, 'typesub') && extractedData.typesub === 'hack') {
    adminSubscribeUser = 'connaissance_undrafted';
    telautoecole = '788699262';
  }

  let user_template = {

    fullname: extractedData.fullname_ae,
    tel: tel_ae,
    name_autoecole: '',
    id_autoecole: '',
    tel_autoecole: telautoecole,
    home_ec: extractedData.home_ec,
    howdoyouknowme: extractedData.howdoyouknowme.title,
    ifautoecole: extractedData.ifautoecole,
    nomautoecoleasked: extractedData.nomautoecoleasked

  }

  console.log('user_template ==> ', user_template);

  Mongo.connect()
    .then((success) => {


      Mongo.findAutoEcoleStudent({
        tel: user_template.tel
      })
        .then((StudentFound) => {
          console.log('StudentFound ==>', StudentFound);

          if (StudentFound.length) {
            let message_backup = `Un Elève est déjà enregistré avec ce numéro`;




            res.json({
              "type": "text_button",
              "id_element": "notification_eleve",
              "id_previous": null,
              "message": message_backup,
              "buttons": [
                {
                  "id": adminSubscribeUser,
                  "title": "Réessayer ♺"
                },
                {
                  "id": "main_menu",
                  "title": "Menu ⏎"
                }
              ]
            });
            Mongo.disconnect();
            res.end();
            return true;
          } else {
            console.log("pas d'eleves trouvé donc on en crée")
            //chercher l'autoecole qui va créer l'eleve par numéro de téléphone
            const condition = {
              phoneNumber: user_template.tel_autoecole
            }
            console.log('condition Auto Ecole ==>', condition);

            Mongo.findAutoEcole(condition)
              .then((autoecole) => {

                console.log('autoecole found ==>', autoecole);

                if (autoecole.length) {

                  user_template.name_autoecole = autoecole[0]['nomAutoecole']
                  user_template.id_autoecole = autoecole[0]['_id']
                  Mongo.createAutoEcoleStudent(user_template)
                    .then((newStudent) => {
                      let message_backup = `Merci pour tes réponses !`;

                      /*  res.json({
                          "id_element": "notification_eleve",
                          "id_previous": null,
                          "type": "text",
                          "message": message_backup,
                          "preview_url": true
                        });*/

                      res.json([
                        {
                          "type": "variable_insert",
                          "id_element": "659816a89f5a6dc6bc104da5_67850b8edccb5bc0fc311a49_variable_notification_eleve",
                          "id_previous": "notification_eleve",
                          "variable": {
                            "id": "tel_ae",
                            "value": tel_ae
                          }
                        },
                        {
                          "id_element": "notification_eleve",
                          "id_previous": null,
                          "type": "text",
                          "message": message_backup,
                          "preview_url": true
                        },
                        {
                          "type": "redirection",
                          "id_element": "new_student_added",
                          "id_previous": "notification_eleve",
                          "redirection_block": "get_current_menu"
                        }]);

                      //Mongo.disconnect();

                      res.end();
                      return true;
                    })
                    .catch((errorStudent) => {
                      Mongo.disconnect();
                      //console.log('errorStudent ==>', errorStudent);
                    })

                } else {
                  console.log('Pas auto-ecole trouvé')
                }
              })
              .catch((error) => {
                //console.log("on dirait qu'il y  erreur ", error);
                //Mongo.disconnect();
              })

          }
        })
        .catch((errorStudentFound) => {

        })


    })
    .catch((error) => {
      //console.log('pas de connexion possible', error);
    })



});
/**/


app.post('/autobot/menueleve', async (req, res) => {

console.log('/autobot/menueleve');

  const PRO_MONITOR = '787570707';
  let typeuser = null;

  try {

      // Data extraction and validation
      const extractedData = extractData(req.body.datas);
      const { datas } = extractedData;
    
      console.log('extractedData ==>', extractedData);


      const connection = await Mongo.connect();
      const students = await Mongo.findAutoEcoleStudent({
        tel: datas.reply_phone
      });
    
      if (students.length) {

        typeuser = students[0].tel_autoecole === PRO_MONITOR ? 'premium' : 'regular';
        redirectionBlock = students[0].tel_autoecole === PRO_MONITOR ? 'already_premium' : 'litesub_ae_form';

      } 

     console.log('typeuser ==>', typeuser);

      if(typeuser === 'premium') {

        return res.json({
          "type": "text_button",
          "id_element": "659816a89f5a6dc6bc104da5_667965dcf9ec2e6b43bd2852_text_button_bCEGZoArTe1E",
          "id_previous": null,
          "message": "Voici les options disponibles :",
          "buttons": [
            {
              "id": "cours",
              "title": "Cours Théoriques 📘"
            },
            {
              "id": "quiz",
              "title": "Exercices  🚗"
            }
          ]
        });

      }

      if(typeuser === 'regular') {

        return res.json({
          "type": "text_button",
          "id_element": "659816a89f5a6dc6bc104da5_667965dcf9ec2e6b43bd2852_text_button_bCEGZoArTe1E",
          "id_previous": null,
          "message": "Voici les options disponibles :",
          "buttons": [
            {
              "id": "cours",
              "title": "Cours Théoriques 📘"
            },
            {
              "id": "quiz",
              "title": "Exercices  🚗"
            },
            {
              "id": "usersubscribitself",
              "title": "Permis si Poche"
            }
          ]
        });
        
      }
  
      
    
  } catch (error) {

    console.error('Database error:', error);
    return res.status(500).json({
      error: 'Database connection failed',
      details: error.message
    });

  }

});


app.post('/autobot/checkifuserexit', async (req, res) => {
  //connaissance_undrafted

  const PRO_MONITOR = '787570707';
  const BUTTON_PERMIS = 'usersubscribitself_test'

  try {
    // Data extraction and validation
    const extractedData = extractData(req.body.datas);
    const { datas } = extractedData;

    if (!datas?.reply_phone) {
      return res.status(400).json({
        error: 'Phone number is required'
      });
    }

    // Database query
    const connection = await Mongo.connect();
    const students = await Mongo.findAutoEcoleStudent({
      tel: datas.reply_phone
    });
    console.log('students ==>', students);

    // Determine redirection logic
    let redirectionBlock = 'connaissance_undrafted';

    if (datas.wannago?.id === BUTTON_PERMIS) {
      if (!students.length) {
        redirectionBlock = 'subscription_ae_form';
      } else {
        redirectionBlock = students[0].tel_autoecole === PRO_MONITOR ? 'already_premium' : 'litesub_ae_form';
      }
    }
    console.log('redirectionBlock ==>', redirectionBlock);
    console.log('_________________________________________')


    // Return appropriate response format
    if (datas.wannago?.id === BUTTON_PERMIS) {
      if (redirectionBlock !== 'already_premium') {

        return res.json([
          {
            "type": "variable_insert",
            "id_element": "659816a89f5a6dc6bc104da5_65d369589f5a6dc6bc104db5_variable_insert_xgFoghaWeGNL",
            "id_previous": null,
            "variable": {
              "id": "typesub",
              "value": "user"
            }
          },
          {
            type: "text_button",
            id_element: "text_button_rGT2VWaeJKBH",
            id_previous: "659816a89f5a6dc6bc104da5_65d369589f5a6dc6bc104db5_variable_insert_xgFoghaWeGNL",
            message: "Avec cette option, vous pouvez suivre votre formation au code de la route avec nous et passer votre examen du code grâce à nos auto-écoles partenaires. Vous bénéficierez de :\n\n✅ Des examens blancs pour vous entraîner sereinement.\n✅ 10 cours de conduite à réserver après la réussite de votre examen du code.\n✅ Une offre flexible à 150 000 FCFA, payable en 3 tranches.\n\n\nPrêt à démarrer l'aventure avec nous ? 🚀",
            buttons: [{
              id: redirectionBlock,
              title: "Allons y 🚀🔥"
            }]
          }
        ]);
      }
    }


    // Handle response based on redirectionBlock
    // 
    if (redirectionBlock === 'already_premium') {
      return res.json({
        type: "text",
        id_element: "redirection_for_autoecolestudent_textMessage",
        message: "Vous êtes déjà inscrit dans tant Utilisateur Premium. Vous pouvez suivre votre formation au code de la route avec nous et passer votre examen du code grâce à nos auto-écoles partenaires. 🚀",
        preview_url: true
      });
    } 

    if (students.length) {

      if (datas.wannago?.id === 'watchbess_cours') {
        redirectionBlock = 'cours';
      }

      if (datas.wannago?.id === 'watchbess_quiz') {
        redirectionBlock = 'quiz';
      }

    }

    return res.json({
      type: "redirection",
      id_element: "redirection_for_autoecolestudent_DFDFD",
      id_previous: null,
      redirection_block: redirectionBlock
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      error: 'Database connection failed',
      details: error.message
    });
  }



});

app.post('/autoecole/checktypeuser', async (req, res) => {


  const extractedData = _.reduce(req.body.datas, (result, { idvariable, value }) => {
    if (idvariable && value !== null) {
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


  Mongo.connect()

    .then(async (success) => {

      //console.log('req.user', req.user)
      const monitor = await Mongo.listAutoEcole({
        "phoneNumber": _.slice(extractedData.reply_phone, 3).join('')
      });
      //_.slice(extractedData.reply_phone, 3).join('')
      if (monitor.length) {
        ////Mongo.disconnect();
        return res.status(200).send(
          {
            "type": "redirection",
            "id_element": "redirection_for_monitor",
            "id_previous": null,
            "redirection_block": "welcome_moniteur"
          }
        );
        res.end();
        return;
      }

      const eleves = await Mongo.findAutoEcoleStudent({
        "tel": _.slice(extractedData.reply_phone, 3).join('')
      })

      if (eleves.length) {
        //Mongo.disconnect();
        return res.status(200).send(
          {
            "type": "redirection",
            "id_element": "redirection_for_autoecolestudent",
            "id_previous": null,
            "redirection_block": "welcome_eleve"
          }
        );
        res.end();
        return;

      } else {
        return res.status(200).send(
          {
            "type": "redirection",
            "id_element": "undrafted_user_block",
            "id_previous": null,
            "redirection_block": "undrafted_user"
          }
        );

      }





    })

    .catch((error) => {
      //console.log('error ==>', error)

    })


});



const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}


require('./routes/autoecole/post')(_, app, axios, Mongo, require("mongodb").ObjectID, authenticateToken);

require('./routes/autoecole/get')(_, app, axios, Mongo, require("mongodb").ObjectID, authenticateToken);

require('./routes/autoecole/chatbotapi')(_, app, axios, Mongo, cron, require("mongodb").ObjectID, authenticateToken, generateRandomString);



app.listen(7568);
