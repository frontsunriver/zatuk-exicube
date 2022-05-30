import { 
    FETCH_LANGUAGE,
    FETCH_LANGUAGE_SUCCESS,
    FETCH_LANGUAGE_FAILED,
    EDIT_LANGUAGE
  } from "../store/types";
  
  export const INITIAL_STATE = {
    langlist:null,
    defaultLanguage:null,
    loading: false,
    error:{
      flag:false,
      msg: null
    }
  }
  
  export const languagereducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case FETCH_LANGUAGE:
        return {
          ...state,
          loading:true
        };
      case FETCH_LANGUAGE_SUCCESS:
        return {
          ...state,
          ...action.payload,
          loading:false
        };
      case FETCH_LANGUAGE_FAILED:
        return {
          ...state,
          langlist:null,
          defaultLanguage:null,
          loading:false,
          error:{
            flag:true,
            msg:action.payload
          }
        };
      case EDIT_LANGUAGE:
        return state;
      default:
        return state;
    }
  };