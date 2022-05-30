import React, { useState, useEffect, useContext,useRef } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { FirebaseContext } from 'common';
import PhotoSizeSelectSmallIcon from '@material-ui/icons/PhotoSizeSelectSmall';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import FitnessCenterIcon from '@material-ui/icons/FitnessCenter';
import CancelScheduleSendIcon from '@material-ui/icons/CancelScheduleSend';
import { useTranslation } from "react-i18next";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    padding: theme.spacing(1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    width: 780,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function CarTypes() {
  const { api, appcat } = useContext(FirebaseContext);
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector(state => state.settingsdata.settings);
  const {
    editCarType
  } = api;
  const columns = [
    { title: t('name'), field: 'name', cellStyle:isRTL ==='rtl'? {paddingRight:appcat === 'taxi'? 100: 180 , textAlign: 'right' }:{ paddingLeft: appcat === 'taxi'? 100: 180}, headerStyle:isRTL==='rtl'?{paddingRight: appcat === 'taxi'? 100: 180}:{ paddingLeft: appcat === 'taxi'? 100: 180}},
    { title: t('image'), field: 'image', cellStyle:{ textAlign: 'center'},render: rowData => <img alt='Car' src={rowData.image} style={{ width: 50 }}/>},
    { title: t('base_fare'), field: 'base_fare', type: 'numeric', cellStyle:{ textAlign: 'center'}},
    { title: t('rate_per_unit_distance'), field: 'rate_per_unit_distance', type: 'numeric', cellStyle:{ textAlign: 'center'}},
    { title: t('rate_per_hour'), field: 'rate_per_hour', type: 'numeric', cellStyle:{ textAlign: 'center'}},
    { title: t('min_fare'), field: 'min_fare', type: 'numeric', cellStyle:{ textAlign: 'center'}},
    { title: t('convenience_fee'), field: 'convenience_fees', type: 'numeric', cellStyle:{ textAlign: 'center'}},
    {
      title: t('convenience_fee_type'),
      field: 'convenience_fee_type',
      lookup: { flat: t('flat'), percentage: t('percentage')},
      cellStyle:{ textAlign: 'center'}
    },
    { title: t('extra_info'), field: 'extra_info' , cellStyle:{ textAlign:isRTL ==='rtl'? 'right' : 'left'}}
  ];

  const subcolumns = [
    { title: t('description'), field: 'description', render: rowData => <span>{rowData.description}</span> },
    { title: t('amount'), field: 'amount', type: 'numeric' }
  ];

  const subcolumns2 = [
    { title: t('minsDelayed'), field: 'minsDelayed', render: rowData => <span>{rowData.minsDelayed}</span> },
    { title: t('amount'), field: 'amount', type: 'numeric' }
  ];

  const [data, setData] = useState([]);
  const cartypes = useSelector(state => state.cartypes);
  const dispatch = useDispatch();
  const rootRef = useRef(null);
  const classes = useStyles();
  const [open,setOpen] = useState(false);
  const [rowIndex,setRowIndex] = useState();
  const [modalType,setModalType] = useState();

  const handleClose = () => {
    setOpen(false);
  }

  useEffect(() => {
    if (cartypes.cars) {
      setData(cartypes.cars);
    } else {
      setData([]);
    }
  }, [cartypes.cars]);

  return (
    cartypes.loading ? <CircularLoading /> :
    <div ref={rootRef}>
      <MaterialTable
        title={t('car_type')}
        columns={columns}
        data={data}
        style={{direction:isRTL ==='rtl'?'rtl':'ltr'}}
        options={{
          exportButton: true,
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
        editable={{
          onRowAdd: newData =>
          settings.AllowCriticalEditsAdmin?
            new Promise(resolve => {
              setTimeout(() => {
                  newData['createdAt'] = new Date().toISOString();
                  dispatch(editCarType(newData,"Add"));
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
            settings.AllowCriticalEditsAdmin?
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                dispatch(editCarType(newData,"Update"));
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
            settings.AllowCriticalEditsAdmin?
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                dispatch(editCarType(oldData,"Delete"));
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
        actions={[
          rowData => (appcat === 'delivery'?{
            icon: () => <div style={{display: 'flex',alignItems: 'center',flexWrap: 'wrap'}}>
                <PhotoSizeSelectSmallIcon />
                <Typography variant="subtitle2" style={{padding: 5}}>{t('parcel_types')}</Typography>
            </div>,
            onClick: (event, rowData) => {
              setModalType('parcelTypes')
              setRowIndex(rowData.tableData.id);
              setOpen(true);
            }
          }:null),
          rowData => (appcat === 'delivery'?{
            icon: () => <div style={{display: 'flex',alignItems: 'center',flexWrap: 'wrap'}}>
                <FitnessCenterIcon />
                <Typography variant="subtitle2" style={{padding: 5}}>{t('options')}</Typography>
            </div>,
            onClick: (event, rowData) => {
              setModalType('options')
              setRowIndex(rowData.tableData.id);
              setOpen(true);
            }
          }:null),
          rowData => ({
            icon: () => <div style={{display: 'flex',alignItems: 'center',flexWrap: 'wrap'}}>
                <CancelScheduleSendIcon />
                <Typography variant="subtitle2" style={{padding: 5}}>{t('cancelSlab')}</Typography>
            </div>,
            onClick: (event, rowData) => {
              setModalType('cancelSlab')
              setRowIndex(rowData.tableData.id);
              setOpen(true);
            }
          })
        ]}
      />
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
          <MaterialTable
            title={modalType === 'options'?t('options') :( modalType === 'cancelSlab' ? t('cancelSlab'): t('parcel_types'))}
            columns={modalType === 'cancelSlab'? subcolumns2 :subcolumns }
            data={(data[rowIndex] && data[rowIndex][modalType])?data[rowIndex][modalType]:[]}
            options={{
              exportButton: true,
            }}
            editable={{
              onRowAdd: newData =>
                settings.AllowCriticalEditsAdmin?
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    let tblData = data;
                    if(!tblData[rowIndex][modalType]){
                      tblData[rowIndex][modalType] = [];
                    }
                    tblData[rowIndex][modalType].push(newData);
                    dispatch(editCarType(tblData[rowIndex]), "Update");
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
                settings.AllowCriticalEditsAdmin?
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    let tblData = data;
                    tblData[rowIndex][modalType][tblData[rowIndex][modalType].indexOf(oldData)] = newData;
                    dispatch(editCarType(tblData[rowIndex]), "Update");
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
                settings.AllowCriticalEditsAdmin?
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve();
                    let tblData = data;
                    tblData[rowIndex][modalType].splice(tblData[rowIndex][modalType].indexOf(oldData), 1);
                    dispatch(editCarType(tblData[rowIndex]), "Update");
                  }, 600);
                })
                :
                new Promise(resolve => {
                  setTimeout(() => {
                    resolve();
                    alert(t('demo_mode'));
                  }, 600);
                }),
            }}  
          />
        </div>
      </Modal>
    </div>
  );
}
