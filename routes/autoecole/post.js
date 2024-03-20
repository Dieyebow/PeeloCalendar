
module.exports = (_, app, axios, Mongo, ObjectID, authenticateToken) => {

    const fs = require('fs');
    const path = require('path');


    const moveFile = (file, destination) => {
        return new Promise((resolve, reject) => {
            file.mv(destination, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };

    // Function to generate a unique filename
    const generateUniqueFilename = (file) => {
        console.log('generateUniqueFilename');
        const randomString = generateRandomString();
        const timestamp = Date.now();
        const extension = path.extname(file.name);
        return `${randomString}_${timestamp}${extension}`;
    };

    const generateRandomString = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters.charAt(randomIndex);
        }
        return result;
    }

 
    app.post('/update/question/quizz/:idquizz', authenticateToken, async (req, res) => {
        console.log(`public/assets/uploads/images/${req.params.idquizz}`);

        let dataToUpdate = {};
        let path = 'https://autoecole.mojay.pro';
        const midway = 'public/assets/uploads'

        console.log('req.body ===>', req.body);
        console.log('req.files ===>', req.files);

        const { text, buttons, textAnswer, keyQuestion } = req.body;
        if (_.has(req.files, 'image')) {
            const imageFilename = generateUniqueFilename(req.files.image);
            await moveFile(req.files.image, `public/assets/uploads/images/${imageFilename}`);
            dataToUpdate.image = `${path}/${midway}/images/${imageFilename}`
        }
        if (_.has(req.files, 'audio')) {
            const audioFilename = generateUniqueFilename(req.files.audio);
            await moveFile(req.files.audio, `public/assets/uploads/audios/${audioFilename}`);
            dataToUpdate.audio = `${path}/${midway}/audios/${audioFilename}`

        }
        if (_.has(req.files, 'audioanswer')) {
            const answerAudioFilename = generateUniqueFilename(req.files.audioanswer);
            await moveFile(req.files.audioanswer, `public/assets/uploads/audios/${answerAudioFilename}`);
            dataToUpdate.audioanswer = `${path}/${midway}/audios/${answerAudioFilename}`

        }

        dataToUpdate.text = text
        dataToUpdate.buttons = JSON.parse(buttons)
        dataToUpdate.textAnswer = textAnswer


        try {

            const connexion = await Mongo.connect();
            const updatedQuizz = await Mongo.updateQuestionToQuizz(req.params.idquizz, keyQuestion, dataToUpdate);
            /*
            return res.status(200).send({
                status: updatedQuizz,
                updatedQuizz: newQuestion
            });
            */

        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',);
        }


    });

    app.post('/add/question/quizz/:idquizz', authenticateToken, async (req, res) => {

        const { image, audio, audioanswer } = req.files;

        const { text, buttons, textAnswer } = req.body;



        // Move the uploaded files to the desired location
        const imageFilename = generateUniqueFilename(image);
        const audioFilename = generateUniqueFilename(audio);
        const answerAudioFilename = generateUniqueFilename(audioanswer);
        const midway = 'public/assets/uploads'

        await moveFile(image, `public/assets/uploads/images/${imageFilename}`);
        await moveFile(audio, `public/assets/uploads/audios/${audioFilename}`);
        await moveFile(audioanswer, `public/assets/uploads/audios/${answerAudioFilename}`);



        let path = 'https://autoecole.mojay.pro';
        const newQuestion = {
            image: `${path}/${midway}/images/${imageFilename}`,
            text: text,
            audio: `${path}/${midway}/audios/${audioFilename}`,
            buttons: JSON.parse(buttons),
            answer: {
                audio: `${path}/${midway}/audios/${answerAudioFilename}`,
                text: textAnswer
            }
        };
        // console.log('newQuestion ==> ', newQuestion);
        //res.json(rassguiss);
        try {

            const connexion = await Mongo.connect();
            const updatedQuizz = await Mongo.addQuestionToQuizz(req.params.idquizz, newQuestion);
            return res.status(200).send({
                status: updatedQuizz,
                updatedQuizz: newQuestion
            });
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',);
        }


        /**/
    })

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
                            audio: "https://mojay.pro/assets/chatbot/storage/autoecole/quiz/panneaux/audios/q1/q1a.mp3",
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