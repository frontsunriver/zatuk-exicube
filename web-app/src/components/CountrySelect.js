/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from "react-i18next";

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
function countryToFlag(isoCode) {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode
        .toUpperCase()
        .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    : isoCode;
}

const useStyles = makeStyles({
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
  rootRtl_1:{
    "& label": {
      right: 75,
      left: "auto"
    },
    "& legend": {
      textAlign: "right",
      marginRight:60
    }
  },
});

export default function CountrySelect(props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir();
  const classes = useStyles();

  return (
    <Autocomplete
      id="country-select-demo"
      style={{ width: '100%',...props.style }}
      options={props.countries}
      classes={{
        option: classes.option,
      }}
      autoHighlight
      getOptionLabel={(option) => option.label}
      getOptionSelected={(option) => option.label}
      renderOption={(option) => (
        <React.Fragment>
          <span>{countryToFlag(option.code)}</span>
          {option.label} ({option.code}) +{option.phone}
        </React.Fragment>
      )}
      disabled={props.disabled}
      onChange={props.onChange}
      value={props.value}
      disableClearable={props.dis}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label}
          className={isRTL ==="rtl"? classes.rootRtl_1:null}
          style={{direction:isRTL === 'rtl'?'rtl':'ltr'}}
          variant="outlined"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
          
        />
      )}
    />         
  );
}