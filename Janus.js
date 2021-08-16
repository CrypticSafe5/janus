const fs = require('fs');
const { EOL } = require('os');
const { v3: getUUID } = require('uuid');

/**
 * @typedef {Object} ChangeRecord
 * @property {string} id - A guid id of the record
 * @property {string} title
 * @property {Date} created
 * @property {string[]} bugs
 * @property {string[]} features
 * @property {string[]} maintenance
 */

const changeHash = {
	'Features Added:': 'features',
	'Bug Fixes:': 'bugs',
	'Maintenance:': 'maintenance'
};

/**
 * Write the records into the changelog file
 */
function updateChangelog() {

}

/**
 * Read a text and parse it into a list of records
 * @param {string} text
 * @returns {ChangeRecord[]}
 */
function parseLog(text) {
	const changelog = [];
	const records = text.split('[id]:').slice(1);
	for (const record of records) {
		let id;
		let created;
		let title;
		const changes = {
			maintenance: [],
			bugs: [],
			features: []
		};

		let section;
		const lines = record.split(EOL);
		for (let lineNumber = 0; lineNumber < lines.length; lineNumber++) {
			const line = lines[lineNumber];
			if (!line) continue;
			if (lineNumber === 0) {
				id = line;
				continue;
			}
			if (lineNumber === 1) {
				const titleChunks = line.split(' - ');
				title = titleChunks[0].slice(2);
				created = titleChunks[1];
				continue;
			}

			if (['Features Added:', 'Maintenance:', 'Bug Fixes:'].includes(line)) {
				section = line;
				continue;
			}

			changes[changeHash[section]].push(line.slice(2));
		}
		changelog.push({
			id,
			title,
			created,
			...changes
		});
	}
	return changelog;
}

function getFormattedDate(date = new Date()) {
	return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

class Janus {
	constructor(path = './changelog.md') {
		this._path = path;
		this._changelog = parseLog(fs.readFileSync(this._path, 'utf8'));
	}

	/**
	 * Search through the changelog for results that include 
	 * @param {string} searchString - Search string to find results of
	 * @returns {ChangeRecord[]}
	 */
	searchLogs(searchString) { }

	/**
	 * Fetch all records past a given date
	 * @param {Object} dateCaps
	 * @param {Date} [dateCaps.startDate] - Date to start pulling from
	 * @param {Date} [dateCaps.endDate] - Date to pull until
	 * @returns {ChangeRecord[]}
	 */
	getLogByDate(startDate, endDate) { }

	/**
	 * Get the parsed changelog
	 * @param {string} [id] - Get record(s) with this id
	 * @returns {ChangeRecord[]}
	 */
	getLog(id) {
		if (!id) return this._changelog;
		const output = [];
		for (let i = 0; i < this._changelog.length; i++) {
			const changeItem = this._changelog[i];
			if (id && id === changeItem.id) output.push(changeItem);
		}
	}

	/**
	 * Edit a particular entry of the changelog
	 * @param {ChangeRecord}
	 * @param {Date} created
	 * @returns {undefined}
	 */
	editEntry(record, created) {
		const newChangelog = [];
		for (let i = 0; i < this._changelog.length; i++) {
			if (this._changelog[i].id === record.id) {
				newChangelog.push({
					...record,
					created: getFormattedDate(created)
				});
				continue;
			}
			newChangelog.push(this._changelog[i]);
		}
		this._changelog = newChangelog;
	}

	/**
	 * Add a change record
	 * @param {ChangeRecord} record 
	 * @param {Date} [created] - Defaults to today's date
	 * @returns {undefined}
	 */
	createEntry(record, created) {
		this._changelog.push({
			...record,
			created: getFormattedDate(created),
			id: getUUID()
		});
	}

	/**
	 * Removes a record from the changelog
	 * @param {string} id
	 * @returns {undefined}
	 */
	deleteEntry(id) {
		const newChangelog = [];
		for (let i = 0; i < this._changelog.length; i++) {
			if (this._changelog[i].id !== id) newChangelog.push(this._changelog[i]);
		}
		this._changelog = newChangelog;
	}
}

module.exports = Janus;
