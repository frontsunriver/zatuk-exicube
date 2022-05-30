/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from "react-i18next";

// ISO 3166-1 alpha-2
// ⚠️ No support for IE 11
// function countryToFlag(isoCode) {
//   return typeof String.fromCodePoint !== 'undefined'
//     ? isoCode
//         .toUpperCase()
//         .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
//     : isoCode;
// }

const useStyles = makeStyles({
    option1: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        }
        },
        option2: {
        fontSize: 15,
        '& > span': {
            marginRight: 10,
            fontSize: 18,
        },
        direction:'rtl'
    },
    rootRtl_1:{
        "& label": {
        right: 20,
        left: 'auto'
        },
        "& legend": {
        textAlign: "right",
        marginRight: 20
        }
    },
    rootRtl_2:{
        "& label": {
        right: 35,
        left: 'auto'
        },
        "& legend": {
        textAlign: "right",
        marginRight: 20
        }
    },
});

export default function CountryListSelect(props) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir();
  const classes = useStyles();

  const onlyCode = props.onlyCode;

  return (
    <Autocomplete
      id="country-select-demo"
      style={{ width: '100%',...props.style }}
      options={props.countries}
      classes={isRTL === 'rtl'?{option: classes.option2}:{option: classes.option1}}
      autoHighlight
      getOptionLabel={(option) => option.label}
      getOptionSelected={(option) => option.label}
      renderOption={(option) => (
        <React.Fragment>
          {option.label}
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
          className={isRTL ==="rtl"? (onlyCode? classes.rootRtl_1:classes.rootRtl_2):null}
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