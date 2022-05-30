const functions = require('firebase-functions');
const mercadopagocheckout = require('./checkout');

exports.link = functions.https.onRequest(mercadopagocheckout.render_checkout);
exports.process = functions.https.onRequest(mercadopagocheckout.process_checkout);