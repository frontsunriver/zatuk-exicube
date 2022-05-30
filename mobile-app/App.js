import React, { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import AppContainer from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import * as Updates from 'expo-updates';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  ImageBackground,
  Dimensions,
  LogBox
} from "react-native";
import { Provider } from "react-redux";
import {
  FirebaseProvider,
  store
} from 'common/src';
import AppCommon from './AppCommon';
import AppCat from './config/AppCat';
import { FirebaseConfig } from './config/FirebaseConfig';
import { colors } from './src/common/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    LogBox.ignoreLogs(['Setting a timer']);
    onLoad();
  }, []);

  const _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/background.jpg'),
        require('./assets/images/logo165x90white.png'),
        require('./assets/images/bg.jpg'),
        require('./assets/images/intro.jpg'),
      ]),
      Font.loadAsync({
        'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
        'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
        'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
        'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
      }),
    ]);
  };

  const onLoad = async () => {
    if (__DEV__) {
      _loadResourcesAsync().then(() => setAssetsLoaded(true));
    } else {
      try {
        Updates.checkForUpdateAsync().then((update) => {
          if (update.isAvailable) {
            Updates.fetchUpdateAsync().then((fetchResult) => {
              if (fetchResult.isNew) {
                Updates.reloadAsync().catch(() => {
                  _loadResourcesAsync().then(() => setAssetsLoaded(true));
                })
              } else {
                _loadResourcesAsync().then(() => setAssetsLoaded(true));
              }
            }).catch((error) => {
              _loadResourcesAsync().then(() => setAssetsLoaded(true));
            });
          } else {
            _loadResourcesAsync().then(() => setAssetsLoaded(true));
          }
        }).catch(error => {
          _loadResourcesAsync().then(() => setAssetsLoaded(true));
        });
      } catch (error) {
        _loadResourcesAsync().then(() => setAssetsLoaded(true));
      }
    }
  }

  if (!assetsLoaded) {
    return <View style={styles.container}>
      <ImageBackground
        source={require('./assets/images/intro.jpg')}
        resizeMode="stretch"
        style={styles.imagebg}
      >
        <ActivityIndicator style={{ paddingBottom: 100 }} color={colors.INDICATOR_BLUE} size='large' />
      </ImageBackground>
    </View>
  }

  return (
    <Provider store={store}>
      <FirebaseProvider config={FirebaseConfig} appcat={AppCat}>
        <AppCommon>
          <AppContainer />
        </AppCommon>
      </FirebaseProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: 'center'
  },
  imagebg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: "flex-end",
    alignItems: 'center'
  }
});