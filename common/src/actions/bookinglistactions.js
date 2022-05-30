import {
  FETCH_BOOKINGS,
  FETCH_BOOKINGS_SUCCESS,
  FETCH_BOOKINGS_FAILED,
  UPDATE_BOOKING,
  CANCEL_BOOKING
} from "../store/types";
import { fetchBookingLocations } from '../actions/locationactions';
import { RequestPushMsg } from '../other/NotificationFunctions';
import { FareCalculator } from '../other/FareCalculator';
import { GetDistance, GetTripDistance } from '../other/GeoFunctions';
import { fetchAddressfromCoords } from '../other/GoogleAPIFunctions'; 
import store from '../store/store';

export const fetchBookings = (uid, role) => (dispatch) => (firebase) => {

  const {
    bookingListRef,
  } = firebase;

  dispatch({
    type: FETCH_BOOKINGS,
    payload: null,
  });
  bookingListRef(uid, role).on("value", (snapshot) => {
    if (snapshot.val()) {
      const data = snapshot.val();
      const active = [];
      let tracked = null;
      const bookings = Object.keys(data)
        .map((i) => {
          data[i].id = i;
          data[i].pickupAddress = data[i].pickup.add;
          data[i].dropAddress = data[i].drop.add;
          data[i].discount = data[i].discount_amount
            ? data[i].discount_amount
            : 0;
          data[i].cashPaymentAmount = data[i].cashPaymentAmount
            ? data[i].cashPaymentAmount
            : 0;
          data[i].cardPaymentAmount = data[i].cardPaymentAmount
            ? data[i].cardPaymentAmount
            : 0;
          return data[i];
        });
      for (let i = 0; i < bookings.length; i++) {
        if (['PAYMENT_PENDING','NEW', 'ACCEPTED', 'ARRIVED', 'STARTED', 'REACHED', 'PENDING', 'PAID'].indexOf(bookings[i].status) != -1) {
          active.push(bookings[i]);
        }
        if ((['ACCEPTED', 'ARRIVED', 'STARTED'].indexOf(bookings[i].status) != -1) && role == 'driver') {
          tracked = bookings[i];
          fetchBookingLocations(tracked.id)(dispatch)(firebase);
        }
      }
      dispatch({
        type: FETCH_BOOKINGS_SUCCESS,
        payload: {
          bookings: bookings.reverse(),
          active: active,
          tracked: tracked
        },
      });
      if (tracked) {
        dispatch({
          type: FETCH_BOOKINGS_SUCCESS,
          payload: null
        });
      }
    } else {
      dispatch({
        type: FETCH_BOOKINGS_FAILED,
        payload: store.getState().languagedata.defaultLanguage.no_bookings,
      });
    }
  });
};

