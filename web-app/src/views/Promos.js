import React, { useState, useEffect, useContext } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';

export default function Promos() {
  const { api } = useContext(FirebaseContext);
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const {
    editPromo
  } = api;
  const settings = useSelector(state => state.settingsdata.settings);

  const columns = [
    { title: t('promo_name'), field: 'promo_name',cellStyle:{textAlign:isRTL ==='rtl'? 'right':'left'}},
    { title: t('description'), field: 'promo_description',cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}},
    {
      title: t('type'),
      field: 'promo_discount_type',
      lookup: { flat: t('flat'), percentage: t('percentage')},
      cellStyle:{textAlign:isRTL ==='rtl'? 'right':'left'}
    },
    { title: t('promo_discount_value'), field: 'promo_discount_value', type: 'numeric',cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}},
    { title: t('max_limit'), field: 'max_promo_discount_value', type: 'numeric',cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}},
    { title: t('min_limit'), field: 'min_order', type: 'numeric',cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}},
    { title: t('end_date'), field: 'promo_validity', render: rowData => rowData.promo_validity ? moment(rowData.promo_validity).format('lll') : null,cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'} },
    { title: t('promo_usage'), field: 'promo_usage_limit', type: 'numeric',cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}},
    { title: t('promo_used_by'), field: 'user_avail', editable: 'never',cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}}
  ];

  const [data, setData] = useState([]);
  const promodata = useSelector(state => state.promodata);
  const dispatch = useDispatch();

  useEffect(() => {
    if (promodata.promos) {
      setData(promodata.promos);
    } else {
      setData([]);
    }
  }, [promodata.promos]);

  return (
    promodata.loading ? <CircularLoading /> :
      <MaterialTable
        title={t('promo_offer')}
        style={{direction:isRTL ==='rtl'?'rtl':'ltr'}}
        columns={columns}
        data={data}
        options={{
          rowStyle: {
            alignItems:'center'
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
        editable={{
          onRowAdd: newData =>
            new Promise(resolve => {
              setTimeout(() => {
                  newData['createdAt'] = new Date().toISOString();
                  dispatch(editPromo(newData,"Add"));
                  resolve();
              }, 600);
            }),
          onRowUpdate: (newData, oldData) =>
            settings.AllowCriticalEditsAdmin?
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                dispatch(editPromo(newData,"Update"));
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
                dispatch(editPromo(oldData,"Delete"));
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
  );
}
