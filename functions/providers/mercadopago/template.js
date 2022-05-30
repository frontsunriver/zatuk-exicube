function getTemplate(preference_id, public_key) {
    return `
        <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Mercadopago Payment Checkout</title>
        </head>
        <body>
            <div class="cho-container"></div>
            <script src="https://sdk.mercadopago.com/js/v2"></script>
            <script>
                const mp = new MercadoPago('${public_key}', {
                    locale: 'en-US'
                });
                mp.checkout({
                    preference: {
                        id: '${preference_id}'
                    },
                    autoOpen: true,
                });
          
            </script>
        </body>
        </html>
    `;
}

module.exports.getTemplate = getTemplate;