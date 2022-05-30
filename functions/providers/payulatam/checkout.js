const admin = require('firebase-admin');
const templateLib = require('./template');
var crypto = require('crypto');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const md5 = x => crypto.createHash('md5').update(x).digest('hex');

const keys = {
    checkoutUrl: 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/',
    merchantId: 1111111,
    apiKey: 'XXXXXXXXXXXXXX',
    accountId: 1111111
};

module.exports.render_checkout = function (request, response) {
    var orderDetails = {
        order_id: request.body.order_id,
        email: request.body.email,
        amount: request.body.amount,
        currency: request.body.currency
    };

    var transaction_unique_key = `${keys.apiKey}~${keys.merchantId}~${orderDetails.order_id}~${orderDetails.amount}~${orderDetails.currency}`;

    var signature = md5(transaction_unique_key);

    const refr = request.get('Referrer');
    const server_url = refr ? (refr.includes('bookings')? refr.substring(0, refr.length - 8)  :refr): request.protocol + "://" + request.get('host') + "/";

    response.send(templateLib.getTemplate(
        keys,
        orderDetails,
        signature,
        server_url + "payulatam-process"
    ));
};

module.exports.process_checkout = function (request, response) {
    if (request.query.transactionState === "4") {
        const order_id = request.query.referenceCode;
        const transaction_id = request.query.transactionId;
        const amount = request.query.TX_VALUE;
        admin.database().ref('bookings').child(order_id).once('value', snapshot => {
          if(snapshot.val()){
              const bookingData = snapshot.val();
              UpdateBooking(bookingData,order_id,transaction_id,'payulatam');
              response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
          }else{
              if(order_id.startsWith("wallet")){
                addToWallet(order_id.substr(7,order_id.length - 21), amount, order_id, transaction_id);
                response.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
              }else{
                response.redirect('/cancel');
              }
          }
        });
    } else {
        response.redirect('/cancel');
    }
};