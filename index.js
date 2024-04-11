const crypto = require("crypto");
const axios = require("axios");
const { URLSearchParams } = require("url");

const SYMBOL = "SPELLUSDT";
const BUY_PRICE = 34160;
const SELL_PRICE = 34501;
const API_KEY   = "FSDLAKFLÇSDK~F"
const QUANTITY   = "0.001"
const SECRET_KEY = "12344"
const API_URL = "https://testnet.binance.vision"; //https://api.binance.com

let isOpened = false;

function calcSMA(data){
    const closes = data.map(candle=> parseFloat(candle[4]));
    const sum = closes.reduce((a,b) => a + b);
    return sum / data.length;
}

async function start(){
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);
    const candle = data[data.length - 1];
    const price = parseFloat(candle[4])

    const sma21 = calcSMA(data);
    const sma13 = calcSMA(data.slice(8));
    console.log("SMA (13): " + sma13);
    console.log("SMA (21): " + sma21);
    console.log("Is Opened: " + isOpened);


    if(sma13 > sma21 && isOpened === false){
        isOpened = true
        console.log("Comprar")
        //newOrder(SYMBOL, QUANTITY, "buy");        
    }
    else if (sma13 < sma21 && isOpened === true){
        isOpened = false;
        //newOrder(SYMBOL, QUANTITY, "sell");
        console.log("Vender")
    }
    else    
        console.log("Aguardando sinal")
    console.log(price)
}

async function newOrder(symbol, quantity, side){
    const order = {symbol, quantity, side};
    order.type = "MARKET";
    order.timestamp = Date.now();

    const signature = crypto
                      .createHmac("sha256", SECRET_KEY)
                      .update(new URLSearchParams(order).toString())
                      .digest("hex");
    
    order.signature = signature;
    
    try {
        const {data} = await axios.post(
            API_URL + "/api/v3/order",
            new URLSearchParams(order).toString(),
            { headers: {"X-MBX-APIKEY": API_KEY}}
        )

        console.log(data);

    } catch (err) {
        console.log(err.response.data);
    }
}
setInterval(start, 3000);
start()