// This module is sending appointments to the owner of the app
var express = require('express');
var router = express.Router(); 
var nodemailer = require('nodemailer'); 
var emailT = require('./email_template.js'); 

const emailSettings = {
    fromEmail: "kontakt@fastcheckonline.de"
}

let transporter = nodemailer.createTransport({
    host: "smtp.ionos.de",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: emailSettings.fromEmail,
      pass: "Emin99887!", 
    },
    tls: {
        rejectUnauthorized: false,
    },
  });


// Send appointment
router.get('/confirmAppointment', function (req, res) {
    res.send("Available methods: POST")
});

router.post('/confirmAppointment', function(req, res) {
    const { name, email, cellphone, clientNumber, provider, date, time, bonusCode } = req.body; 
    if(name == null || email == null || cellphone == null || clientNumber == null || provider == null || date == null || time == null) {
        res.status(500); 
    } else {
        // Valid informations
        f_sendEmail({ name, email, cellphone, clientNumber, provider, date, time, bonusCode }).then((info) => {
            console.log(`[APPOINTMENTS] E-Mail sent: Id Message: ${info.messageId}`); 
            res.json({ sent: "true" }).end();
        }).catch((e) => {
            console.log(`[ERR] E-Mail not sent: ${e}`); 
            res.json({ sent: "false" }).end(); 
        });
    }
});

// Functions
const f_sendEmail = (data) => {
    const { name, email, cellphone, clientNumber, provider, date, time, bonusCode } = data; 
    // Send the appointment to the owner
    const emailTemplate = emailT.getEmailTemplate(data); 
    const message = {
        from: emailSettings.fromEmail,
        to: emailSettings.fromEmail, 
        subject: `Neuer Termin von ${name} für ${new Date(date).getDate()}/${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()} um ${time} Uhr`,
        html: emailTemplate
    }
    // Resolve only if the owner received the email
    return new Promise((resolve, reject) => {
        transporter.sendMail(message, (err, info) => {
            if(info) {
                // Send confirmation to the client
                const emailTemplateCl = emailT.getEmailTemplateForClient(data); 
                const clMessage = {
                    from: emailSettings.fromEmail,
                    to: email.toString(),
                    subject: "Ihr Termin mit Fastcheck",
                    html: emailTemplateCl
                }
                transporter.sendMail(clMessage); 
                // Resolve
                resolve(info); 
            } else {
                reject(err); 
            }
        });
    });

};


module.exports = router; 