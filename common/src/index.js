import React, { createContext } from 'react';
import app from 'firebase/app';
import 'firebase/database';
import 'firebase/auth';
import 'firebase/storage';
import store from './store/store';

import {
    fetchUser,
    mainSignUp,
    mobileSignIn,
    facebookSignIn,
    appleSignIn,
    signOut,
    updateProfile,
    clearLoginError,
    updatePushToken,
    updateProfileImage,
    requestPhoneOtpDevice,
    deleteUser,
    validateReferer,
    checkUserExists,
    monitorProfileChanges,
    fetchProfile
} from './actions/authactions';
import {
    addBooking,
    clearBooking
} from './actions/bookingactions';
import {
    fetchBookings,
    updateBooking,
    cancelBooking,
    updateBookingImage
} from './actions/bookinglistactions';
import { 
    fetchCancelReasons,
    editCancellationReason
} from './actions/cancelreasonactions';
import { 
    fetchCarTypes,
    editCarType
} from './actions/cartypeactions';
import {
    getEstimate,
    clearEstimate
} from './actions/estimateactions';
import { fetchDriverEarnings } from './actions/driverearningaction';
import { fetchEarningsReport } from './actions/earningreportsaction';
import {
    fetchUserNotifications,
    fetchNotifications,
    editNotifications,
    sendNotification
} from './actions/notificationactions';
import {
    fetchPromos,
    editPromo
} from './actions/promoactions';
import {
    addUser,
    fetchUsers,
    fetchUsersOnce,
    fetchDrivers,
    editUser
} from './actions/usersactions';
import { 
    fetchSettings,
    editSettings,
    clearSettingsViewError
} from './actions/settingsactions';
import { 
    fetchPaymentMethods,
    addToWallet,
    updateWalletBalance,
    clearMessage
} from './actions/paymentactions';
import {
    updateTripPickup,
    updateTripDrop,
    updateTripCar,
    updatSelPointType,
    clearTripPoints
} from './actions/tripactions';
import {
    fetchTasks,
    acceptTask,
    cancelTask
} from './actions/taskactions';
import {
    fetchBookingLocations,
    stopLocationFetch
} from './actions/locationactions';
import {
    fetchChatMessages,
    sendMessage, 
    stopFetchMessages
} from './actions/chatactions';
import {
    fetchWithdraws,
    completeWithdraw
} from './actions/withdrawactions';

import {
    MinutesPassed,
    GetDateString
} from './other/DateFunctions';
import { 
    fetchPlacesAutocomplete,
    fetchCoordsfromPlace,
    fetchAddressfromCoords,
    getDistanceMatrix,
    getDirectionsApi
} from './other/GoogleAPIFunctions';
import {
    GetDistance,
    GetTripDistance
} from './other/GeoFunctions';
import {
    countries
} from './other/GetCountries';
import {
    fetchLanguages,
    editLanguage
} from './actions/languageactions';
import {
    RequestPushMsg
} from './other/NotificationFunctions';

const FirebaseContext = createContext(null);

