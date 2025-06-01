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

const WhatsAppSender = require('./modules/WhatsAppSender');  // Ajustez le chemin selon votre structure de dossiers


const Papa = require('papaparse');


let app = express();

let path_public = "/public";



const { google } = require('googleapis');

const sheets = google.sheets('v4');
const SPREADSHEET_ID = '14zP7t_Y7jtdohfdL-Cv2p_K-TLFueZriYzImpbqui1E'; // Replace with your Google Sheet ID
const RANGE = 'responses!A2'; // Adjust the sheet and cell as needed

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Path to your service account credentials
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
});


async function authorizeGoogleSheets() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    keyFile: "./configs/googlecredentias.json" // Replace with your service account key path
  });

  return await auth.getClient();

}


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


const extractData = (data) => {
  let result = {};
  let dataType = null;
  for (let item of data) {
    if (typeof item.value === 'object' && item.value !== null) {

      if (item.value.type === 'interactive') {

 
          console.log(" type interractif done ",item.value.type);
          console.log(" type interractif value ",item.value);
          //return true;
  /*      if (_.includes(item.value, 'button_reply')) {
          result[item.idvariable] = item.value?.interactive?.button_reply?.id || item.value?.value?.interactive?.button_reply?.id;
          dataType = 'button_reply';

        }

        if (_.includes(item.value, 'list_reply')) {
          result[item.idvariable] = item.value.interactive.list_reply.id;
          dataType = 'list_reply';
        }
          */

        if (item.value?.value?.interactive?.type === 'list_reply') {
          result[item.idvariable] = item.value.interactive.list_reply.id;
          dataType = 'list_reply';
        }

        if (item.value?.value?.interactive?.type === 'button_reply') {

          result[item.idvariable] = item.value.value.interactive.button_reply;
          dataType = 'button_reply';
        }

        console.log('item.value?.value?.interactive?.type  ===>', item.value?.value?.interactive?.type);


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

const extractPhoneNumbers = (data) => {
  // Map over the array and extract just the 'tel' values
  return data.map(item => item.phoneNumber);
}


app.get('/dailynewuser', async (req, res) => {

  Mongo.connect()
    .then(async (success) => {

      const dailynew = await Mongo.countDailynewUser();

      console.log('dailynew ==>', dailynew);

      return res.status(200).send(
        dailynew
      ).end();

    })
    .catch((error) => {
      console.log('pas de connexion possible', error);
    })

});



function parseDynamicSurvey(responseJson) {
  const parsed = JSON.parse(responseJson);
  const structuredData = {};
  console.log(' for (const [key, value] of Object.entries(parsed)) {');

  for (const [key, value] of Object.entries(parsed)) {


    console.log(key, 'value ===', value);
    console.log('-----------')
    // Skip the flow_token (not a survey question)
    if (key === 'flow_token') continue;

    // Extract question text from the key

    /*
    const question = key
    .replace(/^screen_\d+_/i, '') // Remove "screen_X_" prefix
    .replace(/__\d+$/i, '')       // Remove trailing "__X" index
    .replace(/_/g, ' ')           // Replace underscores with spaces
    .trim();
 */
    const question = key
      .replace(/_/g, ' ')           // Replace underscores with spaces
      .trim();

    if (!question || /^\d+$/.test(question)) {
      console.log('Skipping invalid key:', key);
      continue;
    }

    // Extract answer from the value
    let answer = value
      .replace(/^\d+_/, '')    // Remove leading numeric prefix (e.g., "1_")
      .replace(/_/g, ' ')      // Replace underscores with spaces
      .replace(/\s+/g, ' ')    // Collapse multiple spaces
      .trim();

    structuredData[question] = answer;
  }

  return structuredData;
}


// Helper function to clean answer values (e.g., "2_25-34_ans" → "25-34 ans")
function extractAnswerValue(value) {
  // Split by underscores and colons, then take the meaningful part
  const parts = value.split(/[_:_]/).filter(p => p.trim() !== '');
  return parts.slice(1).join(' ').replace(/_/g, ' '); // Skip the numeric prefix
}


app.get('/receiving/data', async (req, res) => {
  try {
    const body = { "object": "whatsapp_business_account", "entry": [{ "id": "116399414824178", "changes": [{ "value": { "messaging_product": "whatsapp", "metadata": { "display_phone_number": "221761758092", "phone_number_id": "106273332517016" }, "contacts": [{ "profile": { "name": "Mooo" }, "wa_id": "221781528375" }], "messages": [{ "context": { "from": "221761758092", "id": "wamid.HBgMMjIxNzgxNTI4Mzc1FQIAERgSNTcxRkY0MDkzNUZDNzVBMEI3AA==" }, "from": "221781528375", "id": "wamid.HBgMMjIxNzgxNTI4Mzc1FQIAEhggMUMxNDcwMzYyQTkxNzc2QjAyMjY2MTY0MEQ5OTRBM0MA", "timestamp": "1738692258", "type": "interactive", "interactive": { "type": "nfm_reply", "nfm_reply": { "response_json": "{\"screen_7__0\":\"1_2_:_Insatisfait\",\"screen_7__1\":\"Dkd\",\"screen_7__2\":\"1_Non\",\"screen_6__0\":\"2_Conservateur\",\"screen_6__1\":\"1_Mod\\u00e9r\\u00e9,_j\\u2019utilise_la_techno\",\"screen_5__0\":\"1_Smartphone_(Android)\",\"screen_5__1\":\"1_Recommandation_d\\u2019un_ami\",\"screen_5_Si_autre_ou__2\":\"Ekle\",\"screen_4__0\":\"1_Renforcer_mes_connaissances\",\"screen_4__1\":\"3_Personnalisation_des_services\",\"screen_3__0\":\"1_Non\",\"screen_3_quelques_mots_1\":\"Dkwkdkkdk\",\"screen_2__0\":\"2_Plusieurs_fois_par_semaine\",\"screen_2__1\":\"2_Non,_ce_serait_avec_difficult\\u00e9\",\"screen_2__2\":\"1_Pendant_les_pauses\",\"screen_1__0\":\"1_Etudiant\",\"screen_1_Quel_est_votre_revenu_mensuel_1\":\"1_Entre_200K_-_500_K\",\"screen_0_Quel_ge_avezvous__0\":\"1_18-24_ans\",\"screen_0_Quel_est_votre_genre__1\":\"1_Homme\",\"screen_0_O_habitezvous__2\":\"1_Autres_r\\u00e9gion_du_S\\u00e9n\\u00e9gal\",\"flow_token\":\"unused\"}", "body": "Sent", "name": "flow" } } }] }, "field": "messages" }] }] }
    // Add null checks
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
      return res.status(400).send('Invalid webhook data');
    }

    const specifik_message = body.entry[0].changes[0].value.messages[0];
    console.log('specifik_message ==>', specifik_message);

    if (specifik_message.type === 'interactive' &&
      specifik_message.interactive?.type === 'nfm_reply') {

      const nfmReply = specifik_message.interactive.nfm_reply;
      const surveyData = parseDynamicSurvey(nfmReply.response_json);

      console.log('surveyData ===>', surveyData);
      const from = specifik_message.from; // Get from from message object

      const autho = await GoogleSheetsSending(surveyData, from);
      return res.json(autho);
    }

    res.status(200).send('Processed');

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Internal server error');
  }
});

function extractValue(text, possibilities) {
  if (!text) return null;

  for (const possibility of possibilities) {
    if (String(text).includes(possibility)) {
      return possibility;
    }
  }
  return null;
}

// Configuration des mapping pour chaque section
const MAPPINGS = {
  informations_demographiques: {
    age: [
      "Moins de 18 ans",
      "18-24 ans",
      "25-34 ans",
      "35-44 ans",
      "45-54 ans",
      "55 ans et plus"
    ],
    genre: ["Homme", "Femme"],
    region: [
      "Région de Dakar et périphérie",
      "Autres région du Sénégal"
    ]
  },
  profil_social: {
    statut: ["Sans emploi", "Etudiant", "Employé"],
    revenu: [
      "Entre 100 - 200 K",
      "Entre 200K - 500 K",
      "Entre 500 K - plus"
    ]
  },
  comportement_utilisation: {
    frequence_app: [
      "Plusieurs fois par jour",
      "Une fois par jour",
      "Plusieurs fois par semaine",
      "Rarement"
    ],
    formation_en_ligne: [
      "Oui avec assiduité pour un début",
      "Oui avec assiduité jusqu'à la fin",
      "Non, ce serait avec difficulté"
    ],
    moment_utilisation: [
      "Le matin",
      "Pendant les pauses",
      "Le soir",
      "Tout au long de la journée"
    ]
  },
  besoin: {
    problemes_a_resoudre: [
      "Préparer mon permis",
      "Renforcer mes connaissances",
      "Gagner du temps"
    ],
    fonctionnalites_importantes: [
      "Simplicité d'utilisation",
      "Rapidité",
      "Design attractif",
      "Personnalisation des services",
      "Intégration avec d'autres outils/applications"
    ]
  },
  profil_technologique: {
    appareil: [
      "Smartphone (iOS)",
      "Smartphone (Android)",
      "Tablette",
      "Ordinateur"
    ],
    decouverte: [
      "Réseaux sociaux",
      "Recommandation d'un ami",
      "Recherche sur le store d'applications",
      "Publicité en ligne",
      "Autre"
    ]
  },
  personnalite: {
    face_innovations: [
      "Enthousiaste, j'adore essayer",
      "Modéré, j'utilise la techno",
      "Conservateur"
    ],
    face_peelo: [
      "Enthousiaste, j'adore essayer",
      "Modéré, j'utilise la techno",
      "Conservateur"
    ]
  },
  avis_application: {
    evaluation: [
      "1 : Très insatisfait",
      "2 : Insatisfait",
      "3 : Neutre",
      "4 : Satisfait",
      "5 : Très satisfait"
    ],
    recommandation: ["Oui", "Non", "Peut-être"]
  }
};

function processCSVData(csvData) {
  return csvData.map(row => {
    const response = {
      telephone: row[0], // Assuming phone number is the first column
      informations_demographiques: {},
      profil_social: {},
      comportement_utilisation: {},
      besoin: {},
      profil_technologique: {},
      personnalite: {},
      avis_application: {}
    };

    // Parcourir chaque section et extraire les valeurs
    Object.keys(MAPPINGS).forEach(section => {
      Object.keys(MAPPINGS[section]).forEach(key => {
        response[section][key] = extractValue(
          row.join(' '),
          MAPPINGS[section][key]
        );
      });
    });

    return response;
  });
}

function processCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, fileContent) => {
      if (err) {
        reject(err);
        return;
      }

      Papa.parse(fileContent, {
        complete: (results) => {
          const structuredResponses = processCSVData(results.data);
          resolve(structuredResponses);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  });
}


app.get('/checkfile', async (req, res) => {


  try {
    const filePath = './public/assets/resonses.csv';
    const structuredData = await processCSVFile(filePath);


    console.log('structured data ==>', structuredData);


    // Écriture dans un fichier JSON
    fs.writeFileSync(
      './public/assets/reponses_structurees.json',
      JSON.stringify(structuredData, null, 2)
    );

    console.log('Transformation terminée !');
  } catch (error) {
    console.error('Erreur lors du traitement:', error);
  }

});

app.get('/receiving/flow', async (req, res) => {

  const body = { "object": "whatsapp_business_account", "entry": [{ "id": "116399414824178", "changes": [{ "value": { "messaging_product": "whatsapp", "metadata": { "display_phone_number": "221761758092", "phone_number_id": "106273332517016" }, "contacts": [{ "profile": { "name": "Mooo" }, "wa_id": "221781528375" }], "messages": [{ "context": { "from": "221761758092", "id": "wamid.HBgMMjIxNzgxNTI4Mzc1FQIAERgSNTcxRkY0MDkzNUZDNzVBMEI3AA==" }, "from": "221781528375", "id": "wamid.HBgMMjIxNzgxNTI4Mzc1FQIAEhggMUMxNDcwMzYyQTkxNzc2QjAyMjY2MTY0MEQ5OTRBM0MA", "timestamp": "1738692258", "type": "interactive", "interactive": { "type": "nfm_reply", "nfm_reply": { "response_json": "{\"screen_7__0\":\"1_2_:_Insatisfait\",\"screen_7__1\":\"Dkd\",\"screen_7__2\":\"1_Non\",\"screen_6__0\":\"2_Conservateur\",\"screen_6__1\":\"1_Mod\\u00e9r\\u00e9,_j\\u2019utilise_la_techno\",\"screen_5__0\":\"1_Smartphone_(Android)\",\"screen_5__1\":\"1_Recommandation_d\\u2019un_ami\",\"screen_5_Si_autre_ou__2\":\"Ekle\",\"screen_4__0\":\"1_Renforcer_mes_connaissances\",\"screen_4__1\":\"3_Personnalisation_des_services\",\"screen_3__0\":\"1_Non\",\"screen_3_quelques_mots_1\":\"Dkwkdkkdk\",\"screen_2__0\":\"2_Plusieurs_fois_par_semaine\",\"screen_2__1\":\"2_Non,_ce_serait_avec_difficult\\u00e9\",\"screen_2__2\":\"1_Pendant_les_pauses\",\"screen_1__0\":\"1_Etudiant\",\"screen_1_Quel_est_votre_revenu_mensuel_1\":\"1_Entre_200K_-_500_K\",\"screen_0_Quel_ge_avezvous__0\":\"1_18-24_ans\",\"screen_0_Quel_est_votre_genre__1\":\"1_Homme\",\"screen_0_O_habitezvous__2\":\"1_Autres_r\\u00e9gion_du_S\\u00e9n\\u00e9gal\",\"flow_token\":\"unused\"}", "body": "Sent", "name": "flow" } } }] }, "field": "messages" }] }] }
  let {
    object,
    entry: [
      {
        changes: [
          {
            value: {
              messaging_product,
              metadata: { phone_number_id, display_phone_number },
              contacts: [
                {
                  profile: { name },
                  wa_id
                }
              ],
              messages

            }
          }
        ]
      }
    ]
  } = body;


  specifik_message = messages[0];

  console.log('specifik_message ==>', specifik_message);

  // Example usage in your webhook handler
  if (specifik_message.type === 'interactive') {

    const interactive = specifik_message.interactive;

    if (interactive.type === 'nfm_reply') {
      const nfmReply = interactive.nfm_reply;

      try {

        const surveyData = parseDynamicSurvey(nfmReply.response_json);

        console.log('surveyData ===>', surveyData);
        console.log('___________done wer____________');
        let from = '781528375';
        console.log('from ===', from);
        let autho = await GoogleSheetsSending(surveyData, from)

        console.log('autho lala ====>', autho)
        res.json(autho);
        res.end();
      } catch (error) {
        console.error('Failed to parse survey response:', error);
      }
    }
  }


});


async function GoogleSheetsSending(parsedData, phonenumber) {

  console.log('GoogleSheetsSending ====>', GoogleSheetsSending);

  if (!parsedData) return;

  const authClient = await authorizeGoogleSheets();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `responses!A2:A`, // Adjust range to cover phone number column
    auth: authClient
  });

  console.log('response.data ====== ', response.data);

  // Check if the phone number already exists
  if (response.data.values) {
    const isDuplicate = response.data.values.some(row => row[0] === phonenumber);

    console.log(' isDuplicate ====== ', isDuplicate);

    if (isDuplicate) {
      console.log(`Duplicate found for ${phonenumber} - skipping insert`);
      return;
    }
  }




  const values = Object.values(parsedData);

  values.unshift(phonenumber);


  return await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    auth: authClient,
    requestBody: {
      values: [values]
    }
  });


}

