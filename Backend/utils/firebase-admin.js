const admin = require('firebase-admin');
var serviceAccount = require('./morphis-app-firebase-adminsdk-fbsvc-b7e12e7970.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

module.exports = admin;
