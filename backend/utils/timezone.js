const moment = require('moment-timezone');

// Set default timezone to Asia/Jakarta (GMT+7)
const TIMEZONE = 'Asia/Jakarta';

/**
 * Get current date and time in Jakarta timezone
 * @returns {Date} Current date in Jakarta timezone
 */
const getCurrentTime = () => {
  return moment().tz(TIMEZONE).toDate();
};

/**
 * Convert any date to Jakarta timezone
 * @param {Date|string} date - Date to convert
 * @returns {Date} Date in Jakarta timezone
 */
const toJakartaTime = (date) => {
  return moment(date).tz(TIMEZONE).toDate();
};

/**
 * Get start of day in Jakarta timezone
 * @param {Date|string} date - Date to get start of day
 * @returns {Date} Start of day in Jakarta timezone
 */
const getStartOfDay = (date) => {
  return moment(date).tz(TIMEZONE).startOf('day').toDate();
};

/**
 * Get end of day in Jakarta timezone
 * @param {Date|string} date - Date to get end of day
 * @returns {Date} End of day in Jakarta timezone
 */
const getEndOfDay = (date) => {
  return moment(date).tz(TIMEZONE).endOf('day').toDate();
};

/**
 * Format date to ISO string in Jakarta timezone
 * @param {Date|string} date - Date to format
 * @returns {string} ISO string in Jakarta timezone
 */
const toISOString = (date) => {
  return moment(date).tz(TIMEZONE).toISOString();
};

/**
 * Get next day in Jakarta timezone
 * @param {Date|string} date - Base date
 * @returns {Date} Next day in Jakarta timezone
 */
const getNextDay = (date) => {
  return moment(date).tz(TIMEZONE).add(1, 'day').startOf('day').toDate();
};

module.exports = {
  getCurrentTime,
  toJakartaTime,
  getStartOfDay,
  getEndOfDay,
  toISOString,
  getNextDay,
  TIMEZONE
};