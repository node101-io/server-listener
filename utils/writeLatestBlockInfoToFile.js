import fs from 'fs';
import WebSocket from 'ws';

import decodeTxs from './decodeTxs.js';

const RECONNECT_ATTEMPT_INTERVAL = 5 * 1000;
const WEBSOCKET_URL = 'https://cosmos-rpc.onivalidator.com/websocket';

const startGettingLatestBlock = () => {
  const webSocket = new WebSocket(WEBSOCKET_URL);

  webSocket
    .on('open', _ => {
      webSocket.send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'subscribe',
        id: 0,
        params: {
          query: 'tm.event=\'NewBlock\''
        }
      }));
    })
    .on('message', message => {
      message = JSON.parse(message);

      if (!message.result.data || message.result.data.type != 'tendermint/event/NewBlock')
        return;

      const txs = message.result.data.value.block.data.txs;

      fs.writeFile('txs.json', JSON.stringify({
        height: message.result.data.value.block.header.height,
        txs: decodeTxs(txs)
      }, null, 2), err => {
        if (err)
          return console.error(err);

        console.log('Decoded transactions saved to txs.json');
      })
    })
    .on('error', err => {
      console.error(err);
      webSocket.close();
    })
    .on('unexpected-response', (req, res) => {
      console.error('Unexpected response, trying to reconnect...');
      webSocket.close();
    })
    .on('close', _ => {
      setTimeout(startGettingLatestBlock, RECONNECT_ATTEMPT_INTERVAL);
    });
};

export default startGettingLatestBlock;