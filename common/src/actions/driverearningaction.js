import {
  FETCH_DRIVERS_EARNING,
  FETCH_DRIVERS__EARNING_SUCCESS,
  FETCH_DRIVERS__EARNING_FAILED,
} from "../store/types";

export const fetchDriverEarnings = (uid,role) => (dispatch) => async (firebase) => {

  const {
    bookingListRef,
    settingsRef
  } = firebase;

  dispatch({
    type: FETCH_DRIVERS_EARNING,
    payload: null
  });

  const settingsdata = await settingsRef.once("value");
  const settings = settingsdata.val();
    bookingListRef(uid,role).on("value", snapshot => {
      if (snapshot.val()) {
        const mainArr = snapshot.val();
        var monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var renderobj = {};
        Object.keys(mainArr).map(j => {

          if ((mainArr[j].status === 'PAID' || mainArr[j].status === 'COMPLETE') && mainArr[j].driver_share !== undefined) {
            let bdt = new Date(mainArr[j].tripdate);
            let uniqueKey = bdt.getFullYear() + '_' + bdt.getMonth() + '_' + mainArr[j].driver;
            if (renderobj[uniqueKey] && renderobj[uniqueKey].driverShare > 0) {
              renderobj[uniqueKey].driverShare = (parseFloat(renderobj[uniqueKey].driverShare) + parseFloat(mainArr[j].driver_share)).toFixed(settings.decimal);
              renderobj[uniqueKey]['total_rides'] = renderobj[uniqueKey]['total_rides'] + 1;
            } else {
              renderobj[uniqueKey] = {};
              renderobj[uniqueKey]['dated'] = mainArr[j].tripdate;
              renderobj[uniqueKey]['year'] = bdt.getFullYear();
              renderobj[uniqueKey]['month'] = bdt.getMonth();
              renderobj[uniqueKey]['monthsName'] = monthsName[bdt.getMonth()];
              renderobj[uniqueKey]['driverName'] = mainArr[j].driver_name;
              renderobj[uniqueKey]['driverShare'] = parseFloat(mainArr[j].driver_share).toFixed(settings.decimal);
              renderobj[uniqueKey]['driverVehicleNo'] = mainArr[j].vehicle_number;
              renderobj[uniqueKey]['driverUId'] = mainArr[j].driver;
              renderobj[uniqueKey]['uniqueKey'] = uniqueKey;
              renderobj[uniqueKey]['total_rides'] = 1;
            }
          }
          return null;
        });
        if (renderobj) {
          const arr = Object.keys(renderobj).map(i => {
            renderobj[i].driverShare = parseFloat(renderobj[i].driverShare).toFixed(settings.decimal)
            return renderobj[i]
          })
          dispatch({
            type: FETCH_DRIVERS__EARNING_SUCCESS,
            payload: arr
          });
        }

      } else {
        dispatch({
          type: FETCH_DRIVERS__EARNING_FAILED,
          payload: "No data available."
        });
      }
    });
};

