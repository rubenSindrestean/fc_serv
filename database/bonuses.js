const Promise = require('bluebird');

class BonusesDB {
    constructor(db) {
        this.db = db; 
    }
    createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS bonuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code INT, 
            amount FLOAT,
            title TEXT, 
            description TEXT,
            lastUpdated TEXT, 
            status INT)`;
        return this.db.run(sql); 
    }
    // Get
    getAll() {
        return this.db.all(`SELECT * FROM bonuses ORDER by id DESC`); 
    }
    getById(idx) {
        return this.db.get(`SELECT * FROM bonuses WHERE id = ?`, [idx]);
    }
    getByStatus(status) {
        return this.db.all(`SELECT * FROM bonuses WHERE status = ?`, [status]); 
    }
    getStatusByCode(status, code) {
        return this.db.all(`SELECT * FROM bonuses WHERE status = ? AND code = ?`, [status, code]); 
    }
    // Delete
    deleteAll() {
        return this.db.run(`DELETE FROM bonuses WHERE id > 0`); 
    }
    deleteById(idx) {
        return this.db.run(`DELETE FROM bonuses WHERE id = ?`, [idx]); 
    }
    deleteByStatus(status) {
        return this.db.run(`DELETE FROM bonuses WHERE status = ?`, [status]); 
    }
    // Update
    updateStatus(id, status) {
        const dateFormat = `${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}`;
        return this.db.run(`UPDATE bonuses SET status = ?, lastUpdated = ? WHERE id = ?`, [status, dateFormat, id]); 
    }
    update(task) {
        const { id, code, amount, status, description, title, lastUpdated } = task; 
        return this.db.run(`UPDATE bonuses SET code = ?, amount = ?, description = ?, status = ?, title = ?, lastUpdated = ? WHERE id = ?`, [code, amount, description, status, title, lastUpdated, id]); 
    }
    // Create
    create(code, amount, status, description, title, lastUpdated) {
        return this.db.run(`INSERT INTO bonuses (code, amount, description, status, title, lastUpdated) VALUES (?, ?, ?, ?, ?, ?)`, [code, amount, description, status, title, lastUpdated]); 
    }
}


module.exports = BonusesDB; 