import {
  FETCH_SETTINGS,
  FETCH_SETTINGS_SUCCESS,
  FETCH_SETTINGS_FAILED,
  EDIT_SETTINGS,
  CLEAR_SETTINGS_ERROR
} from "../store/types";

import store from '../store/store';

export const fetchSettings= () => (dispatch) => (firebase) => {

  const {
    settingsRef
  } = firebase;

  dispatch({
    type: FETCH_SETTINGS,
    payload: null,
  });
  settingsRef.on("value", (snapshot) => {
    if (snapshot.val()) {
      dispatch({
        type: FETCH_SETTINGS_SUCCESS,
        payload: snapshot.val(),
      });
    } else {
      dispatch({
        type: FETCH_SETTINGS_FAILED,
        payload: "Unable to fetch database and settings.",
      });
    }
  });
};

export const editSettings = (settings) => (dispatch) => (firebase) => {
  const {
    settingsRef
  } = firebase;
  dispatch({
    type: EDIT_SETTINGS,
    payload: settings
  });
  settingsRef.set(settings);
  alert(store.getState().languagedata.defaultLanguage.updated);
};

export const clearSettingsViewError = () => (dispatch) => (firebase) => {
  dispatch({
    type: CLEAR_SETTINGS_ERROR,
    payload: null
  });
};