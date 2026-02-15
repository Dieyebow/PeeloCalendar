const nodemailer = require('nodemailer');

// Fonction pour envoyer l'email
const sendWelcomeEmail = async (email, password, name) => {
  let transporter;

  // Use local MailDev if no specific SMTP config and not in production
  // OR if specifically forced to use local dev
  const useLocalDev = !process.env.EMAIL_PASSWORD && process.env.NODE_ENV !== 'production';

  if (useLocalDev) {
    console.log('📬 [EMAIL] Using Local MailDev (localhost:1025)');
    transporter = nodemailer.createTransport({
      host: '0.0.0.0',
      port: 1025,
      secure: false,
      ignoreTLS: true,
    });
  } else {
    // Config SMTP réelle (LWS)
    transporter = nodemailer.createTransport({
      host: 'mail77.lwspanel.com',
      port: 465,
      secure: true, // SSL direct
      auth: {
        user: 'peelochat@aipeelo.xyz',
        pass: process.env.EMAIL_PASSWORD
      },
      dkim: {
        domainName: 'aipeelo.xyz',
        keySelector: 'dkim',
        privateKey: process.env.DKIM_PRIVATE_KEY,
        cacheDir: false,
        skipFields: 'message-id:date'
      }
    });
  }

  // Déterminer l'URL de login
  const BASE_URL = process.env.BASE_URL || (process.env.NODE_ENV === 'production' ? 'https://autoecole.mojay.pro' : 'http://localhost:7568');
  // En prod, le front est sur academy.peelo.chat, pas autoecole.mojay.pro (qui est l'API)
  // On va durcir le lien front si on est en prod
  const FRONTEND_URL = process.env.NODE_ENV === 'production' ? 'https://academy.peelo.chat' : 'http://localhost:3000';

  const mailOptions = {
    from: '"Peelo Academy" <peelochat@aipeelo.xyz>',
    to: email,
    subject: 'Bienvenue sur Peelo Academy - Vos accès Admin',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F97316;">Bienvenue ${name} !</h2>
        <p>Un compte administrateur a été créé pour vous sur Peelo Academy.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email :</strong> ${email}</p>
          <p style="margin: 10px 0 0 0;"><strong>Mot de passe :</strong> ${password}</p>
        </div>
        <p>Connectez-vous dès maintenant : <a href="${FRONTEND_URL}/login" style="color: #F97316;">Accéder au Dashboard</a></p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé: %s', info.messageId);
    
    if (useLocalDev) {
        console.log('📬 Email captured by MailDev. Open http://localhost:1080 to view it.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

module.exports = { sendWelcomeEmail };
