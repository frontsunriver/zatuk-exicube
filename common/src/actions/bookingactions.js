import {
    CONFIRM_BOOKING,
    CONFIRM_BOOKING_SUCCESS,
    CONFIRM_BOOKING_FAILED,
    CLEAR_BOOKING
} from "../store/types";

export const clearBooking = () => (dispatch) => (firebase) => {
    dispatch({
        type: CLEAR_BOOKING,
        payload: null,
    });
}

export const addBooking = (bookingData) => (dispatch) => async (firebase) => {

    const   {
        bookingRef,
        appcat,
        settingsRef
    } = firebase;

    dispatch({
        type: CONFIRM_BOOKING,
        payload: bookingData,
    });
    let pickUp = { lat: bookingData.pickup.coords.lat, lng: bookingData.pickup.coords.lng, add: bookingData.pickup.description };
    let drop = { lat: bookingData.drop.coords.lat, lng: bookingData.drop.coords.lng, add: bookingData.drop.description };
    
    let coords = [{latitude: pickUp.lat,longitude: pickUp.lng}];
    if(bookingData.drop.waypointsStr){
        bookingData.drop.waypointsStr.split("|").forEach((point)=>{
            let lat = point.split(',')[0];
            let lng = point.split(',')[1];
            coords.push({latitude: parseFloat(lat), longitude: parseFloat(lng)});
        });
    }
    coords.push({latitude: drop.lat,longitude: drop.lng});
    
    var otp;
    if(bookingData.settings.otp_secure)
        otp = Math.floor(Math.random() * 90000) + 10000;
    else{
        otp = false;
    }
    let today = new Date().getTime();

    const settingsdata = await settingsRef.once("value");
    const settings = settingsdata.val();
    var data = {
        carType: bookingData.carDetails.name,
        carImage: bookingData.carDetails.image,
        customer: bookingData.userDetails.uid,
        customer_email: bookingData.userDetails.profile.email,
        customer_name: bookingData.userDetails.profile.firstName + ' ' + bookingData.userDetails.profile.lastName,
        customer_contact: bookingData.userDetails.profile.mobile? bookingData.userDetails.profile.mobile: ' ',
        customer_token: bookingData.userDetails.profile.pushToken? bookingData.userDetails.profile.pushToken: ' ',
        customer_image: bookingData.userDetails.profile.profile_image ? bookingData.userDetails.profile.profile_image : "",
        drop: drop,
        pickup: pickUp,
        estimate: bookingData.estimate.estimateFare,
        estimateDistance: bookingData.estimate.estimateDistance,
        distance: bookingData.estimate.estimateDistance,
        estimateTime:bookingData.estimate.estimateTime,
        status: (appcat == 'taxi') || bookingData.booking_type_admin ? "NEW" : "PAYMENT_PENDING",
        bookLater:bookingData.bookLater,
        tripdate: bookingData.bookLater?bookingData.tripdate:today,
        bookingDate: today,
        otp: otp,
        booking_type_admin:bookingData.booking_type_admin,
        coords: coords,
        waypoints: bookingData.drop.waypoints? bookingData.drop.waypoints: null,
        trip_cost: bookingData.estimate.estimateFare,
        convenience_fees: bookingData.estimate.convenience_fees,
        driver_share: (parseFloat(bookingData.estimate.estimateFare) - parseFloat(bookingData.estimate.convenience_fees)).toFixed(settings.decimal),
        paymentPacket: bookingData.paymentPacket? bookingData.paymentPacket : null,
        ...bookingData.instructionData
    }

    bookingRef.push(data).then((res) => {
        var bookingKey = res.key;
        dispatch({
            type: CONFIRM_BOOKING_SUCCESS,
            payload: {
                booking_id:bookingKey,
                mainData:{
                    ...data,
                    id:bookingKey
                }
            }    
        });
    }).catch(error => {
        dispatch({
            type: CONFIRM_BOOKING_FAILED,
            payload: error.code + ": " + error.message,
        });
    });
};

