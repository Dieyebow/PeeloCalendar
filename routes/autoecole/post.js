
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
        console.log('generateUniqueFilename ===>',file);
        console.log(' Filename ===>',file.name);

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
            console.log('====================> IMAGE');
            const imageFilename = generateUniqueFilename(req.files.image);
            await moveFile(req.files.image, `public/assets/uploads/images/${imageFilename}`);
            dataToUpdate.image = `${path}/${midway}/images/${imageFilename}`
        }
        if (_.has(req.files, 'audio')) {
            console.log('====================> AUDIO');
            const audioFilename = generateUniqueFilename(req.files.audio);
            await moveFile(req.files.audio, `public/assets/uploads/audios/${audioFilename}`);
            dataToUpdate.audio = `${path}/${midway}/audios/${audioFilename}`

        }

        dataToUpdate.answer = {
            audio: '',
            text: ''
        };

        if (_.has(req.files, 'audioanswer')) {
            console.log('====================> audioanswer');

            const answerAudioFilename = generateUniqueFilename(req.files.audioanswer);
            await moveFile(req.files.audioanswer, `public/assets/uploads/audios/${answerAudioFilename}`);
            dataToUpdate.answer.audio = `${path}/${midway}/audios/${answerAudioFilename}`

        }

        dataToUpdate.text = text
        dataToUpdate.buttons = JSON.parse(buttons)
        dataToUpdate.answer.text = textAnswer


        try {

            const connexion = await Mongo.connect();
            const updatedQuizz = await Mongo.updateQuestionToQuizz(req.params.idquizz, keyQuestion, dataToUpdate);

            console.log('updatedQuizz ===>', updatedQuizz);
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
/*
    app.post('/add/question/quizz/:idquizz', authenticateToken, async (req, res) => {

        const { image, audio, audioanswer } = req.files;

        const { text, buttons, textAnswer } = req.body;



        // Move the uploaded files to the desired location
        const midway = 'public/assets/uploads'
        
        await moveFile(image, `public/assets/uploads/images/${imageFilename}`);
        await moveFile(audio, `public/assets/uploads/audios/${audioFilename}`);
        await moveFile(audioanswer, `public/assets/uploads/audios/${answerAudioFilename}`);
        
        if (_.has(req.files, 'image')) {
            const imageFilename = generateUniqueFilename(image);
            
        }
        
        if (_.has(req.files, 'audio')) {
            const audioFilename = generateUniqueFilename(audio);
            
        }
        
        if (_.has(req.files, 'audio')) {
            const answerAudioFilename = generateUniqueFilename(audioanswer);

        }


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


         
    })
*/

app.post('/add/question/quizz/:idquizz', authenticateToken, async (req, res) => {
  
  console.log('req.files ====> ', req.files);
  
    const { image, audio, audioanswer } = req.files;
    const { text, buttons, textAnswer } = req.body;

    // Generate unique filenames
    let imageFilename, audioFilename, answerAudioFilename;
    if (_.has(req.files, 'image')) {
        imageFilename = generateUniqueFilename(image);
    }
    if (_.has(req.files, 'audio')) {
        audioFilename = generateUniqueFilename(audio);
    }
    if (_.has(req.files, 'audioanswer')) {
        answerAudioFilename = generateUniqueFilename(audioanswer);
    }
  
    // Move the uploaded files to the desired location
    const midway = 'public/assets/uploads';
    if (imageFilename) {
        await moveFile(image, `${midway}/images/${imageFilename}`);
    }
    if (audioFilename) {
        await moveFile(audio, `${midway}/audios/${audioFilename}`);
    }
    if (answerAudioFilename) {
        await moveFile(audioanswer, `${midway}/audios/${answerAudioFilename}`);
    }

    let path = 'https://autoecole.mojay.pro';
    const newQuestion = {
        image: imageFilename ? `${path}/${midway}/images/${imageFilename}` : null,
        text: text,
        audio: audioFilename ? `${path}/${midway}/audios/${audioFilename}` : null,
        buttons: JSON.parse(buttons),
        answer: {
            audio: answerAudioFilename ? `${path}/${midway}/audios/${answerAudioFilename}` : null,
            text: textAnswer
        }
    };

    try {
        const connexion = await Mongo.connect();
        const updatedQuizz = await Mongo.addQuestionToQuizz(req.params.idquizz, newQuestion);
        return res.status(200).send({
            status: updatedQuizz,
            updatedQuizz: newQuestion
        });
    } catch (error) {
        console.log('Error during execution', error);
        return res.status(500).send({ message: 'Internal server error' });
    }
});


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





    app.post('/create/cours', authenticateToken, async (req, res) => {

         console.log('/create/cours ===>');
         console.log('req.files',req.files);
        const existImage = !_.isNull(req.files) ? true : false;
        let imagepath = null
        console.log('____________________________________________')
         console.log('req.body',req.body);
         console.log('existImage',existImage);
         if(existImage)
         {
            const { image } = req.files;
            const imageFilename = generateUniqueFilename(image);
            const midway = 'public/assets/uploads/courses';
            await moveFile(image, `${midway}/${imageFilename}`);
            imagepath = `https://autoecole.mojay.pro/${midway}/${imageFilename}`;
         }
         console.log('____________________________________________>')
         console.log('imagepath ===>',imagepath);

        const { nameCours } = req.body;

        try {

            const connexion = await Mongo.connect();
            const newCours = {
                title: nameCours,
                id_user: req.user._id,
                image: imagepath,
                Sections: [ ],
                quizz_associated: null
            }
            const creation = await Mongo.createCours(newCours);
            return res.status(200).send({
                newCours: creation[0]
            });
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution tous les erreur =======>',errorit);
        }


    });

    app.post('/update/cours', authenticateToken, async (req, res) => {

        console.log('/update/cours');
        const {cours} = req.body;

        console.log('cours ==>',cours);
       try{
            const connexion = await Mongo.connect();
            const updated = await Mongo.udpateCourses( cours );
            console.log('updated zer dondone ==>',updated);
            if(updated.modifiedCount)
            {  
                return res.status(200).send({ message: 'Cours modifié avec succès !' });
            }
        } catch (errorit) {
            console.log('on a une erreur dans l execution',errorit);
            return res.status(500).send({ message: 'Erreur pendant la modification !' });
        }

    });

    app.delete('/delete/cours', authenticateToken, async (req, res) => {
        
        console.log('/delete/cours');

        const { idcours } = req.body;
      
        try {
            const connexion = await Mongo.connect();
            const deletion = await Mongo.deleteCours({_id: ObjectID(idcours)});
            
            console.log('deletion zer ==>',deletion);

            if (deletion.deletedCount === 0) {
                return res.status(404).send({ message: 'Course not found' });
            }
    
            return res.status(200).send({ message: 'Course deleted successfully' });
        } catch (error) {
            console.log('Error during execution', error);
            return res.status(500).send({ message: 'Internal server error' });
        }
    });


}