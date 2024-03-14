module.exports = (_, app, axios, Mongo, ObjectID, authenticateToken) => {

    app.get('/get/list/quiz',authenticateToken, async (req, res) => {

        console.log('/get/list/quiz');

        try {

            const connexion = await Mongo.connect();
            const listQuizz =  await Mongo.listQuizz()
            return res.status(200).send({
                listQuiz: listQuizz
            });

 
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',);
        }

    });



}