app.get('/spreedcheat', async (req, res) => {
  console.log('/spreedcheat');

  const authClient = await authorizeGoogleSheets();

  const parsedData = {
    'screen 7  0': '3 : Neutre',
    'screen 7  1': 'Sk',
    'screen 7  2': 'Non',
    'screen 6  0': 'Modéré, j’utilise la techno',
    'screen 6  1': 'Enthousiaste, j’adore essayer',
    'screen 5  0': 'Tablette',
    'screen 5  1': 'Publicité en ligne',
    'screen 4  0': 'Préparer mon permis',
    'screen 4  1': 'Design attractif',
    'screen 3  0': 'Oui',
    'screen 3 quelques mots 1': 'Sjj',
    'screen 2  0': 'Une fois par jour',
    'screen 2  1': "Oui assiduité jusqu'à la fin",
    'screen 2  2': 'Pendant les pauses',
    'screen 1  0': 'Sans emploi',
    'screen 1 Quel est votre revenu mensuel 1': 'Entre 200K - 500 K',
    'screen 0 Quel ge avezvous  0': '25-34 ans',
    'screen 0 Quel est votre genre  1': 'Femme',
    'screen 0 O habitezvous  2': 'Autres région du Sénégal'
  };
  const values = Object.values(parsedData);

  console.log('values ===', values);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    auth: authClient,
    requestBody: {
      values: [values]
    }
  });

});


