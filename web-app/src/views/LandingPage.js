import React, { useState, useEffect, useContext, useRef } from 'react';
import classNames from "classnames";
import { makeStyles } from '@material-ui/core/styles';
import Header from "components/Header/Header.js";
import Footer from "components/Footer/Footer.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import HeaderLinks from "components/Header/HeaderLinks.js";
import Parallax from "components/Parallax/Parallax.js";
import {
  Paper,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Modal,
  Grid,
  Typography
} from '@material-ui/core';
import GoogleMapsAutoComplete from '../components/GoogleMapsAutoComplete';
import styles from "assets/jss/material-kit-react/views/landingPage.js";
import ProductSection from "./Sections/ProductSection.js";
import SectionDownload from "./Sections/SectionDownload.js";
import { useSelector, useDispatch } from "react-redux";
import AlertDialog from '../components/AlertDialog';
import { FirebaseContext } from 'common';
import {colors} from '../components/Theme/WebTheme';
import { useTranslation } from "react-i18next";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const dashboardRoutes = [];

const useStyles = makeStyles(theme => ({
  ...styles,
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
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
}));

const icons = {
  'paypal':require('../assets/img/payment-icons/paypal-logo.png').default,
  'braintree':require('../assets/img/payment-icons/braintree-logo.png').default,
  'stripe':require('../assets/img/payment-icons/stripe-logo.png').default,
  'paytm':require('../assets/img/payment-icons/paytm-logo.png').default,
  'payulatam':require('../assets/img/payment-icons/payulatam-logo.png').default,
  'flutterwave':require('../assets/img/payment-icons/flutterwave-logo.png').default,
  'paystack':require('../assets/img/payment-icons/paystack-logo.png').default,
  'securepay':require('../assets/img/payment-icons/securepay-logo.png').default,
  'payfast':require('../assets/img/payment-icons/payfast-logo.png').default,
  'liqpay':require('../assets/img/payment-icons/liqpay-logo.png').default,
  'culqi':require('../assets/img/payment-icons/culqi-logo.png').default,
  'mercadopago':require('../assets/img/payment-icons/mercadopago-logo.png').default,
  'test':require('../assets/img/payment-icons/test-logo.png').default
}

