import { useState, useContext, useEffect, useRef } from 'react';
import { FirebaseContext, store } from 'common/src';
import { useSelector, useDispatch } from 'react-redux';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import i18n from 'i18n-js';
import { colors } from './src/common/theme';
import GetPushToken from './src/components/GetPushToken';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import moment from 'moment/min/moment-with-locales';
import {
  AuthLoadingScreen,
} from './src/screens';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, ({ data: { locations }, error }) => {
  if (error) {
    console.log(error);
    return;
  }
  if (locations.length > 0) {
    let location = locations[locations.length - 1];
    if (location.coords) {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      });
    }
  }
});

export default function AppCommon({ children }) {

  const { t } = i18n;
  const { api } = useContext(FirebaseContext);
  const dispatch = useDispatch();
  const gps = useSelector(state => state.gpsdata);
  const activeBooking = useSelector(state => state.bookinglistdata.tracked);
  const lastLocation = useSelector(state => state.locationdata.coords);
  const auth = useSelector(state => state.auth);
  const tasks = useSelector(state => state.taskdata.tasks);
  const settings = useSelector(state => state.settingsdata.settings);
  const watcher = useRef();
  const locationOn = useRef(false);
  const [sound, setSound] = useState();
  const languagedata = useSelector(state => state.languagedata);
  const initialFunctionsNotCalled = useRef(true);
  const authStillNotResponded = useRef(true);
  const authState = useRef('loading');
  const locationLoading = useRef(true);
  const fetchingToken = useRef(true);

  useEffect(() => {
    if (languagedata.langlist) {
      let obj = {};
      let defl = {};
      for (const value of Object.values(languagedata.langlist)) {
        obj[value.langLocale] = value.keyValuePairs;
        if (value.default) {
          defl = value;
        }
      }
      i18n.translations = obj;
      i18n.fallbacks = true;
      AsyncStorage.getItem('lang', (err, result) => {
        if (result) {
          i18n.locale = JSON.parse(result)['langLocale'];
          moment.locale(JSON.parse(result)['dateLocale']);
        } else {
          i18n.locale = defl.langLocale;
          moment.locale(defl.dateLocale);
        }
      });
      dispatch(api.fetchUser());
    }
  }, [languagedata, dispatch, api.fetchUser]);

  useEffect(() => {
    if (auth.info && auth.info.profile && auth.info.profile.usertype == 'driver' && tasks && tasks.length > 0) {
      playSound();
    }
    if (auth.info && auth.info.profile && auth.info.profile.usertype == 'driver' && (!tasks || tasks.length == 0)) {
      stopPlaying();
    }
  }, [auth.info, tasks]);

  useEffect(() => {
    if (settings) {
      loadSound();
    }
  }, [settings]);

  const loadSound = async () => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      useNativeControls: false
    });

    const { sound } = await Audio.Sound.createAsync(settings.CarHornRepeat ? require('./assets/sounds/car_horn_gap.wav') : require('./assets/sounds/car_horn.wav'));
    sound.setIsLoopingAsync(settings.CarHornRepeat);
    setSound(sound);
  }

  const playSound = async () => {
    sound.playAsync();
  }

  const stopPlaying = async () => {
    if (sound) {
      sound.stopAsync();
    }
  }

  useEffect(() => {
    if (gps.location && gps.location.lat && gps.location.lng) {
      locationLoading.current = false;
      if (auth.info && auth.info.uid && auth.info.profile && auth.info.profile.usertype == 'driver' ) {
        api.saveUserLocation(auth.info.uid, {
          lat: gps.location.lat,
          lng: gps.location.lng
        });
      }
      if (activeBooking && auth.info && auth.info.uid && auth.info.profile && auth.info.profile.usertype == 'driver') {
        if (lastLocation && (activeBooking.status == 'ACCEPTED' || activeBooking.status == 'STARTED')) {
          let diff = api.GetDistance(lastLocation.lat, lastLocation.lng, gps.location.lat, gps.location.lng);
          if (diff > 0.010) {
            api.saveTracking(activeBooking.id, {
              at: new Date().getTime(),
              status: activeBooking.status,
              lat: gps.location.lat,
              lng: gps.location.lng
            });
          }
        }
        if (activeBooking.status == 'ACCEPTED') {
          let diff = api.GetDistance(activeBooking.pickup.lat, activeBooking.pickup.lng, gps.location.lat, gps.location.lng);
          if (diff < 0.02) {
            let bookingData = activeBooking;
            bookingData.status = 'ARRIVED';
            store.dispatch(api.updateBooking(bookingData));
            api.saveTracking(activeBooking.id, {
              at: new Date().getTime(),
              status: 'ARRIVED',
              lat: gps.location.lat,
              lng: gps.location.lng
            });
          }
        }
      }
    }
  }, [gps.location]);

  useEffect(() => {
    if (auth.info
      && auth.info.profile
      && auth.info.profile.usertype == 'driver'
      && auth.info.profile.driverActiveStatus
      && auth.info.profile.approved
    ) {
      if (!locationOn.current) {
        locationOn.current = true;
        if (Platform.OS == 'android') {
          AsyncStorage.getItem('firstRun', (err, result) => {
            if (result) {
              StartBackgroundLocation();
            } else {
              Alert.alert(
                t('disclaimer'),
                t('disclaimer_text'),
                [
                  {
                    text: t('ok'), onPress: () => {
                      AsyncStorage.setItem('firstRun', 'OK');
                      StartBackgroundLocation();
                    }
                  }
                ],
                { cancelable: false }
              );
            }
          });
        } else {
          StartBackgroundLocation();
        }
      }
    }
    if (auth.info
      && auth.info.profile
      && auth.info.profile.usertype == 'driver'
      && auth.info.profile.driverActiveStatus == false
      && auth.info.profile.approved
    ) {
      if (locationOn.current) {
        locationOn.current = false;
        StopBackgroundLocation();
      }
    }
    if (auth.info
      && auth.info.profile
      && auth.info.profile.usertype == 'rider'
      && auth.info.profile.approved
    ) {
      if (!locationOn.current) {
        locationOn.current = true;
        GetOneTimeLocation();
      }
    }
  }, [auth.info]);

  const saveToken = async () => {
    let token = await GetPushToken();
    if((auth.info.profile.pushToken && auth.info.profile.pushToken != token) || !auth.info.profile.pushToken ){
      dispatch(
        api.updatePushToken(
          auth.info,
          token ? token : 'token_error',
          Platform.OS == 'ios' ? 'IOS' : 'ANDROID'
        )
      );
    }
  };

  const GetOneTimeLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      try {
        let tempWatcher = await Location.watchPositionAsync({
          accuracy: Location.Accuracy.Balanced
        }, location => {
          store.dispatch({
            type: 'UPDATE_GPS_LOCATION',
            payload: {
              lat: location.coords.latitude,
              lng: location.coords.longitude
            }
          });
          tempWatcher.remove();
        })
      } catch (error) {
        store.dispatch({
          type: 'UPDATE_GPS_LOCATION',
          payload: {
            error:true
          }
        });
        locationLoading.current = false;
      }
    } else {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          error:true
        }
      });
      locationLoading.current = false;
    }
  }

  const StartBackgroundLocation = async () => {
    let permResp = await Location.requestForegroundPermissionsAsync();
    let tempWatcher = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.Balanced
    }, location => {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      });
      tempWatcher.remove();
    })
    if (permResp.status == 'granted') {
      try {
        let { status } = await Location.requestBackgroundPermissionsAsync();
        if (status === 'granted') {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.BestForNavigation,
            showsBackgroundLocationIndicator: true,
            activityType: Location.ActivityType.AutomotiveNavigation,
            foregroundService: {
              notificationTitle: t('locationServiveTitle'),
              notificationBody: t('locationServiveBody'),
              notificationColor: colors.SKY
            }
          });
        } else {
          if (__DEV__) {
            StartForegroundGeolocation();
          } else {
            store.dispatch({
              type: 'UPDATE_GPS_LOCATION',
              payload: {
                error:true
              }
            });
            locationLoading.current = false;
          }
        }
      } catch (error) {
        if (__DEV__) {
          StartForegroundGeolocation();
        } else {
          store.dispatch({
            type: 'UPDATE_GPS_LOCATION',
            payload: {
              error:true
            }
          });
          locationLoading.current = false;
        }
      }
    } else {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          error:true
        }
      });
      locationLoading.current = false;
    }
  }

  const StartForegroundGeolocation = async () => {
    watcher.current = await Location.watchPositionAsync({
      accuracy: Location.Accuracy.High,
      activityType: Location.ActivityType.AutomotiveNavigation,
    }, location => {
      store.dispatch({
        type: 'UPDATE_GPS_LOCATION',
        payload: {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        }
      });
    });
  }

  const StopBackgroundLocation = async () => {
    locationOn.current = false;
    try {
      TaskManager.getRegisteredTasksAsync().then((res) => {
        if (res.length > 0) {
          for (let i = 0; i < res.length; i++) {
            if (res[i].taskName == LOCATION_TASK_NAME) {
              Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
              break;
            }
          }
        } else {
          if (watcher.current) {
            watcher.current.remove();
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (settings) {
      dispatch(api.fetchLanguages());
      dispatch(api.fetchCarTypes());
    }
  }, [settings, dispatch,api.fetchLanguages,api.fetchCarTypes,])

  useEffect(() => {
    if (api) {
      dispatch(api.fetchSettings());
    }
  }, [api,dispatch,api.fetchSettings]);

  useEffect(() => {
    if (auth.info && languagedata && languagedata.langlist && settings && initialFunctionsNotCalled.current) {
      authStillNotResponded.current = false;
      if (auth.info.profile) {
        authState.current= auth.info.profile.usertype;
        if (auth.info.profile.lang) {
          const lang = auth.info.profile.lang;
          i18n.locale = lang['langLocale'];
          moment.locale(lang['dateLocale']);
        }
        let role = auth.info.profile.usertype;
        if (auth.info.profile.approved) {
          saveToken();
          fetchingToken.current = false;
          if (role === 'rider') {
            dispatch(api.monitorProfileChanges());
            dispatch(api.fetchDrivers());
            dispatch(api.fetchBookings(auth.info.uid, role));
            dispatch(api.fetchCancelReasons());
            dispatch(api.fetchPaymentMethods());
            dispatch(api.fetchPromos());
            dispatch(api.fetchUserNotifications());
            initialFunctionsNotCalled.current = false;
          } else if (role === 'driver') {
            dispatch(api.monitorProfileChanges());
            dispatch(api.fetchBookings(auth.info.uid, role));
            dispatch(api.fetchPaymentMethods());
            dispatch(api.fetchTasks());
            dispatch(api.fetchUserNotifications());
            initialFunctionsNotCalled.current = false;
          }
          else {
            Alert.alert(t('alert'), t('not_valid_user_type'));
            dispatch(api.signOut());
          }
        }
        else {
          Alert.alert(t('alert'), t('require_approval'));
          dispatch(api.signOut());
        }
      } else {
        Alert.alert(t('alert'), t('user_issue_contact_admin'));
        dispatch(api.signOut());
      }
    }
  }, [auth.info, languagedata, languagedata.langlist, settings]);


  useEffect(() => {
    if (auth.info
      && auth.info.profile
      && auth.info.profile.usertype == 'driver'
      && auth.info.profile.driverActiveStatus
      && auth.info.profile.approved
    ) {
      let role = auth.info.profile.usertype;
      if(role == 'driver' && authState.current == 'rider'){
        authState.current = 'driver';
        dispatch(api.fetchBookings(auth.info.uid, role));
        dispatch(api.fetchTasks());
      }
    }
  }, [auth.info]);

  useEffect(() => {
    if (api && languagedata && languagedata.langlist && auth.error && auth.error.msg && !auth.info && settings) {
      locationLoading.current = false;
      authState.current= 'failed';
      authStillNotResponded.current = false;
      initialFunctionsNotCalled.current = true;
      fetchingToken.current = false;
      dispatch(api.clearLoginError());
    }
  }, [auth.error, auth.error.msg, languagedata && languagedata.langlist, settings]);

  if (authStillNotResponded.current || !(languagedata && languagedata.langlist) || !settings || authState.current == 'loading') {
    return <AuthLoadingScreen />;
  }

  if((Platform.OS =='ios'? locationLoading.current : false)) {
    return <AuthLoadingScreen />;
  }

  return children;
}