app.get('/check100', async (req, res) => {

  console.log('/check100');




  let connect = await Mongo.connect();
  condition = [
    {
      $addFields: {
        messageCount: { $size: "$flow" }
      }
    },
    {
      $sort: {
        messageCount: -1
      }
    },
    {
      $limit: 100
    },
    {
      $project: {
        phoneNumber: "$user_phone_number",
        fullName: "$user_full_name",
        totalMessages: "$messageCount",
        _id: 0
      }
    }
  ];

  const users = await Mongo.findagregation(condition);

  let contacts = extractPhoneNumbers(users);

  console.log('stringify numb ===', JSON.stringify(contacts));
  //'["221781528375","221774765113","221781528375","97143086195","221781528375","221707480357","221779768156","221775217238","221703448333","221778828366","221777736402","221786120761","221771329388","221775949332","221764873426","221776088019","221704214752","221785879582","221787556661","221771637998","221783772852","221761641894","221776021555","221781089551","221777373839"]'
  //const ramsam = ["221781528375","221777172747","221779943702","221764864239","221781324934","221762511482","221772243709","221763355292","221770149023","221766321254","221764130152","221766842397","221781033855","221771351521","221775930902","221763154694","221783388757","221701023659","221763148918","221770532832","221770753361","221762911851","221782874283","221778034304","221775483828","221766405422","221777953795","221773656613","221775337806","221784324270","221773487891","221781911893","221776671463","221780178696","221781664253","221768024649","221778734085","221773916626","221785238930","221779729223","221774737679","243900959546","221773306607","221785289803","221775081563","221777765226","221762952314","221771279992","221787860295","221773505757","221777636526","34653633708","221778842967","221785210490","212696980337","221786804402","221774898129","221768787349","221772474342","221773669975","221775311963","221760122380","221787319311","221785204569","221783126138","221778450936","221775998344","221773971382","221787358890","221768563741","221786645754","221777187572","221785167255","221773835696","221786315956"]
  const ramsam = ["221772719593"];
  const PHONE_NUMBER_ID = '106273332517016';
  const CODE_COUNTRY = 'fr';
  const TEMPLATE_NAME = 'formulaire_kyc';
  const CONFIG = require("./configs/setup");

  const sender = new WhatsAppSender(
    PHONE_NUMBER_ID,
    CONFIG.env.WHATSAPP_TOKEN
  );
  console.log(PHONE_NUMBER_ID,
    CONFIG.env.WHATSAPP_TOKEN)
  console.log('___________');
  sender.sendBatchMessagesFlow(ramsam, TEMPLATE_NAME, CODE_COUNTRY, []);


});

