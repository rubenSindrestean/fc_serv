const BonusCodesDB = require("./bonusCodes");
const BonusesDB = require("./bonuses");
const AppDB = require("./db");
const OrdersDB = require("./orders");

function main() {
    const bonusCodesDB = new AppDB('./database.sqlite3'); 
    const bonusCodes = new BonusCodesDB(bonusCodesDB);
    const bonuses = new BonusesDB(bonusCodesDB);
    const orders = new OrdersDB(bonusCodesDB); 

    bonusCodes.createTable().then(() => {
        // Table succesfully created
        console.log(`[SQLite] BonusCodes table created`); 
        bonuses.createTable().then(() => {
            console.log(`[SQLite] Bonuses table created`); 
            // Create test bonuses
            // bonuses.create("100001", 50.0, 2, "This is a description. The bonus is cashed out.", "Cashed out bonus", "10/04/2022 21:10"); 
            // bonuses.create("100001", 50.0, 1, "This is a description. The bonus could be cashed out.", "Cashable bonus", "10/04/2022 21:10"); 
            // bonuses.create("100001", 50.0, 0, "This is a description. The bonus is being cleared.", "In cleareance bonus", "10/04/2022 21:10"); 
            orders.createTable().then(() => {
                console.log(`[SQLite] Orders table created`)
            }).catch((e) => {
                console.log(`[ERROR_ORDERS] ${JSON.stringify(e)}`); 
            });

        }).catch((e) => {
            console.log(`[ERROR_MAIN_BONUSES] ${JSON.stringify(e)}`); 
        });
    }).catch((e) => {
        console.log(`[ERROR_MAIN] ${JSON.stringify(e)}`); 
    });
}

module.exports = main; 