const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

mongoose.connect("mongodb://localhost:27017/Product-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log(`Product-service DB Connected`);
        
     });
     app.listen(PORT, () => {
        console.log(`Product-Service at ${PORT}`);

    });