import React, { useState, useContext, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    Platform,
    Image,
    Modal,
    Dimensions
} from 'react-native';
import { Divider, Button, Header } from 'react-native-elements';
import StarRating from 'react-native-star-rating';
import { colors } from '../common/theme';
var { width } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useDispatch, useSelector } from 'react-redux';
import { FirebaseContext } from 'common/src';
import moment from 'moment/min/moment-with-locales';

export default function DriverRating(props) {
    const { api } = useContext(FirebaseContext);
    const { updateBooking } = api;
    const dispatch = useDispatch();
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const [starCount, setStarCount] = useState(0);
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const settings = useSelector(state => state.settingsdata.settings);
    const [booking,setBooking] = useState();
    const { bookingId } = props.route.params;

    useEffect(() => {
        if (activeBookings && activeBookings.length >= 1) {
            let bookingData = activeBookings.filter(item => item.id == bookingId)[0];
            if (bookingData) {
                setBooking(bookingData);
            }
        }
    },[activeBookings]);

    const onStarRatingPress = (rating) => {
        setStarCount(rating);
    }

    const skipRating = () => {
        let curBooking = {...booking};
        curBooking.status = 'COMPLETE';
        dispatch(updateBooking(curBooking));
        props.navigation.navigate('Map');
    }


    const submitNow = () => {
        let curBooking = {...booking};
        curBooking.rating = starCount;
        curBooking.status = 'COMPLETE';
        dispatch(updateBooking(curBooking));
        props.navigation.navigate('Map');
    }

    const alertModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={alertModalVisible}
                onRequestClose={() => {
                    setAlertModalVisible(false);
                }}>
                <View style={styles.alertModalContainer}>
                    <View style={styles.alertModalInnerContainer}>

                        <View style={styles.alertContainer}>

                            <Text style={styles.rideCancelText}>{t('no_driver_found_alert_title')}</Text>

                            <View style={styles.horizontalLLine} />

                            <View style={styles.msgContainer}>
                                <Text style={styles.cancelMsgText}>{t('thanks')}</Text>
                            </View>
                            <View style={[styles.okButtonContainer,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                <Button
                                    title={t('no_driver_found_alert_OK_button')}
                                    titleStyle={styles.signInTextStyle}
                                    onPress={() => {
                                        setAlertModalVisible(false);
                                        props.navigation.navigate('Map')
                                    }}
                                    buttonStyle={[styles.okButtonStyle,{flexDirection:isRTL?'row-reverse':'row'}]}
                                    containerStyle={styles.okButtonContainerStyle}
                                />
                            </View>

                        </View>

                    </View>
                </View>

            </Modal>
        )
    }

    const lCom ={ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.toggleDrawer(); } };
    const rCom = <Text style={styles.headerskip} onPress={() => { skipRating() }}>{t('skip')}</Text>;

    return (
        <View style={styles.mainViewStyle}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL? rCom:null}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('receipt')}</Text>}
                rightComponent={isRTL? null:rCom}
                containerStyle={styles.headerStyle}
                innerContainerStyles={styles.headerInnerStyle}
            />
            <View style={styles.dateViewStyle}>
                <Text style={styles.dateViewTextStyle}>{booking && booking.tripdate ? moment(booking.tripdate).format('lll') : null}</Text>
            </View>

            <View style={styles.rateViewStyle}>
                {settings.swipe_symbol===false?
                    <Text style={styles.rateViewTextStyle}>{settings.symbol}{booking ? booking.customer_paid > 0 ? parseFloat(booking.customer_paid).toFixed(settings.decimal) : 0 : null}</Text>
                    :
                    <Text style={styles.rateViewTextStyle}>{booking ? booking.customer_paid > 0 ? parseFloat(booking.customer_paid).toFixed(settings.decimal) : 0 : null}{settings.symbol}</Text>
                }
            </View>

            <View style={styles.addressViewStyle}>

                <View style={[styles.pickUpStyle,{flexDirection:isRTL?'row-reverse':'row'}]}>

                    <View style={styles.greenDot}></View>
                    <Text style={[styles.addressViewTextStyle,{textAlign:isRTL?'right':'left'}]}>{booking? booking.pickup.add : ''}</Text>
                </View>

                <View style={[styles.pickUpStyle,{flexDirection:isRTL?'row-reverse':'row'}]}>
                    <View style={styles.redDot}></View>
                    <Text style={[styles.addressViewTextStyle,{textAlign:isRTL?'right':'left'}]}>{booking? booking.drop.add: ''}</Text>
                </View>

            </View>

            <View style={styles.tripMainView}>
                <View style={{ flex: 2.2, justifyContent: 'center', alignItems: "center" }}>
                    <View style={styles.tripSummaryStyle}>
                        <Divider style={[styles.divider, styles.summaryStyle]} />
                        <Text style={styles.summaryText}>{t('rate_ride')} </Text>
                        <Divider style={[styles.divider, styles.dividerStyle]} />
                    </View>
                    <View style={{ flex: 3, justifyContent: 'center', alignItems: "center",marginTop:20}}>
                        {booking ?

                            booking.driver_image != '' ? <Image source={{ uri: booking.driver_image }} style={{ height: 78, width: 78, borderRadius: 78 / 2 }} /> :

                                <Image source={require('../../assets/images/profilePic.png')} style={{ height: 78, width: 78, borderRadius: 78 / 2 }} />

                            : null}
                              <Text style={styles.Drivername}>{booking ? booking.driver_name : null}</Text>
                    </View>
                </View>
                <View style={styles.ratingViewStyle}>
                    <StarRating
                        disabled={false}
                        maxStars={5}
                        starSize={40}
                        fullStar={'ios-star'}
                        halfStar={'ios-star-half'}
                        emptyStar={'ios-star-outline'}
                        iconSet={'Ionicons'}
                        fullStarColor={colors.STAR}
                        emptyStarColor={colors.STAR}
                        halfStarColor={colors.STAR}
                        rating={starCount}
                        selectedStar={(rating) => onStarRatingPress(rating)}
                        buttonStyle={{ padding: 20 }}
                        containerStyle={styles.contStyle}
                    />
                </View>
            </View>

            <View style={styles.confBtnStyle}>
                <Button
                    title={t('submit_rating')}
                    titleStyle={{ fontFamily: 'Roboto-Bold' }}
                    onPress={() => submitNow()}
                    buttonStyle={styles.myButtonStyle}
                    disabled={starCount > 0 ? false : true}
                />
            </View>
            {
                alertModal()
            }
        </View>
    )

}
const styles = StyleSheet.create({
    headerStyle: {
        backgroundColor: colors.HEADER,
        borderBottomWidth: 0
    },
    headerInnerStyle: {
        marginLeft: 10,
        marginRight: 10
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    headerskip: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Regular',
        fontSize: 16
    },
    dateViewStyle: {
        justifyContent: "center",
        marginTop: 10
    },
    dateViewTextStyle: {
        fontFamily: 'Roboto-Regular',
        color: colors.DRIVER_RATING_TEXT,
        fontSize: 26,
        textAlign: "center"
    },
    rateViewStyle: {
        alignItems: 'center',
        height:'10%'
    },
    rateViewTextStyle: {
        fontSize: 60,
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold',
        fontWeight: 'bold',
        textAlign: "center",
        
    },
    addressViewStyle: {
        alignSelf:'center',
        marginLeft:10
    },
    addressViewTextStyle: {
        color: colors.DRIVER_RATING_TEXT,
        fontSize: 19,
        fontFamily: 'Roboto-Regular',
        marginLeft: 15,
        marginRight: 15,
        marginTop: 15,
        lineHeight: 24
    },
    greenDot: {
        backgroundColor: colors.GREEN_DOT,
        width: 12,
        height: 12,
        borderRadius: 50
    },
    redDot: {
        backgroundColor: colors.RED,
        width: 12,
        height: 12,
        borderRadius: 50
    },
    divider: {
        backgroundColor: colors.DRIVER_RATING_TEXT,
        width: '20%',
        height: 1,
        top: '2.7%'
    },
    summaryText: {
        color: colors.DRIVER_RATING_TEXT,
        fontSize: 18,
        textAlign: "center",
        fontFamily: 'Roboto-Regular',
        marginHorizontal: 5
    },
    Drivername: {
        color: colors.DRIVER_RATING_TEXT,
        fontSize: 22,
        textAlign: "center",
        fontFamily: 'Roboto-Regular',
    },
    mainViewStyle: {
        flex: 1,
        backgroundColor: colors.WHITE,
        flexDirection: 'column',
        //marginTop: StatusBar.currentHeight
        height:'100%'
    },
    pickUpStyle: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    tripMainView: {
        flex: 6,
        flexDirection: "column",
        justifyContent: "center",
        marginTop:10
    },
    ratingViewStyle: {
        flex: 1.8,
        flexDirection: "row",
        justifyContent: "center"
    },
    tripSummaryStyle: {
        flex: 1,
        flexDirection: "row",
        justifyContent: 'center',
    },
    confBtnStyle: {
        flex: 1,
        justifyContent: "flex-end",
        marginBottom: '5%',
        alignItems: 'center',
    },
    myButtonStyle: {
        justifyContent:'center',
        alignContent:'center',
        backgroundColor: colors.BALANCE_GREEN,
        width: 300,
        height:50,
        padding: 10,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        borderRadius: 10
    },
    contStyle: {
        marginTop: 0,
        paddingBottom: Platform.OS == 'android' ? 5 : 0
    }, summaryStyle: {
        justifyContent: "flex-end"
    },
    dividerStyle: {
        justifyContent: "flex-start"
    },
    //alert modal
    alertModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    alertModalInnerContainer: { height: 200, width: (width * 0.85), backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    alertContainer: { flex: 2, justifyContent: 'space-between', width: (width - 100) },
    rideCancelText: { flex: 1, top: 15, color: colors.BLACK, fontFamily: 'Roboto-Bold', fontSize: 20, alignSelf: 'center' },
    horizontalLLine: { width: (width - 110), height: 0.5, backgroundColor: colors.BLACK, alignSelf: 'center', },
    msgContainer: { flex: 2.5, alignItems: 'center', justifyContent: 'center' },
    cancelMsgText: { color: colors.BLACK, fontFamily: 'Roboto-Regular', fontSize: 15, alignSelf: 'center', textAlign: 'center' },
    okButtonContainer: { flex: 1, width: (width * 0.85), flexDirection: 'row', backgroundColor: colors.DRIVER_RATING_TEXT, alignSelf: 'center' },
    okButtonStyle: { flexDirection: 'row', backgroundColor: colors.DRIVER_RATING_TEXT, alignItems: 'center', justifyContent: 'center' },
    okButtonContainerStyle: { flex: 1, width: (width * 0.85), backgroundColor: colors.DRIVER_RATING_TEXT },
});