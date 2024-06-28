const fs = require('fs');
const WebSocket = require('ws');

const decodeTxs = require('./decodeTxs');
const json = require('./json');
const makeLogger = require('./logger');

const logger = makeLogger(__filename);

const RECONNECT_ATTEMPT_INTERVAL = 5 * 1000;
const WEBSOCKET_URL = 'http://localhost:26657/websocket';
const TXS_FILE_PATH = './data/txs.json';

if (!fs.existsSync(TXS_FILE_PATH))
  fs.writeFile(TXS_FILE_PATH, '', err => {
    if (err)
      return logger.error(err);

    logger.activity('txs.json created');
  });

const writeLatestBlockInfoToFile = () => {
  const webSocket = new WebSocket(WEBSOCKET_URL);

  webSocket
    .on('open', _ => {
      webSocket.send(json.stringify({
        jsonrpc: '2.0',
        method: 'subscribe',
        id: 0,
        params: {
          query: 'tm.event=\'NewBlock\''
        }
      }));
    })
    .on('message', message => {
      const data = json.jsonify(message)?.result?.data;

      if (data?.type != 'tendermint/event/NewBlock')
        return;

      const txs = data?.value?.block?.data?.txs;
      const height = data?.value?.block?.header?.height;

      if (!txs || !height)
        return;

      decodeTxs(txs, (err, decodedTxs) => {
        fs.writeFile(TXS_FILE_PATH, json.stringify({
          height: height,
          txs: decodedTxs
        }), err => {
          if (err)
            return logger.error(err);

          logger.activity('Latest block info saved to txs.json', { is_repeating: true });
        });
      });
    })
    .on('error', err => {
      logger.error(err, { is_repeating: true });
      webSocket.close();
    })
    .on('unexpected-response', (req, res) => {
      logger.error('Unexpected response', { is_repeating: true });
      webSocket.close();
    })
    .on('close', _ => {
      setTimeout(writeLatestBlockInfoToFile, RECONNECT_ATTEMPT_INTERVAL);
    });
};

module.exports = writeLatestBlockInfoToFile;