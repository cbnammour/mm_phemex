const axios = require('axios');
const crypto = require('crypto');
const { API_KEY, API_SECRET } = require("./keys");
const fs = require('fs')

const apiUrl = 'https://testnet-api.phemex.com'; // Use the correct API URL (testnet or production)
const apiKey = API_KEY;
const apiSecret = API_SECRET;
const endpoint = '/spot/orders'; // Replace with the correct endpoint for placing orders


const products = axios.get('https://testnet-api.phemex.com/public/products').then((response) => {
  // console.log(response.data.data.products.find((product) => {
  //   return product.symbol.includes("BTC") && product.type == 'Spot'
  // }))
  // fs.writeFile('./pairs.txt', JSON.stringify(response.data.data.products), err => {
  //   console.log(err)
  // })

  fs.writeFileSync('./pairs.json', JSON.stringify(
    response.data.data.products.filter(product => {
      return product.type == 'Spot'
    })
    ));
  
})

// Construct the request body for your order
const orderRequestBody = {
  symbol: 'sBTCUSDT',
  side: 'Sell',
  qtyType: 'ByBase',
  baseQtyEv: 10000, // This represents 1 USDT
  priceEp: 4246700000000,
  ordType: 'Limit',
  timeInForce: 'GoodTillCancel',
};

// Calculate the request expiry timestamp (Now() + 1 minute)
const now = Math.floor(Date.now() / 1000); // Current time in seconds
const expiry = now + 60; // 1 minute from now

// Construct the string to sign
const queryString = ''; // Replace with your query string if needed
const signatureString = endpoint + queryString + expiry + JSON.stringify(orderRequestBody);

// Calculate the HMAC SHA256 signature using your API Secret
const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(signatureString)
  .digest('hex');

// Set the request headers
const headers = {
  'x-phemex-access-token': apiKey,
  'x-phemex-request-expiry': expiry.toString(),
  'x-phemex-request-signature': signature,
  'x-phemex-request-tracing': 'YOUR_UNIQUE_TRACE_STRING', // Replace with a unique trace string
  // Add other headers if needed
};

// Make the POST request to place the buy limit order
axios.post(`${apiUrl}${endpoint}`, orderRequestBody, { headers })
  .then((response) => {
    console.log(response);
    // console.log(response);
  })
  .catch((error) => {
    console.error('Error placing buy limit order:', error.response ? error.response.data : error.message);
    console.error(error);
  });
