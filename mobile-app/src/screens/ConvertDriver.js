import React, { useEffect,useContext,useState, useRef } from 'react';
import { colors } from '../common/theme';
import { useSelector, useDispatch } from 'react-redux';
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
    Alert ,
    StyleSheet
} from 'react-native';
import { Icon, Button, Header, Input } from 'react-native-elements'
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseContext } from 'common/src';
import { DrawerActions } from '@react-navigation/native';
import ActionSheet from "react-native-actions-sheet";
import i18n from 'i18n-js';
import { Ionicons } from '@expo/vector-icons';

var { height,width } = Dimensions.get('window');

export default function ConvertDriver(props) {
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const { api, appcat } = useContext(FirebaseContext);
    const settings = useSelector(state => state.settingsdata.settings);
    const dispatch = useDispatch();
    const {
        updateProfile
    } = api;

    const cars = useSelector(state => state.cartypes.cars);
    const auth = useSelector(state => state.auth);
    const settingsdata = useSelector(state => state.settingsdata);
    const [carTypes, setCarTypes] = useState(null);
    const [loading,setLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const actionSheetRef = useRef(null);
    
    const [state, setState] = useState({
        usertype: 'driver',
        vehicleNumber: '',
        vehicleMake:'',
        vehicleModel: '',
        carType: null,
        bankAccount: auth.info && auth.info.profile.bankAccount ? auth.info.profile.bankAccount : '',
        bankCode: auth.info && auth.info.profile.bankCode? auth.info.profile.bankCode : '',
        bankName: auth.info && auth.info.profile.bankName? auth.info.profile.bankName : '',
        licenseImage:null,
        other_info:'',  
        queue: false,
        driverActiveStatus: false
    });

    useEffect(() => {
      if (cars) {
        let arr = [];
        for (let i = 0; i < cars.length; i++) {
          arr.push({ label: cars[i].name, value: cars[i].name });
        }
        if(arr.length>0){
            setState({...state, carType: arr[0].value})
        }
        setCarTypes(arr);
      }
    }, [cars]);

    const showActionSheet = () => {
        actionSheetRef.current?.setModalVisible(true);
    }

    const uploadImage = () => {
        return (
            <ActionSheet ref={actionSheetRef}>
                <TouchableOpacity 
                    style={{width:'90%',alignSelf:'center',paddingLeft:20,paddingRight:20,borderColor:colors.CONVERTDRIVER_TEXT,borderBottomWidth:1,height:60,alignItems:'center',justifyContent:'center'}} 
                    onPress={()=>{_pickImage('CAMERA', ImagePicker.launchCameraAsync)}}
                >
                    <Text style={{color:colors.CAMERA_TEXT,fontWeight:'bold'}}>{t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={{width:'90%',alignSelf:'center',paddingLeft:20,paddingRight:20,borderBottomWidth:1,borderColor:colors.CONVERTDRIVER_TEXT,height:60,alignItems:'center',justifyContent:'center'}} 
                    onPress={()=>{ _pickImage('MEDIA', ImagePicker.launchImageLibraryAsync)}}
                >
                    <Text  style={{color:colors.CAMERA_TEXT,fontWeight:'bold'}}>{t('medialibrary')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                     style={{width:'90%',alignSelf:'center',paddingLeft:20,paddingRight:20, height:50,alignItems:'center',justifyContent:'center'}} 
                    onPress={()=>{actionSheetRef.current?.setModalVisible(false);}}>
                    <Text  style={{color:'red',fontWeight:'bold'}}>{t('cancel')}</Text>
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
                base64: true,
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
                        Alert.alert(t('alert'), t('image_upload_error'));
                        setLoader(false);
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

    //register button press for validation
    const onPressRegister = () => {
        if(state.licenseImage == null){
            Alert.alert(t('alert'),t('proper_input_licenseimage'));
        }else{
            if(state.vehicleNumber.length > 1){
                setLoading(true);
                dispatch(updateProfile(auth.info, { ...state, approved:  !settingsdata.settings.driver_approval }));
            }else{
                Alert.alert(t('alert'),t('proper_input_vehicleno'));
            }
        }
    }

    const lCom = { icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer());} }

    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL?null : lCom }
                rightComponent={isRTL? lCom: null}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('convert_to_driver')}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <KeyboardAvoidingView  style={styles.form} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView style={styles.scrollViewStyle} showsVerticalScrollIndicator={false}>
                {
                    uploadImage()
                }
                <View style={styles.form}>
                    <View style={styles.containerStyle}>
                        <View style={[styles.textInputContainerStyle,{marginBottom:10, flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
                            />
                            }
                            {carTypes?
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
                                    items={carTypes}
                                    Icon={() => {return <Ionicons style={{top:5, marginRight: isRTL? '85%' : 0}} name="md-arrow-down" size={24} color="gray" />;}}
                                />
                                : null}
                        </View>
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
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
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
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
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
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
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            {appcat=='delivery'?
                            <Icon
                                name='truck-fast'
                                type='material-community'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
                            />
                            :
                            <Icon
                                name='car'
                                type='font-awesome'
                                color={colors.WHITE}
                                size={18}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
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
                        {settings.bank_fields && !auth.info.profile.bankName ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
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
                        {settings.bank_fields && !auth.info.profile.bankCode ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
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
                        {settings.bank_fields && !auth.info.profile.bankAccount  ? 
                        <View style={[styles.textInputContainerStyle,{flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
                            <Icon
                                name='numeric'
                                type={'material-community'}
                                color={colors.WHITE}
                                size={20}
                                containerStyle={[styles.iconContainer, isRTL? {marginRight: 20} : {marginLeft: 0}]}
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
                        {capturedImage?
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
                        }
                        <View style={styles.buttonContainer}>
                            <Button
                                onPress={onPressRegister}
                                title={t('convert_button')}
                                loading={loading}
                                titleStyle={styles.buttonTitle}
                                buttonStyle={styles.registerButton}
                            />
                        </View>
                        <View style={styles.gapView} />
                    </View>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
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
    containerView: { flex: 1 },
    textContainer: { textAlign: "center" },
    mainView: {
        flex: 1,
        backgroundColor: colors.BLACK
    },
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
        width:width - 60
    },
    iconContainer: {
        paddingVertical: 20
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
        backgroundColor: colors.INDICATOR_BLUE,
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
        color: colors.WHITE,
        width: 200,
        fontSize: 15,
        height: 40,
        marginLeft: Platform.OS=='ios'? 20:10,
        marginTop:Platform.OS=='ios'? 8:-5, 
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
        marginRight: 20,
        marginLeft: 20
    },
    form: {
        flex: 1,
    },
    logo: {
        width: '100%',
        justifyContent: "flex-start",
        marginTop: 10,
        alignItems: 'center',
    },
    scrollViewStyle: {
        height: height
    },
    textInputContainerStyle: {
        flexDirection: 'row',
        alignItems: "center",
        //marginLeft: 20,
        marginRight: 20,
        width:width - 40
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
        backgroundColor: colors.CONVERTDRIVER_TEXT,
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
        color: colors.CONVERTDRIVER_TEXT,
        fontFamily: 'Roboto-Bold',
        fontSize: 13
    }
});