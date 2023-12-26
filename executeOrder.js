const axios = require("axios");
const crypto = require("crypto");
const { API_KEY, API_SECRET } = require("./keys");
const fs = require("fs");

function executeOrder(symbol, side, qty, price) {
  const apiUrl = "https://testnet-api.phemex.com"; // Use the correct API URL (testnet or production)
  const apiKey = API_KEY;
  const apiSecret = API_SECRET;
  const endpoint = "/spot/orders"; // Replace with the correct endpoint for placing orders

  const orderRequestBody = {
    symbol: symbol,
    side: side,
    qtyType: "ByBase",
    baseQtyEv: qty,
    priceEp: price,
    ordType: "Limit", //side === "Sell" ? "Limit" : "Stop" ,
    timeInForce: "ImmediateOrCancel",
  };

  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const expiry = now + 60;

  const queryString = "";
  const signatureString =
    endpoint + queryString + expiry + JSON.stringify(orderRequestBody);

  // Calculate the HMAC SHA256 signature using your API Secret
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(signatureString)
    .digest("hex");

  const headers = {
    "x-phemex-access-token": apiKey,
    "x-phemex-request-expiry": expiry.toString(),
    "x-phemex-request-signature": signature,
    "x-phemex-request-tracing": "YOUR_UNIQUE_TRACE_STRING", // Replace with a unique trace string
    // Add other headers if needed
  };

  axios
    .post(`${apiUrl}${endpoint}`, orderRequestBody, { headers })
    .then((response) => {
      console.log(response);
      // console.log(response);
    })
    .catch((error) => {
      console.error(
        "Error placing buy limit order:",
        error.response ? error.response.data : error.message
      );
      console.error(error);
    });
}

module.exports = executeOrder;
