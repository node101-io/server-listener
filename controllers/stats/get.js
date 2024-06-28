const Cron = require('croner');
const diskusage = require('diskusage-ng');
const os = require('os');

const makeLogger = require('../../utils/logger');

const logger = makeLogger(__filename);

const getMemoryUsage = () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();

  return {
    total: totalMemory,
    used: totalMemory - freeMemory,
    available: freeMemory
  };
};

const getCPUInfo = () => {
  const cpus = os.cpus();

  let user = 0;
  let nice = 0;
  let sys = 0;
  let idle = 0;
  let irq = 0;
  let total = 0;

  for (const cpu in cpus) {
    if (!cpus.hasOwnProperty(cpu))
      continue;

    user += cpus[cpu].times.user;
    nice += cpus[cpu].times.nice;
    sys += cpus[cpu].times.sys;
    irq += cpus[cpu].times.irq;
    idle += cpus[cpu].times.idle;
  };

  total = user + nice + sys + idle + irq;

  return {
    idle: idle,
    total: total
  };
};

const getCpuUsage = callback => {
  const stats1 = getCPUInfo();
  const startIdle = stats1.idle;
  const startTotal = stats1.total;

  setTimeout(() => {
    const stats2 = getCPUInfo();
    const endIdle = stats2.idle;
    const endTotal = stats2.total;

    const idle = endIdle - startIdle;
    const total = endTotal - startTotal;
    const perc = idle / total;

    return callback({
      average_used: ((1 - perc) * 100).toFixed(2),
      cores: os.cpus().length
    });
  }, 1000);
};

const getDiskUsage = callback => {
  diskusage('/', (err, usage) => {
    if (err)
      return logger.error(err.message);

    return callback(null, {
      total: usage.total,
      used: usage.used,
      available: usage.available
    });
  });
};

let memoryUsage = {};
let cpuUsage = {};
let diskUsage = {};

Cron('*/5 * * * * *', () => {
  memoryUsage = getMemoryUsage();

  getCpuUsage(usage => {
    cpuUsage = usage;
  });

  getDiskUsage((err, usage) => {
    if (err)
      return logger.error(err);

    diskUsage = usage;
  });
});

module.exports = (req, res) => {
  return res.json({
    memory: memoryUsage,
    cpu: cpuUsage,
    disk: diskUsage
  });
};