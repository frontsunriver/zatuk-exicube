
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  TextInput,
  FlatList
} from 'react-native';
import { Header } from 'react-native-elements';
import { colors } from '../common/theme';

import i18n from 'i18n-js';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

export default function AddMoneyScreen(props) {

  const settings = useSelector(state => state.settingsdata.settings);
  const { userdata, providers } = props.route.params;

  const [state, setState] = useState({
    userdata: userdata,
    providers: providers,
    amount: '',
    qickMoney: [],
  });

  const defaultAmount = ['5', '10', '20', '50', '100'];

  useEffect(() => {
      let arr = [];
      if( settings && settings.walletMoneyField && settings.walletMoneyField != ""){
        const moneyField = settings.walletMoneyField.split(",");
        for (let i = 0; i < moneyField.length; i++) {
          arr.push({ amount: moneyField[i], selected: false });
        }
        
      }
      else{
        for (let i = 0; i < defaultAmount.length; i++) {
          arr.push({ amount: defaultAmount[i], selected: false });
        } 
      }
      setState({...state, amount: arr[0].amount, qickMoney: arr});
  }, [settings]);

  const quckAdd = (index) => {
    let quickM = state.qickMoney;
    for (let i = 0; i < quickM.length; i++) {
      quickM[i].selected = false;
      if (i == index) {
        quickM[i].selected = true;
      }
    }
    setState({
      ...state,
      amount: quickM[index].amount,
      qickMoney: quickM
    })
  }

  const payNow = () => {
    var d = new Date();
    var time = d.getTime();
    let payData = {
      email: state.userdata.email,
      amount: state.amount,
      order_id: "wallet-" + state.userdata.uid + "-" +time.toString(),
      name: t('add_money'),
      description: t('wallet_ballance'),
      currency: settings.code,
      quantity: 1,
      paymentType: 'walletCredit'
    }
    if (payData) {
      props.navigation.navigate("paymentMethod", {
        payData: payData,
        userdata: state.userdata,
        settings: state.settings,
        providers: state.providers
      });
    }
  }

  const newData = ({ item, index }) => {
    return (
      <TouchableOpacity style={[styles.boxView, { backgroundColor: item.selected ? colors.BUTTON_BACKGROUND : colors.BACKGROUND_PRIMARY }]} onPress={() => { quckAdd(index); }}>
        {settings.swipe_symbol===false?
          <Text style={[styles.quckMoneyText, { color: item.selected ? colors.WHITE : colors.BLACK }]} >{settings.symbol}{item.amount}</Text>
          :
          <Text style={[styles.quckMoneyText, { color: item.selected ? colors.WHITE : colors.BLACK }]} >{item.amount}{settings.symbol}</Text>
        }
      </TouchableOpacity>
    )
  }


  //go back
  const goBack = () => {
    props.navigation.goBack();
  }

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  const lCom = { icon:isRTL ? 'ios-arrow-forward':'arrow-back-sharp', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }
  const rCom = { icon:isRTL ? 'ios-arrow-forward':'arrow-back-sharp', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }

  return (
    <View style={styles.mainView}>
      <Header
        backgroundColor={colors.HEADER}
        leftComponent={isRTL ? null:lCom}
        rightComponent={isRTL? rCom:null}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('add_money')}</Text>}
        containerStyle={styles.headerStyle}
        innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
      />

      <View style={styles.bodyContainer}>
        <View style={[isRTL?{flexDirection:'row-reverse',alignItems: 'center'}:{flexDirection:'row',alignItems: 'center'}]}>
        <Text style={styles.walletbalText }>{t('Balance')} </Text>
        <Text>- </Text>
        {settings.swipe_symbol===false?
          <Text style={styles.ballance}>{settings.symbol}{state.userdata ? parseFloat(state.userdata.walletBalance).toFixed(settings.decimal) : ''}</Text>
          :
          <Text style={styles.ballance}>{state.userdata ? parseFloat(state.userdata.walletBalance).toFixed(settings.decimal) : ''}{settings.symbol}</Text>
        }
      </View>
      <View style={styles.inputTextStyle}>
        <TextInput
          style={isRTL?{textAlign:'right',fontSize:30}:{textAlign:'left',fontSize:30}}
          placeholder={t('addMoneyTextInputPlaceholder') + " (" + settings.symbol + ")"}
          keyboardType={'number-pad'}
          onChangeText={(text) => setState({ ...state,amount: text })}
          value={state.amount}
        />
        </View>
        <View style={styles.quickMoneyContainer}>
            <FlatList
              keyExtractor={(item, index) => index.toString()}
              data={state.qickMoney}
              renderItem={newData}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            />
        </View>
        <TouchableOpacity
          style={styles.buttonWrapper2}
          onPress={payNow}>
          <Text style={styles.buttonTitle}>{t('add_money')}</Text>
        </TouchableOpacity>
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

  mainView: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  bodyContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 12
  },
  walletbalText: {
    fontSize: 17
  },
  ballance: {
    fontWeight: 'bold'
  },
  inputTextStyle: {
    marginTop: 10,
    height: 40,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,

  },
  buttonWrapper2: {
    marginBottom: 10,
    marginTop: 18,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BUTTON_BACKGROUND,
    borderRadius: 8,
  },
  buttonTitle: {
    color: colors.WHITE,
    fontSize: 18,
  },
  quickMoneyContainer: {
    marginTop: 18,
    flexDirection: 'row',
    paddingVertical: 4,
    paddingLeft: 4,
  },
  boxView: {
    height: 40,
    width: 60,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  quckMoneyText: {
    fontSize: 16,
  }

});
