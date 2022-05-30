import React,{useContext} from 'react';
import { Text, 
    View, 
    Dimensions, 
    StyleSheet, 
    FlatList, 
    Image, 
    TouchableOpacity,
    Alert,
    Linking,
    Share,
    Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import SideMenuHeader from './SideMenuHeader';
import { colors } from '../common/theme';
var { width } = Dimensions.get('window');
import { useSelector, useDispatch } from "react-redux";
import i18n from 'i18n-js';
import { FirebaseContext } from 'common/src';

export default function SideMenu(props){

    const { api, appcat } = useContext(FirebaseContext);
    const { updateProfile, signOut } = api;

    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const settings = useSelector(state => state.settingsdata.settings);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const sideMenuList = [
        {name: t('book_your_ride_menu'), navigationName: 'Map', icon: 'home', type: 'font-awesome'},
        {name: t('booking_request'), navigationName: 'DriverTrips', icon: 'home', type: 'font-awesome'},
        {name: t('my_rides_menu'), navigationName: 'RideList', icon: appcat=='delivery'?'truck-fast':'car-sports', type: 'material-community'},
        {name: t('incomeText'), navigationName: 'MyEarning', icon: 'md-wallet', type: 'ionicon'},
        {name: t('my_wallet_menu'), icon: 'account-balance-wallet', navigationName: 'Wallet', type: 'MaterialIcons'},
        {name: t('profile_setting_menu'), navigationName: 'Profile', icon: 'ios-person-add', type: 'ionicon'},
        {name: t('convert_to_driver'), navigationName: 'Convert', icon: 'swap-horizontal-bold', type: 'material-community'},
        {name: t('refer_earn'), navigationName: 'Refer', icon: 'cash', type: 'ionicon'},
        {name: t('emergency'), navigationName: 'Emergency', icon: 'ios-sad', type: 'ionicon'},
        {name: t('push_notification_title'), navigationName: 'Notifications', icon: 'notifications-circle-outline', type: 'ionicon'},
        {name: t('about_us_menu'), navigationName: 'About', icon: 'info', type: 'entypo'},
        {name: t('logout'), icon: 'sign-out',navigationName: 'Logout', type: 'font-awesome'}
    ];

    //navigation to screens from side menu
    const navigateToScreen = (route) => () => {
        props.navigation.navigate(route);
    }
    
    //sign out 
    const logOff = () => {
        auth.info.profile && auth.info.profile.driverActiveStatus ?
        dispatch(updateProfile(auth.info, { driverActiveStatus: false }))
        : null 
        dispatch(signOut());
    }

    const onPressCall = (phoneNumber) => {
        let call_link = Platform.OS == 'android' ? 'tel:' + phoneNumber : 'telprompt:' + phoneNumber;
        Linking.canOpenURL(call_link).then(supported => {
            if (supported) {
                return Linking.openURL(call_link);
            }
        }).catch(error => console.log(error));
    }

    const convert = () => {
        Alert.alert(
            t('profile_updated'),
            t('profile_incomplete'),
            [
                {
                    text: t('cancel'),
                    onPress: () => { props.navigation.closeDrawer() },
                    style: 'cancel',
                },
                {
                    text: t('yes'), onPress: () => {
                        props.navigation.navigate('editUser');
                        props.navigation.closeDrawer();
                    }
                },
            ],
            { cancelable: false },
        );
    }

    const language = (auth.info && auth.info.profile && auth.info.profile.lang? auth.info.profile.lang.langLocale : null);

    return (
        <View style={styles.mainViewStyle}>
            {auth.info && auth.info.profile?
                <SideMenuHeader headerStyle={styles.myHeader} userPhoto={auth.info.profile.profile_image} userEmail={auth.info.profile.email} userName={auth.info.profile.firstName + ' ' + auth.info.profile.lastName} language={language}></SideMenuHeader>
            :null}
            <View style={styles.compViewStyle}>
                {/* <View style={[styles.vertialLine, { height: (width <= 320) ? width / 1.32 : width / 1.40, left: isRTL? 231 : 22 }]}></View> */}
                {!!settings && auth.info && auth.info.profile?
                <FlatList
                    data={sideMenuList}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ marginTop: 20,width:'95%',padding:5 }}
                    bounces={false}
                    renderItem={({ item, index }) => {
                       if (auth.info.profile.usertype == 'rider' && (item.navigationName == 'DriverTrips' || item.navigationName == 'MyEarning')) {
                            return null;
                        }       
                        else if (auth.info.profile.usertype == 'driver' && ( item.navigationName == 'Map' || item.navigationName == 'Emergency')) {
                            return null;
                        } 
                        else if (appcat == 'delivery' && item.navigationName == 'Emergency') {
                            return null;
                        } 
                        else if (!(auth.info.profile.usertype == 'rider' || auth.info.profile.usertype == 'driver') && item.navigationName == 'Refer') {
                            return null;
                        }
                        else if (auth.info.profile.usertype == 'driver'  && item.navigationName == 'Convert') {
                            return null;
                        }
                        else if (auth.info.profile.usertype == 'rider'  && item.navigationName == 'Convert' && auth.info.profile.firstName == " ") {
                            return (
                                <TouchableOpacity
                                    onPress={()=>{convert()}}
                                    style={[styles.menuItemView,{ marginTop: (index == sideMenuList.length - 1) ? width / 7 : 0, flexDirection: isRTL? 'row-reverse' : 'row' }]}
                                    >
                                    <View style={styles.viewIcon}>
                                        <Icon
                                            name={item.icon}
                                            type={item.type}
                                            color={colors.WHITE}
                                            size={16}
                                            containerStyle={styles.iconStyle}
                                        />
                                    </View>
                                    <Text style={styles.menuName}>{item.name}</Text>
                                    <View style={[styles.vertialLine, { height:20, top: 24 }]}></View>
                                </TouchableOpacity>
                            );  
                        }
                        else if ((auth.info.profile.usertype == 'rider' || auth.info.profile.usertype == 'driver') && item.navigationName == 'Refer') {
                            return (
                                <TouchableOpacity
                                    onPress={()=>{
                                        settings.bonus>0?
                                        Share.share({
                                            message:t('share_msg') + settings.code + ' ' + settings.bonus + ".\n"  +  t('code_colon') +  auth.info.profile.referralId  + "\n" + t('app_link') + (Platform.OS=="ios"? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                        :
                                        Share.share({
                                            message: t('share_msg_no_bonus') + "\n"  + t('app_link') + (Platform.OS=="ios"? settings.AppleStoreLink : settings.PlayStoreLink)
                                        })
                                    }}
                                    style={[styles.menuItemView,{ marginTop: (index == sideMenuList.length - 1) ? width / 7 : 0, flexDirection: isRTL? 'row-reverse' : 'row' }]}
                                    >
                                    <View style={styles.viewIcon}>
                                        <Icon
                                            name={item.icon}
                                            type={item.type}
                                            color={colors.WHITE}
                                            size={16}
                                            containerStyle={styles.iconStyle}
                                        />
                                    </View>
                                    <Text style={styles.menuName}>{item.name}</Text>
                                    <View style={[styles.vertialLine, { height:20, top: 24 }]}></View>
                                </TouchableOpacity>
                            );    
                        }
                        else if ((auth.info.profile.usertype == 'admin' || auth.info.profile.usertype == 'fleetadmin') && item.navigationName == 'Notifications') {
                            return null;
                        }  
                        else if (auth.info.profile.usertype == 'rider' && item.navigationName == 'Emergency'  ) {
                            return(
                                <TouchableOpacity
                                    onPress={()=> {
                                            Alert.alert(
                                                t('panic_text'),
                                                t('panic_question'),
                                                [
                                                    {
                                                        text: t('cancel'),
                                                        onPress: () => {},
                                                        style: 'cancel'
                                                    },
                                                    {
                                                        text:  t('ok'), onPress: async () => {
                                                            onPressCall(settings.panic);
                                                        }
                                                    }
                                                ],
                                                { cancelable: false }
                                            )
                                        }
                                    }
                                    style={
                                        [styles.menuItemView, { marginTop: (index == sideMenuList.length - 1) ? width / 7 : 0, flexDirection: isRTL? 'row-reverse' : 'row' }]
                                    }>
                                    <View style={styles.viewIcon}>
                                        <Icon
                                            name={item.icon}
                                            type={item.type}
                                            color={colors.WHITE}
                                            size={16}
                                            containerStyle={styles.iconStyle}
                                        />
                                    </View>
                                    <Text style={styles.menuName}>{item.name}</Text>
                                    <View style={[styles.vertialLine, { height:20, top: 24 }]}></View>
                                </TouchableOpacity>
                                )                        
                        }else{
                            return(
                            <TouchableOpacity
                                onPress={
                                    (item.name == t('logout')) ? () => logOff() :
                                        navigateToScreen(item.navigationName)
                                }
                                style={
                                    [styles.menuItemView, { marginTop: (index == sideMenuList.length - 1) ? 30 : 0, flexDirection: isRTL? 'row-reverse' : 'row' }]
                                }>
                                <View style={styles.viewIcon}>
                                    <Icon
                                        name={item.icon}
                                        type={item.type}
                                        color={colors.WHITE}
                                        size={16}
                                        containerStyle={styles.iconStyle}
                                    />
                                </View>
                                <Text style={styles.menuName}>{item.name}</Text>

                                {item.icon == 'sign-out' ?
                                    <View style={[styles.vertialLine ,{height: 30, top: -30 }]}></View>
                                : 
                                    <View style={[styles.vertialLine, { height:20, top: 24 }]}></View>
                                }
                            </TouchableOpacity>
                            )
                        }
                    }
                    } />
                :null}
            </View>
            <View style={{alignItems:'center', marginBottom:30}}>
                <Image
                    source={require("../../assets/images/logo165x90white.png")}
                    style={{ width: '60%' }}
                />
            </View>

        </View>
    )
    
}
const styles = StyleSheet.create({
    myHeader: {
        marginTop: 0,
    },
    vertialLine: {
        width: 1,
        backgroundColor: colors.MAP_TEXT,
        position: 'absolute',
        left: 18,
        marginLeft:5
    },
    menuItemView: {
        marginBottom: 18,
        flex: 1,
        paddingHorizontal: 10
    },
    viewIcon: {
        width: 24,
        height: 24,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.MAP_TEXT,
        left: 1
    },
    menuName: {
        color: colors.WHITE,
        fontWeight: 'bold',
        paddingHorizontal: 10
    },
    mainViewStyle: {
        backgroundColor: colors.SIDEMENU,
        height: '100%',
    },
    compViewStyle: {
        position: 'relative',
        flex: 3
    },
    iconStyle: {
        justifyContent: 'center',
        alignItems: 'center'
    },

})