export const updateBooking = (booking) => (dispatch) => async (firebase) => {

  const {
    appcat,
    auth,
    trackingRef,
    singleBookingRef,
    singleUserRef,
    walletBalRef,
    walletHistoryRef,
    settingsRef
  } = firebase;

  dispatch({
    type: UPDATE_BOOKING,
    payload: booking,
  });
  
  if (booking.status == 'PAYMENT_PENDING') {
    singleBookingRef(booking.id).update(booking);
  }
  if (booking.status == 'NEW') {
    singleBookingRef(booking.id).update(booking);
  }
  if (booking.status == 'ARRIVED') {
    let dt = new Date();
    booking.driver_arrive_time = dt.getTime().toString();
    singleBookingRef(booking.id).update(booking);
    RequestPushMsg(
      booking.customer_token,
      {
          title: store.getState().languagedata.defaultLanguage.notification_title,
          msg: store.getState().languagedata.defaultLanguage.driver_near,
          screen: 'BookedCab',
          params: { bookingId: booking.id }
      })(firebase);
  }
  if (booking.status == 'STARTED') {
    let dt = new Date();
    let localString = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    let timeString = dt.getTime();
    booking.trip_start_time = localString;
    booking.startTime = timeString;
    singleBookingRef(booking.id).update(booking);

    singleUserRef(booking.driver).once('value', snapshot => {
      let profile = snapshot.val();
      trackingRef(booking.id).push({
        at: new Date().getTime(),
        status: 'STARTED',
        lat: profile.location.lat,
        lng: profile.location.lng
      });
    })

    RequestPushMsg(
      booking.customer_token,
      {
          title: store.getState().languagedata.defaultLanguage.notification_title,
          msg: store.getState().languagedata.defaultLanguage.driver_journey_msg + booking.id,
          screen: 'BookedCab',
          params: { bookingId: booking.id }
      })(firebase);
  }
  if (booking.status == 'REACHED') {

    const driverProfile = await singleUserRef(booking.driver).once('value');
    const driverLocation = driverProfile.val().location;

    trackingRef(booking.id).push({
      at: new Date().getTime(),
      status: 'REACHED',
      lat: driverLocation.lat,
      lng: driverLocation.lng
    });

    let address = booking.drop.add;

    if(appcat == 'taxi'){
      let latlng = driverLocation.lat + ',' + driverLocation.lng;
      address = await fetchAddressfromCoords(latlng)(firebase);
    }

    singleUserRef(booking.customer).child('savedAddresses').once('value',savedAdd => {
        if(savedAdd.val()){
          let addresses = savedAdd.val();
          let didNotMatch = true; 
          for (let key in addresses) {
            let entry = addresses[key];
            if(GetDistance(entry.lat,entry.lng, appcat == 'taxi'? driverLocation.lat : booking.drop.lat, appcat == 'taxi'? driverLocation.lng : booking.drop.lng) < 0.1){
                didNotMatch = false;
                let count = entry.count? entry.count + 1 : 1
                singleUserRef(booking.customer).child('savedAddresses/' + key).update({count: count})
                break;
            }
          }
          if(didNotMatch){
            singleUserRef(booking.customer).child('savedAddresses').push({
              description: address,
              lat: appcat == 'taxi'? driverLocation.lat : booking.drop.lat,
              lng: appcat == 'taxi'? driverLocation.lng : booking.drop.lng,
              count:1
            });
          }  
        }else{
          singleUserRef(booking.customer).child('savedAddresses').push({
            description: address,
            lat: appcat == 'taxi'? driverLocation.lat : booking.drop.lat,
            lng: appcat == 'taxi'? driverLocation.lng : booking.drop.lng,
            count:1
          });
        }
    });

    const end_time = new Date();
    const diff = (end_time.getTime() - parseFloat(booking.startTime)) / 1000;
    const totalTimeTaken = Math.abs(Math.round(diff));
    booking.trip_end_time = end_time.getHours() + ":" + end_time.getMinutes() + ":" + end_time.getSeconds();
    booking.endTime = end_time.getTime();
    booking.total_trip_time = totalTimeTaken;

    if(appcat == 'taxi'){
      let cars = store.getState().cartypes.cars;
      let rates = {};
      for (var i = 0; i < cars.length; i++) {
        if (cars[i].name == booking.carType) {
          rates = cars[i];
        }
      }
      const trackingSnap = await trackingRef(booking.id).orderByKey().once('value');
      const trackingVal = trackingSnap.val();
      const res = await GetTripDistance(trackingVal)(firebase);
      const settingsdata = await settingsRef.once("value");
      const settings = settingsdata.val();
      const distance = settings.convert_to_mile? (res.distance / 1.609344) : res.distance;
      const { grandTotal, convenience_fees} = FareCalculator(distance, totalTimeTaken, rates, null, settings.decimal);
      booking.drop = { 
        add: address,
        lat: driverLocation.lat,
        lng: driverLocation.lng
      };
      booking.dropAddress = address;
      booking.trip_cost = grandTotal;
      booking.distance = parseFloat(distance).toFixed(settings.decimal);
      booking.convenience_fees = convenience_fees;
      booking.driver_share = (grandTotal - convenience_fees).toFixed(settings.decimal);
      booking.coords = res.coords;
    }
    singleBookingRef(booking.id).update(booking);
    RequestPushMsg(
      booking.customer_token,
      {
          title: store.getState().languagedata.defaultLanguage.notification_title,
          msg: store.getState().languagedata.defaultLanguage.driver_completed_ride,
          screen: 'BookedCab',
          params: { bookingId: booking.id }
      })(firebase);
  }
  if (booking.status == 'PENDING') {
    singleBookingRef(booking.id).update(booking);
    singleUserRef(booking.driver).update({ queue: false });
  }
  if (booking.status == 'PAID') {
    const settingsdata = await settingsRef.once("value");
    const settings = settingsdata.val();
    singleBookingRef(booking.id).update(booking);
    if(booking.driver == auth.currentUser.uid && (booking.prepaid || booking.payment_mode == 'cash' || booking.payment_mode == 'wallet')){
      singleUserRef(booking.driver).update({ queue: false });
    }

    singleUserRef(booking.driver).once('value', snapshot => {
      let walletBalance = parseFloat(snapshot.val().walletBalance);
      walletBalance = walletBalance + parseFloat(booking.driver_share);
      if(parseFloat(booking.cashPaymentAmount)>0){
        walletBalance = walletBalance - parseFloat(booking.cashPaymentAmount);
      }
      walletBalRef(booking.driver).set(parseFloat(walletBalance.toFixed(settings.decimal)));

      let details = {
        type: 'Credit',
        amount: parseFloat(booking.driver_share).toFixed(settings.decimal),
        date: new Date().toString(),
        txRef: booking.id
      }
      walletHistoryRef(booking.driver).push(details);
      
      if(parseFloat(booking.cashPaymentAmount)>0){
        let details = {
          type: 'Debit',
          amount: booking.cashPaymentAmount,
          date: new Date().toString(),
          txRef: booking.id
        }
        walletHistoryRef(booking.driver).push(details);
      }  
    });

    RequestPushMsg(
      booking.customer_token,
      {
          title: store.getState().languagedata.defaultLanguage.notification_title,
          msg: store.getState().languagedata.defaultLanguage.success_payment,
          screen: 'BookedCab',
          params: { bookingId: booking.id }
      })(firebase);
      RequestPushMsg(
        booking.driver_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg: store.getState().languagedata.defaultLanguage.success_payment,
            screen: 'BookedCab',
            params: { bookingId: booking.id }
        })(firebase);
  }
  if (booking.status == 'COMPLETE') {
    singleBookingRef(booking.id).update(booking);
    if (booking.rating) {
      RequestPushMsg(
        booking.driver_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg:  store.getState().languagedata.defaultLanguage.received_rating.toString().replace("X", booking.rating.toString()),
            screen: 'BookedCab',
            params: { bookingId: booking.id }
        })(firebase);
      singleUserRef(booking.driver).once('value', snapshot => {
        let profile = snapshot.val();
        let ratings = {};
        if (profile && profile.ratings) {
          ratings = profile.ratings
          let details = ratings.details;
          let sum = 0;
          for (let i = 0; i < details.length; i++) {
            sum = sum + parseFloat(details[i].rate);
          }
          sum = sum + booking.rating;
          ratings.userrating = parseFloat(sum / (details.length + 1)).toFixed(1);
          ratings.details.push({
            user: booking.customer,
            rate: booking.rating
          });
        } else {
          ratings.userrating = booking.rating;
          ratings.details = [];
          ratings.details.push({
            user: booking.customer,
            rate: booking.rating
          });
        }
        singleUserRef(booking.driver).update({ratings: ratings});
      });
    }
  }
};

