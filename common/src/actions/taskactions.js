import {
  FETCH_TASKS,
  FETCH_TASKS_SUCCESS,
  FETCH_TASKS_FAILED,
  ACCEPT_TASK,
  CANCEL_TASK,
} from "../store/types";
import store from "../store/store";
import { updateProfile } from "./authactions";
import { RequestPushMsg } from "../other/NotificationFunctions";

export const fetchTasks = () => (dispatch) => (firebase) => {
  const { auth, tasksRef } = firebase;

  let uid = auth.currentUser.uid;
  dispatch({
    type: FETCH_TASKS,
    payload: null,
  });
  tasksRef().on("value", (snapshot) => {
    if (snapshot.val()) {
      let data = snapshot.val();
      const arr = Object.keys(data)
        .filter(
          (i) => data[i].requestedDrivers && data[i].requestedDrivers[uid]
        )
        .map((i) => {
          data[i].id = i;
          return data[i];
        });
      dispatch({
        type: FETCH_TASKS_SUCCESS,
        payload: arr,
      });
    } else {
      dispatch({
        type: FETCH_TASKS_FAILED,
        payload: store.getState().languagedata.defaultLanguage.no_tasks,
      });
    }
  });
};

export const acceptTask = (userAuthData, task) => (dispatch) => (firebase) => {
  const { trackingRef, singleUserRef, singleBookingRef } = firebase;

  let uid = userAuthData.uid;

  singleUserRef(uid).once("value", (snapshot) => {
    let profile = snapshot.val();

    userAuthData.profile = profile;

    singleBookingRef(task.id)
      .transaction((booking) => {
        if (booking && booking.requestedDrivers) {
          booking.driver = uid;
          booking.driver_image = profile.profile_image
            ? profile.profile_image
            : "";
          booking.driver_name = profile.firstName + " " + profile.lastName;
          booking.driver_contact = profile.mobile;
          booking.driver_token = profile.pushToken;
          booking.vehicle_number = profile.vehicleNumber;
          booking.driverRating = profile.ratings
            ? profile.ratings.userrating
            : "0";
          booking.fleetadmin = profile.fleetadmin ? profile.fleetadmin : "";
          booking.status = "ACCEPTED";
          booking.requestedDrivers = null;
          return booking;
        }
      })
      .then(() => {
        singleBookingRef(task.id)
          .get()
          .then((snapshot) => {
            if (!snapshot.exists()) {
              return;
            } else {
              let requestedDrivers =
                snapshot.val() && snapshot.val().requestedDrivers;
              let driverId = snapshot.val() && snapshot.val().driver;

              if (requestedDrivers == undefined && driverId === uid) {
                updateProfile(userAuthData, { queue: true })(dispatch)(
                  firebase
                );

                RequestPushMsg(task.customer_token, {
                  title:
                    store.getState().languagedata.defaultLanguage
                      .notification_title,
                  msg:
                   profile.firstName +
                    store.getState().languagedata.defaultLanguage
                      .accept_booking_request,
                  screen: "BookedCab",
                  params: { bookingId: task.id },
                })(firebase);

                trackingRef(task.id).push({
                  at: new Date().getTime(),
                  status: "ACCEPTED",
                  lat: profile.location.lat,
                  lng: profile.location.lng,
                });

                dispatch({
                  type: ACCEPT_TASK,
                  payload: { task: task },
                });
              }
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
  });
};

export const cancelTask = (bookingId) => (dispatch) => (firebase) => {
  const { auth, singleTaskRef, singleBookingRef } = firebase;

  let uid = auth.currentUser.uid;

  singleBookingRef(bookingId)
    .transaction((booking) => {
      if (booking && booking.requestedDrivers) {
        if (
          booking.requestedDrivers !== null &&
          Object.keys(booking.requestedDrivers).length === 1
        ) {
          booking.status = "CANCELLED";
          booking.requestedDrivers = null;
          RequestPushMsg(booking.customer_token, {
            title:
              store.getState().languagedata.defaultLanguage.notification_title,
            msg:
              store.getState().languagedata.defaultLanguage.booking_cancelled +
              bookingId,
            screen: "BookedCab",
            params: { bookingId: bookingId },
          })(firebase);
        }
        return booking;
      }
    })
    .then(() => {
      singleTaskRef(uid, bookingId).remove();
      dispatch({
        type: CANCEL_TASK,
        payload: { uid: uid, bookingId: bookingId },
      });
    });
};
