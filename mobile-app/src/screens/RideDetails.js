import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    ImageBackground,
    ScrollView,
    Dimensions,
    Platform
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Header, Rating, Avatar, Button } from 'react-native-elements';
import Dash from 'react-native-dash';
import { colors } from '../common/theme';
var { width } = Dimensions.get('window');
import i18n from 'i18n-js';

import { useSelector } from 'react-redux';

export default function RideDetails(props) {

    const {data}  = props.route.params;
    const paramData = data;
    const settings = useSelector(state => state.settingsdata.settings);
    const auth = useSelector(state => state.auth);

    const goBack = () => {
        props.navigation.goBack();
    }

    const goToBooking = (id) => {
        if(paramData.status == 'PAYMENT_PENDING'){
            props.navigation.navigate('PaymentDetails', { booking: paramData });
        }else{
            props.navigation.replace('BookedCab',{bookingId:id});
        }
    };

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const lCom ={ icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } };
    const rCom ={ icon: 'ios-arrow-forward', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } };

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL? null:lCom}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('ride_details_page_title')}</Text>}
                rightComponent={isRTL? rCom:null}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <ScrollView>
                <View style={styles.mapView}>
                    <View style={styles.mapcontainer}>
                        {paramData?
                        <MapView style={styles.map}
                            provider={PROVIDER_GOOGLE}
                            region={{
                                latitude: (paramData.pickup.lat),
                                longitude: (paramData.pickup.lng),
                                latitudeDelta: 0.3,
                                longitudeDelta: 0.3
                            }}
                        >
                                <Marker
                                    coordinate={{ latitude: paramData ? (paramData.pickup.lat) : 0.00, longitude: paramData ? (paramData.pickup.lng) : 0.00 }}
                                    title={'marker_title_1'}
                                    description={paramData ? paramData.pickup.add : null}
                                    pinColor={colors.GREEN_DOT}
                                />
                                <Marker
                                    coordinate={{ latitude: (paramData.drop.lat), longitude: (paramData.drop.lng) }}
                                    title={'marker_title_2'}
                                    description={paramData.drop.add}
                                />
                                {paramData.coords?
                                <MapView.Polyline
                                    coordinates={paramData.coords}
                                    strokeWidth={4}
                                    strokeColor={colors.INDICATOR_BLUE}
                                    lineDashPattern={[1]}
                                    geodesic={true}
                                />
                                :null}
                        </MapView>
                        :null}
                    </View>
                </View>
                <View style={styles.rideDesc}>

                    <View style={[styles.userDesc,{flexDirection:isRTL?'row-reverse':'row'}]}>

                        {/* Driver Image */}
                        {paramData ?
                            paramData.driver_image != '' ?
                                <Avatar
                                    size="small"
                                    rounded
                                    source={{ uri: paramData.driver_image }}
                                    activeOpacity={0.7}
                                />
                                : paramData.driver_name != '' ?
                                    <Avatar
                                        size="small"
                                        rounded
                                        source={require('../../assets/images/profilePic.png')}
                                        activeOpacity={0.7}
                                    /> : null



                            : null}
                        <View style={[styles.userView,isRTL?{paddingRight:28}:{paddingLeft:28}]}>
                            {/*Driver Name */}
                            {paramData && paramData.driver_name != '' ? <Text style={[styles.personStyle,{textAlign:isRTL?'right':'left'}]}>{paramData.driver_name}</Text> : null}
                            {paramData && paramData.rating > 0 ?

                                <View style={[styles.personTextView,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                    {/*My rating to driver */}
                                    <Text style={[styles.ratingText,isRTL?{marginLeft:8}:{marginRight:8}]}>{t('you_rated_text')}</Text>
                                    <Rating
                                        type="star"
                                        fractions={3}
                                        startingValue={parseFloat(paramData.rating)}
                                        readonly
                                        imageSize={15}
                                        style={{ paddingVertical: 10 }}
                                        showRating={false}
                                    />
                                </View>
                                : null}
                        </View>
                    </View>
                    {/*Car details */}
                    {paramData && paramData.carType ?
                        <View style={[styles.userDesc, styles.avatarView, {flexDirection:isRTL?'row-reverse':'row'}]}>

                            <Avatar
                                size="small"
                                rounded
                                source={paramData.carImage ? { uri: paramData.carImage } : require('../../assets/images/microBlackCar.png')}
                                activeOpacity={0.7}
                            />
                            <View style={[styles.userView, isRTL?{paddingRight:28}:{paddingLeft:28}]}>
                                <Text style={[styles.carNoStyle,{textAlign:isRTL? "right":"left"}]}>{paramData.vehicle_number ? paramData.vehicle_number : <Text> {t('car_no_not_found')}</Text>}</Text>
                                <Text style={[styles.carNoStyleSubText,{textAlign:isRTL? "right":"left"}]}>{paramData.carType}</Text>
                            </View>
                        </View>

                        : null}

                    <View style={[styles.userDesc, {flexDirection:isRTL?'row-reverse':'row'}]}>
                        <Avatar
                            size="small"
                            source={Platform.OS == 'ios' ? require('../../assets/images/fareMetar.jpg') : require('../../assets/images/fareMetar.jpg')}
                            activeOpacity={0.7}

                        />
                        <View style={[styles.userView, isRTL?{paddingRight:28}:{paddingLeft:28}]}>
                            {settings.swipe_symbol===false?
                                <Text style={[styles.textStyle,{textAlign:isRTL? "right":"left"}]}>{settings.symbol}{paramData && paramData.customer_paid ? parseFloat(paramData.customer_paid).toFixed(settings.decimal) : paramData && paramData.estimate ? paramData.estimate : 0}</Text>
                                :
                                <Text style={[styles.textStyle,{textAlign:isRTL? "right":"left"}]}>{paramData && paramData.customer_paid ? parseFloat(paramData.customer_paid).toFixed(settings.decimal) : paramData && paramData.estimate ? paramData.estimate : 0}{settings.symbol}</Text>
                            }
                        </View>
                    </View>
                </View>
                <View>
                    <View style={[styles.location, isRTL?{flexDirection:'row-reverse'}:{flexDirection:'row'}]}>
                        {paramData && paramData.trip_start_time ?
                            <View>
                                <Text style={[styles.timeStyle,{textAlign:isRTL?'right':'left'}]}>{paramData.trip_start_time}</Text>
                            </View>
                            : null}
                        {paramData && paramData.pickup ?
                            <View style={[styles.address, isRTL?{flexDirection:'row-reverse', marginRight:6}:{flexDirection:'row', marginLeft:6}]}>
                                <View style={styles.greenDot} />
                                <Text style={[styles.adressStyle, isRTL?{marginRight:6, textAlign:'right'}:{marginLeft:6, textAlign:'left'}]}>{paramData.pickup.add}</Text>
                            </View>
                            : null}
                    </View>

                    <View style={[styles.location, isRTL?{flexDirection:'row-reverse'}:{flexDirection:'row'}]}>
                        {paramData && paramData.trip_end_time ?
                            <View>
                                <Text style={[styles.timeStyle,{textAlign:isRTL?'right':'left'}]}>{paramData.trip_end_time}</Text>
                            </View>
                            : null}
                        {paramData && paramData.drop ?
                            <View style={[styles.address, isRTL?{flexDirection:'row-reverse', marginRight:6}:{flexDirection:'row', marginLeft:6}]}>
                                <View style={styles.redDot} />
                                <Text style={[styles.adressStyle, isRTL?{marginRight:6, textAlign:'right'}:{marginLeft:6, textAlign:'left'}]}>{paramData.drop.add}</Text>
                            </View>
                            : null}
                    </View>
                </View>
                {paramData && ['PENDING','PAID','COMPLETE'].indexOf(paramData.status) != -1 ?
                    <View style={styles.billView}>
                        <View style={styles.billView}>
                            <Text style={[styles.billTitle,{textAlign:isRTL?'right':'left'}]}>{t('bill_details_title')}</Text>
                        </View>
                        <View style={styles.billOptions}>
                            <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                <Text style={[styles.billName,{textAlign:isRTL?'right':'left'}]}>{t('your_trip')}</Text>
                                {settings.swipe_symbol===false?
                                    <Text style={[styles.billAmount,{textAlign:isRTL?'right':'left'}]}>{settings.symbol} {paramData && paramData.trip_cost > 0 ? parseFloat(paramData.trip_cost).toFixed(settings.decimal) : paramData && paramData.estimate ? parseFloat(paramData.estimate).toFixed(settings.decimal) : 0}</Text>
                                    :
                                    <Text style={[styles.billAmount,{textAlign:isRTL?'right':'left'}]}>{paramData && paramData.trip_cost > 0 ? parseFloat(paramData.trip_cost).toFixed(settings.decimal) : paramData && paramData.estimate ? parseFloat(paramData.estimate).toFixed(settings.decimal) : 0} {settings.symbol}</Text>
                                }
                            </View>
                            <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                <View>
                                    <Text style={[styles.billName, styles.billText,{textAlign:isRTL?'right':'left'}]}>{t('discount')}</Text>
                                    <Text style={[styles.taxColor,{textAlign:isRTL?'right':'left'}]}>{t('promo_apply')}</Text>
                                </View>
                                {settings.swipe_symbol===false?
                                    <Text style={[styles.discountAmount,{textAlign:isRTL?'right':'left'}]}> {isRTL? null: '-'} {settings.symbol}{paramData && paramData.discount_amount ? parseFloat(paramData.discount_amount).toFixed(settings.decimal) : 0} {isRTL? '-':null}</Text>
                                    :
                                    <Text style={[styles.discountAmount,{textAlign:isRTL?'right':'left'}]}> {isRTL? null: '-'} {paramData && paramData.discount_amount ? parseFloat(paramData.discount_amount).toFixed(settings.decimal) : 0} {settings.symbol} {isRTL? '-':null}</Text>
                                }
                            </View>

                            {paramData && paramData.cardPaymentAmount ? paramData.cardPaymentAmount > 0 ?
                                <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                    <View>
                                        <Text style={{textAlign:isRTL?'right':'left'}}>{t('CardPaymentAmount')}</Text>

                                    </View>
                                    {settings.swipe_symbol===false?
                                        <Text style={{textAlign:isRTL?'right':'left'}}>  {settings.symbol}{paramData && paramData.cardPaymentAmount ? parseFloat(paramData.cardPaymentAmount).toFixed(settings.decimal) : 0}</Text>
                                        :
                                        <Text style={{textAlign:isRTL?'right':'left'}}>  {paramData && paramData.cardPaymentAmount ? parseFloat(paramData.cardPaymentAmount).toFixed(settings.decimal) : 0}{settings.symbol}</Text>
                                    }
                                </View>
                                : null : null}
                            {paramData && paramData.cashPaymentAmount ? paramData.cashPaymentAmount > 0 ?
                                <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                    <View>
                                        <Text style={{textAlign:isRTL?'right':'left'}}>{t('CashPaymentAmount')}</Text>

                                    </View>
                                    {settings.swipe_symbol===false?
                                        <Text style={{textAlign:isRTL?'right':'left'}}>  {settings.symbol}{paramData && paramData.cashPaymentAmount ? parseFloat(paramData.cashPaymentAmount).toFixed(settings.decimal) : 0}</Text>
                                        :
                                        <Text style={{textAlign:isRTL?'right':'left'}}>  {paramData && paramData.cashPaymentAmount ? parseFloat(paramData.cashPaymentAmount).toFixed(settings.decimal) : 0}{settings.symbol}</Text>
                                    }
                                </View>
                                : null : null}
                            {paramData && paramData.usedWalletMoney ? paramData.usedWalletMoney > 0 ?
                                <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                    <View>
                                        <Text style={{textAlign:isRTL?'right':'left'}}>{t('WalletPayment')}</Text>

                                    </View>
                                    {settings.swipe_symbol===false?
                                        <Text style={{textAlign:isRTL?'right':'left'}}>  {settings.symbol}{paramData && paramData.usedWalletMoney ? parseFloat(paramData.usedWalletMoney).toFixed(settings.decimal) : 0}</Text>
                                        :
                                        <Text style={{textAlign:isRTL?'right':'left'}}>  {paramData && paramData.usedWalletMoney ? parseFloat(paramData.usedWalletMoney).toFixed(settings.decimal) : 0}{settings.symbol}</Text>
                                    }
                                </View>
                                : null : null}
                        </View>
                        <View style={[styles.paybleAmtView,{flexDirection:isRTL?'row-reverse':'row'}]}>
                            <Text style={[styles.billTitle,{textAlign:isRTL?'right':'left'}]}>{t('Customer_paid')}</Text>
                            {settings.swipe_symbol===false?
                                <Text style={[styles.billAmount2,{textAlign:isRTL?'right':'left'}]}>{settings.symbol}{paramData && paramData.customer_paid ? parseFloat(paramData.customer_paid).toFixed(settings.decimal) : null}</Text>
                                :
                                <Text style={[styles.billAmount2,{textAlign:isRTL?'right':'left'}]}>{paramData && paramData.customer_paid ? parseFloat(paramData.customer_paid).toFixed(settings.decimal) : null}{settings.symbol}</Text>
                            }
                        </View>
                    </View>
                    : null}
                {paramData &&  ['PENDING','PAID','COMPLETE'].indexOf(paramData.status) != -1 ?
                    <View>
                        <View style={styles.iosView}>
                            {
                                Platform.OS == 'ios' ?
                                    <ImageBackground source={require('../../assets/images/dash.png')}
                                        style={styles.backgroundImage}
                                        resizeMode={Platform.OS == 'ios' ? 'repeat' : 'stretch'}>
                                    </ImageBackground>
                                    :
                                    <Dash style={styles.dashView} />
                            }
                        </View>

                        <View style={styles.paymentTextView}>
                            <Text style={[styles.billTitle,{textAlign:isRTL?'right':'left'}]}>{t('payment_status')}</Text>
                        </View>
                        {paramData && paramData.status ?
                            <View style={styles.billOptions}>
                                <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                    <Text style={[styles.billName,{textAlign:isRTL?'right':'left'}]}>{t('payment_status')}</Text>
                                    <Text style={[styles.billAmount,{textAlign:isRTL?'right':'left'}]}>{t(paramData.status)}</Text>

                                </View>
                                {['PAID','COMPLETE'].indexOf(paramData.status) != -1 ?
                                <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                    <Text style={[styles.billName,{textAlign:isRTL?'right':'left'}]}>{t('pay_mode')}</Text>
                                    <Text style={[styles.billAmount,{textAlign:isRTL?'right':'left'}]}>{paramData.payment_mode ? paramData.payment_mode : null} {paramData.gateway ? '(' + paramData.gateway + ')' : null}</Text>
                                </View>
                                :null}
                            </View>
                            : <View style={styles.billOptions}>
                                <View style={[styles.billItem,{flexDirection:isRTL?'row-reverse':'row'}]}></View>
                            </View>}
                    </View>
                :null}
                {(paramData && paramData.status &&  auth && auth.info && auth.info.profile && 
                    (((['PAYMENT_PENDING','NEW','ACCEPTED','ARRIVED','STARTED','REACHED','PENDING','PAID'].indexOf(paramData.status) != -1) && auth.info.profile.usertype=='rider') ||
                    ((['ACCEPTED','ARRIVED','STARTED','REACHED'].indexOf(paramData.status) != -1) && auth.info.profile.usertype=='driver')))?
                    <View style={styles.locationView2}>
                        <Button
                            title={t('go_to_booking')}
                            loading={false}
                            loadingProps={{ size: "large", color: colors.GREEN_DOT }}
                            titleStyle={styles.buttonTitleText2}
                            onPress={() => { goToBooking(paramData.id) }}
                            containerStyle={styles.paynowButton}
                        />
                    </View> : null}
            </ScrollView>
        </View>
    )

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
    containerView: {
        flex: 1
    },
    textContainer: {
        textAlign: "center"
    },
    mapView: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 160,
        marginBottom: 15
    },
    mapcontainer: {
        flex: 7,
        width: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: colors.TRANSPARENT,
        borderStyle: 'solid',
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderBottomWidth: 10,
        borderLeftColor: colors.TRANSPARENT,
        borderRightColor: colors.TRANSPARENT,
        borderBottomColor: colors.BOX_BG,
        transform: [
            { rotate: '180deg' }
        ]
    },
    rideDesc: {
        flexDirection: 'column'
    },
    userDesc: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        alignItems: 'center'
    },
    userView: {
        flexDirection: 'column',
        paddingLeft: 28,
    },
    locationView: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        padding: 10,
        marginVertical: 14,
        justifyContent: "space-between",
    },
    locationView2: {
        flex: 1,
        flexDirection: 'row',
        // paddingHorizontal: 10,
        padding: 10,
        marginVertical: 14,

    },
    // callButtonStyle:{
    // width:400
    // },
    location: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 6,
        marginHorizontal: 8
    },
    greenDot: {
        backgroundColor: colors.GREEN_DOT,
        width: 10,
        height: 10,
        borderRadius: 50,
        alignSelf: 'flex-start',
        marginTop: 5
    },
    redDot: {
        backgroundColor: colors.RED,
        width: 10,
        height: 10,
        borderRadius: 50,
        alignSelf: 'flex-start',
        marginTop: 5
    },
    address: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: 0,
        marginLeft: 6
    },
    billView: {
        marginVertical: 5
    },
    billTitle: {
        fontSize: 18,
        color: colors.RIDEDETAILS_TEXT,
        fontFamily: 'Roboto-Bold'
    },
    billOptions: {
        marginHorizontal: 10,
        marginVertical: 6
    },
    billItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginVertical: 15
    },
    billName: {
        fontSize: 16,
        fontFamily: 'Roboto-Regular',
        color: colors.RIDEDETAILS_TEXT
    },
    billAmount: {
        fontSize: 16,
        fontFamily: 'Roboto-Medium',
        color: colors.RIDEDETAILS_TEXT
    },
    discountAmount: {
        fontSize: 16,
        fontFamily: 'Roboto-Medium',
        color: colors.RED
    },

    billAmount2: {
        fontWeight: 'bold',
        fontSize: 18,
        fontFamily: 'Roboto-Bold',
        color: colors.RIDEDETAILS_TEXT
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: 2,
    },
    carNoStyle: {
        fontSize: 16,
        //fontWeight: 'bold', 
        fontFamily: 'Roboto-Medium'
    },
    carNoStyleSubText: {
        fontSize: 16,
        //fontWeight: 'bold', 
        fontFamily: 'Roboto-Regular',
        color: colors.RIDEDETAILS_TEXT
    },
    textStyle: {
        fontSize: 16,
        //fontWeight: 'bold', 
        fontFamily: 'Roboto-Medium'
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },
    personStyle: {
        fontSize: 16,
        //fontWeight: 'bold', 
        color: colors.BLACK,
        fontFamily: 'Roboto-Medium'
    },
    personTextView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    ratingText: {
        fontSize: 16,
        color: colors.BUTTON,
        marginRight: 8,
        fontFamily: 'Roboto-Regular'
    },
    avatarView: {
        marginVertical: 15
    },
    timeStyle: {
        fontFamily: 'Roboto-Regular',
        fontSize: 16,
        marginTop: 1
    },
    adressStyle: {
        marginLeft: 6,
        fontSize: 15,
        lineHeight: 20
    },
    billView: {
        paddingHorizontal: 14
    },
    billText: {
        fontFamily: 'Roboto-Bold'
    },
    taxColor: {
        color: colors.RIDEDETAILS_TEXT
    },
    paybleAmtView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10
    },
    iosView: {
        paddingVertical: 10
    },
    dashView: {
        width: width, height: 1
    },
    paymentTextView: {
        paddingHorizontal: 10
    },
    // callButtonStyle:{
    //     width:50+'%'
    // },
    callButtonContainerStyle1: {
        flex: 1,
        width: '80%',
        height: 100
    },
    callButtonContainerStyle2: {
        flex: 1,
        width: '80%',
        height: 100,
        paddingLeft: 10
    },
    paynowButton: {
        flex: 1,
        width: '80%',
        height: 150,
        paddingLeft: 10
    },
});