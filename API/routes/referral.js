// This module is sending appointments to the owner of the app
var express = require('express');
// Databases
const BonusCodesDB = require('../../database/bonusCodes');
const BonusesDB = require('../../database/bonuses');
const AppDB = require('../../database/db');
// 
var router = express.Router(); 

router.get('/updateStatus/:code/:id/:newStatus', (req, res) => {
    const { code, id, newStatus } = req.params;
    // if(!code || !id || !newStatus) res.status(500); 
    // if(isNaN(code) || isNaN(id) || isNaN(newStatus)) res.status(500);
    // 
    const bonusesDB = new AppDB('./database.sqlite3'); 
    const bonuses = new BonusesDB(bonusesDB); 
    // 
    bonuses.getById(id).then((response) => {
        if(response.id == id && response.status == 1 && newStatus == 2) {
            // Bonus can be payed out
            bonuses.updateStatus(id, newStatus).then((response) => {
                res.json({ response: response }).end();
            }).catch((e) => {
                console.log(`SQLite Error when trying to update status: ${JSON.stringify(e)}`);
                res.json({ response: "false", error: JSON.stringify(e) }); 
            });
        } else {
            res.json({ response: "false", error: `Nice try` });     
        }
    }).catch((e) => {
        console.log(`SQLite Error when trying to update status: ${JSON.stringify(e)}`);
        res.json({ response: "false", error: JSON.stringify(e) }); 
    });
});

router.get('/getCashedBonuses/:code', function(req, res) {
    const { code } = req.params;
    console.log(`Requested for code: ${code}`);  
    if(!code) res.status(500);
    // 
    const bonusesDB = new AppDB('./database.sqlite3'); 
    const bonuses = new BonusesDB(bonusesDB); 
    // 
    bonuses.getStatusByCode(2, code).then((response) => {
        res.json({ response: response }).end(); 
    }).catch((e) => {
        console.log(`SQLite Error when trying to get bonuses: ${JSON.stringify(e)}`); 
        res.json({ response: "false", error: JSON.stringify(e) }).end(); 
    });
});

router.get('/getPayableBonuses/:code', function(req, res) {
    const { code } = req.params; 
    if(!code) res.status(500);
    // 
    const bonusesDB = new AppDB('./database.sqlite3'); 
    const bonuses = new BonusesDB(bonusesDB); 
    // 
    bonuses.getStatusByCode(1, code).then((response) => {
        res.json({ response: response }).end(); 
    }).catch((e) => {
        console.log(`SQLite Error when trying to get bonuses: ${JSON.stringify(e)}`); 
        res.json({ response: "false", error: JSON.stringify(e) }).end(); 
    });
});


router.get('/getClearingBonuses/:code', function(req, res) {
    const { code } = req.params; 
    if(!code) res.status(500);
    // 
    const bonusesDB = new AppDB('./database.sqlite3'); 
    const bonuses = new BonusesDB(bonusesDB); 
    // 
    bonuses.getStatusByCode(0, code).then((response) => {
        res.json({ response: response }).end(); 
    }).catch((e) => {
        console.log(`SQLite Error when trying to get bonuses: ${JSON.stringify(e)}`); 
        res.json({ response: "false", error: JSON.stringify(e) }).end(); 
    });
    
});

// Create bonus code
router.get('/createBonusCode', function (req, res) {
    res.send("Available methods: POST")
});


router.post('/createBonusCode', function(req, res) {
    const { name, email, address, plz, place, iban } = req.body; 
    if(name == null || email == null || address == null || plz == null || place == null || iban == null) {
        res.status(500); 
    } else {
        // Check for reg-ex again
        if(name && name.toString().length <= 0) {
            res.json({ created: "false", error: "bonusCode/invalidName" }); 
        } else if(email && email.toString().length <= 0) {
            res.json({ created: "false", error: "bonusCode/invalidEmail" });
        } else if(address && address.toString().length <= 0) {
            res.json({ created: "false", error: "bonusCode/invalidAddress" }); 
        } else if(plz && plz.toString().length <= 0) {
            res.json({ created: "false", error: "bonusCode/invalidAddress" }); 
        } else if(place && place.toString().length <= 0) {
            res.json({ created: "false", error: "bonusCode/invalidAddress" }); 
        } else if(iban && iban.toString().length <= 0) {
            res.json({ created: "false", error: "bonusCode/invalidIBAN" }); 
        } else {
            // Valid input
            const bonusCodesDB = new AppDB('./database.sqlite3'); 
            const bonusCodes = new BonusCodesDB(bonusCodesDB);
            const bonuses = new BonusesDB(bonusCodesDB); 
            // Get the latest id
            bonusCodes.getLatestId().then((code) => {
                let newId = parseInt(code); 
                newId = newId + 1;
                // Create the bonusCode
                bonusCodes.create(newId, name, email, address, plz, place, iban).then((response) => {
                    console.log(`New bonus code (${newId}) created, id: ${response.id}`); 
                    // Create a starting bonus for each bonus code
                    bonuses.create(newId, 10, 0, "Danke, dass du die App heruntergeladen hast.", "Startbonus", new Date().toDateString()); 
                    // Return the code
                    bonusCodes.getById(response.id).then((response) => {
                        res.json({ created: "true", bonusObject: { code: response.code } }).end(); 
                    });
                }).catch((e) => {
                    console.log(`SQLite Error when trying to create a bonus code: ${JSON.stringify(e)}`); 
                    res.json({ created: "false", error: JSON.stringify(e) }).end(); 
                });
            });
        }
    }
});

module.exports = router; 