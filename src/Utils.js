class Utils {
	/**
	 * Format a date or current date to a string format
	 * @private
	 * @param {Date} [date]
	 * @returns {string}
	 */
	formatDate(date = new Date()) {
		return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
	}
}

module.exports = Utils;
