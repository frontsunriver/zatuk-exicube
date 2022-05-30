import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
    View, 
    Text,
    Dimensions, 
    TouchableOpacity, 
    ScrollView, 
    KeyboardAvoidingView,
    Image, 
    TouchableWithoutFeedback,
    Platform, 
    Alert 
} from 'react-native';
import Background from './Background';
import { Icon, Button, Header, Input } from 'react-native-elements'
import { colors } from '../common/theme';
var { height } = Dimensions.get('window');
import i18n from 'i18n-js';
import RadioForm from 'react-native-simple-radio-button';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {useSelector} from 'react-redux';
import ActionSheet from "react-native-actions-sheet";
import { FirebaseContext } from 'common/src';

export default function Registration(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const { api, appcat } = useContext(FirebaseContext);
    const {
        countries
    } = api;
    const [state, setState] = useState({
        usertype: 'rider',
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        referralId: '',
        vehicleNumber: '',
        vehicleMake:'',
        vehicleModel: '',
        carType: props.cars && props.cars.length > 0? props.cars[0].value: '',
        bankAccount: '',
        bankCode: '',
        bankName: '',
        licenseImage:null,
        other_info:'', 
    });

    const [role, setRole] = useState(0);
    const [capturedImage, setCapturedImage] = useState(null);
    const [countryCode,setCountryCode] = useState();
    const [mobileWithoutCountry, setMobileWithoutCountry] = useState('');
    const settings = useSelector(state => state.settingsdata.settings);
    const actionSheetRef = useRef(null);

    const radio_props = [
        { label: t('rider'), value: 0 },
        { label: t('driver'), value: 1 }
    ];

    const formatCountries = () => {
        let arr = [];
        for (let i = 0; i < countries.length; i++) {
            let txt = countries[i].label + " (+" + countries[i].phone + ")"; 
            arr.push({ label: txt, value: txt, key: txt});
        }
        return arr;
    }

    useEffect(() => {
        if(settings){
            for (let i = 0; i < countries.length; i++) {
                if(countries[i].label == settings.country){
                    setCountryCode(settings.country + " (+" + countries[i].phone + ")");
                }
            }
        }
    }, [settings]);

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => { 
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity 
                    style={{width:'90%',alignSelf:'center',paddingLeft:20,paddingRight:20,borderColor:colors.WALLET_PRIMARY,borderBottomWidth:1,height:60,alignItems:'center',justifyContent:'center'}} 
                    onPress={()=>{_pickImage('CAMERA', ImagePicker.launchCameraAsync)}}
                >
                    <Text style={{color:colors.CAMERA_TEXT,fontWeight:'bold'}}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width:'90%',alignSelf:'center',paddingLeft:20,paddingRight:20,borderBottomWidth:1,borderColor:colors.WALLET_PRIMARY,height:60,alignItems:'center',justifyContent:'center'}} 
                    onPress={()=>{ _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync)}}
                >
                    <Text  style={{color:colors.CAMERA_TEXT,fontWeight:'bold'}}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                     style={{width:'90%',alignSelf:'center',paddingLeft:20,paddingRight:20, height:50,alignItems:'center',justifyContent:'center'}} 
                    onPress={()=>{actionSheetRef.current?.setModalVisible(false);}}>
                    <Text  style={{color:'red',fontWeight:'bold'}}>Cancel</Text>
                </TouchableOpacity>
            </ActionSheet>
        )
    }

    const _pickImage = async (permissionType, res) => {
        var pickFrom = res;
        let permisions;
        if(permissionType == 'CAMERA'){
            permisions = await ImagePicker.requestCameraPermissionsAsync();
        }else{
            permisions = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }
        const { status } = permisions;

        if (status == 'granted') {

            let result = await pickFrom({
                allowsEditing: true,
                aspect: [4, 3],
                base64:true
            });

            actionSheetRef.current?.setModalVisible(false);
            if (!result.cancelled) {
                let data = 'data:image/jpeg;base64,' + result.base64;
                setCapturedImage(result.uri);
                const blob = await new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.onload = function() {
                        resolve(xhr.response); 
                    };
                    xhr.onerror = function() {
                        Alert.alert(t('alert'), t('image_upload_error'));;
                    };
                    xhr.responseType = 'blob'; 
                    xhr.open('GET', Platform.OS=='ios'?data:result.uri, true); 
                    xhr.send(null); 
                });
                if(blob){
                    setState({ ...state, licenseImage: blob });
                }
            }
        } else {
            Alert.alert(t('alert'),t('camera_permission_error'))
        }
    }

    //upload cancel
    const cancelPhoto = () => {
        setCapturedImage(null);
    }

    const setUserType = (value) => {
        if(value==0){
            setState({...state, usertype: 'rider' });
        }else{
            setState({...state, usertype: 'driver' });
        }
    }

    const validateMobile = () => {
        let mobileValid = true;
        if(mobileWithoutCountry.length<6){
            mobileValid = false;
            Alert.alert(t('alert'),t('mobile_no_blank_error'));
        }
        return mobileValid;
    }

    //register button press for validation
    const onPressRegister = () => {
        const { onPressRegister } = props;
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if(re.test(state.email)){
            if(state.usertype == 'driver' && state.licenseImage == null){
                Alert.alert(t('alert'),t('proper_input_licenseimage'));
            }else{
                if((state.usertype == 'driver' && state.vehicleNumber.length > 1) || state.usertype == 'rider'){
                    if(/\S/.test(state.firstName) && state.firstName.length>0 && /\S/.test(state.lastName) && state.lastName.length >0){
                        if(validateMobile()){
                            const userData = { ...state};
                            if(userData.usertype == 'rider') delete userData.carType;
                            onPressRegister(userData);
                        }else{
                            Alert.alert(t('alert'),t('mobile_no_blank_error'));
                        }
                    }else{
                        Alert.alert(t('alert'),t('proper_input_name'));
                    }
                }else{
                    Alert.alert(t('alert'),t('proper_input_vehicleno'));
                }
            }
        }else{
            Alert.alert(t('alert'),t('proper_email'));
        }
    }

    const upDateCountry = (text) => {
        setCountryCode(text);  
        let extNum = text.split("(")[1].split(")")[0];                                
        let formattedNum = mobileWithoutCountry.replace(/ /g, '');
        formattedNum = extNum + formattedNum.replace(/-/g, '');
        setState({ ...state, mobile: formattedNum })
    }

    const lCom = { icon: 'ios-arrow-back', type: 'ionicon', color: colors.WHITE, size: 35, component: TouchableWithoutFeedback, onPress: props.onPressBack };
    const rCom = { icon: 'ios-arrow-forward', type: 'ionicon', color: colors.WHITE, size: 35, component: TouchableWithoutFeedback, onPress: props.onPressBack };
    
    return (
        <Background>
            <Header
            placement="right"
                backgroundColor={colors.TRANSPARENT}
                leftComponent={isRTL?null : lCom }
                rightComponent={isRTL? rCom: null}
                containerStyle={styles.headerContainerStyle}
                innerContainerStyles={styles.headerInnerContainer}
            />
            <KeyboardAvoidingView  style={styles.form} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                {
                    uploadImage()
                }               
                <View style={styles.logo}>
                    <Image source={require('../../assets/images/logo165x90white.png')} />
                </View>
                <View style={styles.form}>
                    <View style={[styles.containerStyle, isRTL? {marginRight: 10, marginLeft: 20} : {marginLeft:0, marginRight: 20} ]}>
                        <Text style={styles.headerStyle}>{t('registration_title')}</Text>
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row' }]}>
                            <Icon
                                name='user'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={24}
                                containerStyle={[styles.iconContainer,{paddingTop:15 }, isRTL? {marginLeft: 10} : {marginLeft: 0}]}
                            />
                            <RadioForm
                                radio_props={radio_props}
                                initial={role}
                                formHorizontal={true}
                                labelHorizontal={true}
                                buttonColor={colors.WHITE}
                                labelColor={colors.WHITE}
                                style={isRTL? {marginRight: 20} : {marginLeft: 20} }
                                labelStyle ={ isRTL? {marginRight: 10} : {marginRight: 10} }
                                selectedButtonColor={colors.WHITE}
                                selectedLabelColor={colors.WHITE}
                                onPress={(value) => {
                                    setRole(value);
                                    setUserType(value);
                                }}
                            />
                        </View>
                        <View style={{alignItems:'center' }}>                                                                                     
        
                        </View>
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='user'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={24}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('first_name_placeholder')}
                                placeholderTextColor={colors.WHITE}
                                value={state.firstName}
                                keyboardType={'email-address'}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, firstName: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>

                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='user'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={24}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('last_name_placeholder')}
                                placeholderTextColor={colors.WHITE}
                                value={state.lastName}
                                keyboardType={'email-address'}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, lastName: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        <View
                          style={[
                            styles.textInputContainerStyle,
                            {
                              marginBottom: Platform.OS === "ios" ? 0: 10,
                              flexDirection: isRTL ? "row-reverse" : "row",
                              marginTop: Platform.OS === "ios" ? -10 : -25,
                            },
                          ]}
                        >
                            <Icon
                                name='mobile-phone'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={36}
                                containerStyle={[styles.iconContainer,{marginTop:15}, isRTL? {marginLeft: 10} : {marginLeft: 0}]}
                            />

                            <RNPickerSelect
                                key={countryCode}
                                placeholder={{ label: t('select_country'), value: t('select_country')}}
                                value={countryCode}
                                useNativeAndroidPickerStyle={false}
                                style={{
                                    inputIOS: [styles.pickerStyle,{ textAlign: isRTL? 'right': 'left'}],
                                    placeholder: {
                                        color: 'white'
                                    },
                                    inputAndroid: [styles.pickerStyle,{ textAlign: isRTL? 'right': 'left'}]
                                }}
                                onValueChange={(text) => {upDateCountry(text);}}
                                items={formatCountries()}
                                disabled={settings.AllowCountrySelection ? false : true}
                                Icon={() => {return <Ionicons style={{top: 15, marginRight: isRTL? '80%' : 0 }} name="md-arrow-down" size={24} color="gray" />;}}

                            />
                        </View>
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='mobile-phone'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={36}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('mobile_no_placeholder')}
                                placeholderTextColor={colors.WHITE}
                                value={mobileWithoutCountry}
                                keyboardType={'number-pad'}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={
                                    (text) => {
                                        setMobileWithoutCountry(text)
                                        let formattedNum = text.replace(/ /g, '');
                                        formattedNum = countryCode.split("(")[1].split(")")[0] + formattedNum.replace(/-/g, '');
                                        setState({ ...state, mobile: formattedNum })
                                    }
                                }     
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='envelope-o'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('email_placeholder')}
                                placeholderTextColor={colors.WHITE}
                                value={state.email}
                                keyboardType={'email-address'}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, email: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        {state.usertype == 'driver' ? 
                          <View
                            style={[
                              styles.textInputContainerStyle,
                              {
                                marginBottom: Platform.OS === "ios" ? 10: 15,
                                flexDirection: isRTL ? "row-reverse" : "row",
                                marginTop: Platform.OS === "ios" ? -10 : -15,
                              },
                            ]}
                          >
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={22}
                                containerStyle={[styles.iconContainer,{paddingTop: 20}, isRTL? {marginLeft: 10} : {marginLeft: 0}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, { paddingTop: 20 }, isRTL? {marginLeft: 10} : {marginLeft: 0}]}
                            />
                            }
                            {props.cars?
                                <RNPickerSelect
                                    placeholder={{}}
                                    value={state.carType}
                                    useNativeAndroidPickerStyle={false}
                                    style={{
                                        inputIOS: [styles.pickerStyle,{ textAlign: isRTL? 'right': 'left'}],
                                        placeholder: {
                                            color: 'white'
                                        },
                                        inputAndroid: [styles.pickerStyle,{ textAlign: isRTL? 'right': 'left'}]
                                    }}
                                    onValueChange={(value) => setState({ ...state, carType: value })}
                                    items={props.cars}
                                    Icon={() => {return <Ionicons style={{top:15, marginRight: isRTL? '80%' : 0  }} name="md-arrow-down" size={24} color="gray" />;}}
                                />
                                : null}
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={22}
                                containerStyle={[styles.iconContainer,{paddingTop:20}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, { paddingTop: 20 }]}
                            />
                            }
                            <Input
                                editable={true}
                                returnKeyType={'next'}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('vehicle_model_name')}
                                placeholderTextColor={colors.WHITE}
                                value={state.vehicleMake}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, vehicleMake: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={22}
                                containerStyle={[styles.iconContainer,{paddingTop:20}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, { paddingTop: 20 }]}
                            />
                            }
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('vehicle_model_no')}
                                placeholderTextColor={colors.WHITE}
                                value={state.vehicleModel}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, vehicleModel: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={22}
                                containerStyle={[styles.iconContainer,{paddingTop:20}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, { paddingTop: 20 }]}
                            />
                            }
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('vehicle_reg_no')}
                                placeholderTextColor={colors.WHITE}
                                value={state.vehicleNumber}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, vehicleNumber: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {state.usertype == 'driver' ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={22}
                                containerStyle={[styles.iconContainer,{paddingTop:20}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, { paddingTop: 20 }]}
                            />
                            }
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('other_info')}
                                placeholderTextColor={colors.WHITE}
                                value={state.other_info}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, other_info: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {(state.usertype == 'driver' && settings.bank_fields) || (state.usertype == 'rider' && settings.bank_fields && settings.RiderWithDraw) ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('bankName')}
                                placeholderTextColor={colors.WHITE}
                                value={state.bankName}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, bankName: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {(state.usertype == 'driver' && settings.bank_fields) || (state.usertype == 'rider' && settings.bank_fields && settings.RiderWithDraw) ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('bankCode')}
                                placeholderTextColor={colors.WHITE}
                                value={state.bankCode}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, bankCode: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        {(state.usertype == 'driver' && settings.bank_fields) || (state.usertype == 'rider' && settings.bank_fields && settings.RiderWithDraw) ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={styles.iconContainer}
                            />
                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('bankAccount')}
                                placeholderTextColor={colors.WHITE}
                                value={state.bankAccount}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, bankAccount: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        :null}
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='lock'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={24}
                                containerStyle={styles.iconContainer}
                            />

                            <Input
                                editable={true}
                                underlineColorAndroid={colors.TRANSPARENT}
                                placeholder={t('referral_id_placeholder')}
                                placeholderTextColor={colors.WHITE}
                                value={state.referralId}
                                inputStyle={[styles.inputTextStyle,{ textAlign: isRTL? 'right': 'left'}]}
                                onChangeText={(text) => { setState({ ...state, referralId: text }) }}
                                inputContainerStyle={styles.inputContainerStyle}
                                containerStyle={styles.textInputStyle}
                            />
                        </View>
                        {state.usertype == 'driver'  ?
                            capturedImage?
                                <View style={styles.imagePosition}>
                                    <TouchableOpacity style={styles.photoClick} onPress={cancelPhoto}>
                                        <Image source={require('../../assets/images/cross.png')} resizeMode={'contain'} style={styles.imageStyle} />
                                    </TouchableOpacity>
                                    <Image source={{ uri: capturedImage }} style={styles.photoResult} resizeMode={'cover'} />
                                </View>
                                :
                                <View style={styles.capturePhoto}>
                                    <View>
                                        {
                                            state.imageValid ?
                                                <Text style={styles.capturePhotoTitle}>{t('upload_driving_license')}</Text>
                                                :
                                                <Text style={styles.errorPhotoTitle}>{t('upload_driving_license')}</Text>
                                        }

                                    </View>
                                    <View style={[styles.capturePicClick,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                                        <TouchableOpacity style={styles.flexView1} onPress={showActionSheet}>
                                            <View>
                                                <View style={styles.imageFixStyle}>
                                                    <Image source={require('../../assets/images/camera.png')} resizeMode={'contain'} style={styles.imageStyle2} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                        <View style={styles.myView}>
                                            <View style={styles.myView1} />
                                        </View>
                                        <View style={styles.myView2}>
                                            <View style={styles.myView3}>
                                                <Text style={styles.textStyle}>{t('image_size_warning')}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                        :null}
                        <View style={styles.buttonContainer}>
                            <Button
                                onPress={onPressRegister}
                                title={t('register_button')}
                                loading={props.loading}
                                titleStyle={styles.buttonTitle}
                                buttonStyle={[styles.registerButton,{marginTop:state.usertype == 'driver'? 30: 10}]}
                            />
                        </View>
                        <View style={styles.gapView} />
                    </View>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </Background>
    );
};

