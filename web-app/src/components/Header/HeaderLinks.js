/*eslint-disable*/
import React, {useState, useEffect} from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Tooltip from "@material-ui/core/Tooltip";
import { Info, AccountBox, House } from "@material-ui/icons";
import Button from "components/CustomButtons/Button.js";
import styles from "assets/jss/material-kit-react/components/headerLinksStyle.js";
import { useSelector } from "react-redux";
import { useHistory } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { Select, MenuItem  } from '@material-ui/core';
import moment from 'moment/min/moment-with-locales';

const useStyles = makeStyles(styles);

export default function HeaderLinks(props) {
  const classes = useStyles();
  const auth = useSelector(state => state.auth);
  const settings = useSelector(state => state.settingsdata.settings);
  const languagedata = useSelector(state => state.languagedata);
  const { i18n,t } = useTranslation();
  const [loggedIn, setLoggedIn] = useState(false);
  let history = useHistory();

  const [langSelection, setLangSelection] = useState();
  const [multiLanguage,setMultiLanguage] = useState();

  const handleLanguageSelect = (event) => {
    i18n.addResourceBundle(multiLanguage[event.target.value].langLocale, 'translations', multiLanguage[event.target.value].keyValuePairs);
    i18n.changeLanguage(multiLanguage[event.target.value].langLocale);
    setLangSelection(event.target.value);
    moment.locale(multiLanguage[event.target.value].dateLocale);
  };

  useEffect(()=>{
    if(languagedata.langlist){
      for (const key of Object.keys(languagedata.langlist)) {
        if(languagedata.langlist[key].langLocale === i18n.language){
          setLangSelection(key);
        }
      }
      setMultiLanguage(languagedata.langlist);
    }
    
  },[languagedata.langlist]);

  

  useEffect(()=>{
    if(auth.info && auth.info.profile){
      setLoggedIn(true);
    }else{
      setLoggedIn(false);
    }
  },[auth.info]);
  
  return (
    <List className={classes.list}>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          className={classes.navLink}
          onClick={(e) => { e.preventDefault(); history.push('/') }}
        >
          <House className={classes.icons} />{t('home')}
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          className={classes.navLink}
          onClick={(e) => { e.preventDefault(); history.push('/bookings') }}
        >
          {loggedIn?
            <AccountBox className={classes.icons} /> 
            : 
            <AccountBox className={classes.icons} />  
          }         
         
          {loggedIn?
            t('myaccount')
            : 
           t('login_signup')
          }
        </Button>
      </ListItem>
      <ListItem className={classes.listItem}>
        <Button
          color="transparent"
          className={classes.navLink}
          onClick={(e) => { e.preventDefault(); history.push('/about-us') }}
        >
          <Info className={classes.icons} />{t('about_us')}
        </Button>
      </ListItem>
      {settings && settings.FacebookHandle?
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-facebook"
          title={t('follow_facebook')}
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            color="transparent"
            href={settings.FacebookHandle}
            target="_blank"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-facebook"} />
          </Button>
        </Tooltip>
      </ListItem>
      :null}
      {settings && settings.TwitterHandle?
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-twitter"
          title={t('follow_twitter')}
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            href={settings.TwitterHandle}
            target="_blank"
            color="transparent"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-twitter"} />
          </Button>
        </Tooltip>
      </ListItem>
      :null}
      {settings && settings.InstagramHandle?
      <ListItem className={classes.listItem}>
        <Tooltip
          id="instagram-twitter"
          title={t('follow_instagram')}
          placement={window.innerWidth > 959 ? "top" : "left"}
          classes={{ tooltip: classes.tooltip }}
        >
          <Button
            href={settings.InstagramHandle}
            target="_blank"
            color="transparent"
            className={classes.navLink}
          >
            <i className={classes.socialIcons + " fab fa-instagram"} />
          </Button>
        </Tooltip>
      </ListItem>
      :null}
      <ListItem className={classes.listItem}>
        {multiLanguage?
        <Select
          id="booking-type-native1"
          className={classes.input}
          value={langSelection}
          onChange={handleLanguageSelect}
          style={{backgroundColor:'#fff', marginTop:'8px',paddingLeft:'5px',borderRadius:'5px'}}
        >
          {
            Object.keys(multiLanguage).map((key)=> <MenuItem key={key} value={key}>
            {multiLanguage[key].langName}
            </MenuItem>)
          }
        </Select>
        :null}
      </ListItem>
    </List>
  );
}