app.get('/', (req, res) => {

  res.write('ceci est un trsg apitest');
  Mongo.connect()
    .then((success) => {

      let condition = {
        $and: [
          { "idbot": ObjectId("659816a89f5a6dc6bc104da5") },
          { "user_phone_number": "221775766854" }
        ]
      }


      Mongo.numberOfexchangePerUser(condition)
        .then((Dialogs) => {

          console.log('dialogs ==>', Dialogs);

        })
        .catch((error) => {
          console.log('pas de connexion possible', error);
        })



    })
    .catch((error) => {
      console.log('pas de connexion possible', error);
    })

  res.end();
});


const AUTO_ECOLE_CONFIG = {
  name: 'Peelo Car',
  id: "677fcb0aff331d26fcb0cd33",
  tel: '787570707'
};

// Response templates
const RESPONSES = {
  EXISTING_USER: [{
    type: "text",
    id_element: "659816a89f5a6dc6bc104da5_67866889dccb5bc0fc311a4a_text_ASDURT",
    message: "Un Élève est déjà enregistré avec ce numéro",
    preview_url: true
  },
  {
    type: "redirection",
    id_element: "new_student_added_007",
    id_previous: "659816a89f5a6dc6bc104da5_67866889dccb5bc0fc311a4a_text_ASDURT",
    redirection_block: "get_current_menu"
  }],
  UPDATE_SUCCESS: [
    {
      type: "text",
      id_element: "659816a89f5a6dc6bc104da5_67866889dccb5bc0fc311a4a_text_Ataturk",
      message: "L'enregistrement a été effectué avec succès ! 🎉 En attendant la validation, vous pouvez commencer à apprendre dès maintenant.\" 🚀",
      preview_url: true
    },
    {
      type: "redirection",
      id_element: "new_student_added_009",
      id_previous: "659816a89f5a6dc6bc104da5_67866889dccb5bc0fc311a4a_text_Ataturk",
      redirection_block: "get_current_menu"
    }
  ],
  NEW_USER_SUCCESS: [
    {
      type: "text",
      id_element: "659816a89f5a6dc6bc104da5_67866889dccb5bc0fc311a4a_text_XK7INXr3SkCB",
      message: "L'enregistrement a été effectué avec succès ! 🎉 En attendant la validation, vous pouvez commencer à apprendre dès maintenant.\" 🚀",
      preview_url: true
    },
    {
      type: "redirection",
      id_element: "new_student_added",
      id_previous: "659816a89f5a6dc6bc104da5_67866889dccb5bc0fc311a4a_text_XK7INXr3SkCB",
      redirection_block: "get_current_menu"
    }
  ]
};


