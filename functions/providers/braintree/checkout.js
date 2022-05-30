const braintree = require("braintree");
const templateLib = require('./template');
const admin = require('firebase-admin');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const gateway = braintree.connect({
    environment: braintree.Environment.Sandbox, 
    merchantId: 'XXXXXXXXXXXXXX', 
    publicKey: 'XXXXXXXXXXXXXX',
    privateKey: 'XXXXXXXXXXXXXX'
});

module.exports.render_checkout = function(request, response){
    var order_id = request.body.order_id;
    var amount = request.body.amount;
    var currency = request.body.currency;

    gateway.clientToken.generate({
    }, (err, res) => {
        if (err) {
            response.send({ "error": err });
        } else if (res) {
            response.send(templateLib.getTemplate(res.clientToken,order_id,amount,currency));
        } else {
            response.send({ "error": "Some other error" });
        }
    });
};

module.exports.process_checkout = function(request, response){
    gateway.transaction.sale(
        {
            amount: request.query.amount,
            paymentMethodNonce: request.query.nonce,
            options: {
                submitForSettlement: true
            }
        },
        (err, res) => {
            if (err) {
                response.send({ error: err });
            } else {   
                if(res.success){
                    const order_id = request.query.order_id;
                    const transaction_id = res.transaction.id;
                    const amount = request.query.amount;
                    admin.database().ref('bookings').child(order_id).once('value', snapshot => {
                      if(snapshot.val()){
                          const bookingData = snapshot.val();
                          UpdateBooking(bookingData,order_id,transaction_id,'braintree');
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
                }  else{
                    response.redirect('/cancel');
                }  
            }
        }
    );
};