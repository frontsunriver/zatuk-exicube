
const admin = require('firebase-admin');
const templateLib = require('./template');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const PAYSTACK_PUBLIC_KEY = "pk_live_096cf0dc9749743646830cdc2060485800585da2";
const PAYSTACK_SECRET_KEY = "sk_live_3b9516b16250e0b037d8dfcf96a2663bfc170352";

var paystack = require('paystack')(PAYSTACK_SECRET_KEY);

module.exports.render_checkout = function (request, response) {
    const allowed = ["GHS", "NGN", "ZAR"];

    var order_id = request.body.order_id;
    var email = request.body.email;
    var amount = request.body.amount;
    var currency = allowed.includes(request.body.currency) ? request.body.currency : 'NGN';

    response.send(templateLib.getTemplate(      
        PAYSTACK_PUBLIC_KEY,
        order_id,
        email,
        amount,
        currency
    ));
};

module.exports.process_checkout = function (request, response) {
    paystack.transaction.verify(request.query.reference, (error, body) => {
        if(error){
            response.redirect('/cancel');
            return;
        }
        if(body.status){
            let data = body.data;
            if(data.status === 'success'){
                const order_id = data.metadata.order_id;
                const transaction_id = data.reference;
                const amount = parseFloat(data.amount/100);
                admin.database().ref('bookings').child(order_id).once('value', snapshot => {
                  if(snapshot.val()){
                      const bookingData = snapshot.val();
                      UpdateBooking(bookingData,order_id,transaction_id,'paystack');
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
        }else{
            response.redirect('/cancel');
        }
    });
};