import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    StyleSheet,
    View,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    ScrollView,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
    Switch,
    Platform,
    Share
} from 'react-native';
import { Icon, Header } from 'react-native-elements';
import ActionSheet from "react-native-actions-sheet";
import { colors } from '../common/theme';
import * as ImagePicker from 'expo-image-picker';
import i18n from 'i18n-js';
var { width, height } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { FirebaseContext } from 'common/src';
import StarRating from 'react-native-star-rating';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment/min/moment-with-locales';
import { DrawerActions } from '@react-navigation/native';

export default function ProfileScreen(props) {
    const { t } = i18n;
    const [isRTL,setIsRTL] = useState(); 
    const { api } = useContext(FirebaseContext);
    const {
        updateProfileImage,
        signOut,
        deleteUser,
        updateProfile
    } = api;
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const [profileData, setProfileData] = useState(null);
    const [loader, setLoader] = useState(false);

    const actionSheetRef = useRef(null);

    const [langSelection, setLangSelection] = useState();
    const languagedata = useSelector(state => state.languagedata);

    useEffect(() => {
        setLangSelection(i18n.locale);
        setIsRTL(i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0);
    }, []);

    useEffect(() => {
        if (auth.info && auth.info.profile) {
            setProfileData(auth.info.profile);
        }
    }, [auth.info]);

    const onChangeFunction = () => {
        let res = !profileData.driverActiveStatus;
        dispatch(updateProfile(auth.info, { driverActiveStatus: res }));
    }

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => {

        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderColor: colors.BORDER_TEXT, borderBottomWidth: 1, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('CAMERA', ImagePicker.launchCameraAsync) }}
                >
                    <Text style={{ color: colors.CAMERA_TEXT, fontWeight: 'bold' }}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, borderBottomWidth: 1, borderColor: colors.BORDER_TEXT, height: 60, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync) }}
                >
                    <Text style={{ color: colors.CAMERA_TEXT, fontWeight: 'bold' }}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ width: '90%', alignSelf: 'center', paddingLeft: 20, paddingRight: 20, height: 50, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => { actionSheetRef.current?.setModalVisible(false); }}>
                    <Text style={{ color: 'red', fontWeight: 'bold' }}>{t('cancel')}</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType, res) => {
        var pickFrom = res;
        let permisions;
        if (permissionType == 'CAMERA') {
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        } else {
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status == 'granted') {
            setLoader(true);
            let result = await pickFrom({
                allowsEditing: true,
                aspect: [3, 3],
                base64: true
            });
            actionSheetRef.current?.setModalVisible(false);
            if (!result.cancelled) {
                let data = 'data:image/jpeg;base64,' + result.base64;
                setProfileData({
                    ...profileData,
                    profile_image: result.uri
                })
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
                    dispatch(updateProfileImage(auth.info, blob));
                }
                setLoader(false);
            }
            else {
                setLoader(false);
            }
        } else {
            Alert.alert(t('alert'), t('camera_permission_error'))
        }
    };


    const editProfile = () => {
        props.navigation.push('editUser');
    }

    //sign out and clear all async storage
    const logOff = () => {
        auth.info.profile && auth.info.profile.driverActiveStatus ?
        dispatch(updateProfile(auth.info, { driverActiveStatus: false }))
        : null 
        dispatch(signOut());
    }

    //Delete current user
    const deleteAccount = () => {
        Alert.alert(
            t('delete_account_modal_title'),
            t('delete_account_modal_subtitle'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { },
                    style: 'cancel',
                },
                {
                    text: t('yes'), onPress: () => {
                        dispatch(deleteUser(auth.info.uid));
                        props.navigation.navigate('Login');
                    }
                },
            ],
            { cancelable: false },
        );
    }

    const rCom = () => {
        return (
            languagedata && languagedata.langlist ?
                <View style={{ flexDirection: 'row', height: 30, alignItems: 'center',}}>
                    <Text style={{ color: colors.WHITE }}>Lang:</Text>
                    {langSelection ?
                        <RNPickerSelect
                            placeholder={{}}
                            value={langSelection}
                            useNativeAndroidPickerStyle={false}
                            style={{
                                inputIOS: styles.pickerStyle,
                                inputAndroid: styles.pickerStyle1,
                                placeholder: {
                                    color: colors.WHITE
                                },

                            }}
                            onValueChange={
                                (text) => {
                                    let defl = null;
                                    for (const value of Object.values(languagedata.langlist)) {
                                       if(value.langLocale == text){
                                          defl = value;
                                       }
                                    }
                                    setLangSelection(text);
                                    i18n.locale = text;
                                    moment.locale(defl.dateLocale);
                                    setIsRTL(text == 'he' || text == 'ar')
                                    AsyncStorage.setItem('lang', JSON.stringify({langLocale:text,dateLocale:defl.dateLocale }));
                                    dispatch(updateProfile(auth.info,{lang: {langLocale:text,dateLocale:defl.dateLocale }}));
                                }
                            }
                            label={"Language"}
                            items={Object.values(languagedata.langlist).map(function (value) { return { label: value.langName, value: value.langLocale }; })}
                            Icon={() => { return <Ionicons style={{ marginTop: 2 }} name="md-arrow-down" size={20} color="white" />; }}
                        />
                        : null}
                </View>
                : null
        );
    }

    const lCom = { icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } }

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL ? rCom : lCom}
                rightComponent={isRTL ? lCom : rCom}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('profile_page_title')}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollStyle}>
                {
                    uploadImage()
                }
                {profileData && profileData.usertype == 'driver' ?
                    <View style={[styles.scrollViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Text style={styles.profStyle}>{t('active_status')}</Text>
                        <Switch
                            style={{ marginHorizontal: 15 }}
                            value={profileData ? profileData.driverActiveStatus : false}
                            onValueChange={onChangeFunction}
                        />
                    </View>
                    : null}
                <View style={[styles.scrollViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.profStyle}>{t('profile_page_subtitle')}</Text>
                    <Icon
                        name='page-edit'
                        type='foundation'
                        color={colors.PROFILE_PLACEHOLDER_CONTENT}
                        containerStyle={{ right: 20 }}
                        onPress={editProfile}
                    />
                </View>

                <View style={styles.viewStyle}>
                    <View style={styles.imageParentView}>
                        <View style={styles.imageViewStyle} >
                            {
                                loader ?
                                    <View style={[styles.loadingcontainer, styles.horizontal]}>
                                        <ActivityIndicator size="large" color={colors.INDICATOR_BLUE} />
                                    </View>
                                    : <TouchableOpacity onPress={showActionSheet}>
                                        <Image source={profileData && profileData.profile_image ? { uri: profileData.profile_image } : require('../../assets/images/profilePic.png')} style={{ borderRadius: 130 / 2, width: 130, height: 130 }} />
                                    </TouchableOpacity>
                            }
                        </View>
                    </View>
                    <Text style={styles.textPropStyle} >{profileData && profileData.firstName.toUpperCase() + " " + profileData.lastName.toUpperCase()}</Text>
                </View>

                <View style={styles.newViewStyle}>
                    <View style={styles.myViewStyle}>
                        <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Icon
                                name='envelope-letter'
                                type='simple-line-icon'
                                color={colors.PROFILE_PLACEHOLDER_CONTENT}
                                size={30}
                            />
                            <Text style={styles.emailStyle}>{t('email_placeholder')}</Text>
                        </View>
                        <View style={[styles.flexView1, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}>
                            <Text style={styles.emailAdressStyle}>{profileData ? profileData.email : ''}</Text>
                        </View>
                    </View>
                    <View style={styles.myViewStyle}>
                        <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Icon
                                name='phone-call'
                                type='feather'
                                color={colors.PROFILE_PLACEHOLDER_CONTENT}
                            />
                            <Text style={styles.text1}>{t('mobile_no_placeholder')}</Text>
                        </View>
                        <View style={[styles.flexView2, isRTL ? { alignSelf: 'flex-end', right: 10 } : { alignSelf: 'flex-start' }]}>
                            <Text style={styles.text2}>{profileData ? profileData.mobile : ''}</Text>
                        </View>
                    </View>
                    {profileData && profileData.referralId ?
                        <View style={styles.myViewStyle}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <Icon
                                    name='award'
                                    type='feather'
                                    color={colors.PROFILE_PLACEHOLDER_CONTENT}
                                />
                                <Text style={styles.emailStyle}>{t('referralId')}</Text>
                            </View>
                            <View style={[{ flex: 1, }, isRTL ? { alignSelf: 'flex-end', flexDirection: 'row-reverse' } : { alignSelf: 'flex-start', flexDirection: 'row' }]}>
                                <Text style={styles.text2}>{profileData.referralId}</Text>
                                <TouchableOpacity
                                    style={[isRTL ? { marginRight: 20 } : { marginLeft: 20 }]}
                                    onPress={() => {
                                        settings.bonus > 0 ?
                                            Share.share({
                                                message: t('share_msg') + settings.code + ' ' + settings.bonus + ".\n" + t('code_colon') + auth.info.profile.referralId + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                            })
                                            :
                                            Share.share({
                                                message: t('share_msg_no_bonus') + "\n" + t('app_link') + (Platform.OS == "ios" ? settings.AppleStoreLink : settings.PlayStoreLink)
                                            })
                                    }}
                                >
                                    <Icon
                                        name={Platform.OS == 'android' ? 'share-social' : 'share'}
                                        type='ionicon'
                                        color={colors.INDICATOR_BLUE}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                        : null}
                    <View style={styles.myViewStyle}>
                        <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='user'
                                type='simple-line-icon'
                                color={colors.PROFILE_PLACEHOLDER_CONTENT}
                            />
                            <Text style={styles.emailStyle}>{t('usertype')}</Text>
                        </View>
                       <View style={[{ flex: 1 }, isRTL ? { alignSelf: 'flex-end', right: 10 } : { alignSelf: 'flex-start' }]}>
                            <Text style={styles.text2}>{profileData ? t(profileData.usertype) : ''}</Text>
                        </View>
                    </View>
                    {profileData && profileData.usertype == 'driver' ?
                        <View style={styles.myViewStyle}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <Icon
                                    name='car-outline'
                                    type='ionicon'
                                    color={colors.PROFILE_PLACEHOLDER_CONTENT}
                                />
                                <Text style={styles.emailStyle}>{t('car_type')}</Text>
                            </View>
                            <View style={[{ flex: 1 }, isRTL ? { alignSelf: 'flex-end', right: 10 } : { alignSelf: 'flex-start' }]}>
                                <Text style={styles.text2}>{profileData.carType}</Text>
                            </View>
                        </View>
                        : null}
                    {profileData && profileData.usertype == 'driver' ?
                        <View style={styles.myViewStyle}>
                            <View style={[styles.iconViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', }]}>
                                <Icon
                                    name='thumbs-up-outline'
                                    type='ionicon'
                                    color={colors.PROFILE_PLACEHOLDER_CONTENT}
                                />
                                <Text style={styles.emailStyle}>{t('you_rated_text')}</Text>
                            </View>
                            <View style={[{ flex: 1 }, isRTL ? { alignSelf: 'flex-end', flexDirection: 'row-reverse' } : { alignSelf: 'flex-start', flexDirection: 'row' }]}>
                                <Text style={[styles.text2, isRTL ? { color: colors.ProfileDetails_Primary } : { left: 10, color: colors.ProfileDetails_Primary }]}>{profileData && profileData.usertype && profileData.ratings ? profileData.ratings.userrating : 0}</Text>
                                <StarRating
                                    disabled={false}
                                    maxStars={5}
                                    starSize={15}
                                    fullStar={'ios-star'}
                                    halfStar={'ios-star-half'}
                                    emptyStar={'ios-star-outline'}
                                    iconSet={'Ionicons'}
                                    fullStarColor={colors.STAR}
                                    emptyStarColor={colors.STAR}
                                    halfStarColor={colors.STAR}
                                    rating={profileData && profileData.usertype && profileData.ratings ? parseFloat(profileData.ratings.userrating) : 0}
                                    containerStyle={[styles.contStyle, isRTL ? { marginRight: 10 } : { marginLeft: 10 }]}
                                />
                            </View>
                        </View>
                        : null}
                </View>

                <View style={styles.flexView3}>

                    <TouchableOpacity style={[styles.scrollViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                        onPress={deleteAccount}>
                        <Text style={styles.emailStyle}>{t('delete_account_lebel')}</Text>
                        <Icon
                            name={isRTL ? 'arrow-back-sharp' : 'ios-arrow-forward'}
                            type='ionicon'
                            color={colors.FOOTERTOP}
                            size={35}
                            containerStyle={{ right: 20 }}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={logOff}
                        style={[styles.scrollViewStyle, { flexDirection: isRTL ? 'row-reverse' : 'row', marginBottom: 20 }]}>
                        <Text style={styles.emailStyle}>{t('logout')}</Text>
                        <Icon
                            name={isRTL ? 'arrow-back-sharp' : 'ios-arrow-forward'}
                            type='ionicon'
                            color={colors.FOOTERTOP}
                            size={35}
                            containerStyle={{ right: 20 }}
                        />
                    </TouchableOpacity>
                </View>

            </ScrollView>

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
    logo: {
        flex: 1,
        position: 'absolute',
        top: 110,
        width: '100%',
        justifyContent: "flex-end",
        alignItems: 'center'
    },
    footer: {
        flex: 1,
        position: 'absolute',
        bottom: 0,
        height: 150,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    scrollStyle: {
        flex: 1,
        height: height,
        backgroundColor: colors.WHITE
    },
    scrollViewStyle: {
        width: width,
        height: 50,
        marginVertical: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    profStyle: {
        fontSize: 18,
        left: 20,
        fontWeight: 'bold',
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    bonusAmount: {
        right: 20,
        fontSize: 16,
        fontWeight: 'bold'
    },
    viewStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 13
    },
    imageParentView: {
        borderRadius: 150 / 2,
        width: 150,
        height: 150,
        backgroundColor: '#9b9b9b',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageViewStyle: {
        borderRadius: 140 / 2,
        width: 140,
        height: 140,
        backgroundColor: colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textPropStyle: {
        fontSize: 21,
        fontWeight: 'bold',
        color: colors.BUTTON,
        fontFamily: 'Roboto-Bold',
        top: 8,
        textTransform: 'uppercase'
    },
    newViewStyle: {
        flex: 1,
        marginTop: 10
    },
    myViewStyle: {
        flex: 1,
        left: 20,
        marginRight: 40,
        marginBottom: 8,
        borderBottomColor: colors.BORDER_TEXT,
        borderBottomWidth: 1
    },
    iconViewStyle: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    emailStyle: {
        fontSize: 17,
        left: 10,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    emailAdressStyle: {
        fontSize: 15,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Regular'
    },
    mainIconView: {
        flex: 1,
        left: 20,
        marginRight: 40,
        borderBottomColor: colors.BUTTON,
        borderBottomWidth: 1
    },
    text1: {
        fontSize: 17,
        left: 10,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Bold'
    },
    text2: {
        fontSize: 15,
        left: 10,
        color: colors.PROFILE_PLACEHOLDER_CONTENT,
        fontFamily: 'Roboto-Regular'
    },
    textIconStyle: {
        width: width,
        height: 50,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textIconStyle2: {
        width: width,
        height: 50,
        marginTop: 10,
        backgroundColor: colors.BACKGROUND_PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight 
    },
    flexView1: {
        flex: 1
    },
    flexView2: {
        flex: 1
    },
    flexView3: {
        marginTop: 10,
        marginBottom:10
    },
    loadingcontainer: {
        flex: 1,
        justifyContent: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10
    },
    contStyle: {
        width: 90,
    },
    pickerStyle: {
        color: colors.WHITE,
        width: 45,
        marginRight:12,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
    },
    pickerStyle1: {
        color: colors.WHITE,
        width: 68,
        fontSize: 15,
        height: 30,
        fontWeight: 'bold',
      
    },
});