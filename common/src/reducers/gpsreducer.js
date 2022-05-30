import {
    UPDATE_GPS_LOCATION,
  } from "../store/types";
  
  const INITIAL_STATE = {
    location: null,
    error:false
  }
export const gpsreducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case UPDATE_GPS_LOCATION:
            return {
                location: action.payload && action.payload.lat? action.payload : null,
                error: action.payload && action.payload.lat? false : true
            };
        default:
            return state;
    }
};