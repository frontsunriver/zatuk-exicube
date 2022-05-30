/* eslint-disable no-use-before-define */
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from "react-i18next";

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
  inputRtl: {
    "& label": {
      right: 75,
      left: "auto"
    },
    "& legend": {
      textAlign: "right",
      marginRight:65
    }
  },
});

export default function UsersCombo(props) {
  const { i18n  } = useTranslation();
  const isRTL = i18n.dir();
  const classes = useStyles();
  return (
    <Autocomplete
      value={props.value}
      id="user-select"
      style={props.style}
      options={props.users}
      classes={isRTL === 'rtl'?{option: classes.option2}:{option: classes.option1}}
      onChange={props.onChange}
      autoHighlight
      getOptionLabel={(option) => option.desc}
      getOptionSelected={(option) => option.desc}
      renderOption={(option) => (
        <React.Fragment>
          {option.desc}
        </React.Fragment>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.placeholder}
          variant="outlined"
          className={isRTL==='rtl'? classes.inputRtl:classes.commonInputStyle}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'off' // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
}