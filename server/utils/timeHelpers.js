/**
 * Convert time string to minutes since midnight
 * @param {string} timeStr - Time in HH:MM format
 * @returns {number} Minutes since midnight
 */
exports.timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  /**
   * Format time to 12-hour format with AM/PM
   * @param {string} timeStr - Time in HH:MM format
   * @returns {string} Formatted time
   */
  exports.formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  /**
   * Check if a date is today
   * @param {Date} date 
   * @returns {boolean}
   */
  exports.isToday = (date) => {
    const today = new Date();
    const checkDate = new Date(date);
    return checkDate.toDateString() === today.toDateString();
  };
  
  /**
   * Get today's date at midnight
   * @returns {Date}
   */
  exports.getTodayStart = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };