import React, { useState, useEffect, useContext } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from "react-redux";
import AlertDialog from '../components/AlertDialog';
import CircularLoading from "../components/CircularLoading";
import Grid from '@material-ui/core/Grid';
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";
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
  rootRtl:{
    "& label": {
      right:10,
      left:"auto",
      paddingRight:20
    },
    "& legend": {
      textAlign: "right",
      marginRight:20
    }
  },
  rootRtl_1:{
    "& label": { 
      right:10,
      left:"auto",
      paddingRight:12
    },
    "& legend": {
      textAlign: "right",
      marginRight:25
    }
  },
  right:{
    "& legend": {
      marginRight:30
    },
  },
  rightStorelink:{
    "& legend": {
      marginRight:25
    },
  },
}));

const AppInformation = (props) => {
  const { api } = useContext(FirebaseContext);
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editSettings,
    clearSettingsViewError
  } = api;
  const settingsdata = useSelector(state => state.settingsdata);
  const dispatch = useDispatch();
  const classes = useStyles();
  const [data, setData] = useState();
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (settingsdata.settings) {
      setData(settingsdata.settings);
    }
  }, [settingsdata.settings]);

  const handleTextChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
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
      
      <Grid container spacing={2}    style={{direction:isRTL ==='rtl'?'rtl':'ltr'}} >
          <Grid item xs={12} sm={12} md={6} lg={6}>
            <Typography component="h1" variant="h5" style={{textAlign:isRTL=== 'rtl'? 'right':'left'}}>
              {t('app_info')}
            </Typography>
            <TextField
            className={isRTL ==="rtl"? classes.rootRtl:null}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="appName"
              label={ t('AppName')}
              name="appName"
              autoComplete="appName"
              onChange={handleTextChange}
              value={data.appName}
            />
            <TextField
              className={isRTL ==="rtl"? classes.rootRtl:null}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="CompanyName"
              label={t('CompanyName')}
              name="CompanyName"
              autoComplete="CompanyName"
              onChange={handleTextChange}
              value={data.CompanyName}
            />
            <TextField
              className={isRTL ==="rtl"? classes.rootRtl:null}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="CompanyWebsite"
              label={t('CompanyWebsite')}
              name="CompanyWebsite"
              autoComplete="CompanyWebsite"
              onChange={handleTextChange}
              value={data.CompanyWebsite}
            />
            <TextField
              className={isRTL ==="rtl"? classes.rootRtl:null}
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="CompanyTerms"
              label={t('terms')}
              name="CompanyTerms"
              autoComplete="CompanyTerms"
              onChange={handleTextChange}
              value={data.CompanyTerms}
            />
            <TextField
              className={isRTL ==="rtl"? classes.rootRtl_1:null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="contact_email"
              label={t('contact_email')}
              name="contact_email"
              autoComplete="contact_email"
              onChange={handleTextChange}
              value={data.contact_email}
            />
           
   </Grid>
    <Grid item xs={12} sm={12} md={6} lg={6}>
            <Typography component="h1" variant="h5" style={{ textAlign:isRTL=== 'rtl'? 'right':'left'}}>
              {t('app_link')}
            </Typography>
            <TextField
              className={isRTL ==="rtl"? classes.rootRtl_1:null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="FacebookHandle"
              label={t('FacebookHandle')}
              name="FacebookHandle"
              autoComplete="FacebookHandle"
              onChange={handleTextChange}
              value={data.FacebookHandle}
            />
            <TextField
              className={isRTL ==="rtl"? classes.rootRtl_1:null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="TwitterHandle"
              label={t('TwitterHandle')}
              name="TwitterHandle"
              autoComplete="TwitterHandle"
              onChange={handleTextChange}
              value={data.TwitterHandle}
            />
            <TextField
              className={isRTL ==="rtl"? classes.rootRtl_1:null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="InstagramHandle"
              label={t('InstagramHandle')}
              name="InstagramHandle"
              autoComplete="InstagramHandle"
              onChange={handleTextChange}
              value={data.InstagramHandle}
            />
            <TextField
              className={isRTL ==="rtl"? [classes.rootRtl,classes.rightStorelink]:null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="AppleStoreLink"
              label={t('AppleStoreLink')}
              name="AppleStoreLink"
              autoComplete="AppleStoreLink"
              onChange={handleTextChange}
              value={data.AppleStoreLink}
            />
            <TextField
              className={isRTL ==="rtl"? [classes.rootRtl,classes.rightStorelink]:null}
              variant="outlined"
              margin="normal"
              fullWidth
              id="PlayStoreLink"
              label={t('PlayStoreLink')}
              name="PlayStoreLink"
              autoComplete="PlayStoreLink"
              onChange={handleTextChange}
              value={data.PlayStoreLink}
            />
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

export default AppInformation;