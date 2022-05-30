import React, { useState, useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from "react-redux";
import AlertDialog from '../components/AlertDialog';
import CircularLoading from "../components/CircularLoading";
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Grid from '@material-ui/core/Grid';
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";
import CountryListSelect from '../components/CountryListSelect';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  container: {
    zIndex: "12",
    color: "#FFFFFF",
    alignContent: 'center'
  },
  gridcontainer: {
    alignContent: 'center'
  },
  items: {
    margin: 0,
    width: '100%'
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
    width: 192,
    height: 192
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  rootRtl: {
    "& label": {
      right: 10,
      left: "auto",
      paddingRight: 20
    },
    "& legend": {
      textAlign: "right",
      marginRight: 20
    }
  },
  rootRtl_1: {
    "& label": {
      right: 15,
      left: "auto",
      paddingRight: 25
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25
    }
  },
  rootRtl_2: {
    "& label": {
      right: 10,
      left: "auto",
      paddingRight: 12
    },
    "& legend": {
      textAlign: "right",
      marginRight: 25
    }
  },
  right: {
    "& legend": {
      marginRight: 30
    },
  },
  rightStorelink: {
    "& legend": {
      marginRight: 25
    },
  }
}));

const Settings = (props) => {
  const { api, appcat } = useContext(FirebaseContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editSettings,
    clearSettingsViewError,
    countries
  } = api;
  const settingsdata = useSelector(state => state.settingsdata);
  const dispatch = useDispatch();
  const classes = useStyles();
  const [data, setData] = useState();
  const [clicked, setClicked] = useState(false);
  const [countryCode, setCountryCode] = useState();
  const [country, setCountry] = useState(false);

  useEffect(() => {
    if(data){
      for (let i = 0; i < countries.length; i++) {
          if(countries[i].label === data.country){
              setCountryCode(countries[i]);
          }
          if(countries[i].code === data.restrictCountry){
            setCountry(countries[i]);
        }
      }
    }
  }, [data,countries]);

  
  useEffect(() => {
    if (settingsdata.settings) {
      setData(settingsdata.settings);
    }
  }, [settingsdata.settings]);

  const handleSwitchChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.checked });
  };

  const handleTextChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (value) => {
    setData({ ...data, country: value.label });
  };

  const handleCountryCode = (value) => {
    setData({ ...data, restrictCountry: value.code });
  };

  const handleBonusChange = (e) => {
    setData({ ...data, bonus: parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : '' });
  };

  const handleDecimalChange = (e) => {
    setData({ ...data, decimal: parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : '' });
  };

  const handleDriverRadius = (e) => {
    setData({ ...data, driverRadius: parseFloat(e.target.value) >= 0 ? parseFloat(e.target.value) : '' });
  };

  const handleWalletMoney = (e) => {
    setData({ ...data, [e.target.name]: e.target.value  });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.AllowCriticalEditsAdmin) {
      if (data.bonus === '') {
        alert(t('proper_bonus'))
      } else {
        setClicked(true);
        dispatch(editSettings(data));
      }
    } else {
      alert(t('demo_mode'));
    }
  }

  const handleClose = () => {
    setClicked(false);
    dispatch(clearSettingsViewError());
  };


  return (
    data ?
      <form className={classes.form} onSubmit={handleSubmit}>
        <Grid container spacing={2} style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }} >
          <Grid item xs={12} sm={12} md={6} lg={6} >
            <Typography component="h1" variant="h5" style={{ textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
              {t('currency_settings')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} md={4} lg={4} >
                <TextField
                  className={isRTL === "rtl" ? classes.rootRtl : null}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="symbol"
                  label={t('currency_symbol')}
                  name="symbol"
                  autoComplete="symbol"
                  onChange={handleTextChange}
                  value={data.symbol}
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={4} md={4} lg={4}>
                <TextField
                  className={isRTL === "rtl" ? classes.rootRtl : null}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="code"
                  label={t('currency_code')}
                  name="code"
                  autoComplete="code"
                  onChange={handleTextChange}
                  value={data.code}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={4} lg={4}>
                <TextField
                  className={isRTL === "rtl" ? classes.rootRtl : null}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="decimal"
                  label={t('set_decimal')}
                  name="decimal"
                  autoComplete="decimal"
                  onChange={handleDecimalChange}
                  value={data.decimal}
                />
              </Grid>
              <FormControlLabel
                style={{ marginBottom: '10px', flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
                control={
                  <Switch
                    checked={data.swipe_symbol}
                    onChange={handleSwitchChange}
                    name="swipe_symbol"
                    color="primary"
                  />
                }
                label={t('swipe_symbol')}
              />
            </Grid>
            <Typography component="h1" variant="h5" style={{ marginTop: '15px', textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
              {t('security_title')}
            </Typography>
            <FormControlLabel
              style={{ flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row', }}
              control={
                <Switch
                  checked={data.otp_secure}
                  onChange={handleSwitchChange}
                  name="otp_secure"
                  color="primary"
                />
              }
              label={t('settings_label3')}
            />
            <FormControlLabel
              style={{ flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.driver_approval}
                  onChange={handleSwitchChange}
                  name="driver_approval"
                  color="primary"
                />
              }
              label={t('settings_label4')}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <Typography component="h1" variant="h5" style={{ marginTop: '13px', textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
                  {t('referral_bonus')}
                </Typography>
                <TextField
                  className={isRTL === "rtl" ? classes.rootRtl : null}
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  id="bonus"
                  label={t('referral_bonus')}
                  name="bonus"
                  autoComplete="bonus"
                  onChange={handleBonusChange}
                  value={data.bonus}
                />
              </Grid>
            </Grid>
            <Typography component="h1" variant="h5" style={{ marginTop: '10px', textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
              {t('wallet_money_field')}
            </Typography>
            <TextField
              className={isRTL === "rtl" ? classes.rootRtl : null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="walletMoneyField"
              label={t('wallet_money_field')}
              name="walletMoneyField"
              autoComplete="walletMoneyField"
              onChange={handleWalletMoney}
              value={data.walletMoneyField}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <Typography component="h1" variant="h5" style={{ textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
              {t('advance_settings')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6} lg={6} >
                <CountryListSelect
                  label={t('select_country')}
                  dis ={true}
                  countries={countries}
                  onlyCode={false}
                  value={countryCode? countryCode:null}
                  onChange={
                    (object, value) => {
                      handleCountryChange(value);
                    }
                  }
                  style={{marginTop: 16}}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6} lg={6} >
                <CountryListSelect
                  label={t('country_restriction')}
                  dis ={true}
                  countries={countries}
                  onlyCode={true}
                  value={country? country:null}
                  onChange={
                    (object, value) => {
                      handleCountryCode(value);
                    }
                  }
                  style={{marginTop: 16}}
                />
              </Grid>
            </Grid>
            <FormControlLabel
              style={{ marginTop: '10px',flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.AllowCountrySelection}
                  onChange={handleSwitchChange}
                  name="AllowCountrySelection"
                  color="primary"
                />
              }
              label={t('allow_multi_country')}
            />
            <FormControlLabel
              style={{ marginTop: '10px', flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.convert_to_mile}
                  onChange={handleSwitchChange}
                  name="convert_to_mile"
                  color="primary"
                />
              }
              label={t('convert_to_mile')}
            />
            <FormControlLabel
              style={{ marginTop: '10px', flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.CarHornRepeat}
                  onChange={handleSwitchChange}
                  name="CarHornRepeat"
                  color="primary"
                />
              }
              label={t('car_horn_repeat')}
            />

            {appcat === 'delivery' ?
            <FormControlLabel
              style={{ marginTop: '10px', flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.AllowDeliveryPickupImageCapture}
                  onChange={handleSwitchChange}
                  name="AllowDeliveryPickupImageCapture"
                  color="primary"
                />
              }
              label={t('allow_del_pkp_img')}
            />
            :null}
            {appcat === 'delivery' ?
            <FormControlLabel
              style={{ marginTop: '10px', flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.AllowFinalDeliveryImageCapture}
                  onChange={handleSwitchChange}
                  name="AllowFinalDeliveryImageCapture"
                  color="primary"
                />
              }
              label={t('allow_del_final_img')}
            />
            :null}
            <FormControlLabel
              style={{ marginTop: '10px', flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.RiderWithDraw}
                  onChange={handleSwitchChange}
                  name="RiderWithDraw"
                  color="primary"
                />
              }
              label={t('rider_withdraw')}
            />
            <FormControlLabel
              style={{ marginTop: '10px',flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.horizontal_view}
                  onChange={handleSwitchChange}
                  name="horizontal_view"
                  color="primary"
                />
              }
              label={t('car_view_horizontal')}
            />
            <FormControlLabel
              style={{ marginTop: '10px', flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.showLiveRoute}
                  onChange={handleSwitchChange}
                  name="showLiveRoute"
                  color="primary"
                />
              }
              label={t('show_live_route')}
            />
            <Typography component="h1" variant="h5" style={{ marginTop: '15px', textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
              {t('driver_setting')}
            </Typography>
            <TextField
              className={isRTL === "rtl" ? classes.rootRtl : null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="driverRadius"
              label={t('driverRadius')}
              name="driverRadius"
              autoComplete="driverRadius"
              onChange={handleDriverRadius}
              value={data.driverRadius}
            />
            <FormControlLabel
              style={{ flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.autoDispatch}
                  onChange={handleSwitchChange}
                  name="autoDispatch"
                  color="primary"
                />
              }
              label={t('auto_dispatch')}
            />
            <FormControlLabel
              style={{ flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.negativeBalance}
                  onChange={handleSwitchChange}
                  name="negativeBalance"
                  color="primary"
                />
              }
              label={t('negative_balance')}
            />
            <FormControlLabel
              style={{ flexDirection: isRTL === 'rtl' ? 'row-reverse' : 'row' }}
              control={
                <Switch
                  checked={data.bank_fields}
                  onChange={handleSwitchChange}
                  name="bank_fields"
                  color="primary"
                />
              }
              label={t('bank_fields')}
            />
            {appcat === 'taxi' ?
              <Typography component="h1" variant="h5" style={{ marginTop: '15px', textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
                {t('panic_num')}
              </Typography>
              : null}
            {appcat === 'taxi' ?
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                id="panic"
                label={t('panic_num')}
                className={isRTL === "rtl" ? [classes.rootRtl_1, classes.right] : null}
                name="panic"
                autoComplete="panic"
                onChange={handleTextChange}
                value={data.panic}
              />
              : null}
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {t('submit')}
            </Button>
          </Grid>
        </Grid>
        <AlertDialog open={settingsdata.error.flag && clicked} onClose={handleClose}>{t('update_failed')}</AlertDialog>
      </form>
      :
      <CircularLoading />
  );

}

export default Settings;
