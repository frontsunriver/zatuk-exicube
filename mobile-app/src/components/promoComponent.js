import React from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import { Avatar, Button } from "react-native-elements";
import { colors } from "../common/theme";
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';

export default function PromoComp(props) {

  const settings = useSelector(state => state.settingsdata.settings);
  const promos = useSelector(state => state.promodata.promos);

  const onPressButton = (item, index) => {
    const { onPressButton } = props;
    onPressButton(item, index)
  }

  const { t } = i18n;
  const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

  const renderData = ({ item, index }) => {
    return (
      <View style={[styles.container,{flexDirection:isRTL?'row-reverse':'row'}]} >
        <View style={styles.promoViewStyle}>
          <View style={[styles.promoPosition,{flexDirection:isRTL?'row-reverse':'row'}]}>
            <View style={[styles.avatarPosition,{justifyContent:isRTL?'flex-end':'flex-start'}]}>
              <Avatar
                size={40}
                rounded
                source={{
                  uri: item.promo_discount_type ?
                    item.promo_discount_type == 'flat' ? "https://cdn1.iconfinder.com/data/icons/service-maintenance-icons/512/tag_price_label-512.png" :
                      "https://cdn4.iconfinder.com/data/icons/icoflat3/512/discount-512.png" : null
                }}
              />
            </View>
            <View style={[styles.textViewStyle,isRTL?{marginRight:10}:{marginLeft:0}]}>
              <View style={{flexDirection:isRTL?'row-reverse':'row'}}>
                <Text style={[styles.couponCode,{textAlign:isRTL? "right":"left"}]}>{isRTL? ' - ':null}{item.promo_name}{isRTL? null:' - '}</Text>
                <Text style={[styles.textStyle,{textAlign:isRTL? "right":"left"}]}>{item.promo_description}</Text>
              </View>
              {settings.swipe_symbol===false?
                <Text style={[styles.timeTextStyle,{textAlign:isRTL? "right":"left"}]}>{t('min_order_value')} {settings.symbol}{item.min_order}</Text>
                :
                <Text style={[styles.timeTextStyle,{textAlign:isRTL? "right":"left"}]}>{t('min_order_value')} {item.min_order}{settings.symbol}</Text>
              }
            </View>
            <View style={styles.applyBtnPosition} >
              <Button
                title={t('apply')}
                TouchableComponent={TouchableOpacity}
                titleStyle={[styles.buttonTitleStyle,{alignSelf:isRTL?'flex-start':'flex-end'}]}
                buttonStyle={[styles.confButtonStyle,{alignSelf:isRTL?'flex-start':'flex-end'}]}
                onPress={() => onPressButton(item, index)}
              />
            </View>
          </View>
          <View style={styles.borderBottomStyle} />
        </View>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={promos}
        renderItem={renderData}
      />
    </View>
  );

}
//Screen Styling
const styles = StyleSheet.create({
  container: {
    width: "95%",
    alignSelf: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  viewStyle: {
    flexDirection: "row",
    backgroundColor: colors.WHITE
  },
  borderBottomStyle: {
    borderBottomWidth: 1,
    marginTop: 5,
    borderBottomColor: colors.BORDER_BACKGROUND,
    opacity: 0.3
  },
  promoViewStyle: {
    flex: 1
  },
  promoPosition: {
    flexDirection: "row"
  },
  avatarPosition: {
    justifyContent: "flex-start",
    flex: 1.5
  },
  textViewStyle: {
    justifyContent: "center",
    flex: 6
  },
  applyBtnPosition: {
    justifyContent: "flex-start",
    flex: 2.5
  },
  textStyle: {
    fontSize: 15,
    flexWrap: "wrap"
  },
  couponCode: {
    fontWeight: 'bold'
  },
  timeTextStyle: {
    color: colors.PROMO,
    marginTop: 2
  },
  buttonContainerStyle: {
    flexDirection: "row",
    marginTop: 4
  },
  buttonTitleStyle: {
    textAlign: "center",
    color: colors.GREEN_DOT,
    fontSize: 11,
    paddingBottom: 0,
    paddingTop: 0
  },
  confButtonStyle: {
    borderRadius: 6,
    height: 29,
    width: 65,
    alignSelf: 'flex-end',
    backgroundColor: colors.BORDER_BACKGROUND,
    elevation: 0
  },
  deleteButtonStyle: {
    backgroundColor: colors.WHITE,
    borderRadius: 6,
    height: 29,
    marginLeft: 8,
    borderColor: colors.HEADER,
    borderWidth: 1,
    width: 85
  },
  deleteBtnTitleStyle: {
    color: colors.RED,
    textAlign: "center",
    fontSize: 11,
    paddingBottom: 0,
    paddingTop: 0
  }
});
