const axios = require('axios');
const crypto = require('crypto');
const { API_KEY, API_SECRET } = require("./keys");

const apiUrl = 'https://testnet-api.phemex.com'; // Use the correct API URL (testnet or production)
const apiKey = API_KEY;
const apiSecret = API_SECRET;
const endpoint = '/orders'; // Replace with the correct endpoint for placing orders

// Construct the request body for your order
const orderRequestBody = {
  // Replace with your order details
  symbol: 'BTCUSD',
  clOrdID: '', // You can provide a custom client order ID if needed
  side: 'Buy', // Buy order
  qtyType: 'ByBase', // Quantity specified in terms of the base currency
  quoteQtyEv: 0,
  baseQtyEv: 0.1, // 0.01 BTC (0.01 * 100,000,000 Satoshi)
  priceEp: Math.round(45000 * 100000000), // Rounded to the nearest Satoshi
  stopPxEp: 0,
  trigger: 'UNSPECIFIED',
  ordType: 'Limit', // Limit order
  timeInForce: 'GoodTillCancel', // Order remains open until canceled
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
    console.log('Buy limit order placed successfully:', response.data);
    // console.log(response);
  })
  .catch((error) => {
    console.error('Error placing buy limit order:', error.response ? error.response.data : error.message);
    console.error(error);
  });
