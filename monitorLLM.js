let express    = require("express");
let bodyParser = require("body-parser");
let session = require("express-session");
let fs = require("fs");
let cors = require("cors");
let dotenv = require('dotenv');



let axios = require("axios").default
let _ = require("lodash");
let Mongo = require("./models/mongocar");
let app = express();


let path_public = "/public";



dotenv.config({});
 app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(path_public, express.static(__dirname + "/public"));


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


const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY, // defaults to process.env["ANTHROPIC_API_KEY"]
  });
const systemPrompt = ` 
Tu es un moniteur d’auto-école virtuel, expert en signalisation et sécurité routière. Ta mission est d'assister les élèves en répondant à leurs questions et en générant des quiz pédagogiques adaptés. Tu dois pouvoir communiquer aisément en français et en wolof. 
Pour chaque question ou demande, adapte ta réponse à la langue utilisée par l’élève. Lorsque tu reçois une image (par exemple, un panneau de signalisation), analyse-la minutieusement et décris en détail les éléments essentiels et leur signification dans le contexte de la circulation. Explique ces informations en français et en wolof, en mettant l'accent sur la clarté et la pédagogie.
Assure-toi que tes réponses soient précises et adaptées au niveau des étudiants en auto-école. Si besoin, n'hésite pas à reformuler. Les réponses courtes sont préférables. Pour chaque question que je te pose, ta réponse doit être strictement formatée en JSON sans explications supplémentaires. L'objet JSON doit comporter deux clés principales : "francais" et "wolof"
`
const messageText = [{ role: "user", content: "Hello, Claude" }];


async function getBase64Image(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary').toString('base64');
  }
  
  // Usage example
  async function prepareImages() {
    return await getBase64Image("https://autoecole.mojay.pro/public/assets/uploads/images/cZNT_1715184535400.png");
    //('https://autoecole.mojay.pro/public/assets/uploads/images/9JbP_1711212800627.png');
    // Now you can use imageData in your API calls
  }
  

  async function main() {
      
    imageData = await prepareImages()     
 
const messageImage = [
    {
      role: "user",
      content: [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: "image/png",
            data: imageData, // Base64-encoded image data as string
          }
        },
        {
          type: "text", 
          text: "Describe only the road signage that you see in this image."
        }
      ]
    }
  ];

  const dataAnswer = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 330,
    system: systemPrompt,
    messages: messageImage,
  })
   console.log('la reponse IA ',dataAnswer);

   const textResponse = dataAnswer?.content?.[0]?.text;
    if (!textResponse) {
      console.error('Structure de réponse inattendue ou texte manquant:', JSON.stringify(dataAnswer, null, 2));
      return null;
    }

    try {
        const parsedJson = JSON.parse(textResponse);
        
        // Valider la structure attendue
        if (!parsedJson.francais || !parsedJson.wolof) {
          console.error("Le JSON de réponse ne contient pas les champs requis (francais ou wolof)");
          return null;
        }
        
        console.log("JSON extrait avec succès:");
        console.log("Réponse en français:", parsedJson.francais);
        console.log("Réponse en wolof:", parsedJson.wolof);
        
        return parsedJson;
      } catch (error) {
        console.error("Impossible d'analyser la réponse comme JSON:", error);
        console.log("Texte brut:", textResponse);
        return null;
      }


}



main();

return true 


//claude-3-5-sonnet-20240620
//claude-3-7-sonnet-20250219


 

 anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messageImage,
  }).then((response) => {
    console.log('we be waiting');
    console.log(response);
  }).catch((error) => {
    console.log('error catch',error);

    console.error(error);
  });

  return true;



console.log('ceci est un test');


//, authenticateToken
app.get('/claud/monitor', (req, res) => {

    console.log('textlivre');
    res.write('textlivre');
    res.end();

})


app.listen(5754);
