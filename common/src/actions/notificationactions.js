import {
  FETCH_NOTIFICATIONS,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAILED,
  EDIT_NOTIFICATIONS,
  SEND_NOTIFICATION,
  SEND_NOTIFICATION_SUCCESS,
  SEND_NOTIFICATION_FAILED,
} from "../store/types";
import { RequestPushMsg } from '../other/NotificationFunctions';

import store from '../store/store';

export const fetchUserNotifications = () => (dispatch) => (firebase) => {

  const {
    auth,
    singleUserRef
  } = firebase;

  dispatch({
    type: FETCH_NOTIFICATIONS,
    payload: null
  });

  singleUserRef(auth.currentUser.uid).child('notifications').on('value', snapshot => {
    const data = snapshot.val(); 
    if(data){
      const arr = Object.keys(data).map(i => {
        data[i].id = i
        return data[i]
      }).sort((a, b) => b.count - a.count > a.count - b.count);
      dispatch({
        type: FETCH_NOTIFICATIONS_SUCCESS,
        payload: arr
      });
    } else {
      dispatch({
        type: FETCH_NOTIFICATIONS_FAILED,
        payload: "No data available."
      });
    }
  });
};

export const fetchNotifications = () => (dispatch) => (firebase) => {

  const {
    notifyRef
  } = firebase;

  dispatch({
    type: FETCH_NOTIFICATIONS,
    payload: null
  });
  notifyRef.on("value", snapshot => {
    if (snapshot.val()) {
      const data = snapshot.val();

      const arr = Object.keys(data).map(i => {
        data[i].id = i
        return data[i]
      });

      dispatch({
        type: FETCH_NOTIFICATIONS_SUCCESS,
        payload: arr
      });
    } else {
      dispatch({
        type: FETCH_NOTIFICATIONS_FAILED,
        payload: "No data available."
      });
    }
  });
};

export const editNotifications = (notification, method) => (dispatch) => (firebase) => {
  const {
    notifyRef,
    notifyEditRef
  } = firebase;
  dispatch({
    type: EDIT_NOTIFICATIONS,
    payload: { method, notification }
  });
  if (method === 'Add') {
    notifyRef.push(notification);
  } else if (method === 'Delete') {
    notifyEditRef(notification.id).remove();
  } else {
    notifyEditRef(notification.id).set(notification);
  }
}

export const sendNotification = (notification) => (dispatch) => async (firebase) => {

  dispatch({
    type: SEND_NOTIFICATION,
    payload: notification
  });

  const users = store.getState().usersdata.users;
  if (users) {
    let arr = [];
    for (let i = 0; i < users.length; i++) {
      let usr = users[i];
      let obj = {
        "to": null,
        "title": notification.title,
        "msg": notification.body,
      };
      if (notification.usertype === 'All' && notification.devicetype === 'All') {
        if (usr.pushToken) {
          obj.to = usr.pushToken;
          arr.push(obj);
        }
      } else if (notification.usertype === 'All' && notification.devicetype !== 'All') {
        if (usr.pushToken && usr.userPlatform === notification.devicetype) {
          obj.to = usr.pushToken;
          arr.push(obj);
        }
      } else if (notification.usertype !== 'All' && notification.devicetype === 'All') {
        if (usr.pushToken && usr.usertype === notification.usertype) {
          obj.to = usr.pushToken;
          arr.push(obj);
        }
      } else {
        if (usr.pushToken && usr.usertype === notification.usertype && usr.userPlatform === notification.devicetype) {
          obj.to = usr.pushToken;
          arr.push(obj);
        }
      }
    }

    if (arr.length > 0) {
      for (let x = 0; x < arr.length; x++) {
        RequestPushMsg(arr[x].to, {
          title: arr[x].title, msg: arr[x].msg
        })(firebase);
      }
      dispatch({
        type: SEND_NOTIFICATION_SUCCESS,
        payload: arr
      });
    } else {
      dispatch({
        type: SEND_NOTIFICATION_FAILED,
        payload: store.getState().languagedata.defaultLanguage.no_user_match,
      });
    }
  } else {
    dispatch({
      type: SEND_NOTIFICATION_FAILED,
      payload: store.getState().languagedata.defaultLanguage.no_user_match,
    });
  }
}
