/*eslint-disable*/
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { List, ListItem } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/material-kit-react/components/footerStyle.js";
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(styles);


export default function Footer(props) {
  const classes = useStyles();
  const settings = useSelector(state => state.settingsdata.settings);
  const { whiteFont } = props;
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  const aClasses = classNames({
    [classes.a]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  let history = useHistory();
  const { t, i18n  } = useTranslation();
  const isRTL = i18n.dir();

  return (
    <footer className={footerClasses}>
      <div className={classes.container} style={{direction:isRTL === 'rtl' ? 'rtl' : 'ltr'}}>
        <div className={isRTL === 'rtl' ? classes.right : classes.left}>
          <List className={classes.list}>
            <ListItem className={classes.inlineBlock}>
              <a
                style={{cursor:'pointer'}}
                className={classes.block}
                onClick={(e) => { e.preventDefault(); history.push('/') }}
              >
                {t('home')}
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a
                className={classes.block}
                style={{cursor:'pointer'}}
                onClick={(e) => { e.preventDefault(); history.push('/bookings') }}
              >
                {t('myaccount')}
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a
                className={classes.block}
                style={{cursor:'pointer'}}
                onClick={(e) => { e.preventDefault(); history.push('/about-us') }}
              >
                {t('about_us')}
              </a>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <a
                style={{cursor:'pointer'}}  
                className={classes.block}
                onClick={(e) => { e.preventDefault(); history.push('/privacy-policy') }}
              >
                {t('privacy_policy')}
              </a>
            </ListItem>
          </List>
        </div>
        {settings && settings.CompanyWebsite?
        <div className={isRTL === 'rtl' ? classes.left : classes.right}  style={{padding: "15px 0"  }}>
          &copy; {1900 + new Date().getYear() + " "} 
          <a
            href={settings.CompanyWebsite}
            className={aClasses}
            target="_blank"
          >
            {settings.CompanyName}
          </a>
        </div>
        :null}
      </div>
    </footer>
  );
}

Footer.propTypes = {
  whiteFont: PropTypes.bool
};
