const fs = require('fs');
const { EOL } = require('os');
const { v3: getUUID } = require('uuid');
const Utils = require('./Utils');

/**
 * @typedef {Object} ChangeRecord
 * @property {string} id - A guid id of the record
 * @property {string} title
 * @property {Date} created
 * @property {string[]} bugs
 * @property {string[]} features
 * @property {string[]} maintenance
 */

class Janus extends Utils {
	constructor(path = './CHANGELOG.md') {
		super();
		this._path = path;
		this._changelog = [];
		this._changeHash = [
			['Features Added:', 'features'],
			['Bug Fixes:', 'bugs'],
			['Maintenance:', 'maintenance']
		];

		const rawText = fs.readFileSync(this._path, 'utf8');
		const records = rawText.split('[id]:').slice(1);
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
					const [month, date, year] = titleChunks[1].split('/');
					created = new Date(year, (month - 1), date);
					continue;
				}

				if (this._changeHash.find(([e]) => line === e)) {
					section = line;
					continue;
				}

				changes[this._changeHash.find(([e]) => e === section)[1]].push(line.slice(2));
			}
			this._changelog.push({
				id,
				title,
				created,
				...changes
			});
		}
	}

	/**
	 * Write the records into the changelog file
	 * @private
	 * @returns {undefined}
	 */
	writeChangelog() {
		const sortedLogs = [...this._changelog].sort((a, b) => (a.created < b.created) ? 1 : -1);
		let logs = '';
		for (const e of sortedLogs) {
			logs += `[id]:${e.id}${EOL}`;
			logs += `# ${e.title} - ${(e.created.getMonth() + 1)}/${e.created.getDate()}/${e.created.getFullYear()}${EOL}${EOL}`;

			this._changeHash.forEach(([_, type]) => {
				if (e[type].length) {
					const title = this._changeHash.find(([_, e1]) => e1 === type)[0];
					logs += `${title}${EOL}`;
					e[type].forEach((entry) => logs += `- ${entry}${EOL}`);
					logs += EOL;
				}
			});
		}
		fs.writeFileSync(this._path, logs);
	}

	// TODO: Write getEntry()
	/**
	 * Fetch all records with the date parameters
	 * @param {Object} search
	 * @param {string} [search.id] - Id to search by
	 * @param {string} [search.contains] - String to search the contents of updates by
	 * @param {Date} [search.startDate] - Date to start pulling from
	 * @param {Date} [search.endDate] - Date to pull until
	 * @returns {ChangeRecord[]}
	 */
	getEntry(search) { }

	/**
	 * Edit a particular entry of the changelog
	 * @param {string} targetId
	 * @param {ChangeRecord} record
	 * @returns {undefined}
	 */
	editEntry(targetId, record) {
		const newChangelog = this._changelog.map((e) => (e.id === targetId) ? { ...e, ...record } : e);
		this._changelog = newChangelog;
		this.writeChangelog();
	}

	/**
	 * Add a change record
	 * @param {ChangeRecord} record 
	 * @param {Date} [created] - Defaults to today's date
	 * @returns {undefined}
	 */
	createEntry(record, created = new Date()) {
		this._changelog = [
			...this._changelog,
			{
				created,
				id: getUUID(),
				...record
			}
		];
		this.writeChangelog();
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
		this.writeChangelog();
	}
}

module.exports = Janus;
