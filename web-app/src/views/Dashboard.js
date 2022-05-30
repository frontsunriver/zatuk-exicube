import React,{ useState,useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography
} from '@material-ui/core';
import DashboardCard from '../components/DashboardCard';
import Map from '../components/Map';
import { useSelector} from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
    const [mylocation, setMylocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [dailygross,setDailygross] = useState(0);
    const [monthlygross,setMonthlygross] = useState(0);
    const [totalgross,setTotalgross] = useState(0);

    const [settings,setSettings] = useState({});
    const { t, i18n  } = useTranslation();
    const isRTL = i18n.dir();
    const usersdata = useSelector(state => state.usersdata);
    const bookinglistdata = useSelector(state => state.bookinglistdata);
    const settingsdata = useSelector(state => state.settingsdata);
    const auth = useSelector(state => state.auth);
    const cars = useSelector(state => state.cartypes.cars);

    useEffect(()=>{
        if(mylocation == null){
            navigator.geolocation.getCurrentPosition(
                position => setMylocation({ 
                    lat: position.coords.latitude, 
                    lng: position.coords.longitude
                }), 
                error => console.log(error)
            );
        }
    },[mylocation]);

    useEffect(()=>{
        if(settingsdata.settings){
          setSettings(settingsdata.settings);
        }
    },[settingsdata.settings]);

    useEffect(()=>{
        if(usersdata.users){
            const drivers = usersdata.users.filter(user => user.usertype ==='driver' && ((user.fleetadmin === auth.info.uid && auth.info.profile.usertype === 'fleetadmin')|| auth.info.profile.usertype === 'admin'));  
            let locs = [];
            for(let i=0;i<drivers.length;i++){
                if(drivers[i].approved && drivers[i].driverActiveStatus && drivers[i].location){
                    let carImage;
                    for (let j = 0; j < cars.length; j++) {
                        if (cars[j].name === drivers[i].carType) {
                            carImage = cars[j].image;
                        }
                    }
                    locs.push({
                        id:i,
                        lat:drivers[i].location.lat,
                        lng:drivers[i].location.lng,
                        drivername:drivers[i].firstName + ' ' + drivers[i].lastName,
                        carnumber:drivers[i].vehicleNumber,
                        cartype:drivers[i].carType,
                        carImage:carImage
                    });
                }
            }
            setLocations(locs);
        }
    },[usersdata.users,auth.info.profile,auth.info.uid,cars]);

    useEffect(()=>{
        if(bookinglistdata.bookings){
            let today =  new Date();
            let convenniencefees = 0;
            let totconvenienceTrans = 0;
            let todayConvenience = 0;
            for(let i=0;i<bookinglistdata.bookings.length;i++){
                if(bookinglistdata.bookings[i].status === 'PAID' || bookinglistdata.bookings[i].status === 'COMPLETE'){
                    const {tripdate,convenience_fees} = bookinglistdata.bookings[i];
                    let tDate = new Date(tripdate);
                    if(convenience_fees>0){

                        if(tDate.getMonth() === today.getMonth() && tDate.getFullYear() === today.getFullYear()){
                            convenniencefees = convenniencefees + parseFloat(convenience_fees);
                        }
                        if(tDate.getDate() === today.getDate() && tDate.getMonth() === today.getMonth()){
                            todayConvenience  = todayConvenience + parseFloat(convenience_fees);
                        } 
                        totconvenienceTrans  = totconvenienceTrans + parseFloat(convenience_fees);
                    }
                }
            }
            setDailygross(parseFloat(todayConvenience).toFixed(settings.decimal));
            setMonthlygross(parseFloat(convenniencefees).toFixed(settings.decimal));
            setTotalgross(parseFloat(totconvenienceTrans).toFixed(settings.decimal));
        }
    },[bookinglistdata.bookings, settings]);

    return (
        bookinglistdata.loading || usersdata.loading ? <CircularLoading/> :
        <div>
            <Typography variant="h4" style={{margin:"20px 20px 0 15px",textAlign:isRTL==='rtl'?'right':'left'}}>{t('gross_earning')}</Typography>
            <Grid container direction="row" spacing={2}>
                <Grid item xs style={{textAlign:isRTL==='rtl'?'right':'left'}}>
                    {settings.swipe_symbol===false?
                        <DashboardCard title={t('today_text')} image={require("../assets/img/money1.jpg").default}>{ settings.symbol + ' ' + dailygross}</DashboardCard>
                        :
                        <DashboardCard title={t('today_text')} image={require("../assets/img/money1.jpg").default}>{ dailygross + ' ' + settings.symbol }</DashboardCard>
                    }
                </Grid>
                <Grid item xs style={{textAlign:isRTL==='rtl'?'right':'left'}}>
                    {settings.swipe_symbol===false?
                        <DashboardCard title={t('this_month_text')} image={require("../assets/img/money2.jpg").default}>{ settings.symbol +' ' +  monthlygross}</DashboardCard>
                        :
                        <DashboardCard title={t('this_month_text')} image={require("../assets/img/money2.jpg").default}>{ monthlygross +' ' +  settings.symbol}</DashboardCard>
                    }
                </Grid>
                <Grid item xs style={{textAlign:isRTL==='rtl'?'right':'left'}}>
                    {settings.swipe_symbol===false?
                        <DashboardCard title={t('total')} image={require("../assets/img/money3.jpg").default}>{ settings.symbol +' ' +  totalgross}</DashboardCard>
                        :
                        <DashboardCard title={t('total')} image={require("../assets/img/money3.jpg").default}>{ totalgross +' ' +  settings.symbol}</DashboardCard>
                    }
                </Grid>
            </Grid>
            { mylocation?
            <Paper style={{marginTop:'25px'}}>
                <Typography variant="h4" style={{margin:"20px 20px 0 15px",textAlign:isRTL==='rtl'?'right':'left'}}>{t('real_time_driver_section_text')}</Typography>
                <Map mapcenter={mylocation} locations={locations}
                    loadingElement={<div style={{ height: `480px` }} />}
                    containerElement={<div style={{ height: `480px` }} />}
                    mapElement={<div style={{ height: `480px` }} />}
                />
            </Paper>
            :
            <Typography variant="h6" style={{margin:"20px 0 0 15px",color:'#FF0000'}}>{t('allow_location')}</Typography>
            }
        </div>
        
    )
}

export default Dashboard;