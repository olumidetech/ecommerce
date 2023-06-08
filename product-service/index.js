const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Product = require("./Product");
const isAuthenticated = require("../isAuthenticated");
app.use(express.json());
var order;
var channel, connection;

mongoose.connect("mongodb://localhost:27017/Product-service", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log(`Product-service DB Connected`);
        
     });
    
    async function connect() {
        const amqpserver = "amqp://localhost:5672";
        connection = await amqp.connect(amqpserver);
        channel = await connection.createChannel();
        await channel.assertQueue("PRODUCT");
}
connect();

// Create anew product
// Buy a product

app.post("/product/create", isAuthenticated, async (req, res) => {
    try {
      const { name, description, price } = req.body;
      const newProduct = await Product.create({
        name,
        description,
        price,
      });
      return res.json(newProduct);
    } catch (error) {
      return res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.post("/product/buy", isAuthenticated, async(req, res)=> {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids }});

    channel.sendToQueue("ORDER", Buffer.from(
      JSON.stringify({
        products,
        userEmail: req.user.email,
      })
    ));
    channel.consume("PRODUCT", data => {
      console.log("Consuming PRODUCT queue");
      order = JSON.parse(data.content);
      channel.ack(data);
    });
    return res.json(order);
  });

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);

});