export const cancelBooking = (data) => (dispatch) => (firebase) => {
  const {
    singleBookingRef,
    singleUserRef,
    requestedDriversRef
  } = firebase;

  dispatch({
    type: CANCEL_BOOKING,
    payload: data,
  });

  singleBookingRef(data.booking.id).update({
    status: 'CANCELLED',
    reason: data.reason,
    cancelledBy: data.cancelledBy
  }).then(() => {
    if (data.booking.driver && (data.booking.status === 'ACCEPTED' || data.booking.status === 'ARRIVED')) {
      singleUserRef(data.booking.driver).update({ queue: false });
      RequestPushMsg(
        booking.driver_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg:  store.getState().languagedata.defaultLanguage.booking_cancelled + data.booking.id,
            screen: 'BookedCab',
            params: { bookingId: data.booking.id }
        })(firebase);
      RequestPushMsg(
        booking.customer_token,
        {
            title: store.getState().languagedata.defaultLanguage.notification_title,
            msg:  store.getState().languagedata.defaultLanguage.booking_cancelled + data.booking.id,
            screen: 'BookedCab',
            params: { bookingId: data.booking.id }
        })(firebase);
    }
    if (data.booking.status === 'NEW') {
      requestedDriversRef(data.booking.id).remove();
    }
  });
};

export const updateBookingImage = (booking, imageType, imageBlob) => (dispatch) => (firebase) => {
  const   {
    singleBookingRef,
    bookingImageRef
  } = firebase;
  bookingImageRef(booking.id,imageType).put(imageBlob).then(() => {
    imageBlob.close()
    return bookingImageRef(booking.id,imageType).getDownloadURL()
  }).then((url) => {
    if(imageType == 'pickup_image'){
      booking.pickup_image = url;
    }
    if(imageType == 'deliver_image'){
      booking.deliver_image = url;
    }
    singleBookingRef(booking.id).update(booking);
    dispatch({
      type: UPDATE_BOOKING,
      payload: booking,
    });
  })
};

