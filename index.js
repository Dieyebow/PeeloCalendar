const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const credentials = {
  client_id: '558261511977-2lphgl96vd1lojmcnf1kq8j4dep9u19u.apps.googleusercontent.com',
  client_secret: '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',
  redirect_uris: ['https://calendar.mojay.pro'],
};

const auth = new google.auth.OAuth2(
  credentials.client_id,
  credentials.client_secret,
  credentials.redirect_uris[0]
);

const getAuthUrl = () => {
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

// After the user grants access, exchange the authorization code for access token and refresh token
const getAccessToken = async (code) => {
  const { tokens } = await auth.getToken(code);
  auth.setCredentials(tokens);
  return tokens;
};


const authUrl = getAuthUrl();

console.log('authUrl ==>',authUrl);