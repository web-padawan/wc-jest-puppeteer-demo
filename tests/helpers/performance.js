const { printExpected, printReceived } = require('jest-matcher-utils');
const ms = require('ms');

const POOR_DEVICE = 'POOR_DEVICE';
const MEDIUM_DEVICE = 'MEDIUM_DEVICE';
const FAST_DEVICE = 'FAST_DEVICE';

exports.POOR_DEVICE = POOR_DEVICE;
exports.MEDIUM_DEVICE = MEDIUM_DEVICE;
exports.FAST_DEVICE = FAST_DEVICE;

const emulateDevice = async (client, deviceType) => {
  switch (deviceType) {
    case POOR_DEVICE:
      await client.send('Network.enable');

      // Simulate slow network
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 200,
        downloadThroughput: (768 * 1024) / 8,
        uploadThroughput: (330 * 1024) / 8
      });

      // Simulate poor CPU
      await client.send('Emulation.setCPUThrottlingRate', { rate: 6 });
      break;
    case MEDIUM_DEVICE:
      await client.send('Network.enable');

      // Simulate medium network
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 200,
        downloadThroughput: (768 * 1024) / 8,
        uploadThroughput: (330 * 1024) / 8
      });

      // Simulate medium CPU
      await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      break;
    case FAST_DEVICE:
      await client.send('Network.enable');

      // Simulate fast network but still in "real" conditions
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 28,
        downloadThroughput: (5 * 1024 * 1024) / 8,
        uploadThroughput: (1024 * 1024) / 8
      });
      break;
    default:
      // eslint-disable-next-line no-console
      console.error(`Profile ${deviceType} is not available`);
  }
};

const extractDataFromPerformanceTiming = (timing, dataNames) => {
  const { navigationStart } = timing;

  return dataNames.reduce((acc, name) => {
    acc[name] = timing[name] - navigationStart;
    return acc;
  }, {});
};

exports.getSimplePagePerformanceMetrics = async (page, url, deviceType) => {
  const client = await page.target().createCDPSession();
  if (deviceType) {
    await emulateDevice(client, deviceType);
  }
  await client.send('Performance.enable');

  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const performanceTiming = JSON.parse(
    await page.evaluate(() => JSON.stringify(window.performance.timing))
  );

  // Here are some of the metrics we can get
  return extractDataFromPerformanceTiming(performanceTiming, [
    'requestStart',
    'responseStart',
    'responseEnd',
    'domLoading',
    'domInteractive',
    'domContentLoadedEventStart',
    'domContentLoadedEventEnd',
    'domComplete',
    'loadEventStart',
    'loadEventEnd'
  ]);
};

const getTimeFromPerformanceMetrics = (metrics, name) =>
  metrics.metrics.find(x => x.name === name).value * 1000;

const extractDataFromPerformanceMetrics = (metrics, dataNames) => {
  const navigationStart = getTimeFromPerformanceMetrics(
    metrics,
    'NavigationStart'
  );

  return dataNames.reduce((acc, name) => {
    acc[name] = getTimeFromPerformanceMetrics(metrics, name) - navigationStart;

    return acc;
  }, {});
};

exports.getDetailedPagePerformanceMetrics = async (
  page,
  url,
  deviceType = FAST_DEVICE
) => {
  const client = await page.target().createCDPSession();
  await emulateDevice(client, deviceType);
  await client.send('Performance.enable');
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const performanceMetrics = await client.send('Performance.getMetrics');
  return extractDataFromPerformanceMetrics(
    performanceMetrics,
    // Here are some of the metrics we can get
    [
      'DomContentLoaded',
      'FirstMeaningfulPaint',
      'LayoutDuration',
      'NavigationStart',
      'RecalcStyleDuration',
      'ScriptDuration',
      'TaskDuration'
    ]
  );
};

expect.extend({
  toBeInteractiveUnder(metrics, time) {
    const milliseconds = typeof time === 'number' ? time : ms(time);
    return {
      pass: metrics.domInteractive <= milliseconds,
      message() {
        return `Expected page to be interactive under ${printExpected(
          `${ms(milliseconds)}`
        )}. It was interactive in ${printReceived(
          `${ms(metrics.domInteractive)}`
        )}`;
      }
    };
  }
});

expect.extend({
  hasItsFirstMeaningfulPaintUnder(metrics, time) {
    const milliseconds = typeof time === 'number' ? time : ms(time);
    return {
      pass: metrics.FirstMeaningfulPaint <= milliseconds,
      message() {
        return `Expected page to have its first meaningful paint under ${printExpected(
          `${ms(milliseconds)}`
        )}. It has its first meaningful paint after ${printReceived(
          `${ms(metrics.domInteractive)}`
        )}`;
      }
    };
  }
});
