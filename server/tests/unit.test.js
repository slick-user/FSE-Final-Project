const axios = require('axios');
const { getRouteBetween } = require('../controllers/ors');

const { selectBestSchedule, timeToMinutes, formatTime } = require('../controllers/maproute').helpers; 

jest.mock('axios');

describe('ORS - getRouteBetween', () => {
  it('returns data from ORS API', async () => {
    const fakeResponse = { features: [{ properties: { summary: { distance: 1000, duration: 600 } } }] };
    axios.post.mockResolvedValue({ data: fakeResponse });

    const start = { lat: 0, lng: 0 };
    const end = { lat: 1, lng: 1 };

    const result = await getRouteBetween(start, end);
    expect(result).toEqual(fakeResponse);
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      {
        coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
        radiuses: [50, 300]
      },
      expect.any(Object)
    );
  });

  it('throws if axios fails', async () => {
    axios.post.mockRejectedValue(new Error('Network error'));
    const start = { lat: 0, lng: 0 };
    const end = { lat: 1, lng: 1 };

    await expect(getRouteBetween(start, end)).rejects.toThrow('Network error');
  });
});

describe('maproute helpers', () => {

  describe('timeToMinutes', () => {
    it('converts "HH:MM" to total minutes since midnight', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('01:00')).toBe(60);
      expect(timeToMinutes('12:30')).toBe(750);
      expect(timeToMinutes('23:59')).toBe(1439);
    });
  });

  describe('formatTime', () => {
    it('formats "HH:MM" to 12-hour format with AM/PM', () => {
      expect(formatTime('00:00')).toBe('12:00 AM');
      expect(formatTime('01:05')).toBe('1:05 AM');
      expect(formatTime('12:00')).toBe('12:00 PM');
      expect(formatTime('15:30')).toBe('3:30 PM');
      expect(formatTime('23:59')).toBe('11:59 PM');
    });
  });

  describe('selectBestSchedule', () => {
    const schedules = [
      { departureTime: '08:00', routeName: 'A' },
      { departureTime: '10:00', routeName: 'B' },
      { departureTime: '12:00', routeName: 'C' },
      { departureTime: '14:00', routeName: 'D' }
    ];

    it('selects the next bus after requested time', () => {
      const { bestSchedule, isToday } = selectBestSchedule(schedules, 9 * 60); // 09:00
      expect(bestSchedule.routeName).toBe('B');
      expect(isToday).toBe(true);
    });

    it('selects closest past bus if no future bus', () => {
      const { bestSchedule, isToday } = selectBestSchedule(schedules, 15 * 60); // 15:00
      expect(bestSchedule.routeName).toBe('D');
      expect(isToday).toBe(false);
    });

    it('selects first bus if requested time matches first bus', () => {
      const { bestSchedule, isToday } = selectBestSchedule(schedules, 8 * 60); // 08:00
      expect(bestSchedule.routeName).toBe('A');
      expect(isToday).toBe(true);
    });

    it('selects last bus if requested time before all buses', () => {
      const { bestSchedule, isToday } = selectBestSchedule(schedules, 7 * 60); // 07:00
      expect(bestSchedule.routeName).toBe('A');
      expect(isToday).toBe(true);
    });
  });

});

