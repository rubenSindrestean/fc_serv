// This module is sending appointments to the owner of the app
var express = require('express');
var router = express.Router(); 

// XHR2
var XMLHttpRequest = require('xhr2');
const BonusCodesDB = require('../../database/bonusCodes');
const BonusesDB = require('../../database/bonuses');
const AppDB = require('../../database/db');
const OrdersDB = require('../../database/orders');


// API Token
const mode = "development"; 
const realToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NnhvRExDZzNUa3VEbm9IaCIsImFwcElkIjoiTmNDWHZvMkRZV01GUTVxc0UiLCJzZXJ2aWNlTmFtZSI6IlVzZXJTZXJ2aWNlIiwiZWdvbkFwaUtleSI6ImZlZDhhZTIwZTYxZWRmZTY2ZjYzMzU0YWI1NjlhMTUzIiwiaWF0IjoxNjQ5Njg2MjM3fQ.KtspsIQv1jtec6OUZQEiLa63NgKhyfIJl9oROC_epCU`
const demoToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ2WGZMQ05DRTJ5SEpaQUV5UiIsImFwcElkIjoia0ZNelk5WkRxb2s1NUVIYXciLCJzZXJ2aWNlTmFtZSI6IlVzZXJTZXJ2aWNlIiwiZWdvbkFwaUtleSI6IjgyYjk2MjMyYjQyMTA4ZjdmZGJiMjY3YTg5NjQxOWIyIiwiaWF0IjoxNTUwODQ5NTIxfQ.ht-LPAhxwTnbdUn3uBYwuayib-YRfZi8r3qNQWmTTl8`; 
const resellerId = 13321; 
const demoResellerId = 10000;

const db = new AppDB('./database.sqlite3'); 
const ordersDb = new OrdersDB(db);
const bonusesDB = new BonusesDB(db); 
const bonusCodesDB = new BonusCodesDB(db); 

const allowedUsers = [
    {
        name: "fastcheckpanel",
        password: "10afs0AF19H9F23F"
    }
]


function isValidDate(s) {
    var separators = ["\\.", "\\-", "\\/"];
    var bits = s.split(new RegExp(separators.join("|"), "g"));
    var d = new Date(bits[2], bits[1] - 1, bits[0]);
    return d.getFullYear() == bits[2] && d.getMonth() + 1 == bits[1];
}
  
function parseDate(s) {
    var separators = ["\\.", "\\-", "\\/"];
    var bits = s.split(new RegExp(separators.join("|"), "g"));
    var d = new Date(bits[2], bits[1] - 1, bits[0]);
    return d;
}

router.post('/createNewBonus', async (req, res) => {
    const { name, password, code, title, description, amount, status } = req.body; 
    if(!name || !password || !code || !title || !description || !amount || !status || isNaN(code) || isNaN(amount)) {
        return res.status(500);
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        const bonusCodeCheck = await bonusCodesDB.getByBonusCode(code); 
        if(bonusCodeCheck == undefined || bonusCodeCheck == null) {
            return res.json({ error: "Bonuscode ist nicht gültig." }); 
        }
        // Now go to create the code
        var newStatus = status; 
        if(isNaN(status)) {
           if(status === "In bearbeitung") {
               newStatus = 0;
           } else if(status === "Bezahlbar") {
               newStatus = 1;
           } else if(status === "Ausgezahlt") {
               newStatus = 2; 
           } else {
               res.json({ error: "Error_code: #001" }); 
           }
        }
        var response = await bonusesDB.create(code, amount, newStatus, description, title, new Date().toISOString());
        res.json(response).end();  

    }
});

router.post('/updateBonus', async (req, res) => {
    const { name, password, id, code, title, description, amount, status } = req.body; 
    if(!name || !password || !id || !code || !title || !description || !amount || !status || isNaN(code) || isNaN(amount)) {
        return res.status(500);
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        const bonusCodeCheck = await bonusCodesDB.getByBonusCode(code); 
        if(bonusCodeCheck == undefined || bonusCodeCheck == null) {
            return res.json({ error: "Bonuscode ist nicht gültig." }); 
        }
        // Now go to create the code
        var newStatus = status; 
        if(isNaN(status)) {
           if(status === "In bearbeitung") {
               newStatus = 0;
           } else if(status === "Bezahlbar") {
               newStatus = 1;
           } else if(status === "Ausgezahlt") {
               newStatus = 2; 
           } else {
               res.json({ error: "Error_code: #001" }); 
           }
        }
        var response = await bonusesDB.update({ id, code, amount, status: newStatus, description, title, lastUpdated: new Date().toISOString()  });
        res.json(response).end();  

    }
});

