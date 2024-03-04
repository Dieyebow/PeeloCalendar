module.exports = (_, app, axios, Mongo, ObjectID, authenticateToken) => {

    app.post('/create/quizz', authenticateToken, async (req, res) => {

        const { nameQuizz } = req.body;

        console.log('nameQuizz ==>', nameQuizz);
        try {

            const connexion = await Mongo.connect();
            console.log('connexion  == ', connexion);
            console.log("On check le user  ==>", req.user);

            const newQuizz = {
                title: nameQuizz,
                id_user: req.user._id,
                list_quizz: [
                    {
                        image: "https://mojay.pro/assets/chatbot/storage/autoecole/quiz/panneaux/interdiction.jpeg",
                        text: "Sur la route, le panneau <Stop> oblige seulement les voitures en circulation dans cette voie à marquer un arrêt, mais pas les scooters et les cyclistes.",
                        audio: "https://mojay.pro/assets/chatbot/storage/autoecole/quiz/panneaux/audios/q1/q1.mp3",
                        buttons: [
                            {
                                value: "true",
                                title: "Vrai 🟩",
                            },
                            {
                                value: "false",
                                title: "Faux 🟨"
                            }
                        ],
                        answer: {
                            audio: "https://mojay.pro/assets/chatbot/storage/autoecole/quiz/panneaux/audios/q1/q1.mp3",
                            text: "{{goodanswer}} \n\n Le panneau <<stop>> oblige tous les usagers utilisant la voie de circulation (voitures, scooters, camions, cyclistes...) à marquer un arrêt sans dépasser la ligne blanche se trouvant au sol.",

                        }
                    }
                ],
            }

            const creation = await Mongo.createQuizz(newQuizz);
            return res.status(200).send({
                newQuizz: creation
            });

        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',);
        }


    });




}