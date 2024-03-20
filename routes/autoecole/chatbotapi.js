module.exports = (_, app, axios, Mongo, ObjectID, authenticateToken) => {

    const fs = require('fs');
    const path = require('path');


    const generateRandomString = (taille) => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < taille; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

//authenticateToken
    app.post('/chatbot/list/quizz', async (req, res) => {

      const  { status_payment_ec, fullname_ae, tel_ae, reply_phone, bot_number } = req.body
        
        try {

            const connexion = await Mongo.connect();
            const listQuizz = await Mongo.findLiteListQuizz()
            const id_element = generateRandomString(12);


            if (listQuizz.length) {

                const sections_row = listQuizz.map((quiz, index) => {
                    return {
                        id: `Quiz_${quiz._id}`,
                        title: quiz.title,
                        description: `Ce quizz a ${quiz.number_quizz} questions`
                    };
                });

          
                res.status(200).send({

                    "type": "list",
                    "id_element": id_element,
                    "id_previous": null,
                    "interactive": {
                        "type": "list",
                        "header": {
                            "type": "text",
                            "text": "Quizz disponibles"
                        },
                        "body": {
                            "text": "La liste des quizz disponibles",
                        },
                        "footer": {
                            "text": "Choisissez un quizz pour commencer"
                        },
                        "action": {
                            "button": "Démarrer",
                            "sections": [
                              {
                                "title": "Les quizz",
                                "rows": sections_row
                              },
                              
                            ]
                          }
                    }
                });

            }
            } catch (errorit) {
                console.log('nous avons une erreur dans l execution',);
            }

        });

}