const {
  MEDIUM_DEVICE,
  getSimplePagePerformanceMetrics,
  getDetailedPagePerformanceMetrics
} = require('./helpers/performance.js');

describe('Medium', () => {
  it('should have be interactive in less than 2 seconds on medium device', async () => {
    const metrics = await getSimplePagePerformanceMetrics(
      page,
      'http://localhost:3000',
      MEDIUM_DEVICE
    );
    expect(metrics).toBeInteractiveUnder(2000);
  });

  it('should have its first meaningful paint in less than 1 second on medium device', async () => {
    const metrics = await getDetailedPagePerformanceMetrics(
      page,
      'http://localhost:3000',
      MEDIUM_DEVICE
    );
    expect(metrics).hasItsFirstMeaningfulPaintUnder(500);
  });
});
