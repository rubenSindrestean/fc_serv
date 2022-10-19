const sqlite3 = require('sqlite3')
const Promise = require('bluebird')

class AppDB {
    constructor(path) {
        this.db = new sqlite3.Database(path, (err) => {
            if(err) {
                this.db = null; 
                console.log(`[CONNECTION_ERROR] SQLite Connection not succesfull`);
            } else {
                console.log(`[CONNECTION_SUCCESS] SQLite Connection succesfully`); 
            }
        });
    }
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.run(sql, params, function (err) {
            if (err) {
              console.log('SQLite Error: ' + sql)
              console.log(err)
              reject(err)
            } else {
              resolve({ id: this.lastID })
            }
          })
        })
    }
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.get(sql, params, (err, result) => {
            if (err) {
              console.log('SQLite Error: ' + sql)
              console.log(err)
              reject(err)
            } else {
              resolve(result)
            }
          })
        })
      }
    
      all(sql, params = []) {
        return new Promise((resolve, reject) => {
          this.db.all(sql, params, (err, rows) => {
            if (err) {
              console.log('SQLite Error:' + sql)
              console.log(err)
              reject(err)
            } else {
              resolve(rows)
            }
          })
        })
      }
}


module.exports = AppDB; 