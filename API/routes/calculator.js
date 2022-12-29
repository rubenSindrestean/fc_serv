// This module is sending appointments to the owner of the app
var express = require('express');
var router = express.Router(); 

// XHR2
var XMLHttpRequest = require('xhr2');
const AppDB = require('../../database/db');
const OrdersDB = require('../../database/orders');


// API Token
const mode = "development"; // development is for production 
const realToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NnhvRExDZzNUa3VEbm9IaCIsImFwcElkIjoiTmNDWHZvMkRZV01GUTVxc0UiLCJzZXJ2aWNlTmFtZSI6IlVzZXJTZXJ2aWNlIiwiZWdvbkFwaUtleSI6ImZlZDhhZTIwZTYxZWRmZTY2ZjYzMzU0YWI1NjlhMTUzIiwiaWF0IjoxNjQ5Njg2MjM3fQ.KtspsIQv1jtec6OUZQEiLa63NgKhyfIJl9oROC_epCU`
const demoToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ2WGZMQ05DRTJ5SEpaQUV5UiIsImFwcElkIjoia0ZNelk5WkRxb2s1NUVIYXciLCJzZXJ2aWNlTmFtZSI6IlVzZXJTZXJ2aWNlIiwiZWdvbkFwaUtleSI6IjgyYjk2MjMyYjQyMTA4ZjdmZGJiMjY3YTg5NjQxOWIyIiwiaWF0IjoxNTUwODQ5NTIxfQ.ht-LPAhxwTnbdUn3uBYwuayib-YRfZi8r3qNQWmTTl8`; 
const resellerId = 13321; 
const demoResellerId = 10000;

const db = new AppDB('./database.sqlite3'); 
const ordersDb = new OrdersDB(db);


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
            console.log(xhr.response);
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
            console.log(xhr.response);
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});

router.post('/submitOrderDocument', (req, res) => {
    const { signature, orderId } = req.body; 
    if(!signature || !orderId || isNaN(orderId))  {
        res.status(500);
    } else {
       
        var sig = signature.replace("data:image/png;base64,", "");

        console.log(sig); 

        var dataToSubmit = {
            signature: [
                { signature: sig }, 
                { signatureBank: sig },
                { signatureCustomer: sig },
                { signatureDataProtection: sig }
            ]
        } 

        var url = encodeURI(`https://gateway.eg-on.com/order/${orderId}/document/create`);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url);

        xhr.setRequestHeader("reseller-id", mode === "demo"? demoResellerId : resellerId); 
        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.response);
            console.log(`Document created`); 
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send(JSON.stringify(dataToSubmit));
    }
});

router.put('/uploadOrderDocument', (req, res) => {
    const { orderId, file } = req.body; 
    if(!file || !orderId || isNaN(orderId))  {
        res.status(500);
    } else {
       
        console.log(`Uploading document...`); 
        var dataToSubmit = {
            file,
            fileType: 1 // Vertrag
        };

        var url = encodeURI(`https://gateway.eg-on.com/order/${orderId}/document`);

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", url);

        xhr.setRequestHeader("reseller-id", mode === "demo"? demoResellerId : resellerId); 
        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.response);
            console.log(`Documented uploaded...`); 
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send(JSON.stringify(dataToSubmit));
    }
});

