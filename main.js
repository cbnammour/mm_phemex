const WebSocket = require("ws");
const { API_KEY, API_SECRET } = require("./keys");
const { default: axios } = require("axios");
const executeOrder = require("./executeOrder");

// WebSocket URL
// const wsUrl = "wss://ws.phemex.com";
const wsUrl = "wss://testnet-api.phemex.com/ws";

// Symbol and ID
const symbol = "sBTCUSDT";
const id = 1; // You can choose any unique ID you like

// Create a WebSocket connection
const ws = new WebSocket(wsUrl);

// WebSocket connection event handlers
ws.on("open", () => {
  console.log("WebSocket connection is open.");

  // Create the JSON payload
  const payload = JSON.stringify({
    id,
    method: "orderbook.subscribe",
    params: [symbol, true],
  });

  // Send the payload to the WebSocket server
  ws.send(payload);

  // Get the current time
  const currentTime = new Date();

  // Add two minutes
  currentTime.setMinutes(currentTime.getMinutes() + 2);

  const auth = JSON.stringify({
    method: "user.auth",
    params: ["API", API_KEY, API_SECRET, currentTime],
    id: 0,
  });
  ws.send(auth);

  const ping = {
    id: 1,
    method: "server.ping",
    params: [],
  };

  setInterval(() => {
    const message = JSON.stringify(ping);
    ws.send(message);
    console.log("Message sent:", message);
  }, 20000);
  // const subscribeTrade = JSON.stringify({
  //   id: 9,
  //   method:"trade.subscribe",
  //   params:[
  //     "BTCUSD"
  //   ]
  // })

  // ws.send(subscribeTrade)
});

ws.on("message", (data) => {
  const received = JSON.parse(data);

  // if(received.trades) {
  //   console.log(received)
  // }

  if (received.result) {
    console.log(received);
    // return
  }

  if (received.depth == 0) {
    console.log(received.book);
    if (
      received.book != undefined &&
      received.book.bids.length > 0 &&
      received.book.asks.length > 0
    ) {
      // console.log(received.book.bids.length)
      const highestBid = findHighestBid(received.book.bids);

      const lowestAsk = findLowestAsk(received.book.asks);

      const spread = lowestAsk - highestBid;
      const midPrice = (lowestAsk + highestBid) / 2;
      const spreadPerc = (spread / midPrice) * 100;

      console.log("Highest Bid:", highestBid);
      console.log("Lowest Ask:", lowestAsk);

      // const priceDiff = lowestAsk - highestBid;
      // const priceDiffPercentage = ((2*priceDiff)/(lowestAsk+highestBid) )*100
      console.log(spread);
      console.log(spreadPerc);

      const multiplier = calculateOrderMultiplier(spread, 1/3);
      const newLA =
        parseInt((parseFloat(lowestAsk) - multiplier) / 100000000) * 100000000;
      const newHB =
        parseInt((parseFloat(highestBid) + multiplier) / 100000000) * 100000000;

      if (!checkConditions(lowestAsk, highestBid, 0.001, newLA, newHB)) {
        return;
      }

      executeOrder(symbol, "Sell", 10000, newLA);
      executeOrder(symbol, "Buy", 10000, newHB);
    }
  }
});

// ws.on('close', (code, reason) => {
//   console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
// });

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
});

function findHighestBid(bids) {
  let highestBid = 0;
  console.log("bids");
  console.log(bids);
  bids.forEach((element) => {
    if (parseFloat(element[0]) > highestBid) {
      highestBid = element[0];
    }
  });
  return parseFloat(highestBid);
}

function findLowestAsk(asks) {
  let lowestAsk = Infinity;
  asks.forEach((element) => {
    if (parseFloat(element[0]) < lowestAsk) {
      lowestAsk = element[0];
    }
  });
  return parseFloat(lowestAsk);
}

async function placeOrder(orderType, quantity, price, symbol) {
  const apiUrl = "https://testnet-api.phemex.com";
  const requestBody = {
    symbol: "sBTCUSDT",
    clOrdID: "",
    side: "Buy", // or 'Sell'
    qtyType: "ByBase", // or 'ByQuote'
    quoteQtyEv: 0,
    baseQtyEv: 0,
    priceEp: 0,
    stopPxEp: 0,
    trigger: "UNSPECIFIED",
    ordType: "Limit",
    timeInForce: "GoodTillCancel",
  };
  try {
    const response = await axios.post(`${apiUrl}/orders`, requestBody);

    console.log(response);
  } catch (err) {
    console.log(err);
  }
}

function calculateOrderMultiplier(spread, margin) {
  return spread * margin;
}

function checkConditions(LA, HB, feesPerc, newLA, newHB) {
  let condition = false;
  if (
    newLA > newHB &&
    LA > HB &&
    (1 - feesPerc) * newLA > (1 + feesPerc) * newHB
  ) {
    condition = true;
  }

  return condition;
}
