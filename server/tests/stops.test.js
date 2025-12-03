const request = require('supertest');

const mockStopFind = jest.fn().mockReturnValue({
  sort: jest.fn().mockResolvedValue([
    { _id: 'stop1', name: 'Stop1', zone: 1, fee: 10 },
    { _id: 'stop2', name: 'Stop2', zone: 2, fee: 15 }
  ])
});

jest.mock('../config/stop.js', () => {
  return class Stop {
    constructor(data) { Object.assign(this, data); }
    static find = mockStopFind;
    static findById(id) {
      const names = { stop1: 'Stop1', stop2: 'Stop2' };
      return Promise.resolve({
        _id: id,
        name: names[id] || 'Unknown',
        zone: 1,
        fee: 10
      });
    }
    static create(data) { return Promise.resolve({ ...data, _id: 'stop_mock' }); }
  };
});

const app = require('../app');

describe('Stops API', () => {
  it('GET /api/stops should return all stops', async () => {
    const res = await request(app).get('/api/stops');
    
    if (res.statusCode === 500) {
      console.log('ERROR:', res.body);
    }
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe('Stop1');

  });

  it('GET /api/stops/:id should return a single stop', async () => {
    const res = await request(app).get('/api/stops/stop1');
    
    if (res.statusCode === 500) {
      console.log('ERROR:', res.body);
    }
    
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Stop1');

  });
});
