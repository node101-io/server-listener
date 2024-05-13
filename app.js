import fs from 'fs';
import WebSocket from 'ws';

import decodeTxs from './utils/decodeTxs.js';

const webSocket = new WebSocket('https://cosmos-rpc.onivalidator.com/websocket');

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
    const txs = JSON.parse(message).result.data?.value.block.data.txs;

    if (txs)
      fs.writeFile('txs.json', decodeTxs(txs), err => {
        if (err)
          return console.error(err);

        console.log('Decoded transactions saved to txs.json');
      });
  });

// const child_process = require('child_process');

// // list docker containers
// const getContainerIds = callback => {
//   child_process.exec('docker ps --all --quitet --filter name=klein-node', (err, stdout, stderr) => {
//     if (err || stderr)
//       return callback(err || stderr);

//     const containerIds = stdout.split('\n').filter(id => id.length > 0);
//     callback(null, containerIds);
//   });
// };

// const decodeRawTxs = (txs, callback) => {
//   child_process.exec(`docker exec -it ${containerId} /bin/bash -c "$DAEMON_NAME tx decode ${txs} --output=json"`, (err, stdout, stderr) => {
//     if (err || stderr)
//       return callback(err || stderr);

//     callback(null, stdout);
//   });
// };