const Promise = require('bluebird')

class BonusCodesDB {
    constructor(db) {
        this.db = db; 
    }
    createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS bonusCodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code INT, 
            name TEXT,
            email TEXT, 
            streetName TEXT,
            postCode TEXT,
            place TEXT, 
            IBAN TEXT)`;
        return this.db.run(sql); 
    }
    // latestId
    getLatestId() {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT code FROM bonusCodes ORDER BY id DESC LIMIT 0,1`).then((result) => {
                if(result && ('code' in result)) {
                    resolve(result.code);
                } else {
                    // startingId
                    resolve(100000);
                }
            }).catch((e) => {
                // 
                console.log(`getLatestId Error: ${e}`);
                // startingId
                resolve(100000);
            });
        });
    }
    // Get
    getAll() {
        return this.db.all(`SELECT * FROM bonusCodes`); 
    }
    getById(idx) {
        return this.db.get(`SELECT * FROM bonusCodes WHERE id = ?`, [idx]);
    }
    getByBonusCode(idx) {
        return this.db.get(`SELECT * FROM bonusCodes WHERE code = ?`, [idx]);
    }
    getByName(name) {
        return this.db.get(`SELECT * FROM bonusCodes WHERE name = ?`, [name]); 
    }
    // Delete
    deleteById(idx) {
        return this.db.run(`DELETE FROM bonusCodes WHERE id = ?`, [idx]); 
    }
    deleteByName(name) {
        return this.db.run(`DELETE FROM bonusCodes WHERE name = ?`, [name]); 
    }
    // Update
    update(task) {
        const { id, code, name, email, streetName, postCode, place, IBAN } = task; 
        return this.db.run(`UPDATE bonusCodes SET code = ?, name = ?, email = ?, streetName = ?, postCode = ?, place = ?, IBAN = ? WHERE id = ?`, [code, name, email, streetName, postCode, place, IBAN, id]); 
    }
    // Create
    create(code, name, email, streetName, postCode, place, IBAN) {
        return this.db.run(`INSERT INTO bonusCodes (code, name, email, streetName, postCode, place, IBAN) VALUES (?, ?, ?, ?, ?, ?, ?)`, [code, name, email, streetName, postCode, place, IBAN]); 
    }
}


module.exports = BonusCodesDB; 