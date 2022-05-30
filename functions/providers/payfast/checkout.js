const crypto = require("crypto");
const admin = require('firebase-admin');
const templateLib = require('./template');
const axios = require("axios");
const addToWallet = require('../../common').addToWallet;
const UpdateBooking = require('../../common').UpdateBooking;

const testingMode = true;

const PAYFAST_MEWRCHANT_ID = "XXXXXXXXXXXXXX";
const PAYFAST_MERCHANT_KEY = 'XXXXXXXXXXXXXX';
const PAYFAST_CHECKOUT_URL = "https://" + (testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za") + "/eng/process";
const passPhrase = null;

const generateSignature = (data) => {
    let pfOutput = "";
    for (let key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            if (data[key] !== "") {
                pfOutput += `${key}=${encodeURIComponent(data[key].trim()).replace(/%20/g, "+")}&`
            }
        }
    }
    let getString = pfOutput.slice(0, -1);
    if (passPhrase !== null) {
        getString +=`&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }
    return crypto.createHash("md5").update(getString).digest("hex");
};

const pfValidSignature = (pfData, pfParamObject, pfPassphrase = null) => {
    let tempParamString = '';
    if (pfPassphrase !== null) {
        pfParamObject +=`&passphrase=${encodeURIComponent(pfPassphrase.trim()).replace(/%20/g, "+")}`;
    }
    const signature = crypto.createHash("md5").update(pfParamObject).digest("hex");
    return pfData['signature'] === signature;
};

const pfValidPaymentData = (cartTotal, pfData) => {
    return Math.abs(parseFloat(cartTotal) - parseFloat(pfData['amount_gross'])) <= 0.01;
};


const pfValidServerConfirmation = async (pfHost, pfParamString) => {
    const result = await axios.post(`https://${pfHost}/eng/query/validate`, pfParamString)
        .then((res) => {
            return res.data;
        })
        .catch((error) => {
            console.error(error)
        });
    return result === 'VALID';
};


module.exports.render_checkout = function (request, response) {
    const refr = request.get('Referrer');
    const server_url = refr ? (refr.includes('bookings')? refr.substring(0, refr.length - 8)  :refr): request.protocol + "://" + request.get('host') + "/";
    const myData = [];
    myData["merchant_id"] = PAYFAST_MEWRCHANT_ID;
    myData["merchant_key"] = PAYFAST_MERCHANT_KEY;
    myData["return_url"] = server_url + `success?order_id=${request.body.order_id}&amount=${request.body.amount}`;
    myData["cancel_url"] = server_url + 'cancel';
    myData["notify_url"] = server_url + 'payfast-process';
    myData["email_address"] = request.body.email;
    myData["m_payment_id"] = request.body.order_id;
    myData["amount"] = request.body.amount;
    myData["item_name"] = request.body.order_id;
    myData["signature"] = generateSignature(myData);
    response.send(templateLib.getTemplate(
        PAYFAST_CHECKOUT_URL, myData
    ));
};

module.exports.process_checkout = async function (req, res) {
    
    const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";

    const pfData = JSON.parse(JSON.stringify(req.body));

    let pfParamString = "";
    for (let key in pfData) {
        if (Object.prototype.hasOwnProperty.call(pfData, key) && key !== "signature") {
            pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, "+")}&`;
        }
    }

    pfParamString = pfParamString.slice(0, -1);

    const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
    const check2 = pfValidPaymentData(req.body.amount_gross, pfData);
    const check3 = await pfValidServerConfirmation(pfHost, pfParamString);

    if (check1 && check2 && check3) {
        const order_id = req.body.m_payment_id;
        const transaction_id = req.body.pf_payment_id;
        const amount = req.body.amount_gross;
        admin.database().ref('bookings').child(order_id).once('value', snapshot => {
            if (snapshot.val()) {
                const bookingData = snapshot.val();
                UpdateBooking(bookingData,order_id,transaction_id,'payfast');
            }else{
                if(order_id.startsWith("wallet")){
                  addToWallet(order_id.substr(7,order_id.length - 21), amount, order_id, transaction_id);
                }
            }
            res.sendStatus(200);
        });
    }else{
        res.sendStatus(200);
    }
};