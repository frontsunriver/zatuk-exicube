import React,{ useState, useEffect, useContext } from 'react';
import MaterialTable from 'material-table';
import CircularLoading from "../components/CircularLoading";
import { useSelector, useDispatch } from "react-redux";
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";

const Withdraws = () => {
  const { api } = useContext(FirebaseContext);
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector(state => state.settingsdata.settings);
  const {
    completeWithdraw
  } = api;
  const dispatch = useDispatch();
  const columns =  [
      { title: 'ID', field: 'id',editable: 'never',headerStyle:{textAlign:'center'},cellStyle:{textAlign:'center'}},
      { title: t('requestDate'), field: 'date',editable: 'never'},
      { title: t('driver_name'),field: 'name',editable: 'never', cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}},
      { title: t('amount'), field: 'amount',editable: 'never',cellStyle:{textAlign:'center'},headerStyle:{textAlign:'center'}},
      { title: t('processed'), field: 'processed', type: 'boolean',editable: 'never', cellStyle:{paddingLeft:isRTL=== 'rtl'?40:null}},  
      { title: t('processDate'), field: 'procesDate',editable: 'never'}, 
      { title: t('bankName'), field: 'bankName', hidden: settings.bank_fields===false? true: false,editable: 'never'},
      { title: t('bankCode'), field: 'bankCode' , hidden: settings.bank_fields===false? true: false,editable: 'never'},
      { title: t('bankAccount'), field: 'bankAccount', hidden: settings.bank_fields===false? true: false,editable: 'never'}
  ];
  const [data, setData] = useState([]);
  const withdrawdata = useSelector(state => state.withdrawdata);

  useEffect(()=>{
        if(withdrawdata.withdraws){
            setData(withdrawdata.withdraws);
        }else{
          setData([]);
        }
  },[withdrawdata.withdraws]);
  
  return (
    withdrawdata.loading? <CircularLoading/>:
    <MaterialTable
      title={t('booking_title')}
      style={{direction:isRTL ==='rtl'?'rtl':'ltr', padding: 10}}
      columns={columns}
      data={data}
      options={{
        exportButton: true
      }}
      localization={{
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
          icon: 'check',
          tooltip: t('process_withdraw'),
          disabled: rowData.processed,
          onClick: (event, rowData) => {
            dispatch(completeWithdraw(rowData));
          }         
        }),
      ]}
    />
  );
}

export default Withdraws;
