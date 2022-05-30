const admin = require('firebase-admin');
const templateLib = require('./template');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const stripe = require('stripe')('XXXXXXXXXXXXXX');
const stripe_public_key = 'XXXXXXXXXXXXXX';

module.exports.render_checkout = function(request, response){

    const refr = request.get('Referrer');
    const server_url = refr ? (refr.includes('bookings')? refr.substring(0, refr.length - 8)  :refr): request.protocol + "://" + request.get('host') + "/";

    var product_name = request.body.product_name?request.body.product_name:"Booking";
    var order_id = request.body.order_id;
    var amount = request.body.amount;
    var currency = request.body.currency;
    var quantity = request.body.quantity?request.body.quantity:1;

    let session_data = {
        success_url: server_url + 'stripe-process?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: server_url + 'cancel',
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
              currency: currency,
              product_data: {
                name: product_name,
              },
              unit_amount: amount * (currency === 'XOF'? 1 : 100),
            },
            quantity: quantity,
        }],
        mode:'payment',
        metadata:{
            order_id: order_id
        }
    }
    stripe.checkout.sessions.create(
        session_data,
        (err, session) => {
            if (err) {
                response.send({ "error": err });
            } else if (session) {    
                response.send(
                    templateLib.getTemplate(stripe_public_key,session.id)
                );               
            } else {
                response.send({ "error": "Some other problem" })
            }
        }
    );
};

module.exports.process_checkout = function(request, response){
    var session_id = request.query.session_id;
    stripe.checkout.sessions.retrieve(
        session_id,
        (err, session) => {
            if (err) {
                response.redirect('/cancel');
            } else if (session) {
                const order_id = session.metadata.order_id;
                const transaction_id = session.payment_intent;
                const amount = parseFloat(session.currency === 'XOF'? session.amount_total: session.amount_total/100);
                admin.database().ref('bookings').child(order_id).once('value', snapshot => {
                  if(snapshot.val()){
                      const bookingData = snapshot.val();
                      UpdateBooking(bookingData,order_id,transaction_id,'stripe');
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
        }
    );
};