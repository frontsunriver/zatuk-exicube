const admin = require('firebase-admin');
const crypto = require("crypto");
const templateLib = require('./template');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const MERCHANT_CODE = 'XXXXXXXXXXXXXX';
const TXN_PASSWORD = 'XXXXXXXXXXXXXX';

const SECURE_PAY_INVOICE_URL = 'https://test.payment.securepay.com.au/secureframe/invoice';

module.exports.render_checkout = (request, response) => {
  const refr = request.get('Referrer');
  const server_url = refr ? (refr.includes('bookings')? refr.substring(0, refr.length - 8)  :refr): request.protocol + "://" + request.get('host') + "/";

  const d = new Date();
  const timestamp = d.getUTCFullYear() +
    ("00" + (1 + d.getUTCMonth())).substr(-2) +
    ("00" + (d.getUTCDate())).substr(-2) +
    ("00" + (d.getUTCHours())).substr(-2) +
    ("00" + (d.getUTCMinutes())).substr(-2) +
    ("00" + (d.getUTCSeconds())).substr(-2);

  const amount = (request.body.amount * 100).toString();

  const myData = [];
  myData["bill_name"] = "transact";
  myData["merchant_id"] = MERCHANT_CODE;
  myData["primary_ref"] = request.body.order_id;
  myData["txn_type"] = "0";
  myData["amount"] = amount;
  myData["fp_timestamp"] = timestamp;
  myData["currency"] = request.body.currency;
  myData["return_url"] = server_url + 'securepay-process';
  myData["return_url_text"] = "Continue...";
  myData["return_url_target"] ="parent";
  myData["cancel_url"] = server_url + 'cancel';
  myData["template"] = "responsive";
  myData["confirmation"] = "no";
  myData["display_receipt"] = "no";

  const strForSignature = MERCHANT_CODE + "|" + TXN_PASSWORD + "|0|" + request.body.order_id + "|" + amount + "|" + timestamp;
  const signature = ((crypto.createHash('sha1')).update(strForSignature, 'utf-8')).digest('hex');

  myData["fingerprint"] = signature;

  response.send(templateLib.getTemplate(SECURE_PAY_INVOICE_URL, myData));
};

module.exports.process_checkout = async (request, response) => {
  
  const strForSignature = MERCHANT_CODE + "|" + TXN_PASSWORD + "|" + request.body.refid + "|" + request.body.amount + "|" + request.body.timestamp + "|" + request.body.summarycode;
  const signature = ((crypto.createHash('sha1')).update(strForSignature, 'utf-8')).digest('hex');

  if(signature === request.body.fingerprint){
    const order_id = request.body.refid;
    const transaction_id = request.body.txnid;
    const amount = parseFloat(request.body.amount)/100;
    
    admin.database().ref('bookings').child(order_id).once('value', snapshot => {
      if(snapshot.val()){
          const bookingData = snapshot.val();
          UpdateBooking(bookingData,order_id,transaction_id,'securepay');
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
  }else{
    response.redirect(`/cancel`);
  }
};