const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.user;

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    //return res.status(403).send("A token is required for authentication");
    return res.status(401).send("Unauthorized access");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKENKEY);
    req.user = decoded.phone;

    let condition = {
      phone: req.user,
      token: token
    };
    if(!(await User.findOne({ where: condition })))
      throw new Error("Invalid Credentials");
    
  } catch (err) {
    //return res.status(401).send(err.message || "Invalid Token");
    return res.status(401).send("Unauthorized access");
  }
  return next();
};

module.exports = verifyToken;