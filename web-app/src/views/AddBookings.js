import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Select,
  MenuItem,
  Grid,
  Typography,
  TextField,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Modal
} from '@material-ui/core';
import GoogleMapsAutoComplete from '../components/GoogleMapsAutoComplete';
import { useSelector, useDispatch } from "react-redux";
import AlertDialog from '../components/AlertDialog';
import { makeStyles } from '@material-ui/core/styles';
import UsersCombo from '../components/UsersCombo';
import { FirebaseContext } from 'common';
import Button from "components/CustomButtons/Button.js";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width:480,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  container: {
    zIndex: "12",
    color: "#FFFFFF",
    alignContent: 'center'
  },
  title: {
    color: "#000",
  },
  gridcontainer: {
    alignContent: 'center'
  },
  items: {
    margin: 0,
    width: '100%'
  },
  input: {
    fontSize: 18,
    color: "#000"
  },
  inputdimmed: {
    fontSize: 18,
    color: "#737373"
  },
  carphoto: {
    height: '18px',
    marginRight: '10px'
  },
  carphotoRtl:{
    height: '16px',
    marginLeft:'10px'
  },
  buttonStyle: {
    margin: 0,
    width: '100%',
    height: '100%'
  },
  inputRtl: {
    "& label": {
      right: 25,
      left: "auto"
    },
    "& legend": {
      textAlign: "right",
      marginRight: 18
    }
  },
  rightRty:{
    "& legend": {
      marginRight: 30
    }
  }
}));

