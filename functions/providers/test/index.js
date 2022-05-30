const functions = require('firebase-functions');
const testcheckout = require('./checkout');

exports.link = functions.https.onRequest(testcheckout.render_checkout);
exports.process = functions.https.onRequest(testcheckout.process_checkout);