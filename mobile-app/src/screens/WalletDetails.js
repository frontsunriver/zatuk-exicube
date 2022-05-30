
import React, { useEffect, useState} from 'react';
import { WTransactionHistory } from '../components';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
  Alert
} from 'react-native';
import { Header, Icon } from 'react-native-elements';
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { DrawerActions } from '@react-navigation/native';

export default function WalletDetails(props) {

  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const providers = useSelector(state => state.paymentmethods.providers);
  const [profile,setProfile] = useState();

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  useEffect(()=>{
    if(auth.info && auth.info.profile){
        setProfile(auth.info.profile);
    } else{
        setProfile(null);
    }
},[auth.info]);

  const doReacharge = () => {
    if(!(profile.mobile && profile.mobile.length > 6) || profile.email == ' ' || profile.firstName == ' ' || profile.lastName == ' ' ){
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.navigate('editUser');
     } else{
          if (providers) {
      props.navigation.push('addMoney', { userdata: { ...auth.info.profile, uid: auth.info.uid}, providers: providers });
    } else {
      Alert.alert(t('alert'),t('provider_not_found'))
    }
  }
}

  const doWithdraw = () => {
    if(!(profile.mobile && profile.mobile.length > 6) || profile.email == ' ' || profile.firstName == ' ' || profile.lastName == ' ' ){
      Alert.alert(t('alert'), t('profile_incomplete'));
      props.navigation.navigate('editUser');
    }else{
    if (parseFloat(auth.info.profile.walletBalance)>0) {
      props.navigation.push('withdrawMoney', { userdata: { ...auth.info.profile, uid: auth.info.uid} });
    } else {
      Alert.alert(t('alert'),t('wallet_zero'))
    }
  }
}

  const walletBar = height / 4;

  const lCom ={ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } };
  const rCom = auth.info && auth.info.profile && (auth.info.profile.usertype =='driver' || (auth.info.profile.usertype =='rider' && settings && settings.RiderWithDraw))?<TouchableOpacity onPress={doWithdraw}><Text style={{color:colors.WHITE, marginTop: 5}}>{t('withdraw')}</Text></TouchableOpacity>:null;

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.HEADER}
        leftComponent={isRTL? rCom:lCom}
        rightComponent={isRTL? lCom:rCom}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('my_wallet_tile')}</Text>}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />

      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ height: walletBar, marginBottom: 12 }}>
          <View >
            <View style={{ flexDirection:isRTL?'row-reverse':'row', justifyContent: "space-around", marginTop: 8 }}>
              <View style={{ height: walletBar - 50, width: '48%', backgroundColor: colors.BORDER_BACKGROUND, borderRadius: 8, justifyContent: 'center', flexDirection: 'column' }}>
                <Text style={{ textAlign: 'center', fontSize: 18 }}>{t('wallet_ballance')}</Text>
                {settings.swipe_symbol===false?
                  <Text style={{ textAlign: 'center', fontSize: 25, fontWeight: '500', color: colors.BALANCE_GREEN }}>{settings.symbol}{auth.info && auth.info.profile ? parseFloat(auth.info.profile.walletBalance).toFixed(settings.decimal) : ''}</Text>
                  :
                  <Text style={{ textAlign: 'center', fontSize: 25, fontWeight: '500', color: colors.BALANCE_GREEN }}>{auth.info && auth.info.profile ? parseFloat(auth.info.profile.walletBalance).toFixed(settings.decimal) : ''}{settings.symbol}</Text>
                }
              </View>
              <TouchableWithoutFeedback onPress={doReacharge}>
                <View style={{ height: walletBar - 50, width: '48%', backgroundColor: colors.BALANCE_GREEN , borderRadius: 8, justifyContent: 'center', flexDirection: 'column' }}>
                  <Icon
                    name='add-circle'
                    type='MaterialIcons'
                    color={colors.WHITE}
                    size={45}
                    iconStyle={{ lineHeight: 48 }}
                  />
                  <Text style={{ textAlign: 'center', fontSize: 18, color: colors.WHITE }}>{t('add_money')}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={{ marginVertical: 10 }}>
            <Text style={{ paddingHorizontal: 10, fontSize: 18, fontWeight: '500', marginTop: 8, textAlign:isRTL? "right":"left" }}>{t('transaction_history_title')}</Text>
          </View>
        </View>

        <View style={{flex:1}}>
          <View style={{ height: '100%',paddingBottom:6}}>
            <WTransactionHistory walletHistory={auth.info && auth.info.profile? auth.info.profile.walletHistory: []}/>
          </View>
        </View>
      </View>

    </View>
  );

}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontFamily: 'Roboto-Bold',
    fontSize: 20
  },

  textContainer: {
    textAlign: "center"
  },
  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },

});
