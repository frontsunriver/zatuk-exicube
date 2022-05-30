const templateLib = require('./template');
const admin = require('firebase-admin');
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

module.exports.render_checkout = function(request, response){

    const order_id = request.body.order_id;
    const amount = request.body.amount;

    response.send(templateLib.getTemplate(
        order_id,
        amount
    ));
};

module.exports.process_checkout = function(req, res){
    const order_id = req.query.order_id;
    const transaction_id = req.query.transaction_id;
    const amount = req.query.amount;
    admin.database().ref('bookings').child(order_id).once('value', snapshot => {
        if(snapshot.val()){
            const bookingData = snapshot.val();
            UpdateBooking(bookingData,order_id,transaction_id,'test');
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
};


