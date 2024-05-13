import notifyWhenNewNodeInstalled from './utils/notifyWhenNewNodeInstalled.js';
import notifyWhenSyncStatusChange from './utils/notifyWhenSyncStatusChange.js';
import writeLatestBlockInfoToFile from './utils/writeLatestBlockInfoToFile.js';

notifyWhenNewNodeInstalled();
notifyWhenSyncStatusChange();
writeLatestBlockInfoToFile();