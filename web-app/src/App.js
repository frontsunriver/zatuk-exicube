import React, {useRef} from "react";
import { createBrowserHistory } from "history";
import { Router, Route, Switch } from "react-router-dom";
import "assets/scss/material-kit-react.scss?v=1.9.0";
import LandingPage from "./views/LandingPage.js";
import LoginPage from "./views/LoginPage.js";
import PrivacyPolicy from "./views/PrivacyPolicy.js";
import AboutUs from "./views/AboutUs";
import AuthLoading from './views/AuthLoading';
import { Provider } from "react-redux";
import ProtectedRoute from './views/ProtectedRoute';
import MyProfile from './views/MyProfile';
import BookingHistory from './views/BookingHistory';
import Dashboard from './views/Dashboard';
import CarTypes from './views/CarTypes';
import AddBookings from './views/AddBookings';
import Promos from './views/Promos';
import Riders from './views/Riders';
import Drivers from './views/Drivers';
import FleetAdmins from './views/FleetAdmins';
import Notifications from './views/Notifications';
import DriverEarning from './views/DriverEarning';
import Earningreports from './views/Earningreports';
import Settings from './views/Settings';
import LanguageSetting from "./views/LanguageSetting";
import AppInformation from "./views/AppInformation";
import Withdraws from './views/Withdraws';
import CancellationReasons from './views/CancellationReasons';
import AddMoney from "./views/AddMoney";
import { FirebaseProvider, store } from "common";
import { FirebaseConfig } from './config/FirebaseConfig';
import { GoogleMapApiConfig } from './config/GoogleMapApiConfig';
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { AppCat } from './config/AppCat';
import CreateAdmin from './views/CreateAdmin';

i18n
.use(initReactI18next) 
.init({
    resources: {},
    fallbackLng: "en",
    ns: ["translations"],
    defaultNS: "translations",
    interpolation: {
        escapeValue: false
    }
});

function loadScript(src, position, id) {
  if (!position) {
    return;
  }

  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', id);
  script.src = src;
  position.appendChild(script);
}

var hist = createBrowserHistory();

function App() {
  const loaded = useRef(false);
  if (typeof window !== 'undefined' && !loaded.current && !window.google) {
    if (!document.querySelector('#google-maps')) {
      loadScript(
        'https://maps.googleapis.com/maps/api/js?key=' + GoogleMapApiConfig + '&libraries=geometry,drawing,places',
        document.querySelector('head'),
        'google-maps',
      );
    }
    loaded.current = true;
  }

  return (
    <Provider store={store}>
      <FirebaseProvider config={FirebaseConfig} appcat={AppCat}>
        <AuthLoading>
          <Router history={hist}>
            <Switch>
              <ProtectedRoute exact component={BookingHistory} path="/bookings" permit={"rider,admin,driver,fleetadmin"} />
              <ProtectedRoute exact component={MyProfile} path="/profile" permit={"rider,admin,driver,fleetadmin"} />
              <ProtectedRoute exact component={Dashboard} path="/dashboard" permit={"admin,fleetadmin"} />
              <ProtectedRoute exact component={CarTypes} path="/cartypes" permit={"admin"} />
              <ProtectedRoute exact component={CancellationReasons} path="/cancelreasons" permit={"admin"} />
              <ProtectedRoute exact component={AddBookings} path="/addbookings" permit={"admin"} />
              <ProtectedRoute exact component={Promos} path="/promos" permit={"admin"} />
              <ProtectedRoute exact component={Riders} path="/riders" permit={"admin"} />
              <ProtectedRoute exact component={Drivers} path="/drivers" permit={"admin,fleetadmin"} />
              <ProtectedRoute exact component={CreateAdmin} path="/alladmin" permit={"admin"} />
              <ProtectedRoute exact component={FleetAdmins} path="/fleetadmins" permit={"admin"} />
              <ProtectedRoute exact component={DriverEarning} path="/driverearning" permit={"admin,fleetadmin"} />
              <ProtectedRoute exact component={Notifications} path="/notifications" permit={"admin"} />
              <ProtectedRoute exact component={Earningreports} path="/earningreports" permit={"admin"} />
              <ProtectedRoute exact component={AddMoney} path="/addtowallet" permit={"admin"} />
              <ProtectedRoute exact component={Withdraws} path="/withdraws" permit={"admin"} />
              <ProtectedRoute exact component={Settings} path="/settings" permit={"admin"} />
              <ProtectedRoute exact component={AppInformation} path="/appinfo" permit={"admin"} />
              <ProtectedRoute exact component={LanguageSetting} path="/languagesetting" permit={"admin"} />                      
              <Route path="/about-us" component={AboutUs} />
              <Route path="/privacy-policy" component={PrivacyPolicy} />
              <Route path="/login" component={LoginPage} />
              <Route path="/" component={LandingPage} />
            </Switch>
          </Router>
        </AuthLoading>
      </FirebaseProvider>
    </Provider>
  );
}

export default App;