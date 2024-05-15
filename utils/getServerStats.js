const Cron = require('croner');
const diskusage = require('diskusage-ng');
const os = require('os');

const makeLogger = require('./logger');

const logger = makeLogger(__filename);

const getCpuTimes = () => {
  return os.cpus().map(cpu => {
    return {
      idle: cpu.times.idle,
      total: Object.values(cpu.times).reduce((acc, time) => acc + time, 0)
    };
  });
};

let memoryUsage = 0;
let cpuUsage = 0;
let diskUsage = 0;
let previousCpuTimes = getCpuTimes();

Cron('*/5 * * * * *', () => {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  memoryUsage = {
    total: totalMemory,
    used: totalMemory - freeMemory,
    available: freeMemory
  };

  const currentCpuTimes = getCpuTimes();
  const totalUsages = currentCpuTimes.reduce((acc, current, index) => {
    const previous = previousCpuTimes[index];
    const idleDiff = current.idle - previous.idle;
    const totalDiff = current.total - previous.total;
    const usage = 1 - idleDiff / totalDiff;
    return acc + usage;
  }, 0);
  previousCpuTimes = currentCpuTimes;
  cpuUsage = {
    average: ((totalUsages / currentCpuTimes.length) * 100).toFixed(2),
    cores: currentCpuTimes.length
  };

  diskusage('/', (err, usage) => {
    if (err)
      return logger.error(err.message);

    diskUsage = {
      total: usage.total,
      used: usage.used,
      available: usage.available
    };
  });
});

module.exports = () => {
  return {
    memory: memoryUsage,
    cpu: cpuUsage,
    disk: diskUsage
  };
};