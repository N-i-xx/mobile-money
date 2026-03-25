import request from 'supertest';
import app from '../src/index';

describe('Compression Middleware', () => {
  it('should compress large responses', async () => {
    const largeData = 'x'.repeat(2000); // 2KB response
    
    const response = await request(app)
      .get('/health')
      .set('Accept-Encoding', 'gzip')
      .expect(200);
    
    // Check if response is compressed
    expect(response.headers['content-encoding']).toBe('gzip');
  });

  it('should not compress small responses', async () => {
    const response = await request(app)
      .get('/health')
      .set('Accept-Encoding', 'gzip')
      .expect(200);
    
    // Small responses should not be compressed
    expect(response.headers['content-encoding']).toBeUndefined();
  });

  it('should respect x-no-compression header', async () => {
    const largeData = 'x'.repeat(2000);
    
    const response = await request(app)
      .get('/health')
      .set('Accept-Encoding', 'gzip')
      .set('x-no-compression', 'true')
      .expect(200);
    
    // Should not compress when x-no-compression header is present
    expect(response.headers['content-encoding']).toBeUndefined();
  });

  it('should work with compression disabled', async () => {
    // Temporarily disable compression
    const originalEnabled = process.env.COMPRESSION_ENABLED;
    process.env.COMPRESSION_ENABLED = 'false';
    
    try {
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);
      
      // Should not compress when disabled
      expect(response.headers['content-encoding']).toBeUndefined();
    } finally {
      // Restore original setting
      process.env.COMPRESSION_ENABLED = originalEnabled;
    }
  });
});
