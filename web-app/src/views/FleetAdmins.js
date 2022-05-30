import React,{ useState, useEffect, useContext,useRef } from 'react';
import MaterialTable from 'material-table';
import { useSelector, useDispatch } from "react-redux";
import CircularLoading from "../components/CircularLoading";
import { FirebaseContext } from 'common';
import { useTranslation } from "react-i18next";
import moment from 'moment/min/moment-with-locales';

export default function Users() {
  const { api } = useContext(FirebaseContext);
  const { t,i18n } = useTranslation();
  const isRTL = i18n.dir();
  const settings = useSelector(state => state.settingsdata.settings);
  const {
    addUser,
    editUser, 
    deleteUser,
    checkUserExists,
    fetchUsersOnce
  } = api;
  const [data, setData] = useState([]);
  const staticusers = useSelector(state => state.usersdata.staticusers);
  const dispatch = useDispatch();
  const loaded = useRef(false);

  useEffect(()=>{
    dispatch(fetchUsersOnce());
},[dispatch,fetchUsersOnce]);

  useEffect(()=>{
    if(staticusers){
      setData(staticusers.filter(user => user.usertype ==='fleetadmin'));
    }else{
      setData([]);
    }
    loaded.current = true;
  },[staticusers]);

  const columns = [
    { title: t('createdAt'), field: 'createdAt', editable:'never', defaultSort:'desc',render: rowData => rowData.createdAt? moment(rowData.createdAt).format('lll') :null},
    { title: t('first_name'), field: 'firstName', initialEditValue: '', cellStyle:{ paddingLeft:isRTL ==='rtl'? 50 : 15}},
    { title: t('last_name'), field: 'lastName', initialEditValue: '', cellStyle:{ paddingLeft:isRTL ==='rtl'? 30 : 15}},
    { title: t('mobile'), field: 'mobile', editable:'onAdd',render: rowData => settings.AllowCriticalEditsAdmin ?rowData.mobile : "Hidden for Demo"},
    { title: t('email'), field: 'email', editable:'onAdd',render: rowData => settings.AllowCriticalEditsAdmin ?rowData.email : "Hidden for Demo",headerStyle:{textAlign:'center'}},
    { title: t('account_approve'),  field: 'approved', type:'boolean', initialEditValue: true, cellStyle:{ textAlign: 'center'}}
  ];

  return (
    !loaded.current? <CircularLoading/>:
    <MaterialTable
      title={t('fleetadmins')}
      columns={columns}
      style={{direction:isRTL ==='rtl'?'rtl':'ltr'}}
      data={data}
      options={{
        exportButton: settings.AllowCriticalEditsAdmin,
        sorting: true,
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
        new Promise((resolve,reject) => {
          setTimeout(() => {
            checkUserExists(newData).then((res) => {
              if (res.users && res.users.length > 0) {
                alert(t('user_exists'));
                reject();
              }
              else if(res.error){
                alert(t('email_or_mobile_issue'));
                reject();
              }
              else{
                newData['createdByAdmin'] = true;
                newData['usertype'] = 'fleetadmin';
                newData['createdAt'] = new Date().toISOString();
                newData['referralId'] = newData.firstName.toLowerCase() + Math.floor(1000 + Math.random() * 9000).toString();
                dispatch(addUser(newData));
                dispatch(fetchUsersOnce());
                resolve();
              }
            });
          }, 600);
        }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              dispatch(editUser(oldData.id,newData));
              dispatch(fetchUsersOnce());
            }, 600);
          }),
        onRowDelete: oldData =>
          settings.AllowCriticalEditsAdmin?
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              dispatch(deleteUser(oldData.id));
              dispatch(fetchUsersOnce());
            }, 600);
          })
          :
          new Promise(resolve => {
            setTimeout(() => {
              resolve();
              alert(t('demo_mode'));
            }, 600);
          })
          , 
      }}
    />
  );
}
