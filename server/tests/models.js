module.exports = {
  User: class User {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    toObject() {
      const obj = { ...this };
      delete obj.toObject;
      delete obj.save;
      return obj;
    }
    static create(data) {
      const user = { ...data, _id: 'u_mock' };
      user.toObject = function () {
        const obj = { ...this };
        delete obj.toObject;
        return obj;
      };
      return Promise.resolve(user);
    }
    static find() { return Promise.resolve([{ name: 'Alice', rollNo: 'R1' }]); }
    static findOne(filter) {
      if (filter.rollNo === 'R1') {
        return {
          select: jest.fn().mockResolvedValue({
            _id: 'u1',
            name: 'Alice',
            rollNo: 'R1',
            password: '$2b$10$CwTycUXWue0Thq9StjUM0uJ8/jHJmEgppT4h9V1iSWP2LZzZPvRKG',
            role: 'student',
            toObject() {
              return {
                _id: 'u1',
                name: 'Alice',
                rollNo: 'R1',
                role: 'student'
              };
            },
            save: jest.fn().mockResolvedValue(true)
          })
        };
      }
      return { select: jest.fn().mockResolvedValue(null) };
    }
  },

  Bus: class Bus {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static find() {
      return Promise.resolve([
        { _id: 'b1', busNumber: 'B1', model: 'ModelX', driverName: 'John', capacity: 40 },
        { _id: 'b2', busNumber: 'B2', model: 'ModelY', driverName: 'Doe', capacity: 30 }
      ]);
    }
    static findById(id) {
      return Promise.resolve({ _id: id, busNumber: 'B1', model: 'ModelX' });
    }
    static create(data) { return Promise.resolve({ ...data, _id: 'bus_mock' }); }
    static findByIdAndUpdate(id, data) { return Promise.resolve({ _id: id, ...data }); }
    static findByIdAndDelete(id) { return Promise.resolve({ _id: id }); }
  },

  Stop: class Stop {
    constructor(data) { Object.assign(this, data); }
    static find() {
      return Promise.resolve([
        { _id: 'stop1', name: 'Stop1', zone: 1, fee: 10 },
        { _id: 'stop2', name: 'Stop2', zone: 2, fee: 15 }
      ]);
    }
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
  },

  Schedule: class Schedule {
    constructor(data) { Object.assign(this, data); }
    save() { return Promise.resolve(this); }
    static create(data) { return Promise.resolve({ ...data, _id: 'sched_mock' }); }
    static find() { return Promise.resolve([]); }
    static findOne() { return Promise.resolve(null); }
    static findByIdAndDelete(id) { return Promise.resolve({ _id: id }); }
    static deleteMany() { return Promise.resolve({ deletedCount: 0 }); }
  }
};
