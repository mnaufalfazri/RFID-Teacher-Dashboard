import moment from 'moment-timezone';

// Set default timezone to Asia/Jakarta (GMT+7)
const TIMEZONE = 'Asia/Jakarta';

/**
 * Get current date and time in Jakarta timezone
 * @returns {Date} Current date in Jakarta timezone
 */
export const getCurrentTime = () => {
  return moment().tz(TIMEZONE).toDate();
};

/**
 * Convert any date to Jakarta timezone
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date in Jakarta timezone
 */
export const toJakartaTime = (date) => {
  return moment(date).tz(TIMEZONE).toDate();
};

/**
 * Format date for display in Jakarta timezone
 * @param {Date|string} date - Date to format
 * @param {string} format - Moment.js format string
 * @returns {string} Formatted date string
 */
export const formatJakartaTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).tz(TIMEZONE).format(format);
};

/**
 * Get start of day in Jakarta timezone
 * @param {Date|string} date - Date to get start of day
 * @returns {Date} Start of day in Jakarta timezone
 */
export const getStartOfDay = (date) => {
  return moment(date).tz(TIMEZONE).startOf('day').toDate();
};

/**
 * Get end of day in Jakarta timezone
 * @param {Date|string} date - Date to get end of day
 * @returns {Date} End of day in Jakarta timezone
 */
export const getEndOfDay = (date) => {
  return moment(date).tz(TIMEZONE).endOf('day').toDate();
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {Date|string} date - Date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  return moment(date).tz(TIMEZONE).format('YYYY-MM-DD');
};

/**
 * Format time for display (HH:mm:ss)
 * @param {Date|string} date - Date to format
 * @returns {string} Time string in HH:mm:ss format
 */
export const formatTimeForDisplay = (date) => {
  return moment(date).tz(TIMEZONE).format('HH:mm:ss');
};

/**
 * Format time for display (hh:mm a)
 * @param {Date|string} date - Date to format
 * @returns {string} Time string in hh:mm a format
 */
export const formatTime12Hour = (date) => {
  return moment(date).tz(TIMEZONE).format('hh:mm a');
};

/**
 * Format date for display (MMM dd, yyyy)
 * @param {Date|string} date - Date to format
 * @returns {string} Date string in MMM dd, yyyy format
 */
export const formatDateForDisplay = (date) => {
  return moment(date).tz(TIMEZONE).format('MMM DD, YYYY');
};

export { TIMEZONE };