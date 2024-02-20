const ws = require('ws');

const webSocket = new ws.WebSocket('ws://localhost:26657/websocket');

webSocket.on('open', () => {
  webSocket.send(JSON.stringify({
    "jsonrpc": "2.0",
    "method": "subscribe",
    "id": 0,
    "params": {
      "query": "tm.event='NewBlock'"
    }
  }));
});

webSocket.on('message', message => {
  console.log(JSON.parse(message.toString()).result);
});