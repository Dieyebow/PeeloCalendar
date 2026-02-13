const nodemailer = require('nodemailer');

// Fonction pour envoyer l'email
const sendWelcomeEmail = async (email, password, name) => {
  let transporter;

  // Use local MailDev if no specific SMTP config
  if (!process.env.SMTP_USER) {
    console.log('📬 [EMAIL] Using Local MailDev (localhost:1025)');
    transporter = nodemailer.createTransport({
      host: '0.0.0.0',
      port: 1025,
      secure: false,
      ignoreTLS: true,
    });
  } else {
    // Config SMTP réelle
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Peelo Academy" <no-reply@peelo.chat>',
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
        <p>Connectez-vous dès maintenant : <a href="http://localhost:3000/login" style="color: #F97316;">Accéder au Dashboard</a></p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé: %s', info.messageId);
    
    if (!process.env.SMTP_USER) {
        console.log('📬 Email captured by MailDev. Open http://localhost:1080 to view it.');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
};

module.exports = { sendWelcomeEmail };
