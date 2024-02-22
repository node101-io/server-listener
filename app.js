const fetch = require('node-fetch');
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
  console.log(message.toString());
});

fetch('http://127.0.0.1:26657/tx?hash=0x5EC7224872FCCFBA28D4113A1369649555317B5F5EF25B3EFD5BF7F64398F1E8')
  .then(res => res.json())
  .then(console.log)