const styles = {
    headerContainerStyle: {
        backgroundColor: colors.TRANSPARENT,
        borderBottomWidth: 0,
        marginTop: 0
    },
    headerInnerContainer: {
        marginLeft: 10,
        marginRight: 10
    },
    inputContainerStyle: {
        borderBottomWidth: 1,
        borderBottomColor: colors.WHITE
    },
    textInputStyle: {
        marginLeft: 10,
    },
    iconContainer: {
        paddingBottom: 20,
        alignSelf:'center'
    },
    gapView: {
        height: 40,
        width: '100%'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        borderRadius: 40
    },
    registerButton: {
        backgroundColor: colors.SKY,
        width: 180,
        height: 50,
        borderColor: colors.TRANSPARENT,
        borderWidth: 0,
        marginTop: 30,
        borderRadius: 15,
    },
    buttonTitle: {
        fontSize: 16
    },
    pickerStyle: {
        color: 'white',
        width: 200,
        fontSize: 15,
        height: 40,
        marginLeft: 20,
        marginTop:8,
        borderBottomWidth: 1,
        borderBottomColor: colors.WHITE,
    },
    inputTextStyle: {
        color: colors.WHITE,
        fontSize: 13,
        marginLeft: 0,
        height: 32,
    },
    errorMessageStyle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 0
    },
    containerStyle: {
        flexDirection: 'column',
        marginTop: 20,
        paddingLeft: 15,
        paddingRight:15
    },
    form: {
        flex: 1,
    },
    logo: {
        width: '95%',
        justifyContent: "flex-start",
        marginTop: 10,
        alignItems: 'center',
    },
    scrollViewStyle: {
        height: height
    },
    textInputContainerStyle: {
        alignItems: "center",
        paddingTop:10,
    },
    headerStyle: {
        fontSize: 18,
        color: colors.WHITE,
        textAlign: 'center',
        flexDirection: 'row',
        marginTop: 0
    },

    capturePhoto: {
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        backgroundColor: colors.WHITE,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15
    },
    capturePhotoTitle: {
        color: colors.BLACK,
        fontSize: 14,
        textAlign: 'center',
        paddingBottom: 15,

    },
    errorPhotoTitle: {
        color: colors.RED,
        fontSize: 13,
        textAlign: 'center',
        paddingBottom: 15,
    },
    photoResult: {
        alignSelf: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: 20,
        marginRight: 20,
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 15,
        width: '80%',
        height: height / 4
    },
    imagePosition: {
        position: 'relative'
    },
    photoClick: {
        paddingRight: 48,
        position: 'absolute',
        zIndex: 1,
        marginTop: 18,
        alignSelf: 'flex-end'
    },
    capturePicClick: {
        backgroundColor: colors.WHITE,
        flexDirection: 'row',
        position: 'relative',
        zIndex: 1
    },
    imageStyle: {
        width: 30,
        height: height / 15
    },
    flexView1: {
        flex: 12
    },
    imageFixStyle: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageStyle2: {
        width: 150,
        height: height / 15
    },
    myView: {
        flex: 2,
        height: 50,
        width: 1,
        alignItems: 'center'
    },
    myView1: {
        height: height / 18,
        width: 1.5,
        backgroundColor: colors.BORDER_TEXT,
        alignItems: 'center',
        marginTop: 10
    },
    myView2: {
        flex: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    myView3: {
        flex: 2.2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textStyle: {
        color: colors.ProfileDetails_Text,
        fontFamily: 'Roboto-Bold',
        fontSize: 13
    }
}
