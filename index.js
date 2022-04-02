const express = require("express");
const cors = require("cors");
const app = express();
var corsOptions = {
  origin: "http://localhost"
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Day Care application." });
});
require("./routes/routes.js")(app);

const db = require("./models");
//db.sequelize.sync();
db.sequelize
  .authenticate()
  .then(() => {
      console.log('Connection to database has been established successfully.');
  })
  .catch(err => {
      console.error('Unable to connect to the database:', err);
});

// set port, listen for requests
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});