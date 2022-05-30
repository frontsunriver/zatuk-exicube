import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, Image, TouchableWithoutFeedback, Text, Alert } from 'react-native';
import { Header, } from 'react-native-elements';

import i18n from 'i18n-js';
import { colors } from '../common/theme';
import PaymentWebView from '../components/PaymentWebView';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';

export default function SelectGatewayPage(props) {
  const { api, config } = useContext(FirebaseContext);
  const {
    clearMessage,
    fetchProfile,
    RequestPushMsg
  } = api;
  const dispatch = useDispatch();
  const serverUrl = `https://us-central1-${config.projectId}.cloudfunctions.net`;

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
  const icons = {
    'paypal':require('../../assets/payment-icons/paypal-logo.png'),
    'braintree':require('../../assets/payment-icons/braintree-logo.png'),
    'stripe':require('../../assets/payment-icons/stripe-logo.png'),
    'paytm':require('../../assets/payment-icons/paytm-logo.png'),
    'payulatam':require('../../assets/payment-icons/payulatam-logo.png'),
    'flutterwave':require('../../assets/payment-icons/flutterwave-logo.png'),
    'paystack':require('../../assets/payment-icons/paystack-logo.png'),
    'securepay':require('../../assets/payment-icons/securepay-logo.png'),
    'payfast':require('../../assets/payment-icons/payfast-logo.png'),
    'liqpay':require('../../assets/payment-icons/liqpay-logo.png'),
    'culqi':require('../../assets/payment-icons/culqi-logo.png'),
    'mercadopago':require('../../assets/payment-icons/mercadopago-logo.png'),
    'test':require('../../assets/payment-icons/test-logo.png')
  }

  const {payData,providers,userdata,settings,booking} = props.route.params;

  const [state, setState] = useState({
    payData: payData,
    providers: providers,
    userdata: userdata,
    settings: settings,
    booking: booking,
    selectedProvider: null
  });

  const paymentmethods = useSelector(state => state.paymentmethods);
  useEffect(()=>{
    if(paymentmethods.message){
      Alert.alert(t('alert'),paymentmethods.message);
      dispatch(clearMessage());
    }
  },[paymentmethods.message]);


  const onSuccessHandler = (order_details) => {
    if (state.booking) {
      dispatch(fetchProfile());
      if(state.booking.status == "PAYMENT_PENDING"){
        props.navigation.navigate('BookedCab',{bookingId:state.booking.id});
      } else {
        RequestPushMsg(
          state.booking.customer_token, 
          { 
            title: t('notification_title'), 
            msg: t('success_payment'),
            screen: 'BookedCab',
            params: {bookingId: state.booking.id}
          }
        );
        RequestPushMsg(
          state.booking.driver_token, 
          { 
            title: t('notification_title'), 
            msg: t('success_payment'),
            screen: 'BookedCab',
            params: {bookingId: state.booking.id}
          }
        );
        setTimeout(()=>{
          props.navigation.navigate('DriverRating',{bookingId:state.booking.id});
        },2000);
      }
    } else {
        props.navigation.navigate('Wallet');
    }
  };

  const onCanceledHandler = () => {
    if (state.booking) {
        props.navigation.navigate('PaymentDetails',{booking:booking})
    } else {
        props.navigation.navigate('Wallet')
    }
  };

  const goBack = () => {
    setState({ ...state, selectedProvider: null });
    props.navigation.goBack();
  }

  const selectProvider = (provider) => {
    setState({ ...state, selectedProvider: provider });
  };

  const lCom = {icon:isRTL ? 'ios-arrow-forward':'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }
  const rCom = { icon:isRTL ? 'ios-arrow-forward':'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }
  return (
    <View style={styles.container}>
      <Header
        backgroundColor={colors.HEADER}
        leftComponent={isRTL ? null:lCom}
        rightComponent={isRTL? rCom:null}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('payment')}</Text>}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />
      {state.selectedProvider ? <PaymentWebView serverUrl={serverUrl} provider={state.selectedProvider} payData={state.payData} onSuccess={onSuccessHandler} onCancel={onCanceledHandler} /> : null}
      {state.providers && state.selectedProvider == null ?
        <ScrollView>
          {
            state.providers.map((provider) => {
              return (
                <TouchableWithoutFeedback onPress={()=>{selectProvider(provider)}} key={provider.name}>
                  <View style={[styles.box, { marginTop: 6 }]} underlayColor={colors.PAYMENT_BUTTON_BLUE}>
                    <Image
                      style={styles.thumb}
                      source={icons[provider.name]}
                    />
                  </View>
                </TouchableWithoutFeedback>
              );
            })
          }
        </ScrollView>
        : null
      }
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    flex: 1
  },
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: 'Roboto-Bold',
    fontSize: 20
  },
  box: {
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.SELECT_GATEWAY_BACKGROUND,
    borderRadius: 8,
    marginBottom: 4,
    marginHorizontal: 20,
    marginTop: 8
  },
  thumb: {
    height: 35,
    width: 100,
    resizeMode: 'contain'

  }
});
