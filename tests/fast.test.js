const {
  FAST_DEVICE,
  getSimplePagePerformanceMetrics,
  getDetailedPagePerformanceMetrics
} = require('./helpers/performance.js');

describe('Fast', () => {
  it('should have be interactive in less than 2 seconds on fast device', async () => {
    const metrics = await getSimplePagePerformanceMetrics(
      page,
      'http://localhost:3000',
      FAST_DEVICE
    );
    expect(metrics).toBeInteractiveUnder(2000);
  });

  it('should have its first meaningful paint in less than 1 second on fast device', async () => {
    const metrics = await getDetailedPagePerformanceMetrics(
      page,
      'http://localhost:3000',
      FAST_DEVICE
    );
    expect(metrics).hasItsFirstMeaningfulPaintUnder(500);
  });
});
