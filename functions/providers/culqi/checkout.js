var request = require('request');
const templateLib = require('./template');
const admin = require('firebase-admin');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const PULIC_KEY = 'XXXXXXXXXXXXXX';
const SECURE_KEY = 'XXXXXXXXXXXXXX';
const API_URL = 'https://api.culqi.com/v2/charges';

module.exports.render_checkout = (req, res) => {
  let payData = {
    title:'Booking',
    amount: req.body.amount * 100,
    order_id: req.body.order_id,
    email: req.body.email,
    currency: req.body.currency
  };
  res.send(templateLib.getTemplate(payData, PULIC_KEY));
};


module.exports.process_checkout = (req, res)  => {

  
  var body = {
    "amount": req.query.amount,
    "currency_code": req.query.currency,
    "email": req.query.email,
    "source_id": req.query.token
  }

  var options = {
    'method': 'POST',
    'url': API_URL,
    'headers': {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + SECURE_KEY
    },
    'body': JSON.stringify(body)
  };

  request(options, (error, response) => {
    if(error){
      res.redirect('/cancel');
    }else{
      if(response.statusCode === 201){
        
        const order_id = req.query.order_id;
        const transaction_id =  JSON.parse(response.body).id;
        const amount = parseFloat(req.query.amount) / 100;

        admin.database().ref('bookings').child(order_id).once('value', snapshot => {
          if(snapshot.val()){
              const bookingData = snapshot.val();
              UpdateBooking(bookingData,order_id,transaction_id,'calqi');
              res.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
          }else{
              if(order_id.startsWith("wallet")){
                addToWallet(order_id.substr(7,order_id.length - 21), amount, order_id, transaction_id);
                res.redirect(`/success?order_id=${order_id}&amount=${amount}&transaction_id=${transaction_id}`);
              }else{
                res.redirect('/cancel');
              }
          }
        });
      }else{
        res.redirect('/cancel');
      }
    }
  });

};