import React, { useEffect, useContext } from "react";
import CircularLoading from "../components/CircularLoading";
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from "common";
import i18n from "i18next";
import { useTranslation } from "react-i18next";
import moment from "moment/min/moment-with-locales";
import { makeStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import CountrySelect from "../components/CountrySelect";
import PhoneIcon from "@material-ui/icons/Phone";
import styles from "assets/jss/material-kit-react/views/loginPage.js";

const useStyles = makeStyles(styles);

function AuthLoading(props) {
  const { api } = useContext(FirebaseContext);
  const { t } = useTranslation();
  const {
    fetchUser,
    fetchCarTypes,
    fetchSettings,
    fetchBookings,
    fetchCancelReasons,
    fetchPromos,
    fetchDriverEarnings,
    fetchUsers,
    fetchNotifications,
    fetchEarningsReport,
    signOut,
    fetchWithdraws,
    fetchPaymentMethods,
    fetchLanguages,
    countries,
  } = api;
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const languagedata = useSelector((state) => state.languagedata);
  const settingsdata = useSelector((state) => state.settingsdata);

  const [data, setData] = React.useState({
    country: null,
    mobile: "",
    selectedCountry: null,
  });

  const classes = useStyles();

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch, fetchSettings]);

  useEffect(() => {
    if (languagedata.langlist) {
      for (const value of Object.values(languagedata.langlist)) {
        if (value.default === true) {
          i18n.addResourceBundle(
            value.langLocale,
            "translations",
            value.keyValuePairs
          );
          i18n.changeLanguage(value.langLocale);
          moment.locale(value.dateLocale);
        }
      }
      dispatch(fetchUser());
    }
  }, [languagedata, dispatch, fetchUser]);

  useEffect(() => {
    if (settingsdata.settings) {
      dispatch(fetchLanguages());
      dispatch(fetchCarTypes());
      document.title = settingsdata.settings.appName;
    }
  }, [settingsdata.settings, dispatch, fetchLanguages, fetchCarTypes]);

  useEffect(() => {
    if (settingsdata.error) {
      document.title = "Setup";
    }
  }, [settingsdata.error, dispatch]);

  useEffect(() => {
    if (auth.info) {
      if (auth.info.profile) {
        let role = auth.info.profile.usertype;
        if (role === "rider") {
          dispatch(fetchBookings(auth.info.uid, role));
          dispatch(fetchPaymentMethods());
          dispatch(fetchCancelReasons());
          dispatch(fetchUsers());
        } else if (role === "driver") {
          dispatch(fetchBookings(auth.info.uid, role));
        } else if (role === "admin") {
          dispatch(fetchUsers());
          dispatch(fetchBookings(auth.info.uid, role));
          dispatch(fetchPromos());
          dispatch(fetchDriverEarnings(auth.info.uid, role));
          dispatch(fetchNotifications());
          dispatch(fetchEarningsReport());
          dispatch(fetchCancelReasons());
          dispatch(fetchWithdraws());
          dispatch(fetchPaymentMethods());
        } else if (role === "fleetadmin") {
          dispatch(fetchUsers());
          dispatch(fetchBookings(auth.info.uid, role));
          dispatch(fetchDriverEarnings(auth.info.uid, role));
        } else {
          alert(t("not_valid_user_type"));
          dispatch(signOut());
        }
      } else {
        alert(t("user_issue_contact_admin"));
        dispatch(signOut());
      }
    }
  }, [
    auth.info,
    dispatch,
    fetchBookings,
    fetchCancelReasons,
    fetchDriverEarnings,
    fetchEarningsReport,
    fetchNotifications,
    fetchPromos,
    fetchUsers,
    fetchWithdraws,
    signOut,
    fetchPaymentMethods,
    t,
  ]);

  const onInputChange = (event) => {
    setData({ ...data, [event.target.id]: event.target.value });
  };

  const onCountryChange = (object, value) => {
    if (value && value.phone) {
      setData({ ...data, country: value.phone, selectedCountry: value });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const uri = "+" + data.country + data.mobile;
    let encoded = "setup?mobile=" + encodeURIComponent(uri);
    window.open(encoded, "_self");
  };

  return settingsdata.loading ? (
    <CircularLoading />
  ) : settingsdata.settings ? (
    auth.loading || !languagedata.langlist ? (
      <CircularLoading />
    ) : (
      props.children
    )
  ) : (
    <div>
      <div className={classes.container}>
        <GridContainer justify="center">
          <GridItem xs={12} sm={12} md={4}>
            <Card>
              <CardHeader color="info" className={classes.cardHeader}>
                <h4>{"Admin and Database Setup"}</h4>
              </CardHeader>
              <CardBody>
                <CountrySelect
                  countries={countries}
                  label={"Select Country"}
                  value={data.selectedCountry}
                  onChange={onCountryChange}
                  style={{ paddingTop: 20 }}
                  disabled={data.verificationId ? true : false}
                />
                <CustomInput
                  labelText={"Mobile No"}
                  id="mobile"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    required: true,
                    endAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon className={classes.inputIconsColor} />
                      </InputAdornment>
                    ),
                  }}
                  onChange={onInputChange}
                  value={data.mobile}
                />
              </CardBody>
              <CardFooter className={classes.cardFooter}>
                <Button
                  className={classes.normalButton}
                  simple
                  color="primary"
                  size="lg"
                  onClick={onSubmit}
                >
                  {t("submit")}
                </Button>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    </div>
  );
}

export default AuthLoading;
