const fetch = require("node-fetch");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const GOOGLE_MAP_SERVER_KEY = require('./googlemapapiconfig');

const validateBasicAuth = async (authorization) => {
    if(authorization && authorization.startsWith('Basic ')){
        const b64auth = (authorization || '').split(' ')[1] || ''
        const strauth = Buffer.from(b64auth, 'base64').toString()
        const splitIndex = strauth.indexOf(':')
        const username = strauth.substring(0, splitIndex)
        const password = strauth.substring(splitIndex + 1)
        if(username==='exilog' && password === "dWLF&%jn7PpEc2d"){
            return true;
        }else{
            return false;
        }
    }else{
        return false;
    }
};

exports.autocomplete = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateBasicAuth(request.headers.authorization);
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    if(user && settings){
        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${request.body.searchKeyword}&key=${GOOGLE_MAP_SERVER_KEY}`;
        if(settings.restrictCountry && settings.restrictCountry.length>1){
            url = url + `&components=country:${settings.restrictCountry}`;
        }
        if(settings.mapLanguage && settings.mapLanguage.length>1){
            url = url + `&language=${settings.mapLanguage}`;
        }
        let res = await fetch(url);
        let json = await res.json();
        if (json.predictions) {
            response.send({searchResults: json.predictions});
        }else{
            response.send({ error: 'Places API : No predictions found' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getcoords = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateBasicAuth(request.headers.authorization);
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    if(user && settings){
            let url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${request.body.place_id}&key=${GOOGLE_MAP_SERVER_KEY}`;
            if(settings.mapLanguage && settings.mapLanguage.length>1){
                url = url + `&language=${settings.mapLanguage}`;
            }
            let res = await fetch(url);
            let json = await res.json();
            if (json.results && json.results.length > 0 && json.results[0].geometry) {
                response.send({coords:json.results[0].geometry.location});
            }else{
                response.send({ error: 'Geocode API : Place to Coordinate Error' });
            }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getaddress = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateBasicAuth(request.headers.authorization);
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    if(user && settings){
        let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${request.body.latlng}&key=${GOOGLE_MAP_SERVER_KEY}`;
        if(settings.mapLanguage && settings.mapLanguage.length>1){
            url = url + `&language=${settings.mapLanguage}`;
        }
        let res = await fetch(url);
        let json = await res.json();
        if (json.results && json.results.length > 0 && json.results[0].formatted_address) {
            response.send({
                address:json.results[0].formatted_address
            });
        }else{
            response.send({ error: 'Geocode API : Coordinates to Address Error' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getdistancematrix = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateBasicAuth(request.headers.authorization);
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    if(user && settings){
        let url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${request.body.start}&destinations=${request.body.dest}&key=${GOOGLE_MAP_SERVER_KEY}`;
        if(settings.mapLanguage && settings.mapLanguage.length>1){
            url = url + `&language=${settings.mapLanguage}`;
        }
        let res = await fetch(url);
        let json = await res.json();
        if (json.rows && json.rows.length > 0 && json.rows[0].elements.length > 0) {
            let arr = [];
            const elements = json.rows[0].elements;
            for(let i = 0; i<elements.length; i++){
                if(elements[i].status === "OK"){
                    arr.push({
                        found:true,
                        distance_in_km: elements[i].distance.value / 1000,
                        time_in_secs: elements[i].duration.value,
                        timein_text: elements[i].duration.text
                    });
                }else {
                    arr.push({
                        found:false
                    });
                }
            }
            response.send(arr);
        }else{
            response.send({ error: 'Distance MAtrix API : No Route Found' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    }
});

exports.getdirections = functions.https.onRequest(async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const user = await validateBasicAuth(request.headers.authorization);
    let settingdata = await admin.database().ref('settings').once("value");
    let settings = settingdata.val();
    if(user && settings){
        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${request.body.start}&destination=${request.body.dest}&key=${GOOGLE_MAP_SERVER_KEY}`;
        if(request.body.waypoints){
            url = url + '&waypoints=' + request.body.waypoints;
        }
        if(settings.mapLanguage && settings.mapLanguage.length>1){
            url = url + `&language=${settings.mapLanguage}`;
        }
        let res = await fetch(url);
        let json = await res.json();
        if (json.routes && json.routes.length > 0) {
            const legs =  json.routes[0].legs;
            let distance = 0;
            let duration = 0;
            for(let i = 0; i<legs.length; i++){
                distance = distance + legs[i].distance.value;
                duration = duration + legs[i].duration.value;
            }
            response.send({
                distance_in_km:(distance / 1000),
                time_in_secs:duration,
                polylinePoints:json.routes[0].overview_polyline.points
            });
        }else{
            response.send({ error: 'Directions API : No Route Found' });
        }
    }else{
        response.send({ error: 'Unauthorized api call' });
    } 
});
