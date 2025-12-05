const Schedule = require('../models/Schedule');

/*
  - Create today's schedules from any templates marked recurringDaily=true.
  - Copies bus, stop, routeName, departureTime
  - Sets date to today, status to 'scheduled', seatsBooked to 0
  - Skips if a schedule for the same bus/stop/departureTime already exists today
*/
async function ensureTodaySchedules() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const templates = await Schedule.find({ recurringDaily: true }).lean();

  for (const tpl of templates) {
    const exists = await Schedule.findOne({
      bus: tpl.bus,
      stop: tpl.stop,
      date: today,
      departureTime: tpl.departureTime
    }).lean();

    if (!exists) {
      await Schedule.create({
        bus: tpl.bus,
        stop: tpl.stop,
        routeName: tpl.routeName,
        departureTime: tpl.departureTime,
        date: today,
        seatsBooked: 0,
        status: 'scheduled',
        recurringDaily: true
      });
    }
  }
}

// Schedule the job to run shortly after midnight every day.
function startDailyScheduleJob() {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(0, 5, 0, 0); // 00:05 local time
  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }
  const initialDelay = nextRun.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      await ensureTodaySchedules();
    } catch (_) {}
    setInterval(() => {
      ensureTodaySchedules().catch(() => {});
    }, 24 * 60 * 60 * 1000);
  }, initialDelay);
}

module.exports = { ensureTodaySchedules, startDailyScheduleJob };