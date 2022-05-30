import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import i18n from 'i18n-js';
import { colors } from '../common/theme';

export default async function GetPushToken() {

  const { t } = i18n;

  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      //alert(t('push_error_1'));
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
   // alert(t('push_error_2'));
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('messages', {
      name: t('android_channel'),
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: colors.RED,
      sound: 'default'
    });
  }

  return token;
}