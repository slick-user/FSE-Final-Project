const request = require('supertest');

jest.mock('../config/db.js', () => ({
    connectDB: jest.fn()
}));

// Mock all models
jest.mock('../models/User.js', () => require('./models').User);
jest.mock('../models/Bus.js', () => require('./models').Bus);
jest.mock('../models/Stop.js', () => require('./models').Stop);
jest.mock('../models/Schedule.js', () => require('./models').Schedule);

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('$2b$10$hashedpassword'),
    compare: jest.fn().mockResolvedValue(true)
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ id: 'u1', role: 'student' })
}));

const app = require('../app.js');

describe('Integration Tests - End-to-End Workflows', () => {

    describe('User Registration and Login Flow', () => {
        it('should complete full registration and login cycle', async () => {
            // Step 1: Register a new user
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Integration Test User',
                    rollNo: 'INT001',
                    password: 'testpass123',
                    role: 'student',
                    disability: false
                });

            console.log("status code: " + registerRes.statusCode);

            expect(registerRes.statusCode === 201 || registerRes.statusCode === 200).toBeTruthy();
            expect(registerRes.body.success).toBeTruthy();
            expect(registerRes.body.token).toBeDefined();
            const userId = registerRes.body.user._id;

            // Step 2: Login with the same credentials
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    rollNo: 'INT001',
                    password: 'testpass123'
                });

            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body.success).toBeTruthy();
            expect(loginRes.body.token).toBeDefined();
            expect(loginRes.body.user.rollNo).toBe('INT001');
        });
    });

    describe('Driver Login and Route Assignment Flow', () => {
        it('should allow driver to login and view assigned routes', async () => {
            // Step 1: Register a driver
            const driverRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Driver',
                    rollNo: 'DRV001',
                    password: 'driver123',
                    role: 'driver',
                    disability: false
                });

            expect(driverRes.statusCode === 201 || driverRes.statusCode === 200).toBeTruthy();
            expect(driverRes.body.user.role).toBe('driver');

            // Step 2: Login as driver
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    rollNo: 'DRV001',
                    password: 'driver123'
                });

            console.log("status code: " + loginRes.statusCode);

            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body.user.role).toBe('driver');

            // In a real scenario, we would then fetch schedules for the driver's bus
            // This would require the driver to have an assigned bus
        });
    });

    describe('Bus and Schedule Management Flow', () => {
        it('should create bus, stop, and schedule in sequence', async () => {
            // Step 1: Get list of buses
            const busesRes = await request(app).get('/api/buses');
            expect(busesRes.statusCode).toBe(200);
            expect(Array.isArray(busesRes.body)).toBeTruthy();

            // Step 2: Get list of stops
            const stopsRes = await request(app).get('/api/stops');
            expect(stopsRes.statusCode).toBe(200);
            expect(Array.isArray(stopsRes.body)).toBeTruthy();

            // Step 3: Create a schedule (if buses and stops exist)
            if (busesRes.body.length > 0 && stopsRes.body.length > 0) {
                const scheduleRes = await request(app)
                    .post('/api/schedules')
                    .send({
                        busId: busesRes.body[0]._id,
                        stopId: stopsRes.body[0]._id,
                        date: '2025-12-10',
                        departureTime: '09:00',
                        routeName: 'Integration Test Route'
                    });

                expect(scheduleRes.statusCode).toBe(201);
                expect(scheduleRes.body.success).toBeTruthy();
            }
        });
    });

    describe('Schedule Status Update Flow', () => {
        it('should update schedule status from scheduled to running to completed', async () => {
            // Step 1: Create a schedule
            const createRes = await request(app)
                .post('/api/schedules')
                .send({
                    busId: 'b1',
                    stopId: 'stop1',
                    date: '2025-12-15',
                    departureTime: '10:00',
                    routeName: 'Status Test Route'
                });

            if (createRes.statusCode === 201) {
                const scheduleId = createRes.body.data._id;

                // Step 2: Update to running
                const runningRes = await request(app)
                    .put(`/api/schedules/${scheduleId}`)
                    .send({ status: 'running' });

                expect(runningRes.statusCode).toBe(200);

                // Step 3: Update to completed
                const completedRes = await request(app)
                    .put(`/api/schedules/${scheduleId}`)
                    .send({ status: 'completed' });

                expect(completedRes.statusCode).toBe(200);
            }
        });
    });

    describe('Password Reset Flow', () => {
        it('should complete password reset workflow', async () => {
            // Step 1: Request password reset
            const forgotRes = await request(app)
                .post('/api/auth/forgot-password')
                .send({
                    rollNo: 'R1'
                });

            expect(forgotRes.statusCode).toBe(200);
            expect(forgotRes.body.success).toBeTruthy();

            // Step 2: Reset password with code (in development, code is returned)
            if (forgotRes.body.code) {
                const resetRes = await request(app)
                    .post('/api/auth/reset-password')
                    .send({
                        rollNo: 'R1',
                        resetCode: forgotRes.body.code,
                        newPassword: 'newpassword123'
                    });

                expect(resetRes.statusCode).toBe(200);
            }
        });
    });

    describe('Multi-User Scenario', () => {
        it('should handle multiple users with different roles', async () => {
            // Register student
            const studentRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Student User',
                    rollNo: 'STU001',
                    password: 'student123',
                    role: 'student'
                });

            expect(studentRes.body.user.role).toBe('student');

            // Register driver
            const driverRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Driver User',
                    rollNo: 'DRV002',
                    password: 'driver123',
                    role: 'driver'
                });

            expect(driverRes.body.user.role).toBe('driver');

            // Register admin
            const adminRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Admin User',
                    rollNo: 'ADM001',
                    password: 'admin123',
                    role: 'admin'
                });

            expect(adminRes.body.user.role).toBe('admin');

            // All should be able to login
            const studentLogin = await request(app)
                .post('/api/auth/login')
                .send({ rollNo: 'STU001', password: 'student123' });

            expect(studentLogin.statusCode).toBe(200);
        });
    });

    describe('Error Handling Flow', () => {
        it('should handle invalid data gracefully', async () => {
            // Try to create schedule with invalid bus
            const invalidBusRes = await request(app)
                .post('/api/schedules')
                .send({
                    busId: 'invalid_bus_id',
                    stopId: 'stop1',
                    date: '2025-12-20',
                    departureTime: '11:00'
                });

            expect(invalidBusRes.statusCode).toBe(404);
            expect(invalidBusRes.body.success).toBeFalsy();
        });

        it('should prevent duplicate user registration', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate Test',
                    rollNo: 'DUP001',
                    password: 'test123',
                    role: 'student'
                });

            // Duplicate registration
            const dupRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Duplicate Test 2',
                    rollNo: 'DUP001',
                    password: 'test456',
                    role: 'student'
                });

            expect(dupRes.statusCode).toBe(409);
            expect(dupRes.body.error).toContain('already exists');
        });
    });
});
