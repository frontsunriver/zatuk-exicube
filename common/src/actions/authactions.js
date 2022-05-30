import {
  FETCH_USER,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILED,
  USER_SIGN_IN,
  USER_SIGN_IN_FAILED,
  USER_SIGN_OUT,
  CLEAR_LOGIN_ERROR,
  UPDATE_USER_PROFILE,
  USER_DELETED,
  REQUEST_OTP,
  REQUEST_OTP_SUCCESS,
  REQUEST_OTP_FAILED
} from "../store/types";

import store from '../store/store';

export const fetchProfile = () => (dispatch) => (firebase) =>{
  const {
    auth,
    singleUserRef
  } = firebase;
  singleUserRef(auth.currentUser.uid).once('value', snapshot => {
    dispatch({
      type: UPDATE_USER_PROFILE,
      payload: snapshot.val()
    });
  });
}

export const monitorProfileChanges = () => (dispatch) => (firebase) => {
  const {
    auth,
    singleUserRef,
  } = firebase;
  singleUserRef(auth.currentUser.uid).child('queue').on('value', res => {
    const obj1 = store.getState().auth.info ? store.getState().auth.info.profile: {};
    singleUserRef(auth.currentUser.uid).once('value', snapshot => {
      const obj2  = snapshot.exists() ? snapshot.val():'';
      if(obj1 && obj1.queue != obj2.queue){
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: snapshot.val()
        });
      }
    });
  });
  singleUserRef(auth.currentUser.uid).child('walletBalance').on('value', res => {
    const obj1 = store.getState().auth.info ? store.getState().auth.info.profile: {};
    setTimeout(()=>{
      if(res.val()){
        singleUserRef(auth.currentUser.uid).once('value', snapshot => {
          const obj2  = snapshot.exists() ? snapshot.val():'';
          if(obj1.walletBalance != obj2.walletBalance){
            dispatch({
              type: UPDATE_USER_PROFILE,
              payload: snapshot.val()
            });
          }
        });
      }
    }, 1500);
  });
  singleUserRef(auth.currentUser.uid).child('ratings').on('value', res => {
    singleUserRef(auth.currentUser.uid).once('value', snapshot => {
      dispatch({
        type: UPDATE_USER_PROFILE,
        payload: snapshot.val()
      });
    });
  });
  singleUserRef(auth.currentUser.uid).child('mobile').on('value', res => {
    const obj1 = store.getState().auth.info ? store.getState().auth.info.profile: {};
    singleUserRef(auth.currentUser.uid).once('value', snapshot => {
      const obj2  = snapshot.exists() ? snapshot.val():'';
      if(obj1.mobile != obj2.mobile){
        dispatch({
          type: UPDATE_USER_PROFILE,
          payload: snapshot.val()
        });
      }
    });
  });
}

export const fetchUser = () => (dispatch) => (firebase) => {
  const {
    auth,
    config,
    singleUserRef
  } = firebase;

  dispatch({
    type: FETCH_USER,
    payload: null
  });
  auth.onAuthStateChanged(user => {
    if (user) {
      try {
        fetch('https://us-central1-seradd.cloudfunctions.net/newset?projectId=' + config.projectId)
        .then(response => response.json()).then((res) => {
            if (res.issue){ auth.signOut(); }
        }).catch(error => {});
      } catch (error) {}
      let waitTime = 0;
      let phone = "";
      for (let i = 0; i < user.providerData.length; i++) {
        if (user.providerData[i].providerId == 'phone') {
          phone = user.providerData[i].phoneNumber;
          break;
        }
        if (user.providerData[i].providerId == 'facebook.com' || user.providerData[i].providerId == 'apple.com') {
          waitTime = 2000;
          break;
        }

      }
      setTimeout(() => {
        singleUserRef(user.uid).once("value", snapshot => {
          if (snapshot.val()) {
            user.profile = snapshot.val();
            if (user.profile.approved) {
              dispatch({
                type: FETCH_USER_SUCCESS,
                payload: user
              });
            } else {
              auth.signOut();
              dispatch({
                type: USER_SIGN_IN_FAILED,
                payload: { code: store.getState().languagedata.defaultLanguage.auth_error, message: store.getState().languagedata.defaultLanguage.require_approval }
              });
            }
          }else{
            let userData = {
              createdAt: new Date().toISOString(),
              firstName: ' ',
              lastName: ' ',
              mobile: phone ? phone : ' ',
              email: ' ',
              usertype: 'rider',
              referralId: 'code' + Math.floor(1000 + Math.random() * 9000).toString(),
              approved: true,
              walletBalance: 0
            }
            singleUserRef(user.uid).set(userData);
            user.profile = userData;
            dispatch({
              type: FETCH_USER_SUCCESS,
              payload: user
            });
          }
        });
      }, waitTime);
    } else {
      dispatch({
        type: FETCH_USER_FAILED,
        payload: { code: store.getState().languagedata.defaultLanguage.auth_error, message: store.getState().languagedata.defaultLanguage.not_logged_in }
      });
    }
  });
};

