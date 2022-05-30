import {
    FETCH_LANGUAGE,
    FETCH_LANGUAGE_SUCCESS,
    FETCH_LANGUAGE_FAILED,
    EDIT_LANGUAGE
} from "../store/types";

export const fetchLanguages = () => (dispatch) => (firebase) => {

    const {
        languagesRef
    } = firebase;

    dispatch({
        type: FETCH_LANGUAGE,
        payload: null
    });
    languagesRef.on("value", snapshot => {
        if (snapshot.val()) {
            const data = snapshot.val();
            let defLang = null;
            const arr = Object.keys(data).map(i => {
                data[i].id = i;
                if(data[i].default){
                    defLang = data[i].keyValuePairs;
                }
                return data[i]
            });
            dispatch({
                type: FETCH_LANGUAGE_SUCCESS,
                payload: {
                    defaultLanguage: defLang,
                    langlist: arr
                }
            });
        } else {
            dispatch({
                type: FETCH_LANGUAGE_FAILED,
                payload: "No Languages available."
            });
        }
    });
};

export const editLanguage = (lang, method) => (dispatch) => (firebase) => {
    const {
        languagesRef,
        languagesEditRef
    } = firebase;
    dispatch({
        type: EDIT_LANGUAGE,
        payload: { lang, method }
    });
    if (method === 'Add') {
        languagesRef.push(lang);
    } else if (method === 'Delete') {
        languagesEditRef(lang.id).remove();
    } else {
        languagesEditRef(lang.id).set(lang);
    }
}