router.post('/submitOrder', (req, res) => {
    const { address, bank, appointment, signature, offer } = req.body; 
    if(!address || !bank || !appointment || !signature || !offer)  {
        res.status(500);
    } else {
        // Format cellphone / telefon
        var sigDate = null;
        if(isValidDate(appointment.digitalSignatureDate)) {
            console.log(appointment.digitalSignatureDate, typeof appointment.digitalSignatureDate);
            sigDate = parseDate(appointment.digitalSignatureDate); 
            sigDate.setDate(sigDate.getDate() - 1); 
        }
        console.log(`sigDate: ${sigDate}`); 
        var dates = {
            sigDate: sigDate? sigDate.toISOString() : null,
            deliveryDate: isValidDate(appointment.wishdelivery)? parseDate(appointment.wishdelivery).toISOString() : null,
            beforeContractTerminated: isValidDate(appointment.contractResigned)? parseDate(appointment.contractResigned).toISOString() : false,
            birthday: isValidDate(address.birthDate)? parseDate(address.birthDate).toISOString() : null,
        }
        var phones = {}; 
        if(address.cellphone.length > 0) {
            const prefix = address.cellphone.slice(0, 4);
            const rest = address.cellphone.slice(5, address.cellphone.length); 
            phones = {
                ...phones, 
                phonePrefix: prefix,
                phoneNumber: rest
            }
        }

        if(address.telefon.length > 0) {
            const prefix = address.telefon.slice(0, 4);
            const rest = address.telefon.slice(5, address.telefon.length); 
            phones = {
                ...phones, 
                phonePrefix: prefix,
                phoneNumber: rest
            }
        }

        //
        var dataToSubmit = {
            resellerId: resellerId, 
            delivery: {
                country: "81",
                zip: address.plz,
                city: address.place,
                street: address.street,
                houseNumber: address.nr
            },
            contactPerson: {
                salutation: address.gender,
                firstName: address.name,
                lastName: address.firstName,
                clientTitle: address.title === "kein Titel"? "" : address.title,
                birthday: dates.birthday
            },
            contact: {
                email: address.email, 
                ...phones
            }, 
            createdBy: {
                resellerId: resellerId, 
                salutation: "Herr",
                firstName: "Emin",
                lastName: "Güleryüz",
                company: "Güleryüz"
            },
            products: [{
                rateId: offer.rateId,
                consum: offer.consum,
                consumNt: 0,  
                branch: offer.branch, 
                type: offer.type, 
                sigDate: dates.sigDate,
                deliveryType: appointment.movingNew? "new" : "change",
                fastDelivery: appointment.deliverASAP && !appointment.movingNew? 1 : 0,
                deliveryDate: dates.deliveryDate,
                counterNumber: appointment.counter, 
                pointOfDelivery: appointment.melo, 
                beforeProviderCustomerId: appointment.clientNr, 
                beforeProviderName: appointment.exProvider.name,
                beforeProviderId: appointment.exProvider.id,
                marketLocationId: appointment.malo,
                beforeContractTerminated: dates.beforeContractTerminated, 
                referenceResellerId: resellerId
            }],
            aditional: {
                reference_reseller_id: resellerId
            }

        }; 
        
        if(!bank.selfpay) {
            dataToSubmit = {
                ...dataToSubmit,
                payment: {
                    paymentType: "sepa",
                    iban:  bank.iban.iban,
                    accountHolder: {
                        salutation: bank.gender, 
                        firstName: bank.name,
                        lastName: bank.firstName,
                        country: "81",
                        zip: bank.plz,
                        city: bank.place,
                        street: bank.street,
                        houseNumber: bank.nr
                    }   
                },
            }
        } 
        if(bank.selfpay) {
            dataToSubmit = {
                ...dataToSubmit,
                payment: {
                    paymentType: "debit"
                }
            }
        }
        if(bank.otherInvoiceAddress && !bank.selfpay) {
            dataToSubmit = {
                ...dataToSubmit,
                billing: {
                    salutation: bank.r_gender,
                    firstName: bank.r_name,
                    lastName: bank.r_firstName,
                    country: "81",
                    zip: bank.r_plz,
                    city: bank.r_place,
                    street: bank.r_street,
                    houseNumber: bank.r_nr,
                    company: bank.isCompany? bank.company : ""
                }
            }
        }

        console.log(dataToSubmit); 

        var url = encodeURI(`https://gateway.eg-on.com/order`);

        var xhr = new XMLHttpRequest();
        xhr.open("PUT", url);

        xhr.setRequestHeader("reseller-id", mode === "demo"? demoResellerId : resellerId); 
        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            const order = xhr.response; 
            console.log(order); 
            if(order.hasOwnProperty("orderNo") && offer.hasOwnProperty("bonusCode")) {
                const bonusCode = offer.bonusCode;
                const orderId = order.orderNo; 
                ordersDb.create(orderId, bonusCode, new Date());
                console.log(`OrderId: ${orderId} with bonusCode: ${bonusCode}`); 
            }
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send(dataToSubmit);
    }
});

router.get('/getTerms/:fileId', (req, res) => {
    const { fileId } = req.params; 
    if(!fileId || isNaN(fileId))  {
        res.status(500);
    } else {
        // We are good
        var url = encodeURI(`https://gateway.eg-on.com/rateFileText/${fileId}`);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.status);
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});

