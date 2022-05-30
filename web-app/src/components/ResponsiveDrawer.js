import React from 'react';
import PropTypes from 'prop-types';
import {
  AppBar,
  CssBaseline,
  Drawer,
  Hidden,
  IconButton,
  Toolbar,
  Typography
}from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import AppMenu from "../views/AppMenu";
import {colors} from '../components/Theme/WebTheme';
import { useSelector } from "react-redux";

import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  menuButtonRight: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  menuButtonLeft: {
    marginLeft: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width:drawerWidth,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  }
}));

function ResponsiveDrawer(props) {
  const { container } = props;
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const settings = useSelector(state => state.settingsdata.settings);

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  const drawerWidth = 240;

  const { i18n  } = useTranslation();
  const isRTL = i18n.dir();

  return (
    <div className={classes.root} style={{direction:isRTL === 'rtl'? 'rtl':'ltr'}}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar} style={isRTL=== 'rtl'? {marginRight:drawerWidth}:{marginLeft:drawerWidth}}>
        <Toolbar style={{backgroundColor: colors.ResponsiveDrawer_Header,}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={isRTL==='rtl'? classes.menuButtonLeft:classes.menuButtonRight}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {settings && settings.appName? settings.appName: '' }
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={isRTL === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            <AppMenu/>
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            anchor={isRTL === 'rtl' ? 'right' : 'left'}
            open
          >
            <AppMenu/>
          </Drawer>
        </Hidden>
      </nav>
      <main className={classes.content} style={{overflow:'auto', overflowX:'hidden'}}>
        <div className={classes.toolbar}/>
        {props.children}
      </main>
    </div>
  );
}

ResponsiveDrawer.propTypes = {
  container: PropTypes.instanceOf(typeof Element === 'undefined' ? Object : Element),
};

export default ResponsiveDrawer;
