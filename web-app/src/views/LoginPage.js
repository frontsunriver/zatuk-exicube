import React, { useState, useEffect, useContext } from 'react';
import { makeStyles } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import Icon from "@material-ui/core/Icon";
import Header from "components/Header/Header.js";
import HeaderLinks from "components/Header/HeaderLinks.js";
import Footer from "components/Footer/Footer.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import Button from "components/CustomButtons/Button.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import CardFooter from "components/Card/CardFooter.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import styles from "assets/jss/material-kit-react/views/loginPage.js";
import image from "assets/img/background.jpg";
import { useSelector, useDispatch } from "react-redux";
import PhoneIcon from '@material-ui/icons/Phone';
import AlertDialog from '../components/AlertDialog';
import CountrySelect from '../components/CountrySelect';
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);

export default function LoginPage(props) {
  const { api, authRef, RecaptchaVerifier } = useContext(FirebaseContext);
  const { t } = useTranslation();
  const {
    facebookSignIn,
    clearLoginError,
    mobileSignIn,
    countries
  } = api;

  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const dispatch = useDispatch();
  const [capatchaReady, setCapatchaReady] = React.useState(false);

  const [data, setData] = React.useState({
    email: '',
    pass: '',
    country: null,
    mobile: '',
    password: '',
    otp: '',
    verificationId: null,
    firstName: '',
    lastName: '',
    selectedcountry:null,
    usertype:'rider',
    referralId:''
  });

  const [commonAlert, setCommonAlert] = useState({ open: false, msg: '' });

  const classes = useStyles();
  const { ...rest } = props;

  useEffect(() => {
    if(settings){
        for (let i = 0; i < countries.length; i++) {
            if(countries[i].label === settings.country){
                setData({
                  country: countries[i].phone,
                  selectedcountry:countries[i],
                });
            }
        }
    }
  }, [settings,countries]);

  useEffect(() => {
    if(!capatchaReady){
      window.recaptchaVerifier = new RecaptchaVerifier("sign-in-button",{
        'size': 'invisible',
        'callback': function(response) {
          setCapatchaReady(true);
        }
      });
    }
    if (auth.info) {
      if(auth.info.profile){
        let role = auth.info.profile.usertype;
        if(role==='admin' || role==='fleetadmin'){
          props.history.push('/dashboard');
        }
        else if (role==='driver'){
          props.history.push('/bookings');
        }
        else {
          props.history.push('/');
        }
      }
    }
    if (auth.error && auth.error.flag && auth.error.msg.message !== t('not_logged_in')) {
      if (auth.error.msg.message === t('require_approval')){
        setCommonAlert({ open: true, msg: t('require_approval') })
      } else{
        if(data.mobile === '' ||  !(!data.mobile) ){  
          setCommonAlert({ open: true, msg: t('login_error') })
        }
      }
    }
    if(auth.verificationId){
      setData({ ...data, verificationId: auth.verificationId });
    }
  }, [auth.info, auth.error, auth.verificationId, props.history, data, data.email, data.mobile, capatchaReady,RecaptchaVerifier,t]);


  const handleFacebook = (e) => {
    e.preventDefault();
    dispatch(facebookSignIn());
  }

  const handleCommonAlertClose = (e) => {
    e.preventDefault();
    setCommonAlert({ open: false, msg: '' });
    if (auth.error.flag) {
      setData({...data,email:'',pass:''});
      dispatch(clearLoginError());
    }
  };

  const onInputChange = (event) => {
    setData({ ...data, [event.target.id]: event.target.value })
  }

  const handleGetOTP = (e) => {
    e.preventDefault();
    const phoneNumber = "+" + data.country + data.mobile;
    const appVerifier = window.recaptchaVerifier;
    authRef
    .signInWithPhoneNumber(phoneNumber, appVerifier)
    .then(res => {
        setData({...data, verificationId: res.verificationId})
    })
    .catch(error => {
        setCommonAlert({ open: true, msg: error.code + ": " + error.message})
    });
  }

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (data.otp.length === 6 && parseInt(data.otp) > 100000 & parseInt(data.otp) < 1000000) {
      dispatch(mobileSignIn(data.verificationId, data.otp));
    } else {
      setCommonAlert({ open: true, msg: t('otp_validate_error')})
    }
  }

  const handleCancel = (e) => {
    setData({
      ...data,
      mobile: null,
      verificationId: null
    });
  }

  const onCountryChange = (object, value) => {
    if (value && value.phone) {
      setData({ ...data, country: value.phone, selectedcountry:value });
    }
  };

  return (
    <div>
      <Header
        absolute
        color="transparent"
        rightLinks={<HeaderLinks />}
        {...rest}
      />
      <div
        className={classes.pageHeader}
        style={{
          backgroundImage: "url(" + image + ")",
          backgroundSize: "cover",
          backgroundPosition: "top center"
        }}
      >
        <div id="sign-in-button" />
        <div className={classes.container}>
          <GridContainer justify="center">
            <GridItem xs={12} sm={12} md={4}>
              <Card>
                <form className={classes.form}>
                  {settings && settings.FacebookLoginEnabled?
                  <CardHeader color="info" className={classes.cardHeader}>
                    <h4>{t('signIn')}</h4>
                    <div className={classes.socialLine}>
                      {settings.FacebookLoginEnabled?
                      <Button
                        justIcon
                        href="#pablo"
                        target="_blank"
                        color="transparent"

                        onClick={handleFacebook}
                      >
                        <i className={"fab fa-facebook"} />
                      </Button>
                      :null}
                    </div>
                  </CardHeader>
                  :null}
                  <CardBody>
        
                    {settings && settings.AllowCountrySelection && data.selectedcountry?   // COUNTRY
                      <CountrySelect
                        countries={countries}
                        label={t('select_country')}
                        value={data.selectedcountry}
                        onChange={onCountryChange}
                        style={{paddingTop:20}}
                        disabled={data.verificationId ? true : false}
                      />
                      : null}
                 
                      <CustomInput
                        labelText={t('phone')}
                        id="mobile"
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          required: true,
                          disabled: data.verificationId ? true : false,
                          endAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon className={classes.inputIconsColor} />
                            </InputAdornment>
                          )
                        }}
                        onChange={onInputChange}
                        value={data.mobile}
                      />
        
                    {data.verificationId ?    // OTP
                      <CustomInput
                        labelText={t('otp')}
                        id="otp"
                        formControlProps={{
                          fullWidth: true
                        }}
                        inputProps={{
                          type: "password",
                          required: true,
                          endAdornment: (
                            <InputAdornment position="start">
                              <Icon className={classes.inputIconsColor}>
                                lock_outline
                            </Icon>
                            </InputAdornment>
                          ),
                          autoComplete: "off"
                        }}
                        onChange={onInputChange}
                        value={data.otp}
                      />
                      : null}
                  </CardBody>
                  <CardFooter className={classes.cardFooter}>

                    {!data.verificationId ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" type="submit" onClick={handleGetOTP}>
                        {t('get_otp')}
                    </Button>
                      : null}
                    { data.verificationId ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" type="submit" onClick={handleVerifyOTP}>
                        {t('verify_otp')}
                    </Button>
                      : null}

                    {data.verificationId ?
                      <Button className={classes.normalButton} simple color="primary" size="lg" onClick={handleCancel}>
                        {t('cancel')}
                    </Button>
                      : null}

                  </CardFooter>
                </form>
              </Card>
            </GridItem>
          </GridContainer>
        </div>
        <Footer whiteFont />
        <AlertDialog open={commonAlert.open} onClose={handleCommonAlertClose}>{commonAlert.msg}</AlertDialog>
      </div>
    </div>
  );
}