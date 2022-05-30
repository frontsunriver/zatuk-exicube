import React,{ useState, useEffect, useContext , useRef } from 'react';
import MaterialTable from 'material-table';
import CircularLoading from "../components/CircularLoading";
import { useSelector, useDispatch } from "react-redux";
import ConfirmationDialogRaw from '../components/ConfirmationDialogRaw';
import {
  Grid,
  Typography,
  Modal,
  Button,
  FormControlLabel,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
} from '@material-ui/core';
import { FirebaseContext } from 'common';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import UsersCombo from '../components/UsersCombo';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';
import CancelIcon from '@material-ui/icons/Cancel';
import PaymentIcon from '@material-ui/icons/Payment';


const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: 680,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
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

const BookingHistory = (props) => {
  const { api, appcat } = useContext(FirebaseContext);
  const { t, i18n  } = useTranslation();
  const isRTL = i18n.dir();
  const {
    cancelBooking,
    updateBooking,
    RequestPushMsg
  } = api;
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const userdata = useSelector(state => state.usersdata);
  const settings = useSelector(state => state.settingsdata.settings);
  const [role, setRole] = useState(null);
  const [paymentModalStatus, setPaymentModalStatus] = useState(false);
  const providers = useSelector(state => state.paymentmethods.providers);
  const [selectedProvider, setSelectedProvider] = useState();
  const [selectedProviderIndex, setSelectedProviderIndex] = useState(0);
  const [data, setData] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState();
  const bookinglistdata = useSelector(state => state.bookinglistdata);
  const [users, setUsers] = useState(null);
  const [userCombo, setUserCombo] = useState(null);
  const rootRef = useRef(null);
  const [open,setOpen] = useState(false);
  const [rowIndex,setRowIndex] = useState();
  const classes = useStyles();
  const columns =  [
    { title: t('booking_id'), field: 'id', cellStyle: isRTL=== 'rtl' ? {paddingRight:220}:{paddingLeft:220}, headerStyle: isRTL=== 'rtl' ?{paddingRight:220}:{paddingLeft:220}, },
    { title: t('booking_date'), field: 'tripdate', render: rowData => rowData.tripdate?moment(rowData.tripdate).format('lll'):null,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('car_type'), field: 'carType',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}  },
    { title: t('customer_name'),field: 'customer_name',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}  },
    { title: t('pickup_address'), field: 'pickupAddress', cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('drop_address'), field: 'dropAddress', cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('assign_driver'), field: 'driver_name',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('deliveryPerson'), field: 'deliveryPerson', hidden: appcat === 'taxi'? true: false,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}  },
    { title: t('deliveryPersonPhone'), field: 'deliveryPersonPhone', hidden: appcat === 'taxi'? true: false,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('pickUpInstructions'), field: 'pickUpInstructions', hidden: appcat === 'taxi'? true: false ,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('deliveryInstructions'), field: 'deliveryInstructions', hidden: appcat === 'taxi'? true: false,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}  },
    { title: t('parcel_type'), render: rowData => <span>{rowData.parcelTypeSelected?rowData.parcelTypeSelected.description + " (" + rowData.parcelTypeSelected.amount + ")":""}</span> , hidden: appcat === 'taxi'? true: false,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('parcel_option'), render: rowData => <span>{rowData.optionSelected?rowData.optionSelected.description + " (" + rowData.optionSelected.amount + ")":""}</span> , hidden: appcat === 'taxi'? true: false,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('booking_status'), field: 'status', render: rowData => <span>{t(rowData.status)}</span>,cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}  },
    { title: t('take_pickup_image'),  field: 'pickup_image',render: rowData => rowData.pickup_image?<img alt='Pick Up' src={rowData.pickup_image} style={{width: 150}}/>:null, editable:'never', hidden: appcat === 'taxi'? true: false},
    { title: t('take_deliver_image'),  field: 'deliver_image',render: rowData => rowData.deliver_image?<img alt='Deliver' src={rowData.deliver_image} style={{width: 150}}/>:null, editable:'never', hidden: appcat === 'taxi'? true: false},
    { title: t('cancellation_reason'), field: 'reason',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('cancellationFee'), render: rowData => <span>{rowData.cancellationFee? rowData.cancellationFee :(0).toFixed(settings.decimal)}</span>, cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
    { title: t('otp'), field: 'otp',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('trip_cost'), field: 'trip_cost',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('trip_start_time'), field: 'trip_start_time',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('trip_end_time'), field: 'trip_end_time',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('total_time'), field: 'total_trip_time',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('distance'), field: 'distance',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('vehicle_no'), field: 'vehicle_number',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },  
    { title: t('trip_cost_driver_share'), hidden: role==='rider'? true: false, field: 'driver_share',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('convenience_fee'), hidden: role==='rider'? true: false, field: 'convenience_fees',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('discount_ammount'), field: 'discount',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},      
    { title: t('Customer_paid'), field: 'customer_paid',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('payment_mode'), field: 'payment_mode',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('payment_gateway'), field: 'gateway',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'} },
    { title: t('cash_payment_amount'), field: 'cashPaymentAmount',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('card_payment_amount'), field: 'cardPaymentAmount',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}},
    { title: t('wallet_payment_amount'), field: 'usedWalletMoney',cellStyle:{textAlign:isRTL=== 'rtl' ?'right':'left'}}
];

  useEffect(()=>{
        if(bookinglistdata.bookings){
            setData(bookinglistdata.bookings);
        }else{
          setData([]);
        }
  },[bookinglistdata.bookings]);

  useEffect(() => {
    if(auth.info && auth.info.profile){
      setRole(auth.info.profile.usertype);
    }
  }, [auth.info]);

  useEffect(() => {
    if (userdata.users) {
      let arr = [];
      for (let i = 0; i < userdata.users.length; i++) {
        let user = userdata.users[i];
        if (user.usertype === 'driver') {
          arr.push({
            'firstName': user.firstName,
            'lastName': user.lastName,
            'mobile': user.mobile,
            'email': user.email,
            'uid': user.id,
            'desc': user.firstName + ' ' + user.lastName + ' (' + (settings.AllowCriticalEditsAdmin? user.mobile : "Hidden") + ') ' + (settings.AllowCriticalEditsAdmin? user.email : "Hidden"),
            'pushToken': user.pushToken,
            'carType':user.carType
          });
        }
      }
      setUsers(arr);
    }
  }, [userdata.users,settings.AllowCriticalEditsAdmin]);

  const assignDriver = () => {
    let booking = data[rowIndex];
    if(booking['requestedDrivers']){
      booking['requestedDrivers'][userCombo.uid]=true;
    }else{
      booking['requestedDrivers']={};
      booking['requestedDrivers'][userCombo.uid]=true;
    }
    dispatch(updateBooking(booking));
    RequestPushMsg(
      userCombo.pushToken, 
      { 
        title: t('notification_title'), 
        msg: t('new_booking_notification'),
        screen: 'DriverTrips'
      }
    );
    setUserCombo(null);
    handleClose();
    alert("Driver assigned successfully and notified.");
  }

  const onConfirmClose=(value)=>{
    if(value){
      dispatch(cancelBooking({
        reason:value,
        booking:selectedBooking,
        cancelledBy: role
      }));
    }
    setOpenConfirm(false);
  }

  const handleChange = (e) => {
    if(e.target.name === 'selectedProviderIndex'){
      setSelectedProviderIndex(parseInt(e.target.value));
      setSelectedProvider(providers[parseInt(e.target.value)]);
    }
  };

  const handleClose = () => {
    setOpen(false);
  }

  const handlePaymentModalClose = (e) => {
      setTimeout(()=>{
        setPaymentModalStatus(false);
      },1500)
  }

  useEffect(()=>{
    if(providers){
      setSelectedProvider(providers[0]);
    }
  },[providers]);

  const processPayment = (rowData) =>{
    const curBooking = rowData;
    const paymentPacket = { 
      appcat: appcat,
      payment_mode: 'card',
      customer_paid: (parseFloat(curBooking.trip_cost) - parseFloat(curBooking.discount)).toFixed(settings.decimal),
      cardPaymentAmount:  curBooking.payableAmount?curBooking.payableAmount:curBooking.trip_cost,
      discount: curBooking.discount? curBooking.discount:0,
      usedWalletMoney: curBooking.usedWalletMoney?curBooking.usedWalletMoney:0,
      cashPaymentAmount: 0,
      promo_applied: curBooking.promo_applied?curBooking.promo_applied:false,
      promo_details: curBooking.promo_details?curBooking.promo_details:null,
      payableAmount: curBooking.payableAmount?curBooking.payableAmount:curBooking.trip_cost
    };
    curBooking.paymentPacket = paymentPacket;
    dispatch(updateBooking(curBooking));
    setSelectedBooking(curBooking);
  }

  return (
    bookinglistdata.loading? <CircularLoading/>:
    <div>
    <MaterialTable
      title={t('booking_title')}
      columns={columns}
      data={data}
      options={{
        exportButton: settings.AllowCriticalEditsAdmin,
        sorting: true
      }}
      localization={{
        toolbar: {
          searchPlaceholder: (t('search')),
          exportTitle: (t('export')),
        },
        header: {
          actions: (t('actions')) 
      },
      pagination: {
        labelDisplayedRows: ('{from}-{to} '+ (t('of'))+ ' {count}'),
        labelRowsSelect: (t('rows')),
        firstTooltip: (t('first_page_tooltip')),
        previousTooltip: (t('previous_page_tooltip')),
        nextTooltip: (t('next_page_tooltip')),
        lastTooltip: (t('last_page_tooltip'))
      },
    }}
      actions={[
        rowData => ({
          icon: () => <div style={{display: 'flex',alignItems: 'center',flexWrap: 'wrap'}}>
            <CancelIcon />
            <Typography variant="subtitle2">{t('cancel_booking')}</Typography>
          </div>,
          disabled: rowData.status==='NEW' || rowData.status==='ACCEPTED' || rowData.status==='PAYMENT_PENDING'? false:true,
          onClick: (event, rowData) => {
            if(settings.AllowCriticalEditsAdmin && (role==='rider' || role ==='admin')){
              if(rowData.status==='NEW' || rowData.status==='ACCEPTED'){
                setSelectedBooking(rowData);
                setOpenConfirm(true);
              }else{
                setTimeout(()=>{
                  dispatch(cancelBooking({
                    reason: t('cancelled_incomplete_booking'),
                    booking:rowData
                  }));
                },1500);
              }
            }else{
              alert(t('demo_mode'));
            }
          }         
        }),
        rowData => ({
          icon: () => <div style={{display: 'flex',alignItems: 'center',flexWrap: 'wrap'}}>
              <PersonAddIcon />
              <Typography variant="subtitle2">{t('assign_driver')}</Typography>
          </div>,
          disabled: (rowData.status==='NEW' && role==='admin' && settings.autoDispatch===false)? false:true,
          onClick: (event, rowData) => {
            setOpen(true)
            setRowIndex(rowData.tableData.id);
          }
        }),
        rowData => ({
          icon: () => <div style={{display: 'flex',alignItems: 'center',flexWrap: 'wrap'}}>
              <PaymentIcon />
              <Typography variant="subtitle2">{t('paynow_button')}</Typography>
          </div>,
          disabled: (rowData.status==='PENDING' && role==='rider')? false:true,
          onClick: (event, rowData) => {
            processPayment(rowData);
            setPaymentModalStatus(true);
          }
        })
      ]}
    />
    {selectedBooking && selectedBooking.status ==='PENDING' && role==='rider'?
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
        {providers && selectedProvider && selectedBooking?
          <form action={selectedProvider.link} method="POST">
            <input type='hidden' name='order_id' value={selectedBooking.id}/>
            <input type='hidden' name='amount' value={selectedBooking.paymentPacket.payableAmount}/>
            <input type='hidden' name='currency' value={settings.code}/>
            <input type='hidden' name='product_name' value={t('bookingPayment')}/>
            <input type='hidden' name='first_name' value={auth.info.profile.firstName}/>
            <input type='hidden' name='last_name' value={auth.info.profile.lastName}/>
            <input type='hidden' name='quantity' value={1}/>
            <input type='hidden' name='cust_id' value={selectedBooking.customer}/>
            <input type='hidden' name='mobile_no' value={selectedBooking.customer_contact}/>
            <input type='hidden' name='email' value={selectedBooking.customer_email}/>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend" style={{textAlign:isRTL=== 'rtl' ?'right':'left'}}>{t('payment')}</FormLabel>
                <RadioGroup name="selectedProviderIndex" value={selectedProviderIndex} onChange={handleChange}>
                  {providers.map((provider,index) =>
                  <FormControlLabel key={provider.name} value={index} control={<Radio />} label={<img style={{height:24,margin:7}} src={icons[provider.name]} alt={provider.name}/>} /> 
                  )}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}  style={{direction: isRTL=== 'rtl' ?'rtl' : 'ltr'}}>
            <Button onClick={handlePaymentModalClose} variant="contained" color="primary">
              {t('cancel')}
            </Button>
            <Button variant="contained" color="primary" type="submit" style={isRTL=== 'rtl' ?{marginRight:10}:{marginLeft:10}} onClick={handlePaymentModalClose}>
              {t('paynow_button')}
            </Button>
            </Grid>
          </form>
          :null}
        </Grid>
      </Modal>
    :null}
    <ConfirmationDialogRaw
      open={openConfirm}
      onClose={onConfirmClose}
      value={''}
    />
    {users && data && rowIndex>=0?
      <Modal
        disablePortal
        disableEnforceFocus
        disableAutoFocus
        onClose={handleClose}
        open={open}
        className={classes.modal}
        container={() => rootRef.current}
      >
        <div className={classes.paper}>
          <Grid container spacing={2} >
            <Grid item xs={12}>
              <Typography component="h1" variant="h5" className={classes.title} style={{textAlign:isRTL=== 'rtl' ? 'right' : 'left'}}>
                {t('select_driver')}
              </Typography>
            </Grid>
            <Grid item xs={12}>
                <UsersCombo
                  className={classes.items}
                  placeholder={t('select_user')}
                  users={users.filter(usr => usr.carType === data[rowIndex].carType)}
                  value={userCombo}
                  onChange={(event, newValue) => {
                    setUserCombo(newValue);
                  }}
                />
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} style={{direction: isRTL=== 'rtl' ?'rtl' : 'ltr', marginLeft:isRTL=== 'rtl' ? '65%' : 0}}>
            <Button onClick={handleClose} variant="contained" color="primary">
              {t('cancel')}
            </Button>
            <Button onClick={assignDriver} variant="contained" color="primary" style={ isRTL=== 'rtl' ? {marginRight:10} : {marginLeft:10}}>
              {t('assign')}
            </Button>
          </Grid>
          </Grid>
        </div>
      </Modal>
      :null}
    </div>

  );
}

export default BookingHistory;
