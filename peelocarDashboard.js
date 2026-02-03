// =============================================
// PeeloCar Dashboard Routes Module
// Toutes les routes commencent par /dashboard
// =============================================

module.exports = (_, app, axios, Mongo, ObjectId, authenticateToken) => {

// ============================================================
// ROUTES POUR AUTOECOLE_USER (Utilisateurs Admin/Moniteurs)
// ============================================================

// Nombre total d'utilisateurs admin
app.get('/dashboard/users/count', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const count = await Mongo.countUsers();

    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error in /dashboard/users/count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Liste paginée des utilisateurs admin
app.get('/dashboard/users/list', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    await Mongo.connect();
    const users = await Mongo.findUser({});

    return res.status(200).json({
      success: true,
      users: users,
      pagination: {
        page: page,
        limit: limit,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/users/list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ROUTES POUR AUTOECOLES (Auto-écoles)
// ============================================================

// Nombre total d'auto-écoles
app.get('/dashboard/autoecoles/count', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const count = await Mongo.countAutoEcole();

    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error in /dashboard/autoecoles/count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Liste des auto-écoles avec pagination
app.get('/dashboard/autoecoles/list', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    await Mongo.connect();
    const autoecoles = await Mongo.listAutoEcole({});

    return res.status(200).json({
      success: true,
      autoecoles: autoecoles,
      pagination: {
        page: page,
        limit: limit,
        total: autoecoles.length
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/autoecoles/list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Élèves par auto-école spécifique
app.get('/dashboard/autoecoles/:id/students', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await Mongo.connect();
    const students = await Mongo.findAutoEcoleStudent({ id_autoecole: ObjectId(id) });

    return res.status(200).json({
      success: true,
      autoecole_id: id,
      students: students,
      count: students.length
    });
  } catch (error) {
    console.error('Error in /dashboard/autoecoles/:id/students:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Statistiques globales des auto-écoles
app.get('/dashboard/autoecoles/stats', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    const aggregate = [
      {
        $lookup: {
          from: "autoecoles_current_user",
          localField: "_id",
          foreignField: "id_autoecole",
          as: "students"
        }
      },
      {
        $project: {
          _id: 1,
          nomAutoecole: 1,
          phoneNumber: 1,
          Admin_displayName: 1,
          studentsCount: { $size: "$students" },
          created_at: 1
        }
      },
      {
        $sort: { studentsCount: -1 }
      }
    ];

    const stats = await Mongo.findbyaggregate("peelo", "autoecoles", Mongo.client, aggregate);

    return res.status(200).json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error in /dashboard/autoecoles/stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ROUTES POUR AUTOECOLES_CURRENT_USER (Élèves)
// ============================================================

// Nombre total d'élèves
app.get('/dashboard/students/count', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const count = await Mongo.countElevesAutoEcole();

    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error in /dashboard/students/count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Liste paginée des élèves avec filtres
app.get('/dashboard/students/list', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    await Mongo.connect();

    let condition = {};
    if (search) {
      condition = {
        $or: [
          { fullname: { $regex: search, $options: 'i' } },
          { tel: { $regex: search, $options: 'i' } },
          { name_autoecole: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const students = await Mongo.findAutoEcolePagination(skip, limit, condition);
    const totalCount = await Mongo.countElevesAutoEcole(condition);

    return res.status(200).json({
      success: true,
      students: students,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/students/list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Élèves par auto-école
app.get('/dashboard/students/by-autoecole/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    await Mongo.connect();
    const condition = { id_autoecole: ObjectId(id) };
    const students = await Mongo.findAutoEcolePagination(skip, limit, condition);
    const totalCount = await Mongo.countElevesAutoEcole(condition);

    return res.status(200).json({
      success: true,
      autoecole_id: id,
      students: students,
      pagination: {
        page: page,
        limit: limit,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/students/by-autoecole:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Nouvelles inscriptions par date
app.get('/dashboard/students/by-date', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const dailyStats = await Mongo.countDailynewUser();

    return res.status(200).json({
      success: true,
      dailyStats: dailyStats
    });
  } catch (error) {
    console.error('Error in /dashboard/students/by-date:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Élèves premium uniquement (tel_autoecole = 787570707)
app.get('/dashboard/students/premium', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    await Mongo.connect();
    const premiumStudents = await Mongo.findPremiumStudent('787570707');

    return res.status(200).json({
      success: true,
      students: premiumStudents,
      count: premiumStudents.length,
      pagination: {
        page: page,
        limit: limit,
        total: premiumStudents.length
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/students/premium:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Élèves actifs récemment (avec dialogues)
app.get('/dashboard/students/active', authenticateToken, async (req, res) => {
  try {
    const idbot = req.query.idbot || '659816a89f5a6dc6bc104da5';

    await Mongo.connect();
    const activeUsers = await Mongo.countDailyActiveUser();

    return res.status(200).json({
      success: true,
      activeUsers: activeUsers
    });
  } catch (error) {
    console.error('Error in /dashboard/students/active:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ROUTES POUR AUTOECOLES_QUIZZ (Quiz)
// ============================================================

// Nombre total de quiz
app.get('/dashboard/quizz/count', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const count = await Mongo.countQuizz();

    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error in /dashboard/quizz/count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Liste des quiz avec nombre de questions
app.get('/dashboard/quizz/list', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const quizzList = await Mongo.findLiteListQuizz();

    return res.status(200).json({
      success: true,
      quizz: quizzList,
      count: quizzList.length
    });
  } catch (error) {
    console.error('Error in /dashboard/quizz/list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Détails complets d'un quiz spécifique
app.get('/dashboard/quizz/:id/details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await Mongo.connect();
    const quizz = await Mongo.findQuizz({ _id: ObjectId(id) });

    if (!quizz.length) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    return res.status(200).json({
      success: true,
      quizz: quizz[0],
      questionsCount: quizz[0].list_quizz ? quizz[0].list_quizz.length : 0
    });
  } catch (error) {
    console.error('Error in /dashboard/quizz/:id/details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Statistiques des quiz (nombre de questions, répartition)
app.get('/dashboard/quizz/stats', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    const aggregate = [
      {
        $addFields: {
          number_questions: { $size: "$list_quizz" }
        }
      },
      {
        $group: {
          _id: null,
          totalQuizz: { $sum: 1 },
          totalQuestions: { $sum: "$number_questions" },
          avgQuestionsPerQuizz: { $avg: "$number_questions" },
          minQuestions: { $min: "$number_questions" },
          maxQuestions: { $max: "$number_questions" }
        }
      }
    ];

    const stats = await Mongo.findbyaggregate("peelo", "autoecoles_quizz", Mongo.client, aggregate);

    return res.status(200).json({
      success: true,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('Error in /dashboard/quizz/stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Quiz les plus utilisés (basé sur autoecoles_quizz_test)
app.get('/dashboard/quizz/popular', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    await Mongo.connect();

    const aggregate = [
      {
        $group: {
          _id: "$id_quizz",
          testCount: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      },
      {
        $sort: { testCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "autoecoles_quizz",
          localField: "_id",
          foreignField: "_id",
          as: "quizz_info"
        }
      },
      {
        $unwind: {
          path: "$quizz_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          testCount: 1,
          avgScore: { $round: ["$avgScore", 2] },
          title: "$quizz_info.title"
        }
      }
    ];

    const popularQuizz = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);

    return res.status(200).json({
      success: true,
      popularQuizz: popularQuizz
    });
  } catch (error) {
    console.error('Error in /dashboard/quizz/popular:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// ROUTES POUR GESTION CRUD DES QUIZ (Create, Update, Delete)
// ============================================================

// Créer un nouveau quiz
app.post('/dashboard/quizz', authenticateToken, async (req, res) => {
  try {
    const { title, id_user } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    await Mongo.connect();

    const quizzData = {
      title: title,
      id_user: id_user || req.user._id,
      list_quizz: [],
      created_at: new Date(),
      update_date: new Date()
    };

    const result = await Mongo.createQuizz(quizzData);

    return res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quizz_id: result.insertedId
    });
  } catch (error) {
    console.error('Error in POST /dashboard/quizz:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Modifier les métadonnées d'un quiz (titre, etc.)
app.put('/dashboard/quizz/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🔧 [PUT /dashboard/quizz/:id] Début de la requête');
    console.log('📋 [PUT Quiz] ID:', req.params.id);
    console.log('📋 [PUT Quiz] Body:', JSON.stringify(req.body));

    const { id } = req.params;
    const { title } = req.body;

    if (!title) {
      console.log('❌ [PUT Quiz] Erreur: title manquant');
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    console.log('🔌 [PUT Quiz] Connexion à MongoDB...');
    await Mongo.connect();
    console.log('✅ [PUT Quiz] MongoDB connecté');

    const updates = {
      title: title
      // update_date is automatically handled by updatElement
    };

    console.log('📝 [PUT Quiz] Updates à appliquer:', JSON.stringify(updates));
    console.log('🔄 [PUT Quiz] Appel de Mongo.updateQuizz...');

    const result = await Mongo.updateQuizz(id, updates);

    console.log('✅ [PUT Quiz] Résultat de updateQuizz:', JSON.stringify(result));
    console.log('🎉 [PUT Quiz] Mise à jour réussie');

    return res.status(200).json({
      success: true,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    console.error('❌ [PUT Quiz] ERREUR:', error);
    console.error('❌ [PUT Quiz] Stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Ajouter une question à un quiz
app.post('/dashboard/quizz/:id/questions', authenticateToken, async (req, res) => {

  console.log('req.files ====> ', req.files);

  const { id } = req.params;
  const { image, audio, audioanswer } = req.files || {};
  const { text, buttons, textAnswer } = req.body;

  // Generate unique filenames
  let imageFilename, audioFilename, answerAudioFilename;
  if (req.files && _.has(req.files, 'image')) {
      imageFilename = generateUniqueFilename(image);
  }
  if (req.files && _.has(req.files, 'audio')) {
      audioFilename = generateUniqueFilename(audio);
  }
  if (req.files && _.has(req.files, 'audioanswer')) {
      answerAudioFilename = generateUniqueFilename(audioanswer);
  }

  // Move the uploaded files to the desired location
  if (imageFilename) {
      await moveFile(image, path.join(UPLOAD_BASE_PATH, 'images', imageFilename));
  }
  if (audioFilename) {
      await moveFile(audio, path.join(UPLOAD_BASE_PATH, 'audios', audioFilename));
  }
  if (answerAudioFilename) {
      await moveFile(audioanswer, path.join(UPLOAD_BASE_PATH, 'audios', answerAudioFilename));
  }

  const newQuestion = {
      image: imageFilename ? `https://autoecole.mojay.pro/public/assets/uploads/images/${imageFilename}` : null,
      text: text,
      audio: audioFilename ? `https://autoecole.mojay.pro/public/assets/uploads/audios/${audioFilename}` : null,
      buttons: JSON.parse(buttons),
      answer: {
          audio: answerAudioFilename ? `https://autoecole.mojay.pro/public/assets/uploads/audios/${answerAudioFilename}` : null,
          text: textAnswer
      }
  };

  try {
      const connexion = await Mongo.connect();
      const updatedQuizz = await Mongo.addQuestionToQuizz(id, newQuestion);
      return res.status(200).send({
          status: updatedQuizz,
          updatedQuizz: newQuestion
      });
  } catch (error) {
      console.log('Error during execution', error);
      return res.status(500).send({ message: 'Internal server error' });
  }
});

// Modifier une question spécifique dans un quiz
app.put('/dashboard/quizz/:id/questions/:index', authenticateToken, async (req, res) => {
  const { id, index } = req.params;
  let dataToUpdate = {};

  console.log('req.body ===>', req.body);
  console.log('req.files ===>', req.files);

  const { text, buttons, textAnswer } = req.body;
  const keyQuestion = parseInt(index);

  if (req.files && _.has(req.files, 'image')) {
      console.log('====================> IMAGE');
      const imageFilename = generateUniqueFilename(req.files.image);
      await moveFile(req.files.image, path.join(UPLOAD_BASE_PATH, 'images', imageFilename));
      dataToUpdate.image = `https://autoecole.mojay.pro/public/assets/uploads/images/${imageFilename}`;
  }
  if (req.files && _.has(req.files, 'audio')) {
      console.log('====================> AUDIO');
      const audioFilename = generateUniqueFilename(req.files.audio);
      await moveFile(req.files.audio, path.join(UPLOAD_BASE_PATH, 'audios', audioFilename));
      dataToUpdate.audio = `https://autoecole.mojay.pro/public/assets/uploads/audios/${audioFilename}`;
  }

  dataToUpdate.answer = {
      audio: '',
      text: ''
  };

  if (req.files && _.has(req.files, 'audioanswer')) {
      console.log('====================> audioanswer');
      const answerAudioFilename = generateUniqueFilename(req.files.audioanswer);
      await moveFile(req.files.audioanswer, path.join(UPLOAD_BASE_PATH, 'audios', answerAudioFilename));
      dataToUpdate.answer.audio = `https://autoecole.mojay.pro/public/assets/uploads/audios/${answerAudioFilename}`;
  }

  dataToUpdate.text = text;
  dataToUpdate.buttons = JSON.parse(buttons);
  dataToUpdate.answer.text = textAnswer;

  try {
      const connexion = await Mongo.connect();
      const updatedQuizz = await Mongo.updateQuestionToQuizz(id, keyQuestion, dataToUpdate);

      console.log('updatedQuizz ===>', updatedQuizz);
      return res.status(200).json({
        success: true,
        message: 'Question updated successfully'
      });
  } catch (errorit) {
      console.log('nous avons une erreur dans l execution');
      return res.status(500).json({ error: 'Internal server error', message: errorit.message });
  }
});

// Supprimer une question spécifique d'un quiz
app.delete('/dashboard/quizz/:id/questions/:index', authenticateToken, async (req, res) => {
  try {
    const { id, index } = req.params;
    const questionIndex = parseInt(index);

    if (isNaN(questionIndex) || questionIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    await Mongo.connect();

    await Mongo.deleteQuestionFromQuizz(id, questionIndex);

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /dashboard/quizz/:id/questions/:index:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Supprimer un quiz complet
app.delete('/dashboard/quizz/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await Mongo.connect();

    const result = await Mongo.deleteQuizz(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /dashboard/quizz/:id:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================================
// ROUTES POUR UPLOAD DE FICHIERS (Images et Audio)
// ============================================================

// Helper functions pour l'upload
const fs = require('fs');
const path = require('path');

// Chemin absolu vers le dossier uploads
const UPLOAD_BASE_PATH = path.join(__dirname, 'public', 'assets', 'uploads');

// ============================================================
// ENDPOINT DEDIÉ - UPLOAD DE FICHIERS (Images, Audios, Vidéos)
// ============================================================

// Upload de fichiers multimédia - retourne l'URL absolue
// Route: /dashboard/upload/:type où type = image, audio, ou video
app.post('/dashboard/upload/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    console.log('📤 [Upload Media] Début de la requête');
    console.log('📋 [Upload Media] Type demandé:', type);
    console.log('📋 [Upload Media] req.files:', req.files);

    // Vérifier que le type est valide
    const validTypes = {
      'image': 'images',
      'audio': 'audios',
      'video': 'videos'
    };

    if (!validTypes[type]) {
      console.log('❌ [Upload Media] Type non supporté:', type);
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: image, audio, video`
      });
    }

    // Vérifier qu'un fichier est fourni
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log('❌ [Upload Media] Aucun fichier fourni');
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Récupérer le fichier (chercher avec la clé correspondant au type)
    let file = req.files[type] || req.files.file;

    if (!file) {
      console.log('❌ [Upload Media] Fichier non trouvé avec la clé:', type);
      return res.status(400).json({
        success: false,
        message: `File must be uploaded with key: '${type}' or 'file'`
      });
    }

    const subfolder = validTypes[type];
    console.log(`📷 [Upload Media] Fichier ${type} reçu:`, file.name);

    // Générer un nom de fichier unique
    const uniqueFilename = generateUniqueFilename(file);
    console.log('🔤 [Upload Media] Nom unique généré:', uniqueFilename);

    // Définir le chemin de destination
    const uploadPath = path.join(UPLOAD_BASE_PATH, subfolder, uniqueFilename);
    console.log('📂 [Upload Media] Chemin de destination:', uploadPath);

    // Déplacer le fichier vers le dossier de destination
    await moveFile(file, uploadPath);
    console.log('✅ [Upload Media] Fichier déplacé avec succès');

    // Construire l'URL absolue
    const fileUrl = `https://autoecole.mojay.pro/public/assets/uploads/${subfolder}/${uniqueFilename}`;
    console.log('🔗 [Upload Media] URL générée:', fileUrl);

    console.log('🎉 [Upload Media] Upload réussi');
    return res.status(200).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`,
      fileUrl: fileUrl,
      filename: uniqueFilename,
      fileType: type
    });

  } catch (error) {
    console.error('❌ [Upload Media] ERREUR:', error);
    console.error('❌ [Upload Media] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

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

const generateUniqueFilename = (file) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  const timestamp = Date.now();
  const extension = path.extname(file.name);
  return `${randomString}_${timestamp}${extension}`;
};

// Upload d'une image pour une question de quiz
app.post('/dashboard/quizz/:id/questions/:index/upload-image', authenticateToken, async (req, res) => {
  try {
    const { id, index } = req.params;
    const questionIndex = parseInt(index);

    if (isNaN(questionIndex) || questionIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageFile = req.files.image;
    const imageFilename = generateUniqueFilename(imageFile);
    const uploadPath = path.join(UPLOAD_BASE_PATH, 'images', imageFilename);

    await moveFile(imageFile, uploadPath);

    const imageUrl = `https://autoecole.mojay.pro/public/assets/uploads/images/${imageFilename}`;

    await Mongo.connect();

    // Get current question to preserve other fields
    const quiz = await Mongo.findQuizz({ _id: ObjectId(id) });
    if (!quiz.length || !quiz[0].list_quizz[questionIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Quiz or question not found'
      });
    }

    const currentQuestion = quiz[0].list_quizz[questionIndex];
    const updatedQuestion = {
      text: currentQuestion.text,
      buttons: currentQuestion.buttons,
      image: imageUrl,
      answer: currentQuestion.answer
    };

    if (currentQuestion.audio) updatedQuestion.audio = currentQuestion.audio;

    await Mongo.updateQuestionToQuizz(id, questionIndex, updatedQuestion);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error in POST /dashboard/quizz/:id/questions/:index/upload-image:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Upload d'un audio pour une question de quiz
app.post('/dashboard/quizz/:id/questions/:index/upload-audio', authenticateToken, async (req, res) => {
  try {
    const { id, index } = req.params;
    const questionIndex = parseInt(index);

    if (isNaN(questionIndex) || questionIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    if (!req.files || !req.files.audio) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const audioFile = req.files.audio;
    const audioFilename = generateUniqueFilename(audioFile);
    const uploadPath = path.join(UPLOAD_BASE_PATH, 'audios', audioFilename);

    await moveFile(audioFile, uploadPath);

    const audioUrl = `https://autoecole.mojay.pro/public/assets/uploads/audios/${audioFilename}`;

    await Mongo.connect();

    // Get current question to preserve other fields
    const quiz = await Mongo.findQuizz({ _id: ObjectId(id) });
    if (!quiz.length || !quiz[0].list_quizz[questionIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Quiz or question not found'
      });
    }

    const currentQuestion = quiz[0].list_quizz[questionIndex];
    const updatedQuestion = {
      text: currentQuestion.text,
      buttons: currentQuestion.buttons,
      audio: audioUrl,
      answer: currentQuestion.answer
    };

    if (currentQuestion.image) updatedQuestion.image = currentQuestion.image;

    await Mongo.updateQuestionToQuizz(id, questionIndex, updatedQuestion);

    return res.status(200).json({
      success: true,
      message: 'Audio uploaded successfully',
      audioUrl: audioUrl
    });
  } catch (error) {
    console.error('Error in POST /dashboard/quizz/:id/questions/:index/upload-audio:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Upload d'un audio pour la réponse d'une question
app.post('/dashboard/quizz/:id/questions/:index/upload-answer-audio', authenticateToken, async (req, res) => {
  try {
    const { id, index } = req.params;
    const questionIndex = parseInt(index);

    if (isNaN(questionIndex) || questionIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    if (!req.files || !req.files.audioanswer) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const audioFile = req.files.audioanswer;
    const audioFilename = generateUniqueFilename(audioFile);
    const uploadPath = path.join(UPLOAD_BASE_PATH, 'audios', audioFilename);

    await moveFile(audioFile, uploadPath);

    const audioUrl = `https://autoecole.mojay.pro/public/assets/uploads/audios/${audioFilename}`;

    await Mongo.connect();

    // Get current question to preserve other fields
    const quiz = await Mongo.findQuizz({ _id: ObjectId(id) });
    if (!quiz.length || !quiz[0].list_quizz[questionIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Quiz or question not found'
      });
    }

    const currentQuestion = quiz[0].list_quizz[questionIndex];
    const updatedQuestion = {
      text: currentQuestion.text,
      buttons: currentQuestion.buttons,
      audioanswer: audioUrl,
      answer: currentQuestion.answer
    };

    if (currentQuestion.image) updatedQuestion.image = currentQuestion.image;
    if (currentQuestion.audio) updatedQuestion.audio = currentQuestion.audio;

    await Mongo.updateQuestionToQuizz(id, questionIndex, updatedQuestion);

    return res.status(200).json({
      success: true,
      message: 'Answer audio uploaded successfully',
      audioUrl: audioUrl
    });
  } catch (error) {
    console.error('Error in POST /dashboard/quizz/:id/questions/:index/upload-answer-audio:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Upload multiple files at once (image + audio + answer audio) pour une nouvelle question
app.post('/dashboard/quizz/:id/questions/upload-full', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, buttons, textAnswer } = req.body;

    if (!text || !buttons || !textAnswer) {
      return res.status(400).json({
        success: false,
        message: 'text, buttons, and textAnswer are required'
      });
    }

    const basePath = 'https://autoecole.mojay.pro';
    const midway = 'public/assets/uploads';
    let imageUrl = '';
    let audioUrl = '';
    let answerAudioUrl = '';

    // Upload image if provided
    if (req.files && req.files.image) {
      const imageFilename = generateUniqueFilename(req.files.image);
      await moveFile(req.files.image, path.join(UPLOAD_BASE_PATH, 'images', imageFilename));
      imageUrl = `${basePath}/${midway}/images/${imageFilename}`;
    }

    // Upload audio if provided
    if (req.files && req.files.audio) {
      const audioFilename = generateUniqueFilename(req.files.audio);
      await moveFile(req.files.audio, path.join(UPLOAD_BASE_PATH, 'audios', audioFilename));
      audioUrl = `${basePath}/${midway}/audios/${audioFilename}`;
    }

    // Upload answer audio if provided
    if (req.files && req.files.audioanswer) {
      const answerAudioFilename = generateUniqueFilename(req.files.audioanswer);
      await moveFile(req.files.audioanswer, path.join(UPLOAD_BASE_PATH, 'audios', answerAudioFilename));
      answerAudioUrl = `${basePath}/${midway}/audios/${answerAudioFilename}`;
    }

    const newQuestion = {
      image: imageUrl,
      text: text,
      audio: audioUrl,
      buttons: JSON.parse(buttons),
      answer: {
        audio: answerAudioUrl,
        text: textAnswer
      }
    };

    await Mongo.connect();
    await Mongo.addQuestionToQuizz(id, newQuestion);

    return res.status(201).json({
      success: true,
      message: 'Question with files added successfully',
      question: newQuestion
    });
  } catch (error) {
    console.error('Error in POST /dashboard/quizz/:id/questions/upload-full:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================================
// ROUTES POUR AUTOECOLES_QUIZZ_TEST (Résultats des tests)
// ============================================================

// Nombre total de tests effectués
app.get('/dashboard/tests/count', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const count = await Mongo.countTests();

    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error in /dashboard/tests/count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Tests d'un élève spécifique
app.get('/dashboard/tests/by-student/:tel', authenticateToken, async (req, res) => {
  try {
    const { tel } = req.params;

    await Mongo.connect();
    const tests = await Mongo.findTestRecordCurrent({ tel: tel });

    return res.status(200).json({
      success: true,
      student_tel: tel,
      tests: tests,
      count: tests.length
    });
  } catch (error) {
    console.error('Error in /dashboard/tests/by-student:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Résultats par quiz
app.get('/dashboard/tests/by-quiz/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await Mongo.connect();
    const tests = await Mongo.findTestRecordCurrent({ id_quizz: ObjectId(id) });

    return res.status(200).json({
      success: true,
      quizz_id: id,
      tests: tests,
      count: tests.length
    });
  } catch (error) {
    console.error('Error in /dashboard/tests/by-quiz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Statistiques globales des tests
app.get('/dashboard/tests/stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 [Tests Stats] Début de la requête');

    console.log('🔌 [Tests Stats] Connexion à MongoDB...');
    await Mongo.connect();
    console.log('✅ [Tests Stats] MongoDB connecté');

    const aggregate = [
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          avgScore: { $avg: "$score" },
          maxScore: { $max: "$score" },
          minScore: { $min: "$score" },
          totalAnswers: { $sum: { $size: "$answers" } }
        }
      },
      {
        $project: {
          _id: 0,
          totalTests: 1,
          avgScore: { $round: ["$avgScore", 2] },
          maxScore: 1,
          minScore: 1,
          totalAnswers: 1
        }
      }
    ];

    console.log('📈 [Tests Stats] Exécution de l\'agrégation...');
    const stats = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);
    console.log('✅ [Tests Stats] Stats récupérées:', JSON.stringify(stats));

    console.log('🎉 [Tests Stats] Réponse envoyée avec succès');
    return res.status(200).json({
      success: true,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('❌ [Tests Stats] ERREUR:', error);
    console.error('❌ [Tests Stats] Stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Tests récents avec scores
app.get('/dashboard/tests/recent', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    await Mongo.connect();

    const aggregate = [
      {
        $sort: { created_at: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "autoecoles_current_user",
          localField: "tel",
          foreignField: "tel",
          as: "student_info"
        }
      },
      {
        $unwind: {
          path: "$student_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          tel: 1,
          score: 1,
          created_at: 1,
          answers: { $size: "$answers" },
          student_name: "$student_info.fullname",
          autoecole: "$student_info.name_autoecole"
        }
      }
    ];

    const recentTests = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);

    return res.status(200).json({
      success: true,
      recentTests: recentTests
    });
  } catch (error) {
    console.error('Error in /dashboard/tests/recent:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Classement des meilleurs scores
app.get('/dashboard/tests/leaderboard', authenticateToken, async (req, res) => {
  try {
    console.log('🏆 [Tests Leaderboard] Début de la requête');
    const limit = parseInt(req.query.limit) || 10;
    console.log('🏆 [Tests Leaderboard] Limit:', limit);

    console.log('🔌 [Tests Leaderboard] Connexion à MongoDB...');
    await Mongo.connect();
    console.log('✅ [Tests Leaderboard] MongoDB connecté');

    const aggregate = [
      {
        $group: {
          _id: "$tel",
          bestScore: { $max: "$score" },
          totalTests: { $sum: 1 },
          avgScore: { $avg: "$score" }
        }
      },
      {
        $sort: { bestScore: -1, avgScore: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: "autoecoles_current_user",
          localField: "_id",
          foreignField: "tel",
          as: "student_info"
        }
      },
      {
        $unwind: {
          path: "$student_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          tel: "$_id",
          student_name: "$student_info.fullname",
          autoecole: "$student_info.name_autoecole",
          bestScore: 1,
          totalTests: 1,
          avgScore: { $round: ["$avgScore", 2] }
        }
      }
    ];

    console.log('📈 [Tests Leaderboard] Exécution de l\'agrégation...');
    const leaderboard = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);
    console.log('✅ [Tests Leaderboard] Leaderboard récupéré, nombre de résultats:', leaderboard.length);

    console.log('🎉 [Tests Leaderboard] Réponse envoyée avec succès');
    return res.status(200).json({
      success: true,
      leaderboard: leaderboard
    });
  } catch (error) {
    console.error('❌ [Tests Leaderboard] ERREUR:', error);
    console.error('❌ [Tests Leaderboard] Stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================================
// ROUTES POUR AUTOECOLES_COURSES (Cours)
// ============================================================

// Nombre total de cours
app.get('/dashboard/courses/count', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const count = await Mongo.countCourses();

    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error in /dashboard/courses/count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Liste des cours avec nombre de chapitres
app.get('/dashboard/courses/list', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const coursesList = await Mongo.findLiteListCours();

    return res.status(200).json({
      success: true,
      courses: coursesList,
      count: coursesList.length
    });
  } catch (error) {
    console.error('Error in /dashboard/courses/list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Détails complets d'un cours
app.get('/dashboard/courses/:id/details', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await Mongo.connect();
    const course = await Mongo.listCourses({ _id: ObjectId(id) });

    if (!course.length) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    return res.status(200).json({
      success: true,
      course: course[0],
      sectionsCount: course[0].Sections ? course[0].Sections.length : 0
    });
  } catch (error) {
    console.error('Error in /dashboard/courses/:id/details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Statistiques des cours
app.get('/dashboard/courses/stats', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    const aggregate = [
      {
        $addFields: {
          number_sections: { $size: { $ifNull: ["$Sections", []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalSections: { $sum: "$number_sections" },
          avgSectionsPerCourse: { $avg: "$number_sections" },
          minSections: { $min: "$number_sections" },
          maxSections: { $max: "$number_sections" }
        }
      }
    ];

    const stats = await Mongo.findbyaggregate("peelo", "autoecoles_courses", Mongo.client, aggregate);

    return res.status(200).json({
      success: true,
      stats: stats[0] || {}
    });
  } catch (error) {
    console.error('Error in /dashboard/courses/stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// CRUD OPERATIONS - COURS
// ============================================================

// Modifier un cours entier
app.put('/dashboard/courses/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const courseData = req.body;

    // Vérifier que le cours existe
    await Mongo.connect();
    const existingCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    if (!existingCourse.length) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Préparer les données de mise à jour
    const updateData = {
      _id: id,
      ...courseData
    };

    // Mettre à jour le cours
    await Mongo.udpateCourses(updateData);

    // Récupérer le cours mis à jour
    const updatedCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse[0]
    });
  } catch (error) {
    console.error('Error in PUT /dashboard/courses/:id:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Ajouter un chapitre à un cours
app.post('/dashboard/courses/:id/chapters', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const chapterData = req.body;

    // Vérifier que le cours existe
    await Mongo.connect();
    const existingCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    if (!existingCourse.length) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = existingCourse[0];

    // Ajouter un ID unique au nouveau chapitre
    const newChapter = {
      _id: new ObjectId().toString(),
      ...chapterData,
      createdAt: new Date()
    };

    // Ajouter le nouveau chapitre à l'array Sections
    const updatedSections = [...(course.Sections || []), newChapter];

    // Mettre à jour le cours avec le nouveau chapitre
    await Mongo.udpateCourses({
      _id: id,
      Sections: updatedSections
    });

    // Récupérer le cours mis à jour
    const updatedCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    return res.status(201).json({
      success: true,
      message: 'Chapter added successfully',
      chapter: newChapter,
      course: updatedCourse[0]
    });
  } catch (error) {
    console.error('Error in POST /dashboard/courses/:id/chapters:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Modifier un chapitre spécifique
app.put('/dashboard/courses/:id/chapters/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { id, chapterId } = req.params;
    const chapterData = req.body;

    // Vérifier que le cours existe
    await Mongo.connect();
    const existingCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    if (!existingCourse.length) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = existingCourse[0];

    // Vérifier que le chapitre existe
    if (!course.Sections || !course.Sections.length) {
      return res.status(404).json({
        success: false,
        message: 'No chapters found in this course'
      });
    }

    const chapterIndex = course.Sections.findIndex(
      section => section._id === chapterId || section._id.toString() === chapterId
    );

    if (chapterIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Mettre à jour le chapitre
    const updatedSections = [...course.Sections];
    updatedSections[chapterIndex] = {
      ...updatedSections[chapterIndex],
      ...chapterData,
      _id: chapterId, // Garder l'ID original
      updatedAt: new Date()
    };

    // Mettre à jour le cours
    await Mongo.udpateCourses({
      _id: id,
      Sections: updatedSections
    });

    // Récupérer le cours mis à jour
    const updatedCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: 'Chapter updated successfully',
      chapter: updatedSections[chapterIndex],
      course: updatedCourse[0]
    });
  } catch (error) {
    console.error('Error in PUT /dashboard/courses/:id/chapters/:chapterId:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Supprimer un chapitre
app.delete('/dashboard/courses/:id/chapters/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { id, chapterId } = req.params;

    // Vérifier que le cours existe
    await Mongo.connect();
    const existingCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    if (!existingCourse.length) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const course = existingCourse[0];

    // Vérifier que le chapitre existe
    if (!course.Sections || !course.Sections.length) {
      return res.status(404).json({
        success: false,
        message: 'No chapters found in this course'
      });
    }

    const chapterIndex = course.Sections.findIndex(
      section => section._id === chapterId || section._id.toString() === chapterId
    );

    if (chapterIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found'
      });
    }

    // Retirer le chapitre de l'array
    const updatedSections = course.Sections.filter(
      section => section._id !== chapterId && section._id.toString() !== chapterId
    );

    // Mettre à jour le cours
    await Mongo.udpateCourses({
      _id: id,
      Sections: updatedSections
    });

    // Récupérer le cours mis à jour
    const updatedCourse = await Mongo.listCourses({ _id: ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: 'Chapter deleted successfully',
      deletedChapterId: chapterId,
      course: updatedCourse[0]
    });
  } catch (error) {
    console.error('Error in DELETE /dashboard/courses/:id/chapters/:chapterId:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// ============================================================
// KPIS ET STATISTIQUES AVANCÉES
// ============================================================

// Vue d'ensemble globale
app.get('/dashboard/kpis/global', authenticateToken, async (req, res) => {
  try {
    console.log('📊 [KPIs Global] Début de la requête');

    console.log('🔌 [KPIs Global] Connexion à MongoDB...');
    await Mongo.connect();
    console.log('✅ [KPIs Global] MongoDB connecté');

    console.log('📈 [KPIs Global] Récupération totalAutoecoles...');
    const totalAutoecoles = await Mongo.countAutoEcole();
    console.log('✅ [KPIs Global] totalAutoecoles =', totalAutoecoles);

    console.log('📈 [KPIs Global] Récupération totalStudents...');
    const totalStudents = await Mongo.countElevesAutoEcole();
    console.log('✅ [KPIs Global] totalStudents =', totalStudents);

    console.log('📈 [KPIs Global] Récupération totalQuizz...');
    const totalQuizz = await Mongo.countQuizz();
    console.log('✅ [KPIs Global] totalQuizz =', totalQuizz);

    console.log('📈 [KPIs Global] Récupération totalCourses...');
    const totalCourses = await Mongo.countCourses();
    console.log('✅ [KPIs Global] totalCourses =', totalCourses);

    console.log('📈 [KPIs Global] Récupération totalTests...');
    const totalTests = await Mongo.countTests();
    console.log('✅ [KPIs Global] totalTests =', totalTests);

    console.log('📈 [KPIs Global] Récupération nonPermis...');
    const nonPermis = await Mongo.countElevesNonPermis();
    console.log('✅ [KPIs Global] nonPermis - résultat obtenu');

    console.log('🎉 [KPIs Global] Toutes les données récupérées avec succès');
    return res.status(200).json({
      success: true,
      kpis: {
        totalAutoecoles: totalAutoecoles,
        totalStudents: totalStudents,
        totalQuizz: totalQuizz,
        totalCourses: totalCourses,
        totalTests: totalTests,
        studentsWithoutPermis: nonPermis[0] ? nonPermis[0].uniqueCount : 0
      }
    });
  } catch (error) {
    console.error('❌ [KPIs Global] ERREUR:', error);
    console.error('❌ [KPIs Global] Stack:', error.stack);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Taux d'engagement des élèves
app.get('/dashboard/kpis/engagement', authenticateToken, async (req, res) => {
  try {
    const idbot = req.query.idbot || '659816a89f5a6dc6bc104da5';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    await Mongo.connect();
    const engagement = await Mongo.numberOfexchangePerDate(idbot, skip, limit);

    return res.status(200).json({
      success: true,
      engagement: engagement
    });
  } catch (error) {
    console.error('Error in /dashboard/kpis/engagement:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Performance globale des quiz
app.get('/dashboard/kpis/performance', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    const aggregate = [
      {
        $addFields: {
          totalQuestions: { $size: "$answers" },
          successRate: {
            $cond: {
              if: { $gt: [{ $size: "$answers" }, 0] },
              then: {
                $multiply: [
                  { $divide: ["$score", { $size: "$answers" }] },
                  100
                ]
              },
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgSuccessRate: { $avg: "$successRate" },
          totalTests: { $sum: 1 },
          totalQuestions: { $sum: "$totalQuestions" }
        }
      },
      {
        $project: {
          _id: 0,
          avgSuccessRate: { $round: ["$avgSuccessRate", 2] },
          totalTests: 1,
          totalQuestions: 1
        }
      }
    ];

    const performance = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);

    return res.status(200).json({
      success: true,
      performance: performance[0] || {}
    });
  } catch (error) {
    console.error('Error in /dashboard/kpis/performance:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Croissance (nouveaux élèves par jour)
app.get('/dashboard/kpis/growth', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();
    const growthData = await Mongo.countDailynewUser();

    return res.status(200).json({
      success: true,
      growthData: growthData
    });
  } catch (error) {
    console.error('Error in /dashboard/kpis/growth:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// STATISTIQUES AVANCÉES
// ============================================================

// 1. Évolution des inscriptions par mois
app.get('/dashboard/stats/inscriptions/monthly', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    const aggregate = [
      {
        $addFields: {
          createdDate: { $ifNull: ["$created_at", "$createdAt", "$date_created"] }
        }
      },
      {
        $match: {
          createdDate: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdDate" },
            month: { $month: "$createdDate" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      },
      {
        $limit: 12
      }
    ];

    const monthlyData = await Mongo.findbyaggregate("peelo", "autoecoles_current_user", Mongo.client, aggregate);

    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const data = monthlyData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count,
      label: `${months[item._id.month - 1]} ${item._id.year}`
    }));

    const total = data.reduce((sum, item) => sum + item.count, 0);
    const average = data.length > 0 ? (total / data.length).toFixed(2) : 0;

    return res.status(200).json({
      success: true,
      period: `${data.length} derniers mois`,
      data,
      total,
      average: parseFloat(average)
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/inscriptions/monthly:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Tests passés par période (timeline)
app.get('/dashboard/stats/tests/timeline', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const maxDays = 90;
    const limitDays = Math.min(days, maxDays);

    await Mongo.connect();

    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - limitDays);

    const aggregate = [
      {
        $match: {
          date_test: { $gte: dateLimit }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date_test" }
          },
          count: { $sum: 1 },
          avgScore: { $avg: "$nb_point" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ];

    const timeline = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);

    const data = timeline.map(item => ({
      date: item._id,
      count: item.count,
      avgScore: parseFloat(item.avgScore.toFixed(1))
    }));

    const totalTests = data.reduce((sum, item) => sum + item.count, 0);
    const averagePerDay = data.length > 0 ? (totalTests / data.length).toFixed(1) : 0;
    const avgScoreGlobal = data.length > 0
      ? (data.reduce((sum, item) => sum + item.avgScore, 0) / data.length).toFixed(1)
      : 0;

    return res.status(200).json({
      success: true,
      period: `${limitDays} derniers jours`,
      data,
      totalTests,
      averagePerDay: parseFloat(averagePerDay),
      avgScoreGlobal: parseFloat(avgScoreGlobal)
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/tests/timeline:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Taux de réussite global
app.get('/dashboard/stats/performance/success-rate', authenticateToken, async (req, res) => {
  try {
    const passThreshold = 25;
    await Mongo.connect();

    // Stats globales
    const totalTests = await Mongo.countTests();

    const aggregateSuccess = [
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          successfulTests: {
            $sum: { $cond: [{ $gte: ["$nb_point", passThreshold] }, 1, 0] }
          },
          failedTests: {
            $sum: { $cond: [{ $lt: ["$nb_point", passThreshold] }, 1, 0] }
          }
        }
      }
    ];

    const globalStats = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregateSuccess);
    const stats = globalStats[0] || { totalTests: 0, successfulTests: 0, failedTests: 0 };
    const successRate = stats.totalTests > 0 ? ((stats.successfulTests / stats.totalTests) * 100).toFixed(2) : 0;

    // Stats par quiz
    const aggregateByQuizz = [
      {
        $group: {
          _id: "$quizz_id",
          totalTests: { $sum: 1 },
          successfulTests: {
            $sum: { $cond: [{ $gte: ["$nb_point", passThreshold] }, 1, 0] }
          },
          avgScore: { $avg: "$nb_point" }
        }
      },
      {
        $project: {
          quizzId: "$_id",
          totalTests: 1,
          successRate: {
            $multiply: [
              { $divide: ["$successfulTests", "$totalTests"] },
              100
            ]
          },
          avgScore: 1
        }
      },
      {
        $sort: { successRate: -1 }
      },
      {
        $limit: 10
      }
    ];

    const byQuizzData = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregateByQuizz);

    const byQuizz = byQuizzData.map(item => ({
      quizzId: item.quizzId,
      totalTests: item.totalTests,
      successRate: parseFloat(item.successRate.toFixed(1)),
      avgScore: parseFloat(item.avgScore.toFixed(1))
    }));

    return res.status(200).json({
      success: true,
      globalStats: {
        totalTests: stats.totalTests,
        successfulTests: stats.successfulTests,
        failedTests: stats.failedTests,
        successRate: parseFloat(successRate),
        passThreshold
      },
      byQuizz
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/performance/success-rate:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Progression des élèves
app.get('/dashboard/stats/performance/progression', authenticateToken, async (req, res) => {
  try {
    const minTests = parseInt(req.query.minTests) || 3;
    await Mongo.connect();

    const aggregate = [
      {
        $sort: { date_test: 1 }
      },
      {
        $group: {
          _id: "$tel",
          tests: { $push: { score: "$nb_point", date: "$date_test" } },
          testsCount: { $sum: 1 },
          avgScore: { $avg: "$nb_point" }
        }
      },
      {
        $match: {
          testsCount: { $gte: minTests }
        }
      }
    ];

    const studentsData = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);

    let improving = 0;
    let stable = 0;
    let declining = 0;
    const topImprovers = [];

    studentsData.forEach(student => {
      if (student.tests.length >= minTests) {
        const firstScore = student.tests[0].score;
        const lastScore = student.tests[student.tests.length - 1].score;
        const improvement = lastScore - firstScore;

        if (improvement > 2) improving++;
        else if (improvement < -2) declining++;
        else stable++;

        if (improvement > 5) {
          topImprovers.push({
            tel: student._id,
            firstScore,
            lastScore,
            improvement,
            testsCount: student.testsCount
          });
        }
      }
    });

    topImprovers.sort((a, b) => b.improvement - a.improvement);
    const totalStudents = await Mongo.countElevesAutoEcole();

    return res.status(200).json({
      success: true,
      summary: {
        totalStudents,
        studentsAnalyzed: studentsData.length,
        improving,
        stable,
        declining,
        avgProgression: improving > 0 ? ((improving / studentsData.length) * 100).toFixed(1) : 0
      },
      topImprovers: topImprovers.slice(0, 10)
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/performance/progression:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. Quiz les plus difficiles
app.get('/dashboard/stats/performance/difficult-quizz', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const passThreshold = 25;
    await Mongo.connect();

    const aggregate = [
      {
        $group: {
          _id: "$quizz_id",
          avgScore: { $avg: "$nb_point" },
          testsCount: { $sum: 1 },
          successfulTests: {
            $sum: { $cond: [{ $gte: ["$nb_point", passThreshold] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          quizzId: "$_id",
          avgScore: 1,
          testsCount: 1,
          successRate: {
            $multiply: [
              { $divide: ["$successfulTests", "$testsCount"] },
              100
            ]
          }
        }
      },
      {
        $sort: { avgScore: 1 }
      },
      {
        $limit: limit
      }
    ];

    const difficultQuizz = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);

    const data = difficultQuizz.map(item => {
      let difficulty = "Facile";
      if (item.avgScore < 20) difficulty = "Très difficile";
      else if (item.avgScore < 23) difficulty = "Difficile";
      else if (item.avgScore < 26) difficulty = "Moyen";

      return {
        quizzId: item.quizzId,
        avgScore: parseFloat(item.avgScore.toFixed(1)),
        testsCount: item.testsCount,
        successRate: parseFloat(item.successRate.toFixed(1)),
        difficulty
      };
    });

    return res.status(200).json({
      success: true,
      difficultQuizz: data
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/performance/difficult-quizz:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. Élèves actifs vs inactifs
app.get('/dashboard/stats/engagement/activity', authenticateToken, async (req, res) => {
  try {
    const inactiveDays = parseInt(req.query.inactiveDays) || 30;
    await Mongo.connect();

    const now = new Date();
    const inactiveDate = new Date();
    inactiveDate.setDate(now.getDate() - inactiveDays);

    const totalStudents = await Mongo.countElevesAutoEcole();

    // Compter élèves actifs
    const aggregate = [
      {
        $group: {
          _id: "$tel",
          lastTest: { $max: "$date_test" }
        }
      },
      {
        $match: {
          lastTest: { $gte: inactiveDate }
        }
      },
      {
        $count: "activeCount"
      }
    ];

    const activeResult = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);
    const activeCount = activeResult[0] ? activeResult[0].activeCount : 0;
    const inactiveCount = totalStudents - activeCount;

    const activePercentage = totalStudents > 0 ? ((activeCount / totalStudents) * 100).toFixed(1) : 0;
    const inactivePercentage = totalStudents > 0 ? ((inactiveCount / totalStudents) * 100).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      totalStudents,
      active: {
        count: activeCount,
        percentage: parseFloat(activePercentage),
        label: `Actifs (< ${inactiveDays} jours)`
      },
      inactive: {
        count: inactiveCount,
        percentage: parseFloat(inactivePercentage),
        label: `Inactifs (> ${inactiveDays} jours)`
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/engagement/activity:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 7. Temps moyen d'étude
app.get('/dashboard/stats/engagement/study-time', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    const aggregate = [
      {
        $group: {
          _id: "$tel",
          testsCount: { $sum: 1 },
          avgScore: { $avg: "$nb_point" }
        }
      }
    ];

    const studentsData = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregate);

    const totalTests = studentsData.reduce((sum, s) => sum + s.testsCount, 0);
    const avgTestsPerStudent = studentsData.length > 0 ? (totalTests / studentsData.length).toFixed(1) : 0;

    // Distribution
    const veryEngaged = studentsData.filter(s => s.testsCount > 15).length;
    const engaged = studentsData.filter(s => s.testsCount >= 8 && s.testsCount <= 15).length;
    const moderate = studentsData.filter(s => s.testsCount >= 4 && s.testsCount < 8).length;
    const low = studentsData.filter(s => s.testsCount < 4).length;

    const totalStudents = studentsData.length;

    // Top students
    const topStudents = studentsData
      .sort((a, b) => b.testsCount - a.testsCount)
      .slice(0, 10)
      .map(s => ({
        tel: s._id,
        testsCount: s.testsCount,
        avgScore: parseFloat(s.avgScore.toFixed(1))
      }));

    return res.status(200).json({
      success: true,
      globalAverage: {
        avgTestsPerStudent: parseFloat(avgTestsPerStudent),
        totalTestsTaken: totalTests
      },
      distribution: {
        veryEngaged: { count: veryEngaged, label: "> 15 tests", percentage: ((veryEngaged / totalStudents) * 100).toFixed(1) },
        engaged: { count: engaged, label: "8-15 tests", percentage: ((engaged / totalStudents) * 100).toFixed(1) },
        moderate: { count: moderate, label: "4-7 tests", percentage: ((moderate / totalStudents) * 100).toFixed(1) },
        low: { count: low, label: "< 4 tests", percentage: ((low / totalStudents) * 100).toFixed(1) }
      },
      topStudents
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/engagement/study-time:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 8. Classement des auto-écoles
app.get('/dashboard/stats/autoecoles/ranking', authenticateToken, async (req, res) => {
  try {
    const metric = req.query.metric || 'performance';
    await Mongo.connect();

    // Récupérer toutes les auto-écoles avec stats
    const aggregate = [
      {
        $lookup: {
          from: "autoecoles_current_user",
          localField: "_id",
          foreignField: "autoecole_id",
          as: "students"
        }
      },
      {
        $project: {
          nom_autoecole: 1,
          studentsCount: { $size: "$students" }
        }
      },
      {
        $sort: { studentsCount: -1 }
      }
    ];

    const autoecoles = await Mongo.findbyaggregate("peelo", "autoecoles", Mongo.client, aggregate);

    const ranking = autoecoles.map((ae, index) => ({
      rank: index + 1,
      autoecoleId: ae._id,
      autoecoleName: ae.nom_autoecole,
      studentsCount: ae.studentsCount,
      badge: index === 0 ? "🥇 Excellence" : index === 1 ? "🥈 Très bien" : index === 2 ? "🥉 Bien" : ""
    }));

    return res.status(200).json({
      success: true,
      metric,
      ranking
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/autoecoles/ranking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 9. Répartition Premium vs Standard
app.get('/dashboard/stats/admin/premium-distribution', authenticateToken, async (req, res) => {
  try {
    const premiumPhone = "787570707";
    await Mongo.connect();

    const totalStudents = await Mongo.countElevesAutoEcole();

    const aggregatePremium = [
      {
        $match: {
          tel_autoecole: premiumPhone
        }
      },
      {
        $count: "premiumCount"
      }
    ];

    const premiumResult = await Mongo.findbyaggregate("peelo", "autoecoles_current_user", Mongo.client, aggregatePremium);
    const premiumCount = premiumResult[0] ? premiumResult[0].premiumCount : 0;
    const standardCount = totalStudents - premiumCount;

    const premiumPercentage = totalStudents > 0 ? ((premiumCount / totalStudents) * 100).toFixed(1) : 0;
    const standardPercentage = totalStudents > 0 ? ((standardCount / totalStudents) * 100).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      totalStudents,
      premium: {
        count: premiumCount,
        percentage: parseFloat(premiumPercentage)
      },
      standard: {
        count: standardCount,
        percentage: parseFloat(standardPercentage)
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/admin/premium-distribution:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 10. Distribution par statut de permis
app.get('/dashboard/stats/admin/license-status', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    const totalStudents = await Mongo.countElevesAutoEcole();

    const aggregateWithLicense = [
      {
        $match: {
          a_permis: true
        }
      },
      {
        $count: "withLicenseCount"
      }
    ];

    const withLicenseResult = await Mongo.findbyaggregate("peelo", "autoecoles_current_user", Mongo.client, aggregateWithLicense);
    const withLicenseCount = withLicenseResult[0] ? withLicenseResult[0].withLicenseCount : 0;
    const withoutLicenseCount = totalStudents - withLicenseCount;

    const withLicensePercentage = totalStudents > 0 ? ((withLicenseCount / totalStudents) * 100).toFixed(1) : 0;
    const withoutLicensePercentage = totalStudents > 0 ? ((withoutLicenseCount / totalStudents) * 100).toFixed(1) : 0;

    return res.status(200).json({
      success: true,
      totalStudents,
      withLicense: {
        count: withLicenseCount,
        percentage: parseFloat(withLicensePercentage),
        label: "Ont le permis"
      },
      withoutLicense: {
        count: withoutLicenseCount,
        percentage: parseFloat(withoutLicensePercentage),
        label: "N'ont pas le permis"
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/admin/license-status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 11. Vue d'ensemble complète (optimisé pour dashboard principal)
app.get('/dashboard/stats/overview', authenticateToken, async (req, res) => {
  try {
    await Mongo.connect();

    // Récupérer toutes les stats en parallèle
    const [
      totalStudents,
      totalAutoecoles,
      totalTests,
      totalQuizz,
      totalCourses
    ] = await Promise.all([
      Mongo.countElevesAutoEcole(),
      Mongo.countAutoEcole(),
      Mongo.countTests(),
      Mongo.countQuizz(),
      Mongo.countCourses()
    ]);

    // Élèves actifs (30 derniers jours)
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - 30);

    const aggregateActive = [
      {
        $group: {
          _id: "$tel",
          lastTest: { $max: "$date_test" }
        }
      },
      {
        $match: {
          lastTest: { $gte: inactiveDate }
        }
      },
      {
        $count: "activeCount"
      }
    ];

    const activeResult = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregateActive);
    const activeStudents = activeResult[0] ? activeResult[0].activeCount : 0;

    // Stats tests ce mois
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const aggregateThisMonth = [
      {
        $match: {
          date_test: { $gte: firstDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgScore: { $avg: "$nb_point" }
        }
      }
    ];

    const thisMonthResult = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregateThisMonth);
    const testsThisMonth = thisMonthResult[0] ? thisMonthResult[0].count : 0;
    const avgScoreThisMonth = thisMonthResult[0] ? thisMonthResult[0].avgScore : 0;

    // Score moyen global
    const aggregateAvgScore = [
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$nb_point" }
        }
      }
    ];

    const avgScoreResult = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregateAvgScore);
    const avgScoreGlobal = avgScoreResult[0] ? avgScoreResult[0].avgScore : 0;

    // Taux de réussite
    const passThreshold = 25;
    const aggregateSuccessRate = [
      {
        $group: {
          _id: null,
          totalTests: { $sum: 1 },
          successfulTests: {
            $sum: { $cond: [{ $gte: ["$nb_point", passThreshold] }, 1, 0] }
          }
        }
      }
    ];

    const successRateResult = await Mongo.findbyaggregate("peelo", "autoecoles_quizz_test", Mongo.client, aggregateSuccessRate);
    const successRate = successRateResult[0]
      ? ((successRateResult[0].successfulTests / successRateResult[0].totalTests) * 100).toFixed(2)
      : 0;

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      overview: {
        students: {
          total: totalStudents,
          active: activeStudents,
          activityRate: totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : 0
        },
        autoecoles: {
          total: totalAutoecoles
        },
        tests: {
          total: totalTests,
          thisMonth: testsThisMonth,
          avgScore: parseFloat(avgScoreGlobal.toFixed(1)),
          successRate: parseFloat(successRate)
        },
        courses: {
          total: totalCourses
        },
        quizz: {
          total: totalQuizz
        }
      }
    });
  } catch (error) {
    console.error('Error in /dashboard/stats/overview:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

// Route de test de santé
app.get('/dashboard/health', (req, res) => {
  res.json({
    success: true,
    message: 'PeeloCar Dashboard API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// AUTHENTICATION - LOGIN WITH GOOGLE
// ============================================================

// Login via Google Firebase
app.post('/dashboard/login', async (req, res) => {
  try {
    console.log('📧 [Login] Début de la requête /dashboard/login');

    // Validation des données
    if (!req.body.user) {
      console.log('❌ [Login] Données utilisateur manquantes');
      return res.status(400).json({
        success: false,
        message: 'Données utilisateur manquantes'
      });
    }

    const { displayName, photoURL, email, stsTokenManager } = req.body.user;
    console.log('📋 [Login] Email:', email);
    console.log('📋 [Login] DisplayName:', displayName);

    if (!email) {
      console.log('❌ [Login] Email manquant');
      return res.status(400).json({
        success: false,
        message: 'Email requis'
      });
    }

    // Connexion à MongoDB
    console.log('🔌 [Login] Connexion à MongoDB...');
    await Mongo.connect();
    console.log('✅ [Login] MongoDB connecté');

    // Recherche de l'utilisateur
    const condition = { email: email };
    console.log('🔍 [Login] Recherche utilisateur avec email:', email);

    const users = await Mongo.findUser(condition);
    console.log('📊 [Login] Utilisateurs trouvés:', users.length);

    if (!users.length) {
      console.log('❌ [Login] Utilisateur non autorisé');
      return res.status(401).json({
        success: false,
        message: `Vous n'êtes pas autorisé à accéder à cette page !`
      });
    }

    const user = users[0];
    console.log('✅ [Login] Utilisateur trouvé:', user.email);

    // Génération du JWT
    const jwt = require('jsonwebtoken');
    const SECRET_KEY = process.env.SECRET_KEY_JWT || 'Grandneuydegeur';

    const token = jwt.sign({ user: user }, SECRET_KEY, {
      expiresIn: '24h'
    });
    console.log('🔑 [Login] Token JWT généré');

    // Sauvegarde dans la session (optionnel)
    if (req.session) {
      req.session.user = user;
      req.session.token = token;
      console.log('💾 [Login] Session sauvegardée');
    }

    console.log('🎉 [Login] Connexion réussie pour:', user.email);

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      token: token,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName || displayName,
        photoURL: user.photoURL || photoURL
      }
    });

  } catch (error) {
    console.error('❌ [Login] ERREUR:', error);
    console.error('❌ [Login] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la connexion',
      message: error.message
    });
  }
});

}; // Fin du module
