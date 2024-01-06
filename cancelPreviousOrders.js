const axios = require("axios");
const crypto = require("crypto");
const { API_KEY, API_SECRET } = require("./keys");

function cancelAllOrders(symbol, untriggered = true) {
  const apiUrl = "https://testnet-api.phemex.com"; // Use the correct API URL (testnet or production)
  const apiKey = API_KEY;
  const apiSecret = API_SECRET;
  const endpoint = `/spot/orders/all?symbol=${symbol}&untriggered=${untriggered}`;

  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const expiry = now + 60;

  const signatureString = endpoint + expiry;

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
    .delete(`${apiUrl}${endpoint}`, { headers })
    .then((response) => {
      console.log("Successfully canceled all orders:", response.data);
    })
    .catch((error) => {
      console.error(
        "Error canceling all orders:",
        error.response ? error.response.data : error.message
      );
    });
}

module.exports = {
  cancelAllOrders,
};