export default function AddBookings(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const { t, i18n  } = useTranslation();
  const isRTL = i18n.dir();
  const {
    getEstimate,
    clearEstimate,
    addBooking,
    clearBooking,
    MinutesPassed,
    GetDateString,
    GetDistance,
  } = api;
  const dispatch = useDispatch();
  const classes = useStyles();
  const cartypes = useSelector(state => state.cartypes.cars);
  const estimatedata = useSelector(state => state.estimatedata);
  const bookingdata = useSelector(state => state.bookingdata);
  const userdata = useSelector(state => state.usersdata);
  const settings = useSelector(state => state.settingsdata.settings);
  const [carType, setCarType] = useState(t('select_car'));
  const [pickupAddress, setPickupAddress] = useState(null);
  const [dropAddress, setDropAddress] = useState(null);
  const [optionModalStatus, setOptionModalStatus] = useState(false);
  const [estimateModalStatus, setEstimateModalStatus] = useState(false);
  const [selectedCarDetails, setSelectedCarDetails] = useState(null);
  const [users, setUsers] = useState(null);
  const [commonAlert, setCommonAlert] = useState({ open: false, msg: '' });
  const [userCombo, setUserCombo] = useState(null);
  const [estimateRequested, setEstimateRequested] = useState(false);
  const [bookingType, setBookingType] = useState('Book Now');
  const rootRef = useRef(null);
  const [tempRoute, setTempRoute] = useState();
  const [drivers,setDrivers] = useState([]);

  const [instructionData,setInstructionData] = useState({
    deliveryPerson : "",
    deliveryPersonPhone: "",
    pickUpInstructions: "",
    deliveryInstructions: "",
    parcelTypeIndex: 0,
    optionIndex: 0,
    parcelTypeSelected: null,
    optionSelected: null
  });

  const handleChange = (e) => {
    if(e.target.name === 'parcelTypeIndex'){
      setInstructionData({ 
        ...instructionData,
        parcelTypeIndex: parseInt(e.target.value),
        parcelTypeSelected: selectedCarDetails.parcelTypes[e.target.value]
      });
    }else if(e.target.name === 'optionIndex'){
      setInstructionData({ 
        ...instructionData,
        optionIndex: parseInt(e.target.value),
        optionSelected: selectedCarDetails.options[e.target.value]
      });
    }else{
      setInstructionData({ ...instructionData, [e.target.name]: e.target.value });
    }
  };

  const [selectedDate, setSelectedDate] = useState(GetDateString());

  const handleCarSelect = (event) => {
    setCarType(event.target.value);
    let carDetails = null;
    for (let i = 0; i < cartypes.length; i++) {
      if (cartypes[i].name === event.target.value) {
        carDetails = cartypes[i];
        let instObj = {...instructionData};
        if(Array.isArray(cartypes[i].parcelTypes)){
          instObj.parcelTypeSelected = cartypes[i].parcelTypes[0];
          instObj.parcelTypeIndex = 0;
        }
        if(Array.isArray(cartypes[i].options)){
          instObj.optionSelected = cartypes[i].options[0];
          instObj.optionIndex = 0;
        }
        setInstructionData(instObj);
      }
    }
    setSelectedCarDetails(carDetails);
  };

  const handleBookTypeSelect = (event) => {
    setBookingType(event.target.value);
    if (bookingType === 'Book Later') {
      setSelectedDate(GetDateString());
    }
  };

  const onDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  useEffect(() => {
    if (estimatedata.estimate && estimateRequested) {
      setEstimateRequested(false);
      setEstimateModalStatus(true);
    }
    if (userdata.users) {
      let arr = [];
      for (let i = 0; i < userdata.users.length; i++) {
        let user = userdata.users[i];
        if (user.usertype === 'rider') {
          arr.push({
            'firstName': user.firstName,
            'lastName': user.lastName,
            'mobile': user.mobile,
            'email': user.email,
            'uid': user.id,
            'desc': user.firstName + ' ' + user.lastName + ' (' + (settings.AllowCriticalEditsAdmin? user.mobile : "Hidden") + ') ' + (settings.AllowCriticalEditsAdmin? user.email : "Hidden"),
            'pushToken': user.pushToken
          });
        }
      }
      setUsers(arr);
      let arrDrivers = [];
      for (let i = 0; i < userdata.users.length; i++) {
        let user = userdata.users[i];
        if ((user.usertype) && (user.usertype === 'driver') && (user.approved === true) && (user.queue === false) && (user.driverActiveStatus === true) && (user.location)) {
          arrDrivers.push({
            'uid': user.id,
            'location': user.location
          });
        }
      }
      setDrivers(arrDrivers);
    }
  }, [estimatedata.estimate, userdata.users, estimateRequested, settings.AllowCriticalEditsAdmin]);

  const mobile = (userCombo && userCombo.mobile ? true : false);

  const handleGetOptions = (e) => {
    e.preventDefault();
    setEstimateRequested(true);
    if (userCombo && pickupAddress && dropAddress && selectedCarDetails) {
      const directionService = new window.google.maps.DirectionsService();
      directionService.route(
        {
          origin: new window.google.maps.LatLng(pickupAddress.coords.lat, pickupAddress.coords.lng),
          destination: new window.google.maps.LatLng(dropAddress.coords.lat, dropAddress.coords.lng),
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            const route = {
              distance_in_km:(result.routes[0].legs[0].distance.value / 1000),
              time_in_secs:result.routes[0].legs[0].duration.value,
              polylinePoints:result.routes[0].overview_polyline
            };
            setTempRoute(route);
            if (bookingType === 'Book Now') {
              if(mobile === true){
                if(Array.isArray(selectedCarDetails.options) || Array.isArray(selectedCarDetails.parcelTypes)){
                  setOptionModalStatus(true);
                }else{
                  let estimateRequest = {
                    pickup: pickupAddress,
                    drop: dropAddress,
                    carDetails: selectedCarDetails,
                    instructionData: instructionData,
                    routeDetails: route
                  };
                  dispatch(getEstimate(estimateRequest));
                }
              }else{
                setCommonAlert({ open: true, msg: t('incomplete_user')});
              }
            } else {
              if (bookingType === 'Book Later' && selectedDate) {
                if (MinutesPassed(selectedDate) >= 15) {
                  if(mobile === true){
                    if(Array.isArray(selectedCarDetails.options) || Array.isArray(selectedCarDetails.parcelTypes)){
                      setOptionModalStatus(true);
                    }else{
                      let estimateRequest = {
                        pickup: pickupAddress,
                        drop: dropAddress,
                        carDetails: selectedCarDetails,
                        instructionData: instructionData,
                        routeDetails: route
                      };
                      dispatch(getEstimate(estimateRequest));
                    }
                  }else{
                    setCommonAlert({ open: true, msg: t('incomplete_user')});
                  }
                } else {
                  setCommonAlert({ open: true, msg: t('past_booking_error') });
                }
              } else {
                setCommonAlert({ open: true, msg: t('select_proper') });
              }
            }
          } else {
            setCommonAlert({ open: true, msg: t('place_to_coords_error') })
          }
        }
      )
    } else {
      setCommonAlert({ open: true, msg: t('select_proper') })
    }    
  }

  const handleGetEstimate = (e) => {
    e.preventDefault();
    setOptionModalStatus(false);
    let estimateRequest = {
      pickup: pickupAddress,
      drop: dropAddress,
      carDetails: selectedCarDetails,
      instructionData: instructionData,
      routeDetails: tempRoute
    };
    dispatch(getEstimate(estimateRequest));
  };

  const confirmBooking = (e) => {
    e.preventDefault();
    let found = false;
    if(bookingType === 'Book Now'){
      for(let i=0; i< drivers.length;i++){
        const driver = drivers[i];
        let distance = GetDistance(pickupAddress.coords.lat, pickupAddress.coords.lng, driver.location.lat, driver.location.lng);
        if (settings.convert_to_mile) {
            distance = distance / 1.609344;
        }
        if (distance < ((settings && settings.driverRadius) ? settings.driverRadius : 10)) {
          found = true;
          break;
        }
      }
    }
    if((found && bookingType ==='Book Now') || bookingType === 'Book Later'){
      if (appcat==='delivery') {
        const regx1 = /([0-9\s-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
        if (/\S/.test(instructionData.deliveryPerson) && regx1.test(instructionData.deliveryPersonPhone) && instructionData.deliveryPersonPhone && instructionData.deliveryPersonPhone.length > 6) {
          setEstimateModalStatus(false);
          let bookingObject = {
            pickup: pickupAddress,
            drop: dropAddress,
            carDetails: selectedCarDetails,
            userDetails: {
              uid: userCombo.uid,
              profile: {
                firstName: userCombo.firstName,
                lastName: userCombo.lastName,
                mobile: userCombo.mobile,
                pushToken: userCombo.pushToken,
                email: userCombo.email
              }
            },
            estimate: estimatedata.estimate,
            instructionData: instructionData,
            tripdate: bookingType === 'Book Later'? new Date(selectedDate).getTime(): new Date().getTime(),
            bookLater: bookingType === 'Book Later' ? true : false,
            settings: settings,
            booking_type_admin: true
          };
          dispatch(addBooking(bookingObject));
        } else{
          setCommonAlert({ open: true, msg: t('deliveryDetailMissing') });
        }
      }else{
        setEstimateModalStatus(false);
        let bookingObject = {
          pickup: pickupAddress,
          drop: dropAddress,
          carDetails: selectedCarDetails,
          userDetails: {
            uid: userCombo.uid,
            profile: {
              firstName: userCombo.firstName,
              lastName: userCombo.lastName,
              mobile: userCombo.mobile,
              pushToken: userCombo.pushToken,
              email: userCombo.email
            }
          },
          estimate: estimatedata.estimate,
          tripdate: bookingType === 'Book Later'? new Date(selectedDate).getTime(): new Date().getTime(),
          bookLater: bookingType === 'Book Later' ? true : false,
          settings: settings,
          booking_type_admin: false
        };
        dispatch(addBooking(bookingObject));
      }
    } else{
      setCommonAlert({ open: true, msg: t('no_driver_found_alert_messege') });
    }
  };

  const handleOptionModalClose = (e) => {
    e.preventDefault();
    setOptionModalStatus(false);
  };

  const handleEstimateModalClose = (e) => {
    e.preventDefault();
    setEstimateModalStatus(false);
    dispatch(clearEstimate());
    setEstimateRequested(false);
  };

  const handleEstimateErrorClose = (e) => {
    e.preventDefault();
    dispatch(clearEstimate());
    setEstimateRequested(false);
  };

  const handleBookingAlertClose = (e) => {
    e.preventDefault();
    dispatch(clearBooking());
    dispatch(clearEstimate());
    clearForm();
  };

  const clearForm = () => {
    setUserCombo(null);
    setPickupAddress(null);
    setDropAddress(null);
    setSelectedCarDetails(null);
    setCarType(t('select_car'));
    setBookingType('Book Now');
    setEstimateRequested(false);
  }

  const handleBookingErrorClose = (e) => {
    e.preventDefault();
    dispatch(clearBooking());
    setEstimateRequested(false);
  };

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: '' })
  };

  return (
    <div className={classes.container} ref={rootRef}>
      <Grid item xs={12} sm={12} md={8} lg={8}>
        <Grid container spacing={2} >
          <Grid item xs={12}>
            <Typography component="h1" variant="h5" className={classes.title} style={{textAlign:isRTL==='rtl'?'right':'left'}}>
              {t('addbookinglable')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {users ?
              <UsersCombo
                className={classes.items}
                placeholder={t('select_user')}
                users={users}
                value={userCombo}
                onChange={(event, newValue) => {
                  setUserCombo(newValue);
                }}
              />
              : null}
          </Grid>
          <Grid item xs={12}>
            <GoogleMapsAutoComplete
              variant={"outlined"}
              placeholder={t('pickup_location')}
              value={pickupAddress}
              className={classes.items}
              onChange={
                (value) => {
                  setPickupAddress(value);
                }
              }
            />
          </Grid>
          <Grid item xs={12}>
            <GoogleMapsAutoComplete placeholder={t('drop_location')}
              variant={"outlined"}
              value={dropAddress}
              className={classes.items}
              onChange={
                (value) => {
                  setDropAddress(value);
                }
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {cartypes ?
              <Select
                id="car-type-native"
                value={carType}
                onChange={handleCarSelect}
                variant="outlined"
                fullWidth
                style={{textAlign:isRTL==='rtl'? 'right':'left'}}
                className={carType === t('select_car') ? classes.inputdimmed : classes.input}
              >
                <MenuItem value={t('select_car')} key={t('select_car')} style={{direction:isRTL==='rtl'?'rtl':'ltr'}}>
                  {t('select_car')}
                </MenuItem>
                {
                  cartypes.map((car) =>
                    <MenuItem key={car.name} value={car.name} style={{direction:isRTL==='rtl'?'rtl':'ltr'}}>
                      <img src={car.image} className={isRTL==='rtl'? classes.carphotoRtl : classes.carphoto} alt="car types"/>{car.name}
                    </MenuItem>
                  )
                }
              </Select>
              : null}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Select
              id="booking-type-native"
              value={bookingType}
              onChange={handleBookTypeSelect}
              className={classes.input}
              style={{textAlign:isRTL==='rtl'? 'right':'left'}}
              variant="outlined"
              fullWidth
              inputProps={{ 'aria-label': 'Without label' }}
            >
              <MenuItem key={"Book Now"} value={"Book Now"} style={{direction:isRTL==='rtl'?'rtl':'ltr'}}>
                {t('book_now')}
              </MenuItem>
              <MenuItem key={"Book Later"} value={"Book Later"} style={{direction:isRTL==='rtl'?'rtl':'ltr'}}>
                {t('book_later')}
              </MenuItem>
            </Select>
          </Grid>
          {bookingType === 'Book Later' ?
            <Grid item xs={12} sm={6} >
              <TextField
                id="datetime-local"
                label={t('booking_date_time')}
                type="datetime-local"
                variant="outlined"
                fullWidth
                className={isRTL==='rtl'?classes.inputRtl:classes.commonInputStyle}
                InputProps={{
                  className: classes.input,
                  style:{textAlignLast:isRTL==='rtl'?'end':'start'}
                }}
                value={selectedDate}
                onChange={onDateChange}
              />
            </Grid>
            : null}
          <Grid item xs={12} sm={6} >
          <Button
              size="large"
              onClick={handleGetOptions}
              variant="contained" 
              color="secondaryButton"
              className={classes.buttonStyle}
            >
              <i className="fas fa-car" style={isRTL ==='rtl' ? {marginLeft:5}:{marginRight:5}}/>
              {t('book')}
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Modal
        disablePortal
        disableEnforceFocus
        disableAutoFocus
        open={optionModalStatus}
        onClose={handleOptionModalClose}
        className={classes.modal}
        container={() => rootRef.current}
      >
        <Grid container spacing={2} className={classes.paper}>
          <Grid item xs={12} sm={12} md={12} lg={12} style={{textAlign:isRTL==='rtl'?'right':'left'}}>
          {selectedCarDetails && selectedCarDetails.parcelTypes?
            <FormControl component="fieldset">
              <FormLabel component="legend">{t('parcel_types')}</FormLabel>
              <RadioGroup name="parcelTypeIndex" value={instructionData.parcelTypeIndex} onChange={handleChange}>
                {selectedCarDetails.parcelTypes.map((element,index) =>
                  <FormControlLabel key={element.description} value={index} control={<Radio />} label={ settings.swipe_symbol===false? settings.symbol + ' ' + element.amount + ' - ' + element.description: element.amount + ' ' + settings.symbol + ' - ' + element.description} />
                )}
              </RadioGroup>
            </FormControl>
          :null}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} style={{textAlign:isRTL==='rtl'?'right':'left'}}>
          {selectedCarDetails && selectedCarDetails.options?
            <FormControl component="fieldset">
              <FormLabel component="legend">{t('options')}</FormLabel>
              <RadioGroup name="optionIndex" value={instructionData.optionIndex} onChange={handleChange}>
                {selectedCarDetails.options.map((element,index) =>
                  <FormControlLabel key={element.description} value={index} control={<Radio />} label={ settings.swipe_symbol===false? settings.symbol + ' ' + element.amount + ' - ' + element.description: element.amount + ' ' + settings.symbol + ' - ' + element.description} />
                )}
              </RadioGroup>
            </FormControl>
          :null}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}  style={{textAlign:isRTL==='rtl'?'right':'left'}}>
          <Button onClick={handleOptionModalClose} variant="contained" color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleGetEstimate} variant="contained" color="primary" style={isRTL==='rtl'?{marginRight:10}:{marginLeft:10}}>
            {t('get_estimate')}
          </Button>
          </Grid>
        </Grid>
      </Modal>
      <Modal
        disablePortal
        disableEnforceFocus
        disableAutoFocus
        open={estimateModalStatus}
        onClose={handleEstimateModalClose}
        className={classes.modal}
        container={() => rootRef.current}
      >
        <Grid container spacing={1} className={classes.paper}>
            <Typography component="h2" variant="h5" style={{marginTop:15, color:'#000'}}>
                {appcat === 'delivery'? t('delivery_information'): t('estimate_fare_text')}
            </Typography>
            {appcat==='delivery'?
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="deliveryPerson"
                label={t('deliveryPerson')}
                name="deliveryPerson"
                autoComplete="deliveryPerson"
                onChange={handleChange}
                value={instructionData.deliveryPerson}
                autoFocus
                className={isRTL==='rtl'?classes.inputRtl:null}
                style={{direction:isRTL==='rtl'?'rtl':'ltr'}}
              />
            </Grid>
            :null}
            {appcat==='delivery'?
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="deliveryPersonPhone"
                label={t('deliveryPersonPhone')}
                name="deliveryPersonPhone"
                autoComplete="deliveryPersonPhone"
                onChange={handleChange}
                value={instructionData.deliveryPersonPhone}
                className={isRTL==='rtl'?[classes.inputRtl, classes.rightRty]:null}
                style={{direction:isRTL==='rtl'?'rtl':'ltr'}}
              />
            </Grid>
            :null}
            {appcat==='delivery'?
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="pickUpInstructions"
                label={t('pickUpInstructions')}
                name="pickUpInstructions"
                autoComplete="pickUpInstructions"
                onChange={handleChange}
                value={instructionData.pickUpInstructions}
                className={isRTL==='rtl'?classes.inputRtl:null}
                style={{direction:isRTL==='rtl'?'rtl':'ltr'}}
              />
            </Grid>
            :null}
            {appcat==='delivery'?
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="deliveryInstructions"
                label={t('deliveryInstructions')}
                name="deliveryInstructions"
                autoComplete="deliveryInstructions"
                onChange={handleChange}
                value={instructionData.deliveryInstructions}
                className={isRTL==='rtl'?classes.inputRtl:null}
                style={{direction:isRTL==='rtl'?'rtl':'ltr'}}
              />
            </Grid>
            :null}
          <Grid item xs={12} sm={12} md={12} lg={12} style={{textAlign:isRTL==='rtl'?'right':'left'}}>
            {settings.swipe_symbol===false?
              <Typography color={'primary'} style={{fontSize:30}}>
                {t('total')} - {settings?settings.symbol:null} {estimatedata.estimate ? estimatedata.estimate.estimateFare : null}
              </Typography>
              :
              <Typography color={'primary'} style={{fontSize:30}}>
                {t('total')} - {estimatedata.estimate ? estimatedata.estimate.estimateFare : null} {settings?settings.symbol:null}
              </Typography>
            }
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} style={{textAlign:isRTL==='rtl'?'right':'left'}}>
            <Button onClick={handleEstimateModalClose} variant="contained" color="primary">
              {t('cancel')}
            </Button>
            <Button onClick={confirmBooking} variant="contained" color="primary" style={isRTL==='rtl'?{marginRight:10}:{marginLeft:10}}>
              {t('book_now')}
            </Button>
          </Grid>
        </Grid>
      </Modal>
      <AlertDialog open={bookingdata.booking ? true : false} onClose={handleBookingAlertClose}>{bookingdata.booking ? t('booking_success') + bookingdata.booking.booking_id : null}</AlertDialog>
      <AlertDialog open={bookingdata.error.flag} onClose={handleBookingErrorClose}>{bookingdata.error.msg}</AlertDialog>
      <AlertDialog open={estimatedata.error.flag} onClose={handleEstimateErrorClose}>{estimatedata.error.msg}</AlertDialog>
      <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>{commonAlert.msg}</AlertDialog>
    </div>
  );
}
