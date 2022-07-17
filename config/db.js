require('dotenv').config();
const Sequelize = require("sequelize");
const jwt = require('jsonwebtoken');

var firebase_admin = require("firebase-admin");
var serviceAccount = require('../kiwi-app-parent-firebase-adminsdk-w1w4z-9afd55f6ab.json');
firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(serviceAccount),
});
const firebase_messaging = firebase_admin.messaging()


const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: process.env.DIALECT,
  dialectOptions: {
    dateStrings: true,
    typeCast: function (field, next) {
      if (field.type === 'DATETIME') {
        return field.string()
      }
      return next()
    },
  },
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
  },
  omitNull: false
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

db.sendMessage = (msg) => {
  firebase_messaging.send(msg).then((response) => {
    console.log("Firebase message with", msg.topic, "topic successfully sent: ", response)
  })
  .catch((error) => {
    console.log("Firebase message send failed: ", error)
  });
}

module.exports = db;