export default function LandingPage(props) {
  const { api, appcat } = useContext(FirebaseContext);
  const {
    getEstimate, 
    clearEstimate,
    addBooking, 
    clearBooking,
    MinutesPassed,
    GetDateString,
    GetDistance
  } = api;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const { ...rest } = props;
  const cartypes = useSelector(state => state.cartypes.cars);
  const estimatedata = useSelector(state => state.estimatedata);
  const bookingdata = useSelector(state => state.bookingdata);
  const userdata = useSelector(state => state.usersdata);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);
  const [carType, setCarType] = useState();
  const [pickupAddress, setPickupAddress] = useState(null);
  const [dropAddress, setDropAddress] = useState(null);
  const [optionModalStatus, setOptionModalStatus] = useState(false);
  const [estimateModalStatus, setEstimateModalStatus] = useState(false);
  const [paymentModalStatus, setPaymentModalStatus] = useState(false);
  const [estimateRequested, setEstimateRequested] = useState(false);
  const [selectedCarDetails, setSelectedCarDetails] = useState(null);
  const auth = useSelector(state => state.auth);
  const [commonAlert, setCommonAlert] = useState({ open: false, msg: '' });
  const [bookingType, setBookingType] = useState('Book Now');
  const [role, setRole] = useState(null);
  const [selectedDate, setSelectedDate] = React.useState(GetDateString());
  const rootRef = useRef(null);
  const [tempRoute, setTempRoute] = useState();
  const [selectedProvider, setSelectedProvider] = useState();
  const [selectedProviderIndex, setSelectedProviderIndex] = useState(0);
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
    }else if(e.target.name === 'selectedProviderIndex'){
      setSelectedProviderIndex(parseInt(e.target.value));
      setSelectedProvider(providers[parseInt(e.target.value)]);
    }else{
      setInstructionData({ ...instructionData, [e.target.name]: e.target.value });
    }
  };

  useEffect(() => {
    if (userdata.users) {
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
  }, [userdata.users]);

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
      if(bookingType==='Book Later'){
          setSelectedDate(GetDateString());
      }
  };

  const onDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  useEffect(() => {
    if (t) {
      setCarType(t('select_car'))
    }
  }, [t]);

  useEffect(()=>{
    if(providers){
      setSelectedProvider(providers[0]);
    }
  },[providers]);

  useEffect(() => {
    if (estimatedata.estimate &&  estimateRequested) {
      setEstimateModalStatus(true);
    }
    if(auth.info && auth.info.profile){
      setRole(auth.info.profile.usertype);
    }
  }, [estimatedata.estimate,auth.info,  estimateRequested]);


  useEffect(() => {
    if (bookingdata.booking && bookingdata.booking.mainData.status === 'PAYMENT_PENDING') {
      setPaymentModalStatus(true);
    }
}, [bookingdata.booking]);

  const [phoneAlert, setPhoneAlert] = useState({ open: false, msg: '' });

  const handlePhoneAlertClose = (e) => {
    e.preventDefault();
    setPhoneAlert({ open: false, msg: '' })
  };

  const handlePhoneAlertGo = (e) => {
    e.preventDefault();
    props.history.push('/profile');
  };

  const handleGetOptions = (e) => {
    e.preventDefault();
    setEstimateRequested(true);
    if (auth.info) {
      if (auth.info.profile.usertype === 'rider') {
        if(auth.info.profile.email === ' ' || auth.info.profile.firstName === ' ' || auth.info.profile.lastName === ' '){
          setCommonAlert({ open: true, msg: t('profile_incomplete')})
        } else{
          if (pickupAddress && dropAddress && selectedCarDetails) {
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
                  } else {
                    if (bookingType === 'Book Later' && selectedDate) {
                      if (MinutesPassed(selectedDate) >= 15) {
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
                      } else {
                        setCommonAlert({ open: true, msg: t('past_booking_error')});
                      }
                    } else {
                      setCommonAlert({ open: true, msg: t('select_proper')});
                    }
                  }
                } else {
                  setCommonAlert({ open: true, msg: t('place_to_coords_error')})
                }
              }
            )
          } else {
            setCommonAlert({ open: true, msg: t('select_proper')})
          }   
        }
      } else {
        setCommonAlert({ open: true, msg: t('user_issue_contact_admin')})
      }
    } else {
      setCommonAlert({ open: true, msg: t('must_login')})
    }
  };

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
        if (regx1.test(instructionData.deliveryPersonPhone) && instructionData.deliveryPersonPhone && instructionData.deliveryPersonPhone.length > 6) {
          setEstimateModalStatus(false);

          const paymentPacket = { 
            appcat: appcat,
            payment_mode: 'card',
            customer_paid: estimatedata.estimate.estimateFare,
            discount_amount: 0,
            usedWalletMoney: 0,
            cardPaymentAmount: estimatedata.estimate.estimateFare,
            cashPaymentAmount: 0,
            payableAmount: estimatedata.estimate.estimateFare,
            promo_applied: false,
            promo_details: null
          };

          let bookingObject = {
            pickup: pickupAddress,
            drop: dropAddress,
            carDetails: selectedCarDetails,
            userDetails: auth.info,
            estimate: estimatedata.estimate,
            instructionData: instructionData,
            paymentPacket: paymentPacket,
            tripdate: bookingType === 'Book Later'? new Date(selectedDate).getTime(): new Date().getTime(),
            bookLater: bookingType === 'Book Later' ? true : false,
            settings: settings,
            booking_type_admin: false,

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
          userDetails: auth.info,
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
    props.history.push('/bookings');
  };

  const handleBookingErrorClose = (e) => {
    e.preventDefault();
    dispatch(clearBooking());
    setEstimateRequested(false);
  };

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: '' })
  };

  const handlePaymentModalClose = (e) => {
    setTimeout(()=>{
      setPaymentModalStatus(false);
      dispatch(clearBooking());
      dispatch(clearEstimate());
    },1500);
  }

  return (
    <div style={{backgroundColor:colors.LandingPage_Background}}>
      <Header
        color="transparent"
        routes={dashboardRoutes}
        rightLinks={<HeaderLinks />}
        fixed
        changeColorOnScroll={{
          height: 400,
          color: "white"
        }}
        {...rest}
      />
      <Parallax filter image={require("assets/img/background.jpg").default}>
        {(cartypes && !role) || (cartypes && (role === 'rider' || role === 'admin'))?
          <div className={classes.container} style={{direction:isRTL === 'rtl'?'rtl':'ltr'}}>
            <GridContainer spacing={2}>
              <GridItem xs={12} sm={12} md={6} lg={6}>
                <br />
                <h1 style={{textAlign:isRTL === 'rtl'?'right':'left',position: "relative",marginTop: "30px",minHeight: "32px",color: "#FFFFFF",textDecoration: "none",fontSize:"2.955rem"}}>{t('book_your_cab')}</h1>
              </GridItem>
            </GridContainer>
            <GridContainer spacing={2}>
              <GridItem xs={12} sm={12} md={6} lg={6}>
                <Paper >
                  <GoogleMapsAutoComplete 
                    placeholder={t('pickup_location')}
                    variant={"filled"}
                    value={pickupAddress}
                    onChange={
                      (value) => {
                        setPickupAddress(value);
                      }
                    }
                  />
                </Paper>
              </GridItem>
            </GridContainer>
            <GridContainer spacing={2}>
              <GridItem xs={12} sm={12} md={6} lg={6}>
                <Paper>
                  <GoogleMapsAutoComplete 
                    placeholder={t('drop_location')}
                    variant={"filled"}
                    value={dropAddress}
                    onChange={
                      (value) => {
                        setDropAddress(value);
                      }
                    }
                  />
                </Paper>
              </GridItem>
            </GridContainer>
            <GridContainer spacing={2}>
            <GridItem xs={6} sm={6} md={3} lg={3}>
                {cartypes && carType?
                <FormControl style={{ width: '100%' }}>
                  <Select
                    id="car-type-native"
                    value={carType}
                    onChange={handleCarSelect}
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
                </FormControl>
                :null}
              </GridItem>
              <GridItem xs={6} sm={6} md={3} lg={3}>
                <FormControl style={{ width: '100%' }}>
                  <Select
                    id="booking-type-native"
                    value={bookingType}
                    onChange={handleBookTypeSelect}
                    className={classes.input}
                    style={{textAlign:isRTL==='rtl'? 'right':'left'}}
                    inputProps={{ 'aria-label': 'Without label' }}
                  >
                    <MenuItem key={"Book Now"} value={"Book Now"} style={{direction:isRTL==='rtl'?'rtl':'ltr'}}>
                      {t('book_now')}
                    </MenuItem>
                    <MenuItem key={"Book Later"} value={"Book Later"} style={{direction:isRTL==='rtl'?'rtl':'ltr'}}>
                      {t('book_later')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
            </GridContainer>
            <GridContainer spacing={2}>
              {bookingType==='Book Later'?
              <GridItem xs={6} sm={6} md={4} lg={4}>
                <TextField
                  id="datetime-local"
                  label={t('booking_date_time')}
                  type="datetime-local"
                  variant="filled"
                  fullWidth
                  className={isRTL==='rtl'?[classes.inputRtl,classes.commonInputStyle]:classes.commonInputStyle}
                  InputProps={{
                    className: classes.input,
                    style:{textAlignLast:isRTL==='rtl'?'end':'start'}
                  }}
                  value = {selectedDate}
                  onChange={onDateChange}
                />
              </GridItem>
              :null}
              <GridItem xs={6} sm={6} md={bookingType==='Book Later'?2:6} lg={bookingType==='Book Later'?2:6}>
                <Button
                  color="primaryButton"
                  size="lg"
                  rel="noopener noreferrer"
                  className={classes.items}
                  onClick={handleGetOptions}
                  style={{height:bookingType==='Book Later'?76:52}}
                >
                  <i className="fas fa-car"  style={isRTL==='rtl'? {marginLeft: '10px'}: {marginRight: '10px'}} />
                  {t('book_now')}
                </Button>
              </GridItem>
            </GridContainer>
          </div>
          : 
          <div className={classes.container}>
            <GridContainer spacing={2}>
              <GridItem xs={12} sm={12} md={6} lg={6}>
                <br />
                <h1  style={{textAlign:isRTL === 'rtl'?'right':'left',position: "relative",marginTop: "30px",minHeight: "32px",color: "#FFFFFF",textDecoration: "none",fontSize:"2.955rem"}}>{t('landing_slogan')}</h1>
              </GridItem>
            </GridContainer>
          </div>
          }
      </Parallax>
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div style={{backgroundColor: colors.LandingPage_Front, borderRadius: 6}}>
          <div className={classes.container}>
            <ProductSection />
          </div>
        </div>
      </div>
      <div className={classNames(classes.main2, classes.mainRaised2)} style={{marginTop:1}}>
        <div style={{backgroundColor: colors.LandingPage_Front, borderRadius: 6}}>
          <div className={classes.container}>
            <SectionDownload />
          </div>
        </div>
      </div>
      <Footer />
      <Modal
        disablePortal
        disableEnforceFocus
        disableAutoFocus
        open={paymentModalStatus}
        onClose={handlePaymentModalClose}
        className={classes.modal}
        container={() => rootRef.current}
      >
        <Grid container spacing={2} className={classes.paper}>
        {providers && selectedProvider && bookingdata && bookingdata.booking?
          <form action={selectedProvider.link} method="POST">
            <input type='hidden' name='order_id' value={bookingdata.booking.booking_id}/>
            <input type='hidden' name='amount' value={bookingdata.booking.mainData.trip_cost}/>
            <input type='hidden' name='currency' value={settings.code}/>
            <input type='hidden' name='product_name' value={t('bookingPayment')}/>
            <input type='hidden' name='first_name' value={auth.info.profile.firstName}/>
            <input type='hidden' name='last_name' value={auth.info.profile.lastName}/>
            <input type='hidden' name='quantity' value={1}/>
            <input type='hidden' name='cust_id' value={bookingdata.booking.mainData.customer}/>
            <input type='hidden' name='mobile_no' value={bookingdata.booking.mainData.customer_contact}/>
            <input type='hidden' name='email' value={bookingdata.booking.mainData.customer_email}/>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">{t('payment')}</FormLabel>
                <RadioGroup name="selectedProviderIndex" value={selectedProviderIndex} onChange={handleChange}>
                  {providers.map((provider,index) =>
                  <FormControlLabel key={provider.name} value={index} control={<Radio />} label={<img style={{height:24,margin:7}} src={icons[provider.name]} alt={provider.name}/>} /> 
                  )}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
            <Button onClick={handlePaymentModalClose} variant="contained" color="primary">
              {t('cancel')}
            </Button>
            <Button variant="contained" color="primary" type="submit" style={{marginLeft:10}} onClick={handlePaymentModalClose}>
              {t('paynow_button')}
            </Button>
            </Grid>
          </form>
          :null}
        </Grid>
      </Modal>
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
                  <FormControlLabel key={element.description} style={{direction:isRTL==='rtl'?'rtl':'ltr'}} value={index} control={<Radio />} label={ settings.swipe_symbol===false? settings.symbol + ' ' + element.amount + ' - ' + element.description: element.amount + ' ' + settings.symbol + ' - ' + element.description} />
                )}
              </RadioGroup>
            </FormControl>
          :null}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12}  style={{textAlign:isRTL==='rtl'?'right':'left'}}>
          {selectedCarDetails && selectedCarDetails.options?
            <FormControl component="fieldset">
              <FormLabel component="legend">{t('options')}</FormLabel>
              <RadioGroup name="optionIndex" value={instructionData.optionIndex} onChange={handleChange}>
                {selectedCarDetails.options.map((element,index) =>
                  <FormControlLabel key={element.description} style={{direction:isRTL==='rtl'?'rtl':'ltr'}} value={index} control={<Radio />} label={ settings.swipe_symbol===false? settings.symbol + ' ' + element.amount + ' - ' + element.description: element.amount + ' ' + settings.symbol + ' - ' + element.description} />
                )}
              </RadioGroup>
            </FormControl>
          :null}
          </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} style={{textAlign:isRTL==='rtl'?'right':'left'}}>
          <Button onClick={handleOptionModalClose} variant="contained" color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handleGetEstimate} variant="contained" color="primary" style={{marginLeft:10}}>
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
        <Grid container spacing={1} className={classes.paper} style={{direction:isRTL==='rtl'?'rtl':'ltr'}}>
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
            {settings && settings.swipe_symbol===false?
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
            <Button onClick={confirmBooking} variant="contained" color="primary" style={{marginLeft:10}}>
              {t('book_now')}
            </Button>
          </Grid>
        </Grid>
      </Modal>
      {appcat === 'taxi'?
      <AlertDialog open={bookingdata.booking ? true : false} onClose={handleBookingAlertClose}>{bookingdata.booking ? t('booking_success') + bookingdata.booking.booking_id : null}</AlertDialog>
      :null}
      <AlertDialog open={bookingdata.error.flag} onClose={handleBookingErrorClose}>{bookingdata.error.msg}</AlertDialog>
      <AlertDialog open={estimatedata.error.flag} onClose={handleEstimateErrorClose}>{estimatedata.error.msg}</AlertDialog>
      <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>{commonAlert.msg}</AlertDialog>

      <Dialog
        open={phoneAlert.open}
        onClose={handlePhoneAlertClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Alert"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t('phone_no_update')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePhoneAlertClose} color="primary">
            {t('cancel')}
          </Button>
          <Button onClick={handlePhoneAlertGo} color="primary">
            {t('yes')}
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
