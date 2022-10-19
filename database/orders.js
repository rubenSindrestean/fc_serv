const Promise = require('bluebird');

class OrdersDB {
    constructor(db) {
        this.db = db; 
    }
    createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId INT, 
            bonusCode INT,
            date CHAR)`;
        return this.db.run(sql); 
    }
    // Get
    getAll() {
        return this.db.all(`SELECT * FROM orders ORDER by id DESC`); 
    }
    getById(idx) {
        return this.db.get(`SELECT * FROM orders WHERE id = ?`, [idx]);
    }
    getByOrderId(orderId, asc) {
        return this.db.all(`SELECT * FROM orders WHERE orderId = ?`, [orderId]); 
    }
    getByBonusCode(code) {
        return this.db.all(`SELECT * FROM orders WHERE bonusCode = ?`, [code]); 
    }
    // Delete
    deleteAll() {
        return this.db.run(`DELETE FROM orders WHERE id > 0`); 
    }
    deleteById(idx) {
        return this.db.run(`DELETE FROM orders WHERE id = ?`, [idx]); 
    }
    deleteByBonusCode(code) {
        return this.db.run(`DELETE FROM orders WHERE bonusCode = ?`, [code]); 
    }
    // Create
    create(orderId, bonusCode, date) {
        return this.db.run(`INSERT INTO orders (orderId, bonusCode, date) VALUES (?, ?, ?)`, [orderId, bonusCode, date]); 
    }
}


module.exports = OrdersDB; 