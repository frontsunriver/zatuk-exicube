import React,{useState,useEffect,useRef,useContext} from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Dimensions,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  Platform
} from "react-native";
import { colors } from "../common/theme";
import { Header } from "react-native-elements";
import i18n from 'i18n-js';
var { height, width } = Dimensions.get('window');
import { useSelector, useDispatch } from 'react-redux';
import { ScrollView } from "react-native-gesture-handler";
import { FirebaseContext } from 'common/src';

const hasNotch = Platform.OS === 'ios' && !Platform.isPad && !Platform.isTVOS && ((height === 780 || width === 780) || (height === 812 || width === 812) || (height === 844 || width === 844) || (height === 896 || width === 896) || (height === 926 || width === 926))

export default function OnlineChat(props) {
  const { api } = useContext(FirebaseContext);
  const {
    fetchChatMessages, 
    sendMessage, 
    stopFetchMessages
  } = api;
  const dispatch = useDispatch();
  const { bookingId } = props.route.params;
  const activeBookings = useSelector(state => state.bookinglistdata.active);
  const [curBooking, setCurBooking] = useState(null);
  const auth = useSelector(state => state.auth);
  const [inputMessage,setInputMessage] = useState('');
  const allChat = useSelector(state=>state.chatdata.messages);
  const scrollViewRef = useRef();

  const { t }=i18n;
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
    if (activeBookings && activeBookings.length >= 1) {
      let booking = activeBookings.filter(booking => booking.id == bookingId)[0];
      setCurBooking(booking);
    }
  }, [activeBookings]);


  const SendMsg = () => {
      if (inputMessage == '' || inputMessage == undefined || inputMessage == null) {
          Alert.alert(t('alert'),t('chat_blank'));
      } else {
        setInputMessage('');
        dispatch(sendMessage({
          booking:curBooking,
          role:role,
          message:inputMessage
        }));
      }
  }

  const renderItem = ({ item }) => {
    return (
      item.source == "rider" ?
        <View style={styles.drivermsgStyle}>
          <Text style={[styles.msgTextStyle, { textAlign: isRTL? 'left': 'right',}]}>{item ? item.message : t('chat_not_found')}</Text>
          <Text style={[styles.msgTimeStyle, { textAlign: isRTL? 'left': 'right',}]}>{item ? item.msgTime : null}</Text>
        </View>
        :
        <View style={styles.riderMsgStyle}>
          <Text style={[styles.riderMsgText, { textAlign: isRTL? 'right': 'left' }]}>{item ? item.message : t('chat_not_found')}</Text>
          <Text style={[styles.riderMsgTime, { textAlign: isRTL? 'right': 'left' }]}>{item ? item.msgTime : null}</Text>
        </View>
    );
  }

  const lCom = { icon: 'angle-left', type: 'font-awesome', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.goBack(); } }
  const rCom = { icon: 'angle-right', type: 'font-awesome', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.goBack(); } }


  useEffect(() => {
      const unsubscribe = props.navigation.addListener('focus', () => {
        dispatch(fetchChatMessages(bookingId));
      });
      return unsubscribe;
  }, [props.navigation]);

  useEffect(() => {
      const unsubscribe = props.navigation.addListener('blur', () => {
        dispatch(stopFetchMessages(bookingId));
      });
      return unsubscribe;
  }, [props.navigation]);

  return (
    <View style={styles.container}>
      <Header
        leftComponent={isRTL? null : lCom }
        rightComponent={isRTL? rCom : null }
        backgroundColor={colors.HEADER}
        centerComponent={<Text style={styles.headerTitleStyle}>{t('chat_title')}</Text>}
        containerStyle={styles.headerStyle}
        innerContainerStyles={[styles.inrContStyle,{marginBottom: 10}]}
        statusBarProps={{ barStyle: 'light-content' }}
        barStyle="light-content"
      />

      <KeyboardAvoidingView behavior= {(Platform.OS === 'ios')? "padding" : null} style={{flex:1}}>
        <FlatList
          data={allChat? allChat: []}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ref={scrollViewRef}
          onContentSizeChange={(contentWidth, contentHeight)=> {scrollViewRef.current.scrollToEnd({animated: true})}}
        />
        <View style={[styles.footer, {flexDirection: isRTL ? 'row-reverse' : 'row'}]}>
          <TextInput
            value={inputMessage}
            style={[styles.input,{ textAlign: isRTL? 'right': 'left'}]}
            underlineColorAndroid="transparent"
            placeholder={t('chat_input_title')}
            onChangeText={text => setInputMessage(text)}
          />
          <TouchableOpacity onPress={() => SendMsg()}>
            <Text style={styles.send}>{t('send_button_text')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}


//Screen Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:colors.ONLINE_CHAT_BACKGROUND,
  },
  container1: {
    height: height - 150
  },
  container2: {
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  backIconStyle: {
    alignSelf: 'flex-start',
    marginLeft: 20
  },
  contentContainerStyle: {
    flexGrow: 1
  },
  headerTitleStyle: {
    color: colors.WHITE,
    fontSize: 18,
    textAlign: 'center',
  },
  headerStyle: {
    backgroundColor: colors.HEADER,
    borderBottomWidth: 0,
    justifyContent: 'space-around',
    height: Platform.OS == "ios"? 70 +(hasNotch ? 30 : null): null
  },

  inrContStyle: {
    marginLeft: 10,
    marginRight: 10
  },

  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40,
    marginRight: 10
  },
  rowText: {
    flex: 1
  },
  message: {
    fontSize: 18
  },
  sender: {
    fontWeight: 'bold',
    paddingRight: 10
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
  },
  input: {
    paddingHorizontal: 20,
    fontSize: 18,
    flex: 1
  },
  send: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 20
  },
  drivermsgStyle: {
    backgroundColor: colors.DRIVER_MSG_BACKGROUND,
    marginBottom: 5,
    marginTop: 5,
    marginRight: 10,
    marginLeft: 30,
    borderRadius: 20,
    elevation: 5,
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: colors.PROMO,
    shadowOffset: { height: 1, width: 0 },
  }, 
  msgTextStyle: {
    marginStart: 15,
    marginEnd: 15,
    marginTop: 10,
    fontSize: 18,
    color: colors.WHITE
  },
  msgTimeStyle: {
    marginStart: 15,
    marginBottom: 10,
    marginEnd: 15,
    fontSize: 12,
    color: colors.WHITE
  },
  riderMsgStyle: {
    backgroundColor: colors.WHITE,
    marginBottom: 5,
    marginTop: 5,
    marginRight: 30,
    marginLeft: 10,
    borderRadius: 20,
    shadowOpacity: 0.75,
    shadowRadius: 5,
    shadowColor: colors.PROMO,
    shadowOffset: { height: 1, width: 0 },
  },
  riderMsgText: {
    marginStart: 15,
    marginEnd: 15,
    fontSize: 18,
    color: colors.BLACK,
    marginTop: 10
  },
  riderMsgTime: {
    marginStart: 15,
    marginEnd: 15,
    fontSize: 12,
    color: colors.BLACK,
    marginBottom: 10
  }
});
