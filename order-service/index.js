const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 9090;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Order = require("./Order");
const isAuthenticated = require("../isAuthenticated");
app.use(express.json());

var channel, connection;
mongoose.connect("mongodb://localhost:27017/order-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log(`Order-service DB Connected`);
        
     });
    
    async function connect() {
        const amqpserver = "amqp://localhost:5672";
        connection = await amqp.connect(amqpserver);
        channel = await connection.createChannel();
        await channel.assertQueue("ORDER");
}

function createOrder(products, userEmail) {
    let total = 0;
    for (let t=0; t<products.lenght;++t) {
        total += products[t].price;
    }
    const newOrder = new Order({
        products,
        user: userEmail,
        total_price: total
    });
    newOrder.save();
    return newOrder;
}
connect().then(() => {
    channel.consume("ORDER", data => {
        console.log("consuming ORDER queue");
        const { products, userEmail } = JSON.parse(data.content);
        const newOrder = createOrder(products, userEmail);
        channel.ack(data);
        channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify({ newOrder })));
       });
});
app.listen(PORT, () => {
    console.log(`Order-Service at ${PORT}`);

});
