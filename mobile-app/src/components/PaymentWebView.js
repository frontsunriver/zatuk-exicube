import React, {useRef} from 'react';
import { WebView } from 'react-native-webview';

export default function PaymentWebView(props) {
  const webViewRef = useRef();

  const onLoadStart = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;

    let matchUrl = nativeEvent.url.split('?');
    if (matchUrl[0] === props.serverUrl + '/success') {
      var obj = { gateway: props.provider.name };
      if (matchUrl[1]) {
        var pairs = matchUrl[1].split('&');
        for (i in pairs) {
          var split = pairs[i].split('=');
          obj[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
        }
      }
      if (obj['transaction_id'] == undefined) {
        obj['transaction_id'] = 'no transaction id'
      }
      setTimeout(()=>{
        webViewRef.current.stopLoading()
        props.onSuccess(obj);
      },3000);
    }
    if (matchUrl[0] === props.serverUrl + '/cancel') {
      setTimeout(()=>{
        webViewRef.current.stopLoading()
        props.onCancel();
      },3000);
    }
  };

  return (
    <WebView
      originWhitelist={['*']}
      ref={webViewRef}
      source={{
        uri: props.serverUrl + props.provider.link,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
        body: 'order_id=' + props.payData.order_id
          + '&amount=' + props.payData.amount
          + '&currency=' + props.payData.currency
          + '&product_name=' + props.payData.product_name
          + '&quantity=' + props.payData.quantity
          + '&cust_id=' + props.payData.cust_id
          + '&mobile_no=' + props.payData.mobile_no
          + '&email=' + props.payData.email
          + '&first_name=' + props.payData.first_name
          + '&last_name=' + props.payData.last_name
      }}
      onLoadStart={onLoadStart}
    />
  );
};
