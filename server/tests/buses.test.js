const request = require('supertest');

// Create mocks with proper chaining BEFORE requiring anything
const mockBusFind = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([
    { _id: 'b1', busNumber: 'B1', model: 'ModelX', driverName: 'John', capacity: 40 },
    { _id: 'b2', busNumber: 'B2', model: 'ModelY', driverName: 'Doe', capacity: 30 }
  ])
});

const mockStopFind = jest.fn().mockReturnValue({
  sort: jest.fn().mockResolvedValue([
    { _id: 'stop1', name: 'Stop1', zone: 1, fee: 10 },
    { _id: 'stop2', name: 'Stop2', zone: 2, fee: 15 }
  ])
});

const mockScheduleFind = jest.fn().mockReturnValue({
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
});

// Mock the modules
jest.mock('../models/Bus.js', () => {
  return class Bus {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static find = mockBusFind;
    static findById(id) { 
      return Promise.resolve({ _id: id, busNumber: 'B1', model: 'ModelX', capacity: 40 }); 
    }
    static create(data) { return Promise.resolve({ ...data, _id: 'bus_mock' }); }
    static findByIdAndUpdate(id, data) { return Promise.resolve({ _id: id, ...data }); }
    static findByIdAndDelete(id) { return Promise.resolve({ _id: id }); }
  };
});

jest.mock('../models/Stop.js', () => {
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

jest.mock('../models/Schedule.js', () => {
  return class Schedule {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static create(data) { return Promise.resolve({ ...data, _id: 'sched_mock' }); }
    static find = mockScheduleFind;
    static findOne() { return Promise.resolve(null); }
    static findByIdAndDelete(id) { return Promise.resolve({ _id: id }); }
    static deleteMany() { return Promise.resolve({ deletedCount: 0 }); }
  };
});

jest.mock('../config/db.js', () => ({ 
  connectDB: jest.fn(), 
  User: class User {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static create(data) { return Promise.resolve({ ...data, _id: 'u_mock' }); }
    static find() { return Promise.resolve([{ name: 'Alice', rollNo: 'R1' }]); }
    static findOne() { return Promise.resolve(null); }
  }
}));

jest.mock('../controllers/ors.js', () => ({
  getRouteBetween: jest.fn().mockResolvedValue({ features: [] })
}));

const app = require('../app');

describe('Buses API', () => {
  it('GET /api/buses should return a list of buses', async () => {
    const res = await request(app).get('/api/buses');
    
    if (res.statusCode === 500) {
      console.log('ERROR:', res.body);
    }
    
    expect(res.statusCode).toBe(200);
expect(res.body.success).toBeTruthy();
expect(Array.isArray(res.body.data)).toBe(true);
expect(res.body.count).toBeDefined();
expect(res.body.data[0].busNumber).toBe('B1');
  });

  it('POST /api/schedules assigns a bus schedule', async () => {
    const res = await request(app)
      .post('/api/schedules')
      .send({
        busId: 'b1',
        stopId: 'stop1',
        driverName: 'Ali',
        departureTime: '10:00',
        date: '2025-12-05'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data).toBeDefined();
  });
});
