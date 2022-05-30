import React, { useEffect, useState } from 'react';
import {Route,Redirect} from 'react-router-dom';
import { useSelector } from "react-redux";
import ResponsiveDrawer from '../components/ResponsiveDrawer';
import CircularLoading from "../components/CircularLoading";

function matchUser(permit, usertype){
    let permitions = permit? permit.split(',') : [];
    let permitted = false;
    for(let i=0;i<permitions.length;i++){
        permitted = usertype === permitions[i]?true:false
        if(permitted) break;
    }
    return permitted;
}

function ProtectedRoute({ component: Component, permit, ...rest }) {
    const auth = useSelector(state => state.auth);
    const [checkedAuth,setCheckedAuth] = useState(false);

    useEffect(()=>{
        if(auth.info && auth.info.profile){
            setCheckedAuth(true);
        }
        if(auth.error && auth.error.msg && !auth.info){
            setCheckedAuth(true);
        }
    },[auth.info,auth.error])

    return(
        checkedAuth?
        <Route {...rest} render={props => (
            auth.info && auth.info.profile?
            matchUser(permit,auth.info.profile.usertype) ?
            <ResponsiveDrawer><Component {...props} /></ResponsiveDrawer>
            :<Redirect to="/login" /> :<Redirect to="/login" /> 
        )} />
        :<CircularLoading/>
    )
}

export default ProtectedRoute;