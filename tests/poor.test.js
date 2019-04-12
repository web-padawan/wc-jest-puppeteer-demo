const {
  POOR_DEVICE,
  getSimplePagePerformanceMetrics,
  getDetailedPagePerformanceMetrics
} = require('./helpers/performance.js');

describe('Poor', () => {
  it('should have be interactive in less than 3 seconds on poor device', async () => {
    const metrics = await getSimplePagePerformanceMetrics(
      page,
      'http://localhost:3000',
      POOR_DEVICE
    );
    expect(metrics).toBeInteractiveUnder(3000);
  });

  it('should have its first meaningful paint in less than 1 second on poor device', async () => {
    const metrics = await getDetailedPagePerformanceMetrics(
      page,
      'http://localhost:3000',
      POOR_DEVICE
    );
    expect(metrics).hasItsFirstMeaningfulPaintUnder(500);
  });
});
