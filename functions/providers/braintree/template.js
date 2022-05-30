function getTemplate(token, order_id, amount, currency) {
    return `
        <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <script src="https://js.braintreegateway.com/web/dropin/1.22.0/js/dropin.min.js"></script>
            <title>Braintree Payment Checkout</title>
        </head>
        <body>
            <div id="dropin-container"></div>
            <div style="width:100%;height:60px;margin: 0 auto">
                <center>
                    <button id="submit-button"
                        style="padding: 10px;padding-left: 100px;padding-right: 100px;font-size:16px;color: #fff;background-color:red;font-size:18px;background: #00c4ff;border-radius: 6px;box-shadow:none;border:0;">Pay</button>
                </center>
            </div>
            <script>
                var button = document.querySelector('#submit-button');
                var dropinInstance;
                braintree.dropin.create({
                    authorization: '${token}',
                    container: '#dropin-container',
                    paypal: {
                        flow: 'checkout',
                        amount: '${amount}',
                        currency: '${currency}'
                    }
                }, (error, instance) => {
                    if (instance) {
                        dropinInstance = instance;
                        dropinInstance.on('paymentMethodRequestable', event => {
                            if (event.paymentMethodIsSelected) {
                                dropinInstance.requestPaymentMethod((err, payload) => {
                                    if (!err) {
                                        window.ReactNativeWebView.postMessage(payload.nonce);
                                        button.style.display="none";
                                    }
                                    if (err) {
                                        dropinInstance.clearSelectedPaymentMethod();
                                        window.ReactNativeWebView.postMessage("Error");
                                        button.style.display="block";
                                    }
                                });
                            }
                        });

                        button.addEventListener('click', ()=>{
                            button.style.display="none";
                            dropinInstance.requestPaymentMethod((err, payload) => {
                                if (!err) {
                                    window.open("braintree-process?order_id=${order_id}&amount=${amount}&nonce=" + payload.nonce, "_self");
                                }
                                if (err) {
                                    dropinInstance.clearSelectedPaymentMethod();
                                    button.style.display="block";
                                    window.open("cancel");
                                }
                            });
                        });
                    }
                    if (error) {
                        console.log(error);
                    }
                });
            </script>
        </body>
        </html>
    `;
}

module.exports.getTemplate = getTemplate;
