import React, { useState, useEffect, useContext, useRef } from 'react';
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";
import langlocales from '../lists/langlocales';
import datelocales from '../lists/datelocales';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import BookIcon from '@material-ui/icons/Book';
import {
  Typography,
  Modal,
  Button,
  Grid,
  TextareaAutosize
} from '@material-ui/core';
import CircularLoading from 'components/CircularLoading';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: 850,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    overflow:'initial'
  },
}));

export default function LanguageSetting(props) {
  const { api } = useContext(FirebaseContext);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editLanguage
  } = api;
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [rowIndex, setRowIndex] = useState();
  const classes = useStyles();
  const [data, setData] = useState();
  const languagedata = useSelector(state => state.languagedata);
  const dispatch = useDispatch();
  const settings = useSelector(state => state.settingsdata.settings);
  const [txtAreaVal, setTxtAreaVal] = useState();

  const columns = [
    { title: t('langName'), field: 'langName', cellStyle: { textAlign:'center'},headerStyle:{textAlign:'center'}},
    {
      title: t('langLocale'),
      field: 'langLocale',
      lookup: langlocales,
      cellStyle: { textAlign:'center'},headerStyle:{textAlign:'center',}
    },
    {
      title: t('dateLocale'),
      field: 'dateLocale',
      lookup: datelocales,
      cellStyle: { textAlign:'center'},headerStyle:{textAlign:'center'}
    }
  ];

  useEffect(() => {
    if (languagedata.langlist) {
      setData(languagedata.langlist);
    } else {
      setData([]);
    }
  }, [languagedata.langlist]);


  const handleClose = () => {
    setTxtAreaVal(null);
    setRowIndex(-1);
    setOpen(false);
  }

  const saveJson = () => {
    let newData = data[rowIndex];
    try {
      if (settings.AllowCriticalEditsAdmin) {
        newData['keyValuePairs'] = JSON.parse(txtAreaVal);
        dispatch(editLanguage(newData, "Update"));
        handleClose();
      } else {
        alert(t('demo_mode'));
      }
    } catch (error) {
      alert("JSON Error"); 
    }
  }

  return (
    languagedata.loading ?
      <CircularLoading /> :
      <div>
        <MaterialTable
          title={t('language')}
          style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr' }}
          columns={columns}
          data={data}
          options={{
            rowStyle: {
              alignItems: 'center'
            }
          }}
          localization={{body:{
            addTooltip: (t('add')),
            deleteTooltip: (t('delete')),
            editTooltip: (t('edit')),
            emptyDataSourceMessage: (
              (t('blank_message'))
          ),
          editRow: { 
            deleteText: (t('delete_message')),
            cancelTooltip: (t('cancel')),
            saveTooltip: (t('save')) 
             },
            },
            toolbar: {
              searchPlaceholder: (t('search')),
              exportTitle: (t('export')),
            },
            header: {
              actions: (t('actions')) 
          },
          pagination: {
            labelDisplayedRows: ('{from}-{to} '+ (t('of'))+ ' {count}'),
            labelRowsSelect: (t('rows')),
            firstTooltip: (t('first_page_tooltip')),
            previousTooltip: (t('previous_page_tooltip')),
            nextTooltip: (t('next_page_tooltip')),
            lastTooltip: (t('last_page_tooltip'))
          },
          }}
          actions={[
            rowData => ({
              icon: () => <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <BookIcon />
                <Typography variant="subtitle2">{t('make_default')}</Typography>
              </div>,
              disabled: rowData.default,
              onClick: (event, rowData) => {
                if (settings.AllowCriticalEditsAdmin) {
                  let curVal = rowData["default"];
                  for (const value of Object.values(data)) {
                    if (rowData.id === value.id) {
                      value["default"] = !curVal;
                    } else {
                      value["default"] = curVal;
                    }
                    dispatch(editLanguage(value, "Update"));
                  }
                } else {
                  alert(t('demo_mode'));
                }
              }
            }),
            rowData => ({
              icon: () => <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <BookIcon />
                <Typography variant="subtitle2">{t('edit_json')}</Typography>
              </div>,
              onClick: (event, rowData) => {
                setOpen(true)
                setRowIndex(rowData.tableData.id);
                setTxtAreaVal(JSON.stringify(data[rowData.tableData.id].keyValuePairs, null, 2))
              }
            })
          ]}
          editable={{
            onRowAdd: newData =>
              settings.AllowCriticalEditsAdmin ?
                new Promise(resolve => {
                  setTimeout(() => {
                    let kvSet = {};
                    for (const value of Object.values(data)) {
                      if (value.default) {
                        kvSet = value.keyValuePairs;
                      }
                    }
                    newData['createdAt'] = new Date().toISOString();
                    newData['default'] = false;
                    newData['keyValuePairs'] = kvSet;
                    dispatch(editLanguage(newData, "Add"));
                    resolve();
                  }, 600);
                })
                :
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    alert(t('demo_mode'));
                  }, 600);
                }),
            onRowUpdate: (newData, oldData) =>
              settings.AllowCriticalEditsAdmin ?
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    dispatch(editLanguage(newData, "Update"));
                  }, 600);
                })
                :
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    alert(t('demo_mode'));
                  }, 600);
                }),
            onRowDelete: oldData =>
              settings.AllowCriticalEditsAdmin ?
                oldData.default ?
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      alert("Cannot delete default language");
                    }, 600);
                  })
                  :
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      dispatch(editLanguage(oldData, "Delete"));
                    }, 600);
                  })
                :
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    alert(t('demo_mode'));
                  }, 600);
                })
          }}
        />
        {rowIndex >= 0 ?
          <Modal
            disablePortal
            disableEnforceFocus
            disableAutoFocus
            onClose={handleClose}
            open={open}
            className={classes.modal}
            container={() => rootRef.current}
          >
            <div className={classes.paper}>
              <Grid container spacing={2} >
                <Grid item xs={12}>
                  <Typography component="h1" variant="h5" className={classes.title} style={{ textAlign: isRTL === 'rtl' ? 'right' : 'left' }}>
                    {t('add_language')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextareaAutosize
                    id="langJsonArea"
                    aria-label="empty textarea"
                    placeholder="Empty"
                    style={{ width: 800,  height:500,alignItems: 'center',overflow:'scroll'}}
                    defaultValue={txtAreaVal}
                    onChange={(event) => {
                      setTxtAreaVal(event.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} style={{ direction: isRTL === 'rtl' ? 'rtl' : 'ltr', marginLeft: isRTL === 'rtl' ? '65%' : 0 ,overflow:'initial'}}>
                  <Button onClick={handleClose} variant="contained" color="primary">
                    {t('cancel')}
                  </Button>
                  <Button onClick={saveJson} variant="contained" color="primary" style={isRTL === 'rtl' ? { marginRight: 10 } : { marginLeft: 10 }}>
                    {t('submit')}
                  </Button>
                </Grid>
              </Grid>
            </div>
          </Modal>
          : null}
      </div>
  );
}
