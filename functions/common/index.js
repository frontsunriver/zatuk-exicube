const fetch = require("node-fetch");
const admin = require('firebase-admin');

module.exports.UpdateBooking = (bookingData,order_id,transaction_id,gateway) => {
    let curChanges = {
        status: bookingData.status === 'PAYMENT_PENDING' ? 'NEW' : 'PAID',
        prepaid: bookingData.status === 'PAYMENT_PENDING' ? true : false,
        transaction_id: transaction_id,
        gateway: gateway
    }
    Object.assign(curChanges, bookingData.paymentPacket);
    admin.database().ref('bookings').child(order_id).update(curChanges);
    if(bookingData.paymentPacket.appcat === 'taxi' && bookingData.status === 'PENDING'){
        if(parseFloat(bookingData.paymentPacket.usedWalletMoney)>0){
            deductFromWallet(bookingData.customer, bookingData.paymentPacket.usedWalletMoney , order_id);
        }
        addToWallet(bookingData.driver, bookingData.driver_share, order_id, order_id );
        admin.database().ref('users').child(bookingData.driver).update({queue:false});
    }
    if(bookingData.paymentPacket.appcat === 'delivery' && bookingData.status === 'PENDING'){
        admin.database().ref('users').child(bookingData.driver).update({queue:false});
        addToWallet(bookingData.driver, bookingData.driver_share, order_id, order_id );
    }
    if(bookingData.paymentPacket.appcat === 'delivery' && bookingData.status === 'PAYMENT_PENDING'){
        if(parseFloat(bookingData.paymentPacket.usedWalletMoney)>0){
            deductFromWallet(bookingData.customer, bookingData.paymentPacket.usedWalletMoney , order_id);
        }
    }
}

const RequestPushMsg = async (token, data) => {

    admin.database().ref('/users').orderByChild("pushToken").equalTo(token).once("value", (udata) => {
        let users = udata.val();
        if (users) {
            for (let ukey in users) {
                admin.database().ref('/users/' + ukey + '/notifications').push(
                    {
                         dated: new Date().getTime(), 
                         title: data.title, 
                         msg: data.msg
                    }
                )
            }
        }
    });

    let response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'accept-encoding': 'gzip, deflate',
            'host': 'exp.host'
        },
        body: JSON.stringify({
            "to": token,
            "title": data.title,
            "body": data.msg,
            "data": data,
            "priority": "high",
            "sound": "default",
            "channelId": "messages",
            "_displayInForeground": true
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    } else {
        return await response.json()
    }
}

module.exports.RequestPushMsg = RequestPushMsg;

const addToWallet = async (uid,amount,description,transaction_id) =>{
    let snapshot =  await admin.database().ref("users/" + uid).once("value");
    if (snapshot.val()) {
        const pushToken = snapshot.val().pushToken;
        let walletBalance = parseFloat(snapshot.val().walletBalance);
        walletBalance = walletBalance + parseFloat(amount);
        let details = {
            type: 'Credit',
            amount: amount,
            date: new Date().toString(),
            txRef: description,
            transaction_id: transaction_id? transaction_id : ''
        }
        await admin.database().ref("users/" + uid + "/walletBalance").set(walletBalance);
        await admin.database().ref("users/" + uid + "/walletHistory").push(details);
        if(pushToken){
            const language = Object.values((await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value')).val())[0].keyValuePairs;
            RequestPushMsg(
                pushToken, 
                {
                    title: language.notification_title, 
                    msg: language.wallet_updated,
                    screen: 'Wallet'
                }
            );
        }  
        return true;
    }else{
        return false;
    }
}

module.exports.addToWallet = addToWallet;

const deductFromWallet = async (uid,amount,description) =>{
    let snapshot =  await admin.database().ref("users/" + uid).once("value");
    if (snapshot.val()) {
        const pushToken = snapshot.val().pushToken;
        let walletBalance = parseFloat(snapshot.val().walletBalance);
        walletBalance = walletBalance - parseFloat(amount);
        let details = {
            type: 'Debit',
            amount: amount,
            date: new Date().toString(),
            txRef: description,
            transaction_id: description
        }
        await admin.database().ref("users/" + uid + "/walletBalance").set(walletBalance);
        await admin.database().ref("users/" + uid + "/walletHistory").push(details);
        if(pushToken){
            const language = Object.values((await admin.database().ref("languages").orderByChild("default").equalTo(true).once('value')).val())[0].keyValuePairs;
            RequestPushMsg(
                pushToken, 
                {
                    title: language.notification_title, 
                    msg: language.wallet_updated,
                    screen: 'Wallet'
                }
            );
        }  
        return true;
    }else{
        return false;
    }
}

module.exports.deductFromWallet = deductFromWallet;


module.exports.getDistance = (lat1, lon1, lat2, lon2) => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;
        return dist;
    }
}

module.exports.getHtml = (message) => {
    return (
        `
        <!DOCTYPE HTML>
        <html>
        <head> 
            <meta name='viewport' content='width=device-width, initial-scale=1.0'> 
            <title>${message}</title> 
            <style> 
                body { font-family: Verdana, Geneva, Tahoma, sans-serif; } 
                .container { display: flex; justify-content: center; align-items: center; width: 100%; height: 100%; padding: 60px 0; } 
                .contentDiv { padding: 40px; box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.3); border-radius: 10px; width: 70%; margin: 0px auto; text-align: center; } 
                .contentDiv img { width: 140px; display: block; margin: 0px auto; margin-bottom: 10px; } 
                h3, h6, h4 { margin: 0px; } .contentDiv h3 { font-size: 22px; } 
                .contentDiv h6 { font-size: 13px; margin: 5px 0; } 
                .contentDiv h4 { font-size: 16px; } 
            </style>
        </head>
        <body> 
            <div class='container'> 
                <div class='contentDiv'> 
                    <img src='https://cdn.pixabay.com/photo/2016/11/30/17/11/configuration-1873379__340.png' alt='Icon'> 
                    <h3>${message}</h3> 
                </div> 
            </div>
        </body>
        </html>
        `
    );
}
