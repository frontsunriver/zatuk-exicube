import React, { useState, useEffect, useContext } from 'react';
import { Registration } from '../components';
import { StyleSheet, View, Alert } from 'react-native';
import { useSelector } from 'react-redux';

import i18n from 'i18n-js';
import { FirebaseContext } from 'common/src';

export default function RegistrationPage(props) {
  const { api } = useContext(FirebaseContext);
  const {
    mainSignUp, 
    validateReferer,
    checkUserExists
  } = api;
  const [loading, setLoading] = useState(false);
  const cars = useSelector(state => state.cartypes.cars);
  const [carTypes, setCarTypes] = useState(null);
  
  const { t } = i18n;

  useEffect(() => {
    if (cars) {
      let arr = [];
      for (let i = 0; i < cars.length; i++) {
        arr.push({ label: cars[i].name, value: cars[i].name });
      }
      setCarTypes(arr);
    }
  }, [cars]);

  const clickRegister = async (regData) => {
    setLoading(true);
    checkUserExists(regData).then((res)=>{
      if(res.users && res.users.length>0){
        setLoading(false);
        Alert.alert(t('alert'),t('user_exists'));
      }
      else if(res.error){
        setLoading(false);
        Alert.alert(t('alert'),t('email_or_mobile_issue'));
      }
      else{
        if (regData.referralId && regData.referralId.length > 0) {
          validateReferer(regData.referralId).then((referralInfo)=>{
            if (referralInfo.uid) {
              mainSignUp({...regData, signupViaReferral: referralInfo.uid}).then((res)=>{
                setLoading(false);
                if(res.uid){
                  Alert.alert(t('alert'),t('account_create_successfully'));
                  props.navigation.goBack();
                }else{
                  Alert.alert(t('alert'),t('reg_error'));
                }
              })
            }else{
              setLoading(false);
              Alert.alert(t('alert'),t('referer_not_found'))
            }
          }).catch((error)=>{
            setLoading(false);
            Alert.alert(t('alert'),t('referer_not_found'))
          });
        } else {
          mainSignUp(regData).then((res)=>{
            setLoading(false);
            if(res.uid){
                Alert.alert(t('alert'),t('account_create_successfully'));
              props.navigation.goBack();
            }else{
              Alert.alert(t('alert'),t('reg_error'));
            }
          })
        }
      }
    });
  }

  return (
    <View style={styles.containerView}>
      {carTypes?
      <Registration
        cars={carTypes}
        onPressRegister={(regData) => clickRegister(regData)}
        onPressBack={() => { props.navigation.goBack() }}
        loading={loading}>
      </Registration>
      :null}
    </View>
  );

}
const styles = StyleSheet.create({
  containerView: { flex: 1 },
  textContainer: { textAlign: "center" },
});
