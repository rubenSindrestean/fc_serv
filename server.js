var express = require('express'); 
var emails = require('./API/routes/email.js'); 
var referrals = require('./API/routes/referral.js');
var calculator = require('./API/routes/calculator.js');
var panel = require('./API/routes/panel.js'); 
var mApp = require('./API/routes/app.js');

// CORS
const cors = require("cors");
// Init database
const main = require('./database/main.js');
// 
app = express(),
port = process.env.PORT || 3000;

app.listen(port);

// Allow json
app.use(cors()) // Use this after the variable declaration
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));


// Routers
app.use('/emails', emails);
app.use('/referrals', referrals);
app.use('/tarifrechner', calculator);
app.use('/panel', panel)
app.use('/app', mApp); 

// Start DB
main();
// Logs
console.log('[Fastcheck] API Server started on port: ' + port);
