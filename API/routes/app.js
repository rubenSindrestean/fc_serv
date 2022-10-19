// This module is sending appointments to the owner of the app
var express = require('express');
var router = express.Router(); 

const serverInfo = {
    website: {
        link: "https://fastcheckonline.de/",
        display: "fastcheckonline.de"
    }, 
    address: {
        backend: "Bahnhofstraße 194 44629 Herne",
        display: "Fastcheck\nBahnhofstraße 194\n44629 Herne"
    },
    cellphone: {
        backend: "+4917681006442",
        display: "0176 - 81006442"
    },
    whatsapp: {
        backend: "+4917681006442",
        display: "0176 - 81006442"
    },
    email: "kontakt@fastcheckonline.de",
    impressum: "https://www.fastcheckonline.de/impressum"
}

router.get('/info', function(req, res) {
    res.json(serverInfo).end();
});



module.exports = router; 