const createUserTemplate = (extractedData) => ({
  fullname: extractedData.datas.fullname_ae,
  tel: extractedData.datas.tel_ae,
  name_autoecole: AUTO_ECOLE_CONFIG.name,
  id_autoecole: ObjectId(AUTO_ECOLE_CONFIG.id),
  tel_autoecole: AUTO_ECOLE_CONFIG.tel,
  status_payment_ec: extractedData.datas.status_payment_ec,
  tel_payment: extractedData.datas.tel_payment,
  reply_phone: extractedData.datas.reply_phone,
  typeofpayment: extractedData.datas.typeofpayment,
  paymentamout: extractedData.datas.paymentamout,
  age: extractedData.datas.age,
  waypayment: extractedData.datas.waypayment,
  home_ec: extractedData.datas.home_ec,
  typesub: extractedData.datas.typesub
});

// Error handler middleware
const errorHandler = (error, res) => {
  console.error('Error:', error);
  res.status(500).json({
    type: "error",
    message: "Une erreur est survenue lors du traitement de votre demande"
  });
};

app.get('/autobot/signup/user', (req, res) => {

  res.write('/autobot/signup/user');
  res.end();
});

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

  return true


});

app.post('/payment/request', async (req, res) => {

  console.log('/payment/request');
  let connexion;

  try {

    const extractedData = extractData(req.body.datas);
   

    connexion = await Mongo.connect();
     
   let tel =  extractedData.datas.typesub === 'user' ? extractedData.datas.reply_phone  : `221${extractedData.datas.tel_ae}`;
   
     console.log('tel ===>',tel);
    extractedData.datas.tel_ae = tel;
    console.log('extractedData ===>',extractedData)

    const userExist = await Mongo.findAutoEcoleStudent({
      tel: tel
    });

    console.log('userExist ===>',userExist);

    if (userExist.length === 0) 
      {
      // Create new user
      console.log('USER DOESNT EXIST');
      const userTemplate = createUserTemplate(extractedData);
      await Mongo.createAutoEcoleStudent(userTemplate);
      return res.json(RESPONSES.NEW_USER_SUCCESS);
    }

    // Handle existing user
    if (userExist[0]['tel_autoecole'] === AUTO_ECOLE_CONFIG.tel) 
      {
      return res.json(RESPONSES.EXISTING_USER);
     }

     console.log('______________  JOKOLABS  ______________')
     console.log('______________  extracted datas  ______________')
     console.log('______________  extracted datas  ______________',extractedData)

     //return false;
     //res.end();
    // Update existing user
    await Mongo.updateCurrentUser(
      userExist[0]['_id'],
      createUserTemplate(extractedData)
    ); 

    return res.json(RESPONSES.UPDATE_SUCCESS);

  } catch (error) {
    errorHandler(error, res);
  } finally {
    if (connexion) {
      await Mongo.disconnect();
    }
  }




});


 
 
 

app.listen(7434);
