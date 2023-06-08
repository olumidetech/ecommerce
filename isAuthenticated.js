const jwt = require("jsonwebtoken");

async function isAuthenticated(req, res, next) {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid or missing authorization header" });
  }

  const token = tokenHeader.split(" ")[1];

  jwt.verify(token, "secret", (err, user) => {
    if (err) {
      return res.json({ message: err });
    } else {
      req.user = user;
      next();
    }
  });
}

module.exports = isAuthenticated;
