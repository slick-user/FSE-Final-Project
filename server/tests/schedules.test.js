const request = require('supertest');

// Mock Schedule model
const mockScheduleFind = jest.fn().mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue([
        {
            _id: 'sched1',
            bus: { _id: 'b1', busNumber: 'B1', model: 'ModelX', capacity: 40 },
            stop: { _id: 'stop1', name: 'Stop1', zone: 'Islamabad' },
            routeName: 'Route 1',
            departureTime: '08:00',
            date: new Date('2025-12-05'),
            status: 'scheduled',
            seatsBooked: 0
        }
    ])
});

const mockScheduleFindById = jest.fn((id) => ({
    populate: jest.fn().mockResolvedValue({
        _id: id,
        bus: { _id: 'b1', busNumber: 'B1', capacity: 40 },
        stop: { _id: 'stop1', name: 'Stop1', zone: 'Islamabad' },
        departureTime: '08:00',
        date: new Date('2025-12-05'),
        status: 'scheduled'
    })
}));

const mockScheduleFindOne = jest.fn().mockResolvedValue(null);

const mockScheduleCreate = jest.fn((data) => {
    const schedule = {
        ...data,
        _id: 'new_sched',
        populate: jest.fn().mockResolvedValue({
            ...data,
            _id: 'new_sched',
            bus: { _id: data.bus, busNumber: 'B1', capacity: 40 },
            stop: { _id: data.stop, name: 'Stop1', zone: 'Islamabad' }
        })
    };
    return Promise.resolve(schedule);
});

const mockScheduleFindByIdAndUpdate = jest.fn((id, data) => ({
    populate: jest.fn().mockResolvedValue({
        _id: id,
        ...data,
        bus: { _id: 'b1', busNumber: 'B1' },
        stop: { _id: 'stop1', name: 'Stop1' }
    })
}));

const mockScheduleFindByIdAndDelete = jest.fn((id) =>
    Promise.resolve({ _id: id })
);

jest.mock('../models/Schedule.js', () => {
    return class Schedule {
        constructor(data) { Object.assign(this, data); }
        static find = mockScheduleFind;
        static findById = mockScheduleFindById;
        static findOne = mockScheduleFindOne;
        static create = mockScheduleCreate;
        static findByIdAndUpdate = mockScheduleFindByIdAndUpdate;
        static findByIdAndDelete = mockScheduleFindByIdAndDelete;
    };
});

jest.mock('../models/Bus.js', () => {
    return class Bus {
        static findById(id) {
            return Promise.resolve({ _id: id, busNumber: 'B1', capacity: 40 });
        }
    };
});

jest.mock('../models/Stop.js', () => {
    return class Stop {
        static findById(id) {
            return Promise.resolve({ _id: id, name: 'Stop1', zone: 'Islamabad' });
        }
    };
});

jest.mock('../config/db.js', () => ({
    connectDB: jest.fn()
}));

jest.mock('../utils/timeHelpers.js', () => ({
    getTodayStart: jest.fn(() => new Date('2025-12-04'))
}));

const app = require('../app');

describe('Schedules API', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/schedules', () => {
        it('should return all schedules', async () => {
            const res = await request(app).get('/api/schedules');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBeTruthy();
            expect(Array.isArray(res.body.data)).toBeTruthy();
            expect(res.body.count).toBeDefined();
        });

        it('should filter schedules by date', async () => {
            const res = await request(app)
                .get('/api/schedules')
                .query({ date: '2025-12-05' });

            expect(res.statusCode).toBe(200);
            expect(mockScheduleFind).toHaveBeenCalled();
        });

        it('should filter schedules by status', async () => {
            const res = await request(app)
                .get('/api/schedules')
                .query({ status: 'scheduled' });

            expect(res.statusCode).toBe(200);
        });

        it('should filter schedules by busId', async () => {
            const res = await request(app)
                .get('/api/schedules')
                .query({ busId: 'b1' });

            expect(res.statusCode).toBe(200);
        });
    });

    describe('GET /api/schedules/:id', () => {
        it('should return a single schedule', async () => {
            const res = await request(app).get('/api/schedules/sched1');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBeTruthy();
            expect(res.body.data).toBeDefined();
            expect(res.body.data._id).toBe('sched1');
        });

        it('should return 404 for non-existent schedule', async () => {
            mockScheduleFindById.mockReturnValueOnce({
                populate: jest.fn().mockResolvedValue(null)
            });

            const res = await request(app).get('/api/schedules/nonexistent');

            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBeFalsy();
        });
    });

    describe('POST /api/schedules', () => {
        it('should create a new schedule', async () => {
            const res = await request(app)
                .post('/api/schedules')
                .send({
                    busId: 'b1',
                    stopId: 'stop1',
                    date: '2025-12-05',
                    departureTime: '08:00',
                    routeName: 'Test Route'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBeTruthy();
            expect(res.body.data).toBeDefined();
            expect(mockScheduleCreate).toHaveBeenCalled();
        });

        it('should prevent scheduling conflicts', async () => {
            mockScheduleFindOne.mockResolvedValueOnce({
                _id: 'existing',
                bus: 'b1',
                date: new Date('2025-12-05'),
                departureTime: '08:00'
            });

            const res = await request(app)
                .post('/api/schedules')
                .send({
                    busId: 'b1',
                    stopId: 'stop1',
                    date: '2025-12-05',
                    departureTime: '08:00'
                });

            expect(res.statusCode).toBe(409);
            expect(res.body.error).toContain('already scheduled');
        });

        it('should return 404 for invalid bus', async () => {
            const Bus = require('../models/Bus.js');
            Bus.findById = jest.fn().mockResolvedValue(null);

            const res = await request(app)
                .post('/api/schedules')
                .send({
                    busId: 'invalid',
                    stopId: 'stop1',
                    date: '2025-12-05',
                    departureTime: '08:00'
                });

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toContain('Bus not found');
        });
    });

    describe('PUT /api/schedules/:id', () => {
        it('should update a schedule', async () => {
            const res = await request(app)
                .put('/api/schedules/sched1')
                .send({
                    status: 'running'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBeTruthy();
            expect(mockScheduleFindByIdAndUpdate).toHaveBeenCalled();
        });

        it('should return 404 for non-existent schedule', async () => {
            mockScheduleFindByIdAndUpdate.mockReturnValueOnce({
                populate: jest.fn().mockResolvedValue(null)
            });

            const res = await request(app)
                .put('/api/schedules/nonexistent')
                .send({ status: 'completed' });

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/schedules/:id', () => {
        it('should delete a schedule', async () => {
            const res = await request(app).delete('/api/schedules/sched1');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBeTruthy();
            expect(mockScheduleFindByIdAndDelete).toHaveBeenCalledWith('sched1');
        });

        it('should return 404 for non-existent schedule', async () => {
            mockScheduleFindByIdAndDelete.mockResolvedValueOnce(null);

            const res = await request(app).delete('/api/schedules/nonexistent');

            expect(res.statusCode).toBe(404);
        });
    });
});
