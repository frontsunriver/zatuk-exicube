function getTemplate(
    checkout_url, myData
){
    let htmlForm = `<form action="${checkout_url}" method="post" name="payfast">`;
    for (let key in myData) {
        if (Object.prototype.hasOwnProperty.call(myData, key)){
            value = myData[key];
            if (value !== "") {
                htmlForm +=`<input name="${key}" type="hidden" value="${value.trim()}" />`;
            }
        }
    }
    htmlForm += '</form>'; 

    return `
        <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Payfast Payment Checkout</title>
        </head>
        <body>
            <center>
                <h1>Please do not refresh this page...</h1>
            </center>
            ${htmlForm}
            <script type="text/javascript">
                document.payfast.submit();
            </script>
        </body>
        </html>
    `;
}

module.exports.getTemplate = getTemplate;