router.get('/revocationText/:providerId', (req, res) => {
    const { providerId } = req.params; 
    if(!providerId || isNaN(providerId))  {
        res.status(500);
    } else {
        // We are good
        var url = encodeURI(`https://gateway.eg-on.com/revocationText/${providerId}`);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.status);
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});

router.get('/getExProviders/:rateId', (req, res) => {
    const { rateId } = req.params; 
    if(!rateId || isNaN(rateId))  {
        res.status(500);
    } else {
        // We are good
        var url = encodeURI(`https://gateway.eg-on.com/beforeProvider/${rateId}`);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.status);
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});


router.get('/checkIban/:IBAN', (req, res) => {
    const { IBAN } = req.params; 
    if(!IBAN) {
        res.status(500);
    } else {
        // We are good
        var url = encodeURI(`https://gateway.eg-on.com/checkIban/${IBAN}`);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.status);
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});

router.get('/getContract/:rateId/:rateFileId', (req, res) => {
    const { rateId, rateFileId } = req.params; 
    if(!rateFileId || !rateId) {
        res.status(500);
    } else if(isNaN(rateFileId) || isNaN(rateId)) {
        res.status(500);
    } else {
        // We are good
        var url = encodeURI(`https://gateway.eg-on.com/rateService/contractFile/${rateId}/${rateFileId}`);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);

        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            // console.log(xhr.status);
            res.json(JSON.parse(xhr.response)).end(); 
        }};

        xhr.send();
    }
});

router.get('/getRates/:plz/:place/:street/:number/:kwh/:type/:branch', (req, res) => {
    // plz = zip 
    // place = city
    // kwh = consumption
    // type = privat / gewerbe or both
    // branch = strom/gas

    const { plz, place, street, number, kwh, type, branch } = req.params;
    if(!plz || !place || !street || !number || !kwh || !type || !branch) {
        return res.json({ error: "Invalid parameters" }).end(); 
    }

    var url = encodeURI(`https://gateway.eg-on.com/rates/?zip=${plz}&city=${place}&street=${street}&houseNumber=${number}&consum=${kwh}&type=${type}&branch=${branch}`);

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`);

    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        // console.log(xhr.status);
        // console.log(xhr.response)
        res.json(JSON.parse(xhr.response)).end(); 
    }};

    xhr.send();
});

router.get('/getCities/:plz', (req, res) => {
    const { plz } = req.params;
    const plzReg = /\b((?:0[1-46-9]\d{3})|(?:[1-357-9]\d{4})|(?:[4][0-24-9]\d{3})|(?:[6][013-9]\d{3}))\b/;
    if(isNaN(plz) || plzReg.test(plz) == false && plz.length > 0) {
        return res.json({ error: "Postleitzahl muss eine 5-stellige Nummer sein." }).end(); 
    }
    var url = encodeURI(`https://gateway.eg-on.com/cities/${plz}`); 
    
    var xhr = new XMLHttpRequest(); 
    xhr.open("GET", url); 

    xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`)

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            res.json(JSON.parse(xhr.response)).end(); 
    }};
    
    xhr.send();
});

router.get(`/getStreets/:plz/:place`, (req, res) => {

    const { plz, place } = req.params; 
    const plzReg = /\b((?:0[1-46-9]\d{3})|(?:[1-357-9]\d{4})|(?:[4][0-24-9]\d{3})|(?:[6][013-9]\d{3}))\b/;
    
    if(!plz || !place) {
        res.json({ error: "Missing params" }).end(); 
    }
    else if(isNaN(plz) || plzReg.test(plz) == false && plz.length > 0) {
        return res.json({ error: "Postleitzahl muss eine 5-stellige Nummer sein." }).end(); 
    }
    else if(!isNaN(place)) {
        return res.json({ error: "Invalid city name." }).end();
    } else {
        // We ready
        var url = encodeURI(`https://gateway.eg-on.com/streets/${plz}/${place}`);
        var xhr = new XMLHttpRequest(); 
        xhr.open("GET", url); 
        xhr.setRequestHeader("Authorization", `Bearer ${mode === "demo"? demoToken : realToken}`)

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                res.json(JSON.parse(xhr.response)).end(); 
        }};
        
        xhr.send();
    }

});



module.exports = router; 