router.get('/getBonusID/:bonusId/:name/:password', async (req, res) => {
    const { name, password, bonusId } = req.params; 
    if(!name || !password || !bonusId ) {
        return res.json({ error: true }).end(); 
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        try {
            const info = await bonusesDB.getById(bonusId); 
            if(info == undefined || info == null) {
                return res.json({ error: "Bonus ID nicht gefunden." }).end(); 
            }
            res.json(info).end(); 
        }
        catch (e) {
            console.log(`Error: ${e}`); 
            res.status(500); 
        }
    }
});

router.get('/updateBonus/:bonusId/:name/:password', async (req, res) => {
    const { name, password, bonusId } = req.params; 
    if(!name || !password || !bonusId ) {
        return res.json({ error: true }).end(); 
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        try {
            const info = await bonusesDB.getById(bonusId); 
            if(info == undefined || info == null) {
                return res.json({ error: "Bonus ID nicht gefunden." }).end(); 
            }
            res.json(info).end(); 
        }
        catch (e) {
            console.log(`Error: ${e}`); 
            res.status(500); 
        }
    }
});

router.get('/checkLogin/:name/:password', (req, res) => {
    const { name, password } = req.params;
    if(!name || !password) {
        res.json({ validUser: false }).end(); 
    } else {
        // Checking
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                res.json({ validUser: true }).end();
            } else {
                res.json({ validUser: false }).end(); 
            }
        });
    }
});

router.get('/getBonusCodeInfo/:bonusCode/:name/:password', async (req, res) => {
    const { name, password, bonusCode } = req.params; 
    if(!name || !password || !bonusCode || bonusCode.toString().length < 6 || bonusCode.toString().length > 6) {
        return res.json({ error: true }).end(); 
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        try {
            const info = await bonusCodesDB.getByBonusCode(bonusCode); 
            if(info == undefined || info == null) {
                return res.json({ error: true }).end(); 
            }
            res.json(info).end(); 
        }
        catch (e) {
            console.log(`Error: ${e}`); 
            res.status(500); 
        }
    }
});

router.get('/getBonuses/:name/:password', async (req, res) => {
    const { name, password } = req.params; 
    if(!name || !password) {
        res.status(500);
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        const bonuses = await bonusesDB.getAll(); 
        res.json(bonuses).end(); 
    }
});


router.get('/deleteBonus/:bonusId/:name/:password', async (req, res) => {
    const { bonusId, name, password } = req.params; 
    if(!name || !password || !bonusId) {
        res.status(500);
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        const bonuses = await bonusesDB.deleteById(bonusId); 
        res.json(bonuses).end(); 
    }
});

router.get('/getBonusOrders/:name/:password', async (req, res) => {
    const { name, password } = req.params; 
    if(!name || !password) {
        res.status(500);
    } else {
        var hasAccess = false;
        allowedUsers.map((user, idx) => {
            if(user.name === name && user.password === password) {
                hasAccess = true; 
            }
        });
        if(!hasAccess) {
            return res.json({ error: true }).end();  
        }
        const orders = await ordersDb.getAll(); 
        res.json(orders).end(); 
    }
});

router.get('/getOrderStatus/:orderId', (req, res) => {
    const { orderId } = req.params; 
    if(!orderId || isNaN(orderId))  {
        res.status(500);
    } else {
        // We are good
        var url = encodeURI(`https://gateway.eg-on.com/order/${orderId}/status`);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});

router.get('/getOrderInfo/:orderId', (req, res) => {
    const { orderId } = req.params; 
    if(!orderId || isNaN(orderId))  {
        res.status(500);
    } else {
        // We are good
        var url = encodeURI(`https://gateway.eg-on.com/orderView/${orderId}`);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});







module.exports = router; 