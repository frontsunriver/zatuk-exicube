import React,{ useState, useEffect, useContext } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";

export default function Notifications() {
  const { api } = useContext(FirebaseContext);
  const { t, i18n  } = useTranslation();
  const isRTL = i18n.dir();
  const {
    sendNotification,
    editNotifications
  } = api;
  const settings = useSelector(state => state.settingsdata.settings);
  const columns =  [
      {
        title: t('device_type'),
        field: 'devicetype',
        lookup: { All: (t('all')), ANDROID: (t('android')), IOS: (t('ios')) },
        cellStyle:{paddingLeft: isRTL=== 'rtl'?55:null}
      },
      {
        title: t('user_type'),
        field: 'usertype',
        lookup: { rider: t('rider'), driver: t('driver') },
        cellStyle:{paddingLeft: isRTL=== 'rtl'?55:null}
      },
      { title: t('title'),field: 'title', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
      { title: t('body'), field: 'body', cellStyle:{paddingLeft: isRTL=== 'rtl'?40:null}},
  ];

  const [data, setData] = useState([]);
  const notificationdata = useSelector(state => state.notificationdata);
  const dispatch = useDispatch();

  useEffect(()=>{
        if(notificationdata.notifications){
            setData(notificationdata.notifications);
        }else{
            setData([]);
        }
  },[notificationdata.notifications]);

  return (
    notificationdata.loading? <CircularLoading/>:
    <MaterialTable
      title={t('push_notification_title')}
      columns={columns}
      data={data}
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
              resolve();
              const tblData = data;
              tblData.push(newData);
              settings.AllowCriticalEditsAdmin?
                dispatch(sendNotification(newData))
                :
                alert(t('demo_mode'));
              dispatch(editNotifications(newData,"Add"));
            }, 600);
          }),

          // onRowUpdate: (newData, oldData) =>
          // new Promise(resolve => {
          //   setTimeout(() => {
          //     resolve();
          //     dispatch(editNotifications(newData,"Update"));
          //   }, 600);
          // }),
        onRowDelete: oldData =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              dispatch(editNotifications(oldData,"Delete"));
            }, 600);
          }),
      }}
    />
  );
}
