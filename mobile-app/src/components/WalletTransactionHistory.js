import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, FlatList, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements'
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import moment from 'moment/min/moment-with-locales';

export default function  WTransactionHistory(props) {

    const [data,setData] = useState(null);
    const settings = useSelector(state => state.settingsdata.settings);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    useEffect(()=>{
        let wdata = props.walletHistory;
        var wallHis = []
        for(key in wdata){
            wdata[key].walletKey = key
            let d = wdata[key].date;
            let tDate = new Date(d);
            wdata[key].date = moment(tDate).format('lll');
            wallHis.push(wdata[key])
        }
        wallHis.length>0?setData(wallHis.reverse()):setData([]);
    },[props.walletHistory]);

    const newData = ({ item }) => {
        return (
            <View style={styles.container}>
                <View style={[styles.divCompView, {flexDirection:isRTL?'row-reverse':'row'}]}>
                    <View style={styles.containsView}>
                        <View style={[styles.statusStyle, {flexDirection:isRTL?'row-reverse':'row'}]}>
                            {item.type == 'Credit' ?
                                <View style={[styles.crimageHolder,isRTL?{marginRight: 10}:{marginLeft: 10}]}>
                                    <Icon
                                        iconStyle={styles.debiticonPositionStyle}
                                        name={isRTL ?'keyboard-arrow-right':'keyboard-arrow-left'}
                                        type='MaterialIcons'
                                        size={32}
                                        color={colors.WHITE}
                                    />

                                </View>
                            :null}
                            {item.type == 'Debit' ?
                                <View style={[styles.drimageHolder,isRTL?{marginRight: 10}:{marginLeft: 10}]}>
                                    <Icon
                                        iconStyle={styles.crediticonPositionStyle}
                                        name={isRTL ?'keyboard-arrow-left':'keyboard-arrow-right'}
                                        type='MaterialIcons'
                                        size={32}
                                        color={colors.WHITE}
                                    />
                                </View>
                            :null}
                            {item.type == 'Withdraw' ?
                                <View style={[styles.primageHolder,isRTL?{marginRight: 10}:{marginLeft: 10}]}>
                                    <Icon
                                        iconStyle={styles.crediticonPositionStyle}
                                        name='keyboard-arrow-down'
                                        type='MaterialIcons'
                                        size={32}
                                        color={colors.WHITE}
                                    />
                                </View>
                            :null}
                            <View style={[styles.statusView, isRTL?{marginRight: 10}:{marginLeft: 10}]}>
                            {item.type  && item.type == 'Credit'?
                                settings.swipe_symbol===false?
                                    <Text style={[styles.historyamounttextStyle, {textAlign:isRTL? "right":"left"}]}>{t('credited') + ' ' + settings.symbol + parseFloat(item.amount).toFixed(settings.decimal)}</Text>
                                    :
                                    <Text style={[styles.historyamounttextStyle, {textAlign:isRTL? "right":"left"}]}>{t('credited') + ' ' + parseFloat(item.amount).toFixed(settings.decimal) + settings.symbol}</Text>
                            :null}
                            {item.type && item.type == 'Debit'?
                                settings.swipe_symbol===false?
                                    <Text style={[styles.historyamounttextStyle, {textAlign:isRTL? "right":"left"}]}>{t('debited') + ' ' + settings.symbol + parseFloat(item.amount).toFixed(settings.decimal)}</Text>
                                    :
                                    <Text style={[styles.historyamounttextStyle, {textAlign:isRTL? "right":"left"}]}>{t('debited') + ' ' + parseFloat(item.amount).toFixed(settings.decimal) + settings.symbol}</Text>
                            :null}
                            {item.type && item.type == 'Withdraw'?
                                settings.swipe_symbol===false?
                                    <Text style={[styles.historyamounttextStyle, {textAlign:isRTL? "right":"left"}]}>{t('withdrawn') + ' ' + settings.symbol + parseFloat(item.amount).toFixed(settings.decimal)}</Text>
                                    :
                                    <Text style={[styles.historyamounttextStyle, {textAlign:isRTL? "right":"left"}]}>{t('withdrawn') + ' ' + parseFloat(item.amount).toFixed(settings.decimal) + settings.symbol}</Text>
                            :null}   
                            <Text style={[styles.textStyle, {textAlign:isRTL? "right":"left"}]}>{t('transaction_id')} {item.txRef.startsWith('wallet')?item.transaction_id:item.txRef}</Text>
                            <Text style={[styles.textStyle2, {textAlign:isRTL? "right":"left"}]}>{item.date}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        )
    }
    return (
        <FlatList
            keyExtractor={(item, index) => index.toString()}
            data={data}
            renderItem={newData}
        />
    );
    
};
const styles = StyleSheet.create({
    myHeader: {
        marginTop: 0,
    },
    container: {
        flex: 1,
    },
    divCompView: {
        height: 80,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        backgroundColor: colors.BORDER_BACKGROUND,
        flexDirection: 'row',
        flex: 1,
        borderRadius: 6,
    },
    drimageHolder: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.RED,
        padding: 3
    },
    crimageHolder: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.BALANCE_GREEN,
    },
    primageHolder: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue',
        padding: 3
    },
    containsView: {
        justifyContent: 'center',
    },

    statusStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems : 'center'
    },
    statusView: {
        marginLeft: 10

    },
    textStyle: {
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        fontWeight:'500',
        color: colors.PROMO
    },
    historyamounttextStyle: {
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        fontWeight:'500'
    },
    textStyle2:{
        fontSize: 14,
        fontFamily: 'Roboto-Regular',
        color: colors.PROMO
    },
    textColor: {
        color: colors.WALLET_PRIMARY,
        alignSelf: 'center',
        fontSize: 12,
        fontFamily: 'Roboto-Regular',
        paddingLeft: 5
    },
    textFormat: {
        flex: 1,
        width: Dimensions.get("window").width - 100
    },
    cabLogoStyle: {
        width: 25,
        height: 28,
        flex: 1
    },
    clockIconStyle: {
        flexDirection: 'row',
        marginTop: 8
    },
    debiticonPositionStyle: {
        alignSelf: 'flex-start',
    },
    crediticonPositionStyle: {
        alignSelf: 'flex-start',
    }
});
