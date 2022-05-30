import React from 'react';
import { Header } from 'react-native-elements';
import { colors } from '../common/theme';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    Dimensions,
    Image,
    ScrollView
} from 'react-native';
var { width } = Dimensions.get('window');
import { DrawerActions } from '@react-navigation/native';

import i18n from 'i18n-js';


export default function AboutPage(props) {

    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;

    const lCom = { icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } }
    const rCom = { icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } }
    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL ? null:lCom}
                rightComponent={isRTL? rCom:null}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('about_us_menu')}</Text>}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            <ScrollView>
                <View styles={{ flex: 1 }}>
                    <View style={{ height: 200, width: 200, marginTop: 30, marginBottom: 40, alignSelf: 'center' }}>
                        <Image
                            style={{ width: 200, height: 200, borderRadius: 15 }}
                            source={require('../../assets/images/logo1024x1024.png')}
                        />
                    </View>
                    <View style={{ width: width, paddingLeft: 40, paddingRight: 40 }}>
                        <Text style={{ textAlign: isRTL? 'right':'center', fontSize: 20, lineHeight: 28 }}>
                            {t('about_us_content1') + ' ' + t('about_us_content2')} 
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: colors.WHITE,
        //marginTop: StatusBar.currentHeight,
    },
    headerStyle: {
        backgroundColor: colors.HEADER,
        borderBottomWidth: 0
    },
    headerTitleStyle: {
        color: colors.WHITE,
        fontFamily: 'Roboto-Bold',
        fontSize: 20
    },
    aboutTitleStyle: {
        color: colors.BLACK,
        fontFamily: 'Roboto-Bold',
        fontSize: 20,
        marginLeft: 8,
        marginTop: 8
    },
    aboutcontentmainStyle: {
        marginTop: 12,
        marginBottom: 60
    },
    contact: {
        marginTop: 6,
        marginLeft: 8,
        //flexDirection:'row',
        width: "100%",
        marginBottom: 30
    }
})