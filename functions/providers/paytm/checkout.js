const admin = require('firebase-admin');
const checksum_lib = require('./checksum');
const templateLib = require('./template');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const PAYTM_MEWRCHANT_ID = "XXXXXXXXXXXXXX";
const PAYTM_MERCHANT_KEY = 'XXXXXXXXXXXXXX';
const PAYTM_WEBSITE = "WEBSTAGING";
const PAYTM_INDUSTRY_TYPE_ID = "Retail";
const PAYTM_CHANNEL_ID = "WEB";

const PAYTM_CHECKOUT_URL = "https://securegw-stage.paytm.in/order/process";

module.exports.render_checkout = function(request, response){

    var order_id = request.body.order_id;
    var amount = request.body.amount;
    var cust_id = request.body.cust_id;
    var mobile_no = request.body.mobile_no;
    var email = request.body.email;

    const refr = request.get('Referrer');
    const server_url = refr ? (refr.includes('bookings')? refr.substring(0, refr.length - 8)  :refr): request.protocol + "://" + request.get('host') + "/";

    var paytmParams = {
      "MID" : PAYTM_MEWRCHANT_ID,
      "WEBSITE" : PAYTM_WEBSITE,
      "INDUSTRY_TYPE_ID" : PAYTM_INDUSTRY_TYPE_ID,
      "CHANNEL_ID" : PAYTM_CHANNEL_ID,
      "ORDER_ID" : order_id,
      "CUST_ID" : cust_id,
      "MOBILE_NO" : mobile_no,
      "EMAIL" : email,
      "TXN_AMOUNT" : amount,
      "CALLBACK_URL" : server_url + 'paytm-process'
    };

	checksum_lib.genchecksum(paytmParams, PAYTM_MERCHANT_KEY, (err, checksum) => {
        if(!err){    
            response.send(templateLib.getTemplate(PAYTM_CHECKOUT_URL,paytmParams,checksum));
        }
    });
};


module.exports.process_checkout = function(request, response){

    var received_data = request.body;
    var paytmChecksum = "";
    var paytmParams = {};

    for(var key in received_data){
        if(key === "CHECKSUMHASH") {
            paytmChecksum = received_data[key];
        } else {
            paytmParams[key] = received_data[key];
        }
    }

    var isValidChecksum = checksum_lib.verifychecksum(paytmParams, PAYTM_MERCHANT_KEY, paytmChecksum);
    if(isValidChecksum) {
        if(received_data.STATUS === 'TXN_SUCCESS'){
            const order_id = received_data.ORDERID;
            const transaction_id = received_data.TXNID;
            const amount = received_data.TXNAMOUNT;
            admin.database().ref('bookings').child(order_id).once('value', snapshot => {
              if(snapshot.val()){
                  const bookingData = snapshot.val();
                  UpdateBooking(bookingData,order_id,transaction_id,'paytm');
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
            response.redirect('/cancel');
        }
    } else {
        response.redirect('/cancel');
    }   
};