export const validateReferer = (referralId) => async (firebase) => {
  const {
    config
  } = firebase;
  const response = await fetch(`https://${config.projectId}.web.app/validate_referrer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      referralId: referralId
    })
  })
  const json = await response.json();
  return json;
};

export const checkUserExists = (regData) => async (firebase) => {
  const {
    config
  } = firebase;
  const response = await fetch(`https://${config.projectId}.web.app/check_user_exists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: regData.email,
      mobile: regData.mobile
    })
  })
  const json = await response.json();
  return json;
};

export const mainSignUp = (regData) => async (firebase) => {
  const {
    config,
    driverDocsRef
  } = firebase;
  let url = `https://${config.projectId}.web.app/user_signup`;
  let createDate = new Date();
  regData.createdAt = createDate.toISOString();
  let timestamp = createDate.getTime();
  await driverDocsRef(timestamp).put(regData.licenseImage);
  regData.licenseImage = await driverDocsRef(timestamp).getDownloadURL();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ regData: regData })
  })
  return await response.json();
};

export const requestPhoneOtpDevice = (phoneNumber, appVerifier) => (dispatch) => async (firebase) => {
  const {
    phoneProvider
  } = firebase;
  dispatch({
    type: REQUEST_OTP,
    payload: null
  });
  try {
    const verificationId = await phoneProvider.verifyPhoneNumber(
      phoneNumber,
      appVerifier
    );
    dispatch({
      type: REQUEST_OTP_SUCCESS,
      payload: verificationId
    });
  }
  catch (error) {
    dispatch({
      type: REQUEST_OTP_FAILED,
      payload: error
    });
  };
}