const FirebaseProvider  = ({ config, appcat, children }) => {
    let firebase = {
        app: null,
        database: null,
        auth: null,
        storage: null,
    }

    if (!app.apps.length) {
        app.initializeApp(config);
        firebase = {
            app: app,
            config: config,
            appcat: appcat,
            database: app.database(),
            auth: app.auth(),
            storage: app.storage(),
            authRef: app.auth(),
            facebookProvider:new app.auth.FacebookAuthProvider(),
            googleProvider:new app.auth.GoogleAuthProvider(),
            appleProvider:new app.auth.OAuthProvider('apple.com'),
            phoneProvider:new app.auth.PhoneAuthProvider(),          
            RecaptchaVerifier: app.auth.RecaptchaVerifier,
            captchaGenerator: (element) => new app.auth.RecaptchaVerifier(element),           
            facebookCredential: (token) => app.auth.FacebookAuthProvider.credential(token),
            googleCredential: (idToken) => app.auth.GoogleAuthProvider.credential(idToken),
            mobileAuthCredential: (verificationId,code) => app.auth.PhoneAuthProvider.credential(verificationId, code),           
            usersRef: app.database().ref("users"),
            bookingRef:app.database().ref("bookings"),
            cancelreasonRef:app.database().ref("cancel_reason"),
            settingsRef:app.database().ref("settings"),
            carTypesRef:app.database().ref("cartypes"),   
            carTypesEditRef:(id) => app.database().ref("cartypes/"+ id),            
            promoRef:app.database().ref("promos"),
            promoEditRef:(id) => app.database().ref("promos/"+ id),
            notifyRef:app.database().ref("notifications/"),
            notifyEditRef:(id) => app.database().ref("notifications/"+ id),
            singleUserRef:(uid) => app.database().ref("users/" + uid),
            profileImageRef:(uid) => app.storage().ref(`users/${uid}/profileImage`),
            bookingImageRef:(bookingId,imageType) => app.storage().ref(`bookings/${bookingId}/${imageType}`),
            driverDocsRef:(uid,timestamp) => app.storage().ref(`users/${uid}/driverDocuments/${timestamp}/`),          
            singleBookingRef:(bookingKey) => app.database().ref("bookings/" + bookingKey),
            requestedDriversRef:(bookingKey ) => app.database().ref("bookings/" + bookingKey  + "/requestedDrivers"),
            walletBalRef:(uid) => app.database().ref("users/" + uid + "/walletBalance"),
            walletHistoryRef:(uid) => app.database().ref("users/" + uid + "/walletHistory"),  
            referralIdRef:(referralId) => app.database().ref("users").orderByChild("referralId").equalTo(referralId),
            trackingRef: (bookingId) => app.database().ref('tracking/' + bookingId),
            tasksRef:() => app.database().ref('bookings').orderByChild('status').equalTo('NEW'),
            singleTaskRef:(uid,bookingId) => app.database().ref("bookings/" + bookingId  + "/requestedDrivers/" + uid),
            bookingListRef:(uid,role) => 
                role == 'rider'? app.database().ref('bookings').orderByChild('customer').equalTo(uid):
                    (role == 'driver'? 
                        app.database().ref('bookings').orderByChild('driver').equalTo(uid)
                        :
                        (role == 'fleetadmin'? 
                            app.database().ref('bookings').orderByChild('fleetadmin').equalTo(uid)
                            : app.database().ref('bookings')
                        )
                    ),
            chatRef:(bookingId) => app.database().ref('chats/' + bookingId + '/messages'),
            withdrawRef:app.database().ref('withdraws/'),
            languagesRef:app.database().ref("languages"),
            languagesEditRef:(id) => app.database().ref("languages/"+ id),
            api: {
                MinutesPassed: MinutesPassed, 
                GetDateString: GetDateString, 
                
                fetchPlacesAutocomplete: (searchKeyword) => fetchPlacesAutocomplete(searchKeyword)(firebase), 
                fetchCoordsfromPlace: (place_id) => fetchCoordsfromPlace(place_id)(firebase), 
                fetchAddressfromCoords: (latlng) => fetchAddressfromCoords(latlng)(firebase), 
                getDistanceMatrix: (startLoc, destLoc) => getDistanceMatrix(startLoc, destLoc)(firebase), 
                getDirectionsApi: (startLoc, destLoc, waypoints) => getDirectionsApi(startLoc, destLoc, waypoints)(firebase), 

                RequestPushMsg: (token, data) => RequestPushMsg(token, data)(firebase), 

                countries: countries,
                GetDistance: GetDistance, 
                GetTripDistance: GetTripDistance,
                saveUserLocation: (uid,location) => app.database().ref('users/' + uid + '/location').set(location),
                saveTracking: (bookingId, location) => app.database().ref('tracking/' + bookingId).push(location),

                saveUserNotification:(uid,notification) => app.database().ref("users/" + uid + "/notifications").push(notification),

                fetchUserNotifications:() => (dispatch) => fetchUserNotifications()(dispatch)(firebase), 

                validateReferer: (referralId) => validateReferer(referralId)(firebase), 
                checkUserExists: (regData) => checkUserExists(regData)(firebase), 
                
                fetchUser: () => (dispatch) => fetchUser()(dispatch)(firebase), 
                mobileSignIn: (verficationId, code) => (dispatch) => mobileSignIn(verficationId, code)(dispatch)(firebase), 
                facebookSignIn: (token) => (dispatch) => facebookSignIn(token)(dispatch)(firebase), 
                appleSignIn: (credentialData) => (dispatch) => appleSignIn(credentialData)(dispatch)(firebase), 
                mainSignUp: (data)  => mainSignUp(data)(firebase), 
                signOut: () => (dispatch) => signOut()(dispatch)(firebase), 
                updateProfile: (userAuthData, updateData) => (dispatch) => updateProfile(userAuthData, updateData)(dispatch)(firebase), 
                fetchProfile: () => (dispatch) => fetchProfile()(dispatch)(firebase), 
                monitorProfileChanges: () => (dispatch) => monitorProfileChanges()(dispatch)(firebase), 
                clearLoginError: () => (dispatch) => clearLoginError()(dispatch)(firebase), 
                addBooking: (bookingData) => (dispatch) => addBooking(bookingData)(dispatch)(firebase), 
                clearBooking: () => (dispatch) => clearBooking()(dispatch)(firebase), 
                fetchBookings: (uid, role) => (dispatch) => fetchBookings(uid, role)(dispatch)(firebase), 
                updateBooking: (booking) => (dispatch) => updateBooking(booking)(dispatch)(firebase), 
                cancelBooking: (data) => (dispatch) => cancelBooking(data)(dispatch)(firebase), 
                fetchCancelReasons: () => (dispatch) => fetchCancelReasons()(dispatch)(firebase), 
                editCancellationReason: (reasons, method) => (dispatch) => editCancellationReason(reasons, method)(dispatch)(firebase), 
                fetchCarTypes: () => (dispatch) => fetchCarTypes()(dispatch)(firebase), 
                editCarType: (data, method) => (dispatch) => editCarType(data, method)(dispatch)(firebase),  
                getEstimate: (bookingData) => (dispatch) => getEstimate(bookingData)(dispatch)(firebase), 
                clearEstimate: () => (dispatch) => clearEstimate()(dispatch)(firebase), 
                fetchSettings: () => (dispatch) => fetchSettings()(dispatch)(firebase), 
                editSettings: (settings) => (dispatch) => editSettings(settings)(dispatch)(firebase), 
                clearSettingsViewError: () => (dispatch) => clearSettingsViewError()(dispatch)(firebase), 
                fetchDriverEarnings: (uid,role) => (dispatch) => fetchDriverEarnings(uid,role)(dispatch)(firebase), 
                fetchEarningsReport: () => (dispatch) => fetchEarningsReport()(dispatch)(firebase), 
                fetchNotifications: () => (dispatch) => fetchNotifications()(dispatch)(firebase), 
                editNotifications: (notifications, method) => (dispatch) => editNotifications(notifications, method)(dispatch)(firebase), 
                sendNotification: (notification) => (dispatch) => sendNotification(notification)(dispatch)(firebase), 
                fetchPromos: () => (dispatch) => fetchPromos()(dispatch)(firebase), 
                editPromo: (data, method) => (dispatch) => editPromo(data, method)(dispatch)(firebase), 
                fetchUsers: () => (dispatch) => fetchUsers()(dispatch)(firebase), 
                fetchUsersOnce: () => (dispatch) => fetchUsersOnce()(dispatch)(firebase), 
                fetchDrivers: () => (dispatch) => fetchDrivers()(dispatch)(firebase), 
                addUser: (userdata) => (dispatch) => addUser(userdata)(dispatch)(firebase),
                editUser: (id, user) => (dispatch) => editUser(id, user)(dispatch)(firebase), 
                updatePushToken: (userAuthData, token, platform) => (dispatch) => updatePushToken(userAuthData, token, platform)(dispatch)(firebase), 
                updateProfileImage: (userAuthData, imageBlob) => (dispatch) => updateProfileImage(userAuthData, imageBlob)(dispatch)(firebase), 
                requestPhoneOtpDevice: (phoneNumber, appVerifier) => (dispatch) => requestPhoneOtpDevice(phoneNumber, appVerifier)(dispatch)(firebase), 
                deleteUser: (uid) => (dispatch) => deleteUser(uid)(dispatch)(firebase), 
                fetchPaymentMethods: () => (dispatch) => fetchPaymentMethods()(dispatch)(firebase), 
                addToWallet: (uid, amount) => (dispatch) => addToWallet(uid, amount)(dispatch)(firebase), 
                updateWalletBalance: (balance, details) => (dispatch) => updateWalletBalance(balance, details)(dispatch)(firebase), 
                clearMessage: () => (dispatch) => clearMessage()(dispatch)(firebase), 
                updateTripPickup: (pickupAddress) => (dispatch) => updateTripPickup(pickupAddress)(dispatch)(firebase), 
                updateTripDrop: (dropAddress) => (dispatch) => updateTripDrop(dropAddress)(dispatch)(firebase), 
                updateTripCar: (selectedCar) => (dispatch) => updateTripCar(selectedCar)(dispatch)(firebase), 
                updatSelPointType: (selection) => (dispatch) => updatSelPointType(selection)(dispatch)(firebase), 
                clearTripPoints: () => (dispatch) => clearTripPoints()(dispatch)(firebase),
                fetchTasks: () => (dispatch) => fetchTasks()(dispatch)(firebase), 
                acceptTask: (userAuthData,task) => (dispatch) => acceptTask(userAuthData,task)(dispatch)(firebase), 
                cancelTask: (bookingId) => (dispatch) => cancelTask(bookingId)(dispatch)(firebase), 
                fetchBookingLocations: (bookingId) => (dispatch) => fetchBookingLocations(bookingId)(dispatch)(firebase), 
                stopLocationFetch: (bookingId) => (dispatch) => stopLocationFetch(bookingId)(dispatch)(firebase), 
                fetchChatMessages: (bookingId) => (dispatch) => fetchChatMessages(bookingId)(dispatch)(firebase), 
                sendMessage: (data) => (dispatch) => sendMessage(data)(dispatch)(firebase), 
                stopFetchMessages: (bookingId) => (dispatch) => stopFetchMessages(bookingId)(dispatch)(firebase), 
                fetchWithdraws: () => (dispatch) => fetchWithdraws()(dispatch)(firebase), 
                completeWithdraw: (entry) => (dispatch) => completeWithdraw(entry)(dispatch)(firebase),
                updateBookingImage: (booking, imageType, imageBlob) => (dispatch) => updateBookingImage(booking, imageType, imageBlob)(dispatch)(firebase),
                editLanguage: (data, method) => (dispatch) => editLanguage(data, method)(dispatch)(firebase), 
                fetchLanguages: () => (dispatch) => fetchLanguages()(dispatch)(firebase)
            }
        }
    }

    return (
        <FirebaseContext.Provider value={firebase}>
            {children}
        </FirebaseContext.Provider>
    )
}

export {
    FirebaseContext,
    FirebaseProvider,
    store
}