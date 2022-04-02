require('dotenv').config();
const Sequelize = require("sequelize");
const jwt = require('jsonwebtoken');

const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.DIALECT,
  timezone: process.env.TIMEZONE,
  pool: {
    max: parseInt(process.env.POOLMAX),
    min: parseInt(process.env.POOLMIN),
    acquire: parseInt(process.env.POOLACQUIRE),
    idle: parseInt(process.env.POOLIDLE)
  },
  define: {
    freezeTableName: true,
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.indexSize = parseInt(process.env.INDEXSIZE);
// db.tokenKey = process.env.TOKENKEY;
// db.tokenExpiry = process.env.TOKENEXPIRY;

db.userToken = (obj) => {
  if(!obj.token){
    return jwt.sign(
      obj,
      process.env.TOKENKEY,
      { expiresIn: process.env.TOKENEXPIRY }
    );
  }

  try {
    jwt.verify(obj.token, process.env.TOKENKEY);
    return obj.token;
  } catch (err) {
    return jwt.sign(
      {phone: obj.phone},
      process.env.TOKENKEY,
      { expiresIn: process.env.TOKENEXPIRY }
    );
  }
}


module.exports = db;
