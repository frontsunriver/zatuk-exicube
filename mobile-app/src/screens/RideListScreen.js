import React, { useEffect,useState } from 'react';
import { RideList } from '../components';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback
} from 'react-native';
import { Header } from 'react-native-elements';
import { colors } from '../common/theme';
import i18n from 'i18n-js';
import { useSelector } from 'react-redux';
import { DrawerActions } from '@react-navigation/native';

export default function RideListPage(props) {
    const bookings = useSelector(state => state.bookinglistdata.bookings);
    const settings = useSelector(state => state.settingsdata.settings);
    const fromBooking  = props.route.params?props.route.params: null;
    const [bookingData,setBookingData] = useState([]);
    const { t } = i18n;
    const isRTL = i18n.locale.indexOf('he') === 0 || i18n.locale.indexOf('ar') === 0;
    const [tabIndex, setTabIndex] = useState(-1);

    useEffect(()=>{
        if(bookings){
            setBookingData(bookings);
            if(fromBooking){
                const lastStatus = bookings[0].status;
                if(lastStatus == 'COMPLETE') setTabIndex(1);
                if(lastStatus == 'CANCELLED') setTabIndex(2);
            }else{
                setTabIndex(0);
            }
        }else{
            setBookingData([]);
            setTabIndex(0);
        }
    },[bookings]);

    const goDetails = (item, index) => {
        if (item && item.trip_cost > 0) {
            item.roundoffCost = Math.round(item.trip_cost).toFixed(settings.decimal);
            item.roundoff = (Math.round(item.roundoffCost) - item.trip_cost).toFixed(settings.decimal);
            props.navigation.push('RideDetails', { data: item });
        } else {
            item.roundoffCost = Math.round(item.estimate).toFixed(settings.decimal);
            item.roundoff = (Math.round(item.roundoffCost) - item.estimate).toFixed(settings.decimal);
            props.navigation.push('RideDetails', { data: item });
        }
    }

    const hCom ={ icon: 'md-menu', type: 'ionicon', color: colors.WHITE, size: 30, component: TouchableWithoutFeedback, onPress: () => { props.navigation.dispatch(DrawerActions.toggleDrawer()); } };
    
    return (
        <View style={styles.mainView}>
            <Header
                backgroundColor={colors.HEADER}
                leftComponent={isRTL? null:hCom}
                centerComponent={<Text style={styles.headerTitleStyle}>{t('ride_list_title')}</Text>}
                rightComponent={isRTL? hCom:null}
                containerStyle={styles.headerStyle}
                innerContainerStyles={{ marginLeft: 10, marginRight: 10 }}
            />
            {tabIndex>=0?
                <RideList onPressButton={(item, index) => { goDetails(item, index) }} data={bookingData} tabIndex={tabIndex}></RideList>
            :null}
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
        backgroundColor: colors.WHITE
    }
});