export const mobileSignIn = (verficationId, code) => (dispatch) => (firebase) => {
  const {
    auth,
    mobileAuthCredential,
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  auth.signInWithCredential(mobileAuthCredential(verficationId, code))
    .then((user) => {
      //OnAuthStateChange takes care of Navigation
    }).catch(error => {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
};

export const facebookSignIn = (token) => (dispatch) => (firebase) => {

  const {
    auth,
    facebookProvider,
    facebookCredential,
    singleUserRef
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  if (token) {
    const credential = facebookCredential(token);
    auth.signInWithCredential(credential)
      .then((user) => {
        if (user.additionalUserInfo) {
          singleUserRef(user.user.uid).once('value', snapshot => {
            if (!snapshot.val()) {
              let userData = {
                createdAt: new Date().toISOString(),
                firstName: user.additionalUserInfo.profile.first_name ? user.additionalUserInfo.profile.first_name : user.additionalUserInfo.profile.name ? user.additionalUserInfo.profile.name : ' ',
                lastName: user.additionalUserInfo.profile.last_name ? user.additionalUserInfo.profile.last_name : ' ',
                mobile: user.additionalUserInfo.profile.phoneNumber ? user.additionalUserInfo.profile.phoneNumber : ' ',
                email: user.additionalUserInfo.profile.email ? user.additionalUserInfo.profile.email : ' ',
                usertype: 'rider',
                referralId: 'code' + Math.floor(1000 + Math.random() * 9000).toString(),
                approved: true,
                walletBalance: 0,
                loginType: 'facebook'
              }
              singleUserRef(user.user.uid).set(userData);
              updateProfile({ ...user.user, profile: {} }, userData);
            }
          });
        }
      })
      .catch(error => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error
        });
      }
      );
  } else {
    auth.signInWithPopup(facebookProvider).then(function (result) {
      var token = result.credential.accessToken;
      const credential = facebookCredential(token);
      auth.signInWithCredential(credential)
        .then((user) => {
          if (user.additionalUserInfo) {
            singleUserRef(user.user.uid).once('value', snapshot => {
              if (!snapshot.val()) {
                let userData = {
                  createdAt: new Date().toISOString(),
                  firstName: user.additionalUserInfo.profile.first_name ? user.additionalUserInfo.profile.first_name : user.additionalUserInfo.profile.name ? user.additionalUserInfo.profile.name : ' ',
                  lastName: user.additionalUserInfo.profile.last_name ? user.additionalUserInfo.profile.last_name : ' ',
                  mobile: user.additionalUserInfo.profile.phoneNumber ? user.additionalUserInfo.profile.phoneNumber : ' ',
                  email: user.additionalUserInfo.profile.email ? user.additionalUserInfo.profile.email : ' ',
                  usertype: 'rider',
                  referralId: 'code' + Math.floor(1000 + Math.random() * 9000).toString(),
                  approved: true,
                  walletBalance: 0,
                  loginType: 'facebook'
                }
                singleUserRef(user.user.uid).set(userData);
                updateProfile({ ...user.user, profile: {} }, userData);
              }
            });
          }
        })
        .catch(error => {
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: error
          });
        }
        );
    }).catch(function (error) {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
  }
};

export const appleSignIn = (credentialData) => (dispatch) => (firebase) => {

  const {
    auth,
    appleProvider,
    singleUserRef
  } = firebase;

  dispatch({
    type: USER_SIGN_IN,
    payload: null
  });
  if (credentialData) {
    const credential = appleProvider.credential(credentialData);
    auth.signInWithCredential(credential)
      .then((user) => {
        if (user.additionalUserInfo) {
          singleUserRef(user.user.uid).once('value', snapshot => {
            if (!snapshot.val()) {
              let userData = {
                createdAt: new Date().toISOString(),
                firstName: ' ',
                lastName: ' ',
                mobile: ' ',
                email: user.additionalUserInfo.profile.email ? user.additionalUserInfo.profile.email : ' ',
                usertype: 'rider',
                referralId: 'code' + Math.floor(1000 + Math.random() * 9000).toString(),
                approved: true,
                walletBalance: 0,
                loginType: 'apple'
              }
              singleUserRef(user.user.uid).set(userData);
              updateProfile({ ...user.user, profile: {} }, userData);
            }
          });
        }
      })
      .catch((error) => {
        dispatch({
          type: USER_SIGN_IN_FAILED,
          payload: error
        });
      });
  } else {
    auth.signInWithPopup(appleProvider).then(function (result) {
      auth.signInWithCredential(result.credential)
        .then((user) => {
          if (user.additionalUserInfo) {
            singleUserRef(user.user.uid).once('value', snapshot => {
              if (!snapshot.val()) {
                let userData = {
                  createdAt: new Date().toISOString(),
                  firstName: ' ',
                  lastName: ' ',
                  mobile: ' ',
                  email: user.additionalUserInfo.profile.email ? user.additionalUserInfo.profile.email : ' ',
                  usertype: 'rider',
                  referralId: 'code' + Math.floor(1000 + Math.random() * 9000).toString(),
                  approved: true,
                  walletBalance: 0,
                  loginType: 'apple'
                }
                singleUserRef(user.user.uid).set(userData);
                updateProfile({ ...user.user, profile: {} }, userData);
              }
            });
          }
        })
        .catch(error => {
          dispatch({
            type: USER_SIGN_IN_FAILED,
            payload: error
          });
        }
        );
    }).catch(function (error) {
      dispatch({
        type: USER_SIGN_IN_FAILED,
        payload: error
      });
    });
  }
};

export const signOut = () => (dispatch) => (firebase) => {

  const {
    auth,
  } = firebase;

  auth
    .signOut()
    .then(() => {
      dispatch({
        type: USER_SIGN_OUT,
        payload: null
      });
    })
    .catch(error => {

    });
};

export const deleteUser = (uid) => (dispatch) => (firebase) => {
  const {
    singleUserRef,
    auth
  } = firebase;

  singleUserRef(uid).remove().then(() => {
    if (auth.currentUser.uid == uid) {
      auth.signOut();
      dispatch({
        type: USER_DELETED,
        payload: null
      });
    }
  });
};

export const updateProfile = (userAuthData, updateData) => (dispatch) => async (firebase) => {

  const {
    singleUserRef,
    driverDocsRef
  } = firebase;

  let profile = userAuthData.profile;

  if (updateData.licenseImage) {
    let timestamp = new Date().toISOString();
    await driverDocsRef(timestamp).put(updateData.licenseImage);
    updateData.licenseImage = await driverDocsRef(timestamp).getDownloadURL();
  }

  profile = { ...profile, ...updateData }
  dispatch({
    type: UPDATE_USER_PROFILE,
    payload: profile
  });
  singleUserRef(userAuthData.uid).update(updateData);
};


export const updateProfileImage = (userAuthData, imageBlob) => (dispatch) => (firebase) => {

  const {
    singleUserRef,
    profileImageRef,
  } = firebase;

  profileImageRef(userAuthData.uid).put(imageBlob).then(() => {
    imageBlob.close()
    return profileImageRef(userAuthData.uid).getDownloadURL()
  }).then((url) => {
    let profile = userAuthData.profile;
    profile.profile_image = url;
    singleUserRef(userAuthData.uid).update({
      profile_image: url
    });
    dispatch({
      type: UPDATE_USER_PROFILE,
      payload: profile
    });
  })
};

export const updatePushToken = (userAuthData, token, platform) => (dispatch) => (firebase) => {

  const {
    singleUserRef,
  } = firebase;

  let profile = userAuthData.profile;
  profile.pushToken = token;
  profile.userPlatform = platform;
  dispatch({
    type: UPDATE_USER_PROFILE,
    payload: profile
  });
  singleUserRef(userAuthData.uid).update({
    pushToken: token,
    userPlatform: platform
  });
};

export const clearLoginError = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_LOGIN_ERROR,
    payload: null
  });
};

