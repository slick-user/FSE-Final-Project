const User = require('../models/User');
const Schedule = require('../models/Schedule');

/**
 * Reserve a seat for a user
 */
exports.reserveSeat = async (userId, scheduleId, seatNumber) => {
  // Find user and schedule
  const [user, schedule] = await Promise.all([
    User.findById(userId),
    Schedule.findById(scheduleId).populate('bus')
  ]);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!schedule) {
    throw new Error('Schedule not found');
  }
  
  // Check if seat number is valid
  if (seatNumber < 1 || seatNumber > schedule.bus.capacity) {
    throw new Error(`Seat number must be between 1 and ${schedule.bus.capacity}`);
  }
  
  // Check if user already has a reservation for this schedule
  const existingReservation = user.reservedSeats.find(
    r => r.schedule.equals(scheduleId) && r.status === 'reserved'
  );
  
  if (existingReservation) {
    throw new Error('You already have a reservation for this schedule');
  }
  
  // Check if seat is already taken by someone else
  const allUsers = await User.find({
    'reservedSeats.schedule': scheduleId,
    'reservedSeats.seatNumber': seatNumber,
    'reservedSeats.status': 'reserved'
  });
  
  if (allUsers.length > 0) {
    throw new Error('Seat already reserved by another user');
  }
  
  // Check if bus is full
  if (schedule.seatsBooked >= schedule.bus.capacity) {
    throw new Error('Bus is full');
  }
  
  // Create reservation
  user.reservedSeats.push({
    schedule: scheduleId,
    seatNumber,
    status: 'reserved'
  });
  
  schedule.seatsBooked += 1;
  
  // Save both documents
  await Promise.all([
    user.save(),
    schedule.save()
  ]);
  
  return {
    user,
    schedule,
    seatNumber
  };
};

/**
 * Cancel a reservation
 */
exports.cancelReservation = async (userId, scheduleId, seatNumber) => {
  const [user, schedule] = await Promise.all([
    User.findById(userId),
    Schedule.findById(scheduleId)
  ]);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  if (!schedule) {
    throw new Error('Schedule not found');
  }
  
  // Find the reservation
  const reservationIndex = user.reservedSeats.findIndex(
    r => r.schedule.equals(scheduleId) && 
         r.seatNumber === seatNumber && 
         r.status === 'reserved'
  );
  
  if (reservationIndex === -1) {
    throw new Error('Reservation not found');
  }
  
  // Update status to cancelled
  user.reservedSeats[reservationIndex].status = 'cancelled';
  
  // Decrement seats booked
  schedule.seatsBooked = Math.max(schedule.seatsBooked - 1, 0);
  
  await Promise.all([
    user.save(),
    schedule.save()
  ]);
  
  return {
    user,
    schedule
  };
};

/**
 * Get user's active reservations
 */
exports.getUserReservations = async (userId) => {
  const user = await User.findById(userId)
    .populate({
      path: 'reservedSeats.schedule',
      populate: { path: 'bus stop' }
    });
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Filter only active reservations
  const activeReservations = user.reservedSeats.filter(
    r => r.status === 'reserved'
  );
  
  return activeReservations;
};