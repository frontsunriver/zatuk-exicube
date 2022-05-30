import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    TouchableOpacity,
    Text,
    Platform,
    Modal,
    TouchableWithoutFeedback,
    Linking,
    Alert,
    Share
} from 'react-native';
import { TouchableOpacity as OldTouch } from 'react-native';
import { Icon, Button, Header } from 'react-native-elements';
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion } from 'react-native-maps';
import { OtpModal } from '../components';
import StarRating from 'react-native-star-rating';
import RadioForm from 'react-native-simple-radio-button';
import { colors } from '../common/theme';
var { width, height } = Dimensions.get('window');
import i18n from 'i18n-js';
import { useSelector, useDispatch } from 'react-redux';
import Polyline from '@mapbox/polyline';
import getDirections from 'react-native-google-maps-directions';
import carImageIcon from '../../assets/images/track_Car.png';
import { FirebaseContext } from 'common/src';
import * as ImagePicker from 'expo-image-picker';
import moment from 'moment/min/moment-with-locales';

export default function BookedCabScreen(props) {
    const { api, appcat } = useContext(FirebaseContext);
    const {
        fetchBookingLocations,
        stopLocationFetch,
        updateBookingImage,
        cancelBooking,
        updateBooking,
        getDirectionsApi
    } = api;
    const dispatch = useDispatch();
    const { bookingId } = props.route.params;
    const latitudeDelta = 0.0922;
    const longitudeDelta = 0.0421;
    const [alertModalVisible, setAlertModalVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const activeBookings = useSelector(state => state.bookinglistdata.active);
    const [curBooking, setCurBooking] = useState(null);
    const cancelReasons = useSelector(state => state.cancelreasondata.complex);
    const auth = useSelector(state => state.auth);
    const [cancelReasonSelected, setCancelReasonSelected] = useState(0);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const lastLocation = useSelector(state => state.locationdata.coords);
    const [liveRouteCoords, setLiveRouteCoords] = useState(null);
    const mapRef = useRef();
    const pageActive = useRef();
    const [lastCoords, setlastCoords] = useState();
    const [arrivalTime, setArrivalTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [purchaseInfoModalStatus, setPurchaseInfoModalStatus] = useState(false);
    const [userInfoModalStatus, setUserInfoModalStatus] = useState(false);
    const settings = useSelector(state => state.settingsdata.settings);

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0; 

    const [role,setRole] = useState();

    useEffect(()=>{
        if(auth.info && auth.info.profile){
            setRole(auth.info.profile.usertype);
        } else{
            setRole(null);
        }
    },[auth.info]);

    useEffect(() => {
        setInterval(() => {
            if (pageActive.current && curBooking && lastLocation && (curBooking.status == 'ACCEPTED' || curBooking.status == 'STARTED')) {
                if (lastCoords && lastCoords.lat != lastLocation.lat && lastCoords.lat != lastLocation.lng) {
                    if (curBooking.status == 'ACCEPTED') {
                        let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
                        let point2 = { lat: curBooking.pickup.lat, lng: curBooking.pickup.lng };
                        fitMap(point1, point2);
                    } else {
                        let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
                        let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
                        fitMap(point1, point2);
                    }
                    setlastCoords(lastLocation);
                }
            }
        }, 20000);
    }, []);


    useEffect(() => {
        if (lastLocation && curBooking && curBooking.status == 'ACCEPTED' && pageActive.current) {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = { lat: curBooking.pickup.lat, lng: curBooking.pickup.lng };
            fitMap(point1, point2);
            setlastCoords(lastLocation);
        }

        if (curBooking && curBooking.status == 'ARRIVED' && pageActive.current) {
            setlastCoords(null);
            setTimeout(() => {
                mapRef.current.fitToCoordinates([{ latitude: curBooking.pickup.lat, longitude: curBooking.pickup.lng }, { latitude: curBooking.drop.lat, longitude: curBooking.drop.lng }], {
                    edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                    animated: true,
                })
            }, 1000);
        }
        if (lastLocation && curBooking && curBooking.status == 'STARTED' && pageActive.current) {
            let point1 = { lat: lastLocation.lat, lng: lastLocation.lng };
            let point2 = { lat: curBooking.drop.lat, lng: curBooking.drop.lng };
            fitMap(point1, point2);
            setlastCoords(lastLocation);
        }
        if (lastLocation && curBooking && curBooking.status == 'REACHED' && role == 'rider' && pageActive.current) {
            setTimeout(() => {
                mapRef.current.fitToCoordinates([{ latitude: curBooking.pickup.lat, longitude: curBooking.pickup.lng }, { latitude: lastLocation.lat, longitude: lastLocation.lng }], {
                    edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                    animated: true,
                })
            }, 1000);
        }
    }, [lastLocation, curBooking, pageActive.current])

    const fitMap = (point1, point2) => {
        let startLoc = point1.lat + ',' + point1.lng;
        let destLoc = point2.lat + ',' + point2.lng;
        if(settings.showLiveRoute){
            getDirectionsApi(startLoc, destLoc, null).then((details) => {
                setArrivalTime(details.time_in_secs ? parseFloat(details.time_in_secs / 60).toFixed(0) : 0);
                let points = Polyline.decode(details.polylinePoints);
                let coords = points.map((point, index) => {
                    return {
                        latitude: point[0],
                        longitude: point[1]
                    }
                })
                setLiveRouteCoords(coords);
                mapRef.current.fitToCoordinates([{ latitude: point1.lat, longitude: point1.lng }, { latitude: point2.lat, longitude: point2.lng }], {
                    edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                    animated: true,
                })
            });
        }else{
            mapRef.current.fitToCoordinates([{ latitude: point1.lat, longitude: point1.lng }, { latitude: point2.lat, longitude: point2.lng }], {
                edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                animated: true,
            })
        }
    }


    useEffect(() => {
        if (activeBookings && activeBookings.length >= 1) {
            let booking = activeBookings.filter(booking => booking.id == bookingId)[0];
            if (booking) {
                setCurBooking(booking);
                if (booking.status == 'NEW' && booking.bookLater == false) {
                    if (role == 'rider') setSearchModalVisible(true);
                }
                if (booking.status == 'ACCEPTED') {
                    if (role == 'rider') setSearchModalVisible(false);
                    if (role == 'rider') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'ARRIVED') {
                    if (role == 'rider') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'STARTED') {
                    if (role == 'rider') dispatch(fetchBookingLocations(bookingId));
                }
                if (booking.status == 'REACHED') {
                    if (role == 'driver') {
                        if (booking.prepaid) {
                            booking.status = 'PAID';
                            dispatch(updateBooking(booking));
                        } else {
                            props.navigation.navigate('PaymentDetails', { booking: booking });
                        }
                    } else {
                        dispatch(stopLocationFetch(bookingId));
                    }
                }
                if (booking.status == 'PENDING') {
                    if (role == 'rider') props.navigation.navigate('PaymentDetails', { booking: booking });
                }
                if (booking.status == 'PAID' & pageActive.current) {
                    if (role == 'rider') props.navigation.navigate('DriverRating', { bookingId: booking.id });
                    if (role == 'driver') props.navigation.navigate('DriverTrips');
                }
                if ((booking.status == 'ACCEPTED' || booking.status == 'ARRIVED') && booking.pickup_image) {
                    setLoading(false);
                }
                if (booking.status == 'STARTED' && booking.deliver_image) {
                    setLoading(false);
                }
            }
            else {
                setModalVisible(false);
                setSearchModalVisible(false);
                props.navigation.navigate('RideList',{fromBooking:true});
            }
        }
        else {
            setModalVisible(false);
            setSearchModalVisible(false);
            if (role == 'driver') {
                props.navigation.navigate('DriverTrips');
            } else {
                props.navigation.navigate('RideList',{fromBooking:true});
            }
        }
    }, [activeBookings, role, pageActive.current]);

    const renderButtons = () => {
        return (
            (curBooking && role == 'rider' && (curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED')) ||
                (curBooking && role == 'driver' && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' || curBooking.status == 'STARTED')) ?
                <View style={{ flex: 1.5, flexDirection: 'row' }}>
                    {(role == 'rider' && !curBooking.pickup_image && (curBooking.status == 'NEW' || curBooking.status == 'ACCEPTED')) ||
                        (role == 'driver' && !curBooking.pickup_image && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED')) ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('cancel_ride')}
                                loading={false}
                                loadingProps={{ size: "large", color: colors.INDICATOR_BLUE }}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold' }}
                                onPress={() => {
                                    role == 'rider' ?
                                        setModalVisible(true) :
                                        Alert.alert(
                                            t('alert'),
                                            t('cancel_confirm'),
                                            [
                                                { text: t('cancel'), onPress: () => {}, style: 'cancel' },
                                                { text: t('ok'), onPress: () => dispatch(cancelBooking({ booking: curBooking, reason: t('driver_cancelled_booking'), cancelledBy: role })) },
                                            ]
                                        );
                                }
                                }
                                buttonStyle={{ height: '100%', backgroundColor: colors.HEADER }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {appcat == 'delivery' && settings.AllowDeliveryPickupImageCapture && role == 'driver' && !curBooking.pickup_image && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED') ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('take_pickup_image')}
                                loading={loading}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
                                buttonStyle={{ height: '100%', backgroundColor: colors.BUTTON_ORANGE }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {role == 'driver' && ((curBooking.pickup_image && appcat=='delivery') || (!settings.AllowDeliveryPickupImageCapture && appcat=='delivery')  || appcat == 'taxi') && (curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED') ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('start_trip')}
                                loading={false}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold' }}
                                onPress={() => {
                                    if (curBooking.otp && appcat=='taxi') {
                                        setOtpModalVisible(true);
                                    } else {
                                        startBooking();
                                    }
                                }}
                                buttonStyle={{ height: '100%', backgroundColor: colors.START_TRIP }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}

                    {appcat == 'delivery' && settings.AllowFinalDeliveryImageCapture && role == 'driver' && !curBooking.deliver_image && curBooking.status == 'STARTED' ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('take_deliver_image')}
                                loading={loading}
                                loadingProps={{ size: "large", color: colors.WHITE }}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold' }}
                                onPress={() => _pickImage(ImagePicker.launchCameraAsync)}
                                buttonStyle={{ height: '100%', backgroundColor: colors.BUTTON_ORANGE }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                    {role == 'driver' && ((curBooking.deliver_image && appcat=='delivery') || (!settings.AllowFinalDeliveryImageCapture && appcat=='delivery') || appcat == 'taxi') && curBooking.status == 'STARTED' ?
                        <View style={{ flex: 1 }}>
                            <Button
                                title={t('complete_ride')}
                                loading={loading}
                                titleStyle={{ color: colors.WHITE, fontWeight: 'bold' }}
                                onPress={() => {
                                    if (curBooking.otp && appcat=='delivery') {
                                        setOtpModalVisible(true);
                                    } else {
                                        endBooking();
                                    }
                                }}
                                buttonStyle={{ height: '100%', backgroundColor: colors.RED }}
                                containerStyle={{ height: '100%' }}
                            />
                        </View>
                        : null}
                </View>
                : null
        );
    }

    const startBooking = () => {
        setOtpModalVisible(false);
        let booking = { ...curBooking };
        booking.status = 'STARTED';
        dispatch(updateBooking(booking));
    }

    const endBooking = () => {
        setLoading(true);
        let booking = { ...curBooking };
        booking.status = 'REACHED';
        dispatch(updateBooking(booking));
        setOtpModalVisible(false);
    }

    const startNavigation = () => {
        const params = [
            {
                key: "travelmode",
                value: "driving"
            },
            {
                key: "dir_action",
                value: "navigate"
            }
        ];
        let data = null;
        try {
            if (curBooking.status == 'ACCEPTED') {
                data = {
                    source: {
                        latitude: lastLocation.lat,
                        longitude: lastLocation.lng
                    },
                    destination: {
                        latitude: curBooking.pickup.lat,
                        longitude: curBooking.pickup.lng
                    },
                    params: params,
                }
            }
            if (curBooking.status == 'STARTED') {
                data = {
                    source: {
                        latitude: lastLocation.lat,
                        longitude: lastLocation.lng
                    },
                    destination: {
                        latitude: curBooking.drop.lat,
                        longitude: curBooking.drop.lng
                    },
                    params: params,
                }
            }

            if (data && data.source.latitude) {
                getDirections(data);
            } else {
                Alert.alert(t('alert'), t('navigation_available'));
            }


        } catch (error) {
            console.log(error);
            Alert.alert(t('alert'), t('location_error'));
        }

    }

    //ride cancel confirm modal design
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

                            <Text style={styles.rideCancelText}>{t('rider_cancel_text')}</Text>

                            <View style={styles.horizontalLLine} />

                            <View style={styles.msgContainer}>
                                <Text style={styles.cancelMsgText}>{t('cancel_messege1')}  {bookingId} {t('cancel_messege2')} </Text>
                            </View>
                            <View style={styles.okButtonContainer}>
                                <Button
                                    title={t('no_driver_found_alert_OK_button')}
                                    titleStyle={styles.signInTextStyle}
                                    onPress={() => {
                                        setAlertModalVisible(false);
                                        props.navigation.popToTop();
                                    }}
                                    buttonStyle={styles.okButtonStyle}
                                    containerStyle={styles.okButtonContainerStyle}
                                />
                            </View>

                        </View>

                    </View>
                </View>

            </Modal>
        )
    }

    //caacel modal design
    const cancelModal = () => {
        return (
            <Modal
                animationType="none"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}>
                <View style={styles.cancelModalContainer}>
                    <View style={styles.cancelModalInnerContainer}>

                        <View style={styles.cancelContainer}>
                            <View style={styles.cancelReasonContainer}>
                                <Text style={styles.cancelReasonText}>{t('cancel_reason_modal_title')}</Text>
                            </View>

                            <View style={styles.radioContainer}>
                                <RadioForm
                                    radio_props={cancelReasons}
                                    initial={0}
                                    animation={false}
                                    buttonColor={colors.RADIO_BUTTON}
                                    selectedButtonColor={colors.RADIO_BUTTON_SELECTION}
                                    buttonSize={10}
                                    buttonOuterSize={20}
                                    style={styles.radioContainerStyle }
                                    labelStyle={styles.radioText}
                                    radioStyle={[styles.radioStyle,{flexDirection:isRTL?'row-reverse':'row'}]}
                                    onPress={(value) => { setCancelReasonSelected(value) }}
                                />
                            </View>
                            <View style={[styles.cancelModalButtosContainer,{flexDirection:isRTL?'row-reverse':'row'}]}>
                                <Button
                                    title={t('dont_cancel_text')}
                                    titleStyle={styles.signInTextStyle}
                                    onPress={() => { setModalVisible(false) }}
                                    buttonStyle={styles.cancelModalButttonStyle}
                                    containerStyle={styles.cancelModalButtonContainerStyle}
                                />

                                <View style={styles.buttonSeparataor} />

                                <Button
                                    title={t('no_driver_found_alert_OK_button')}
                                    titleStyle={styles.signInTextStyle}
                                    onPress={() => {
                                        if (cancelReasonSelected >= 0) {
                                            dispatch(cancelBooking({ booking: curBooking, reason: cancelReasons[cancelReasonSelected].label, cancelledBy: role }));
                                        } else {
                                            Alert.alert(t('alert'), t('select_reason'));
                                        }
                                    }}
                                    buttonStyle={styles.cancelModalButttonStyle}
                                    containerStyle={styles.cancelModalButtonContainerStyle}
                                />
                            </View>

                        </View>


                    </View>
                </View>

            </Modal>
        )
    }


    const searchModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={searchModalVisible}
                onRequestClose={() => {
                    setSearchModalVisible(false)
                }}
            >
                <View style={{ flex: 1, backgroundColor: colors.BACKGROUND, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '80%', backgroundColor: colors.WHITE, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flex: 1, maxHeight: 310,marginTop:15 }}>
                        <Image source={require('../../assets/images/lodingDriver.gif')} resizeMode={'contain'} style={{ width: 160, height: 160, marginTop: 15 }} />
                        <View><Text style={{ color: colors.BLACK, fontSize: 16, marginTop: 12 }}>{t('driver_assign_messege')}</Text></View>
                        <View style={styles.buttonContainer}>
                            <Button
                                title={t('close')}
                                loading={false}
                                loadingProps={{ size: "large", }}
                                titleStyle={styles.buttonTitleText}
                                onPress={() => { setSearchModalVisible(false) }}
                                buttonStyle={{width:100}}
                                containerStyle={{ marginTop: 20 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    const chat = () => {
        props.navigation.navigate("onlineChat", { bookingId: bookingId })
    }

    const onPressCall = (phoneNumber) => {
        let call_link = Platform.OS == 'android' ? 'tel:' + phoneNumber : 'telprompt:' + phoneNumber;
        Linking.canOpenURL(call_link).then(supported => {
            if (supported) {
                return Linking.openURL(call_link);
            }
        }).catch(error => console.log(error));
    }

    const _pickImage = async (res) => {
        var pickFrom = res;

        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status == 'granted') {
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3],
                base64: true
            });

            if (!result.cancelled) {
                let data = 'data:image/jpeg;base64,' + result.base64;
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        resolve(xhr.response);
                    };
                    xhr.onerror = function () {
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoader(false);
                    };
                    xhr.responseType = 'blob';
                    xhr.open('GET', Platform.OS == 'ios' ? data : result.uri, true);
                    xhr.send(null);
                });
                if (blob) {
                    setLoading(true);
                    dispatch(updateBookingImage(curBooking,
                        curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' ? 'pickup_image' : 'deliver_image',
                        blob));
                }
            }
        }
    };

    const PurchaseInfoModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={purchaseInfoModalStatus}
                onRequestClose={() => {
                    setPurchaseInfoModalStatus(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{width:'100%'}}>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading}>{t('parcel_type')}</Text>
                            <Text style={styles.textContent}>
                                {curBooking && curBooking.parcelTypeSelected ? curBooking.parcelTypeSelected.description : ''}
                            </Text>
                        </View>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading}>{t('options')}</Text>
                            <Text style={styles.textContent}>
                                {curBooking && curBooking.optionSelected ? curBooking.optionSelected.description : ''}
                            </Text>
                        </View>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading}>{t('deliveryPerson')}</Text>
                            <Text style={styles.textContent}>
                                {curBooking ? curBooking.deliveryPerson : ''}
                            </Text>
                        </View>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading}>{t('deliveryPersonPhone')}</Text>
                            <Text style={styles.textContent}>
                                {curBooking ? curBooking.deliveryPersonPhone : ''}
                            </Text>
                        </View>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading}>{t('pickUpInstructions')}</Text>
                            <Text style={styles.textContent}>
                                {curBooking ? curBooking.pickUpInstructions : ''}
                            </Text>
                        </View>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading}>{t('deliveryInstructions')}</Text>
                            <Text style={styles.textContent}>
                                {curBooking ? curBooking.deliveryInstructions : ''}
                            </Text>
                        </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', height: 40 }}>
                            <OldTouch
                                loading={false}
                                onPress={() => setPurchaseInfoModalStatus(false)}
                                style={styles.modalButtonStyle}
                            >
                                <Text style={styles.modalButtonTextStyle}>{t('ok')}</Text>
                            </OldTouch>
                        </View>
                    </View>
                </View>
            </Modal>

        )
    }




    const UserInfoModal = () => {
        return (
            <Modal
                animationType="fade"
                transparent={true}
                visible={userInfoModalStatus}
                onRequestClose={() => {
                    setUserInfoModalStatus(false);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{width:'100%'}}>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading1}>{t('deliveryPersonPhone')}</Text>
                            <Text style={styles.textContent1} onPress={() => onPressCall(curBooking.deliveryPersonPhone)}>
                                <Icon
                                    name="ios-call"
                                    type="ionicon"
                                    size={15}
                                    color={colors.INDICATOR_BLUE}
                                />
                                {curBooking ? curBooking.deliveryPersonPhone : ''}
                            </Text>
                        </View>
                        <View style={[styles.textContainerStyle,{ alignItems:isRTL? "flex-end" : "flex-start"}]}>
                            <Text style={styles.textHeading1}>{t('senderPersonPhone')}</Text>

                            <Text style={styles.textContent1} onPress={() => onPressCall(curBooking.customer_contact)}>
                                <Icon
                                    name="ios-call"
                                    type="ionicon"
                                    size={15}
                                    color={colors.INDICATOR_BLUE}
                                />
                                {curBooking ? curBooking.customer_contact : ''}
                            </Text>
                        </View>
                        </View>
                        <View style={{ flexDirection: 'row', alignSelf: 'center', height: 40 }}>
                            <OldTouch
                                loading={false}
                                onPress={() => setUserInfoModalStatus(false)}
                                style={styles.modalButtonStyle}
                            >
                                <Text style={styles.modalButtonTextStyle}>{t('ok')}</Text>
                            </OldTouch>
                        </View>
                    </View>
                </View>
            </Modal>

        )
    }

    const onShare = async (curBooking) => {
        try {
            const result = await Share.share({
                message: curBooking.otp + t('otp_sms')
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            pageActive.current = true;
        });
        return unsubscribe;
    }, [props.navigation,pageActive.current]);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('blur', () => {
            pageActive.current = false;
            if (role == 'rider') {
                dispatch(stopLocationFetch(bookingId));
            }
        });
        return unsubscribe;
    }, [props.navigation,pageActive.current]);

    useEffect(() => {
        pageActive.current = true;
        return () => {
            pageActive.current = false;
        };
      }, []);

    const goBack = () => {
        props.navigation.goBack();
    }

    const lCom = {icon:'arrow-back', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }
    const rCom = { icon:'ios-arrow-forward', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { goBack() } }
    return (
        <View style={styles.mainContainer}>
            <Header
                backgroundColor={colors.HEADER}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('booked_cab_title')}</Text>}
                containerStyle={styles.headerStyle}
                leftComponent={isRTL ? null:lCom}
                rightComponent={isRTL? rCom:null}
                innerContainerStyles={styles.headerInnerStyle}
            />
            <View style={[styles.topContainer,{flexDirection:isRTL?'row-reverse':'row'}]}>
                <View style={styles.topLeftContainer}>
                    <View style={styles.circle} />
                    <View style={styles.staightLine} />
                    <View style={styles.square} />
                </View>
                <View style={styles.topRightContainer}>
                    <TouchableOpacity style={styles.whereButton}>
                        <View style={[styles.whereContainer,{flexDirection:isRTL?"row-reverse":"row"}]}>
                            <Text numberOfLines={1} style={[styles.whereText,{textAlign: isRTL? 'right': 'left'}]}>{curBooking ? curBooking.pickup.add : ""}</Text>
                            <Icon
                                name='gps-fixed'
                                color={colors.WHITE}
                                size={23}
                                containerStyle={styles.iconContainer}
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropButton}>
                        <View style={[styles.whereContainer,{flexDirection:isRTL?"row-reverse":"row"}]}>
                            <Text numberOfLines={1} style={[styles.whereText,{textAlign: isRTL? 'right': 'left'}]}>{curBooking ? curBooking.drop.add : ""}</Text>
                            <Icon
                                name='search'
                                type='feather'
                                color={colors.WHITE}
                                size={23}
                                containerStyle={styles.iconContainer}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.mapcontainer}>
                {curBooking ?
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: curBooking.pickup.lat,
                            longitude: curBooking.pickup.lng,
                            latitudeDelta: latitudeDelta,
                            longitudeDelta: longitudeDelta
                        }}
                    >

                        {(curBooking.status == 'ACCEPTED' || curBooking.status == 'ARRIVED' || curBooking.status == 'STARTED') && lastLocation ?
                            <Marker.Animated
                                coordinate={new AnimatedRegion({
                                    latitude: lastLocation.lat,
                                    longitude: lastLocation.lng,
                                    latitudeDelta: latitudeDelta,
                                    longitudeDelta: longitudeDelta
                                })}
                            >
                                <Image
                                    source={carImageIcon}
                                    style={{ height: 40, width: 40 }}
                                />
                            </Marker.Animated>
                            : null}

                        <Marker
                            coordinate={{ latitude: (curBooking.pickup.lat), longitude: (curBooking.pickup.lng) }}
                            title={curBooking.pickup.add}
                            pinColor={colors.GREEN_DOT}
                        />
                        <Marker
                            coordinate={{ latitude: (curBooking.drop.lat), longitude: (curBooking.drop.lng) }}
                            title={curBooking.drop.add}
                        />

                        {liveRouteCoords && (curBooking.status == 'ACCEPTED' || curBooking.status == 'STARTED') ?
                            <MapView.Polyline
                                coordinates={liveRouteCoords}
                                strokeWidth={5}
                                strokeColor={colors.INDICATOR_BLUE}
                                lineDashPattern={[1]}
                            />
                            : null}

                        {(curBooking.status == 'ARRIVED' || curBooking.status == 'REACHED') && curBooking.coords ?
                            <MapView.Polyline
                                coordinates={curBooking.coords}
                                strokeWidth={4}
                                strokeColor={colors.INDICATOR_BLUE}
                                lineDashPattern={[1]}
                            />
                            : null}
                    </MapView>
                    : null}
                {role == 'driver' && appcat == 'delivery'?
                    <TouchableOpacity
                        style={[styles.floatButton, isRTL?{left:10,bottom: 220}: { right:10,bottom: 220 }]}

                        onPress={() => setPurchaseInfoModalStatus(true)}
                    >
                        <Icon
                            name="cube"
                            type="ionicon"
                            size={30}
                            color={colors.WHITE}
                        />
                    </TouchableOpacity>
                    : null}
                {role == 'driver'?
                    <TouchableOpacity
                        style={[styles.floatButton, isRTL?{left:10,bottom: 150}: { right:10,bottom: 150 }]}
                        onPress={() =>
                            startNavigation()
                        }
                    >
                        <Icon
                            name="ios-navigate"
                            type="ionicon"
                            size={30}
                            color={colors.WHITE}
                        />
                    </TouchableOpacity>
                    : null}
                {curBooking  && !(curBooking.status=='NEW') ?
                <TouchableOpacity
                    style={[styles.floatButton,isRTL?{left:10,bottom: 80}: { right:10,bottom: 80 }]}
                    onPress={() => chat()}
                >
                    <Icon
                        name="ios-chatbubbles"
                        type="ionicon"
                        size={30}
                        color={colors.WHITE}
                    />
                </TouchableOpacity>
                :null}
                {curBooking && !(curBooking.status=='NEW')?
                <TouchableOpacity
                    style={[styles.floatButton,isRTL?{left:10,bottom: 10}: { right:10,bottom: 10 }]}
                    onPress={() => role == 'rider' ? onPressCall(curBooking.driver_contact) : (appcat == 'taxi' ? onPressCall(curBooking.customer_contact) : setUserInfoModalStatus(true))}
                >


                    <Icon
                        name="ios-call"
                        type="ionicon"
                        size={30}
                        color={colors.WHITE}
                    />
                </TouchableOpacity>
                :null}
            </View>
            <View style={styles.bottomContainer}>

                <View style={styles.otpContainer}>
                    <Text style={styles.cabText}>{t('booking_status')}: <Text style={styles.cabBoldText}>{curBooking && curBooking.status ? t(curBooking.status) : null} {curBooking && curBooking.status == 'ACCEPTED'  && settings.showLiveRoute ? '( ' + arrivalTime + ' ' + t('mins') + ' )' : ''}</Text></Text>
                    {role == 'rider' && settings.otp_secure ?
                        <View style={{ flexDirection:isRTL? 'row-reverse' : 'row', padding: 1 }}>
                            <Text style={styles.otpText}>{curBooking ? t('otp') + curBooking.otp : null}</Text>
                            <View style={{ alignSelf: 'center', marginRight: 3 }}>
                                <TouchableOpacity onPress={() => onShare(curBooking)}>
                                    <Icon
                                        name="share-social-outline"
                                        type="ionicon"
                                        size={22}
                                        color={colors.INDICATOR_BLUE} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        : null}
                </View>
                <View style={styles.cabDetailsContainer}>
                    {curBooking && curBooking.status == "NEW" && curBooking.bookLater == false?
                        <View style={{ flex: 1, width: width, height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Image style={{ width: 40, height: 40 }} source={require('../../assets/images/loader.gif')} />
                            <Text style={{ fontSize: 22 }}>{t('searching')}</Text>
                        </View>
                        : null}
                    {curBooking && curBooking.status == "NEW" && curBooking.bookLater ?
                        <View style={{ flex: 1, width: width, height: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16 }}>{t('trip_start_time') + ":  " }</Text>
                            <Text style={{ fontWeight:'bold', fontSize: 16 }}>{moment(curBooking.tripdate).format('lll')}</Text>
                        </View>
                        : null}
                    
                    {curBooking && curBooking.status != "NEW" ?
                        <View style={styles.cabDetails}>
                            <View style={styles.cabName}>
                                <Text style={styles.cabNameText}>{curBooking.carType}</Text>
                            </View>

                            <View style={styles.cabPhoto}>
                                <Image source={{ uri: curBooking.carImage }} resizeMode={'contain'} style={styles.cabImage} />
                            </View>

                            <View style={styles.cabNumber}>
                                <Text style={styles.cabNumberText}>{curBooking.vehicle_number}</Text>
                            </View>

                        </View>
                        : null}
                    {curBooking && curBooking.status != "NEW" ?
                        <View style={styles.verticalDesign}>
                            <View style={styles.triangle} />
                            <View style={styles.verticalLine} />
                        </View>
                        : null}
                    {curBooking && curBooking.status != "NEW" ?
                        <View style={styles.driverDetails}>
                                {role == 'rider' ?
                                   <View style={styles.driverPhotoContainer}>
                                    <Image source={curBooking.driver_image ? { uri: curBooking.driver_image } : require('../../assets/images/profilePic.png')} style={styles.driverPhoto} />
                                    <Text style={styles.driverNameText}>{curBooking.driver_name}</Text>
                                    </View>
                                    :
                                    <View style={styles.driverPhotoContainer}>
                                    <Image source={curBooking.customer_image ? { uri: curBooking.customer_image } : require('../../assets/images/profilePic.png')} style={styles.driverPhoto} />
                                    <Text style={styles.driverNameText}>{curBooking.customer_name}</Text>
                                    </View>
                                }
                            <View style={styles.ratingContainer}>
                                {role == 'rider' ?
                                    <StarRating
                                        disabled={true}
                                        maxStars={5}
                                        starSize={height / 42}
                                        fullStar={'ios-star'}
                                        halfStar={'ios-star-half'}
                                        emptyStar={'ios-star-outline'}
                                        iconSet={'Ionicons'}
                                        fullStarColor={colors.STAR}
                                        emptyStarColor={colors.STAR}
                                        halfStarColor={colors.STAR}
                                        rating={parseInt(curBooking.driverRating)}
                                        containerStyle={styles.ratingContainerStyle}
                                    />
                                    : null}
                            </View>

                        </View>
                        : null}
                </View>
                {
                    renderButtons()
                }
            </View>
            {
                PurchaseInfoModal()
            }
            {
                UserInfoModal()
            }
            {
                cancelModal()
            }
            {
                alertModal()
            }
            {
                searchModal()
            }
            <OtpModal
                modalvisable={otpModalVisible}
                requestmodalclose={() => { setOtpModalVisible(false) }}
                otp={curBooking ? curBooking.otp : ''}
                onMatch={(value) => value ? appcat == 'taxi'? startBooking() : endBooking() : null}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: colors.WHITE, },
    headerStyle: {
        backgroundColor: colors.HEADER,
        borderBottomWidth: 0,
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
    topContainer: { flex: 1.5,  borderTopWidth: 0, alignItems: 'center', backgroundColor: colors.HEADER, paddingEnd: 20 },
    topLeftContainer: {
        flex: 1.5,
        alignItems: 'center'
    },
    topRightContainer: {
        flex: 9.5,
        justifyContent: 'space-between',
    },
    circle: {
        height: 15,
        width: 15,
        borderRadius: 15 / 2,
        backgroundColor: colors.LIGHT_YELLOW
    },
    staightLine: {
        height: height / 25,
        width: 1,
        backgroundColor: colors.LIGHT_YELLOW
    },
    square: {
        height: 17,
        width: 17,
        backgroundColor: colors.MAP_SQUARE
    },
    whereButton: { flex: 1, justifyContent: 'center', borderBottomColor: colors.WHITE, borderBottomWidth: 1 },
    whereContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', },
    whereText: { flex: 9, fontFamily: 'Roboto-Regular', fontSize: 14, fontWeight: '400', color: colors.WHITE },
    iconContainer: { flex: 1, },
    dropButton: { flex: 1, justifyContent: 'center' },
    mapcontainer: {
        flex: 7,
        width: width
    },
    bottomContainer: { flex: 2.5, alignItems: 'center' },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    otpContainer: { flex: 0.8, backgroundColor: colors.BOX_BG, width: width, flexDirection: 'row', justifyContent: 'space-between' },
    cabText: { paddingLeft: 10, alignSelf: 'center', color: colors.BLACK, fontFamily: 'Roboto-Regular' },
    cabBoldText: { fontFamily: 'Roboto-Bold' },
    otpText: { alignSelf: 'center', color: colors.BLACK, fontFamily: 'Roboto-Bold' },
    cabDetailsContainer: { flex: 2.5, backgroundColor: colors.WHITE, flexDirection: 'row', position: 'relative', zIndex: 1 },
    cabDetails: { flex: 19 },
    cabName: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    cabNameText: { color: colors.MAP_TEXT, fontFamily: 'Roboto-Bold', fontSize: 13 },
    cabPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cabImage: { width: 100, height: height / 20, marginBottom: 5, marginTop: 5 },
    cabNumber: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cabNumberText: { color: colors.BUTTON, fontFamily: 'Roboto-Bold', fontSize: 13 },
    verticalDesign: { flex: 2, height: 50, width: 1, alignItems: 'center' },
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
        ],

        marginTop: -1,
        overflow: 'visible'
    },
    verticalLine: { height: height / 18, width: 0.5, backgroundColor: colors.BLACK, alignItems: 'center', marginTop: 10 },
    driverDetails: { flex: 19, alignItems: 'center', justifyContent: 'center',},
    driverPhotoContainer: {alignItems: 'center',marginTop:10},
    driverPhoto: { borderRadius: height / 20 / 2, width: height / 20, height: height / 20 ,},
    driverNameContainer: { flex: 2.2, alignItems: 'center', justifyContent: 'center' },
    driverNameText: { color: '#4f4e4e', fontFamily: 'Roboto-Bold', fontSize: 14 },
    ratingContainer: { flex: 2.4, alignItems: 'center', justifyContent: 'center' },
    ratingContainerStyle: {paddingBottom: Platform.OS == 'android' ? 0 : 0 },

    //alert modal
    alertModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    alertModalInnerContainer: { height: 200, width: (width * 0.85), backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    alertContainer: { flex: 2, justifyContent: 'space-between', width: (width - 100) },
    rideCancelText: { flex: 1, top: 15, color: colors.BLACK, fontFamily: 'Roboto-Bold', fontSize: 20, alignSelf: 'center' },
    horizontalLLine: { width: (width - 110), height: 0.5, backgroundColor: colors.BLACK, alignSelf: 'center', },
    msgContainer: { flex: 2.5, alignItems: 'center', justifyContent: 'center' },
    cancelMsgText: { color: colors.BLACK, fontFamily: 'Roboto-Regular', fontSize: 15, alignSelf: 'center', textAlign: 'center' },
    okButtonContainer: { flex: 1, width: (width * 0.85), flexDirection: 'row', backgroundColor: colors.BUTTON, alignSelf: 'center' },
    okButtonStyle: { flexDirection: 'row', backgroundColor: colors.BUTTON, alignItems: 'center', justifyContent: 'center' },
    okButtonContainerStyle: { flex: 1, width: (width * 0.85), backgroundColor: colors.BUTTON, },

    //cancel modal
    cancelModalContainer: { flex: 1, justifyContent: 'center', backgroundColor: colors.BACKGROUND },
    cancelModalInnerContainer: { height: 400, width: width * 0.85, padding: 0, backgroundColor: colors.WHITE, alignItems: 'center', alignSelf: 'center', borderRadius: 7 },
    cancelContainer: { flex: 1, justifyContent: 'space-between', width: (width * 0.85) },
    cancelReasonContainer: { flex: 1 },
    cancelReasonText: { top: 10, color: colors.BLACK, fontFamily: 'Roboto-Bold', fontSize: 20, alignSelf: 'center' },
    radioContainer: { flex: 8, alignItems: 'center' },
    radioText: { fontSize: 16, fontFamily: 'Roboto-Medium', color: colors.BLACK, },
    radioContainerStyle: { paddingTop: 30, marginLeft: 10 },
    radioStyle: { paddingBottom: 25 },
    cancelModalButtosContainer: { flex: 1,  backgroundColor: colors.BUTTON, alignItems: 'center', justifyContent: 'center' },
    buttonSeparataor: { height: height / 35, width: 0.8, backgroundColor: colors.WHITE, alignItems: 'center', marginTop: 3 },
    cancelModalButttonStyle: { backgroundColor: colors.BUTTON, borderRadius: 0 },
    cancelModalButtonContainerStyle: { flex: 1, width: (width * 2) / 2, backgroundColor: colors.BUTTON, alignSelf: 'center', margin: 0 },
    signInTextStyle: {
        fontFamily: 'Roboto-Bold',
        fontWeight: "700",
        color: colors.WHITE
    },
    floatButton: {
        borderWidth: 1,
        borderColor: colors.BLACK,
        alignItems: "center",
        justifyContent: "center",
        width: 60,
        position: "absolute",
        right: 10,
        height: 60,
        backgroundColor: colors.BLACK,
        borderRadius: 30
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: colors.BACKGROUND
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    textContainerStyle: {
        flexDirection: 'column',
        marginBottom: 12,
    },
    textHeading: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    textHeading1: {
        fontSize: 20,
        color: colors.BLACK
    },
    textContent: {
        fontSize: 14,
        margin: 4,
    },
    textContent1: {
        fontSize: 20,
        color: colors.BUTTON_LOADING,
        padding: 5
    },
    modalButtonStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.BUTTON_RIGHT,
        width: 100,
        height: 40,
        elevation: 0,
        borderRadius: 10
    },
    modalButtonTextStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 18
    },
});