const db = require("../config/db.js");

db.getPagination = (page, size) => {
  const limit = size ? +size : db.indexSize;
  const offset = page ? page * limit : -1;
  return { limit, offset };
};

db.getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: rows } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, rows, totalPages, currentPage };
};

db.user = require("./user.model.js")(db.sequelize, db.Sequelize);
db.nanny = require("./nanny.model.js")(db.sequelize, db.Sequelize);
db.child = require("./child.model.js")(db.sequelize, db.Sequelize);
db.config = require("./config.model.js")(db.sequelize, db.Sequelize);
db.location = require("./location.model.js")(db.sequelize, db.Sequelize);
db.report = require("./report.model.js")(db.sequelize, db.Sequelize);
db.milkSession = require("./milkSession.model.js")(db.sequelize, db.Sequelize);
db.mealConfig = require("./mealConfig.model.js")(db.sequelize, db.Sequelize);

// user - nanny
db.user.hasOne(db.nanny, {
  foreignKey: 'user_id'
});
db.nanny.belongsTo(db.user, {
  foreignKey: {
    name: 'user_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});

// location - mealConfig
db.location.hasMany(db.mealConfig, {
  foreignKey: 'location_id'
});
db.mealConfig.belongsTo(db.location, {
  foreignKey: {
    name: 'location_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});

// report - nanny - child - milkSession - location
db.nanny.hasMany(db.report, {
  foreignKey: 'nanny_id'
});
db.report.belongsTo(db.nanny, {
  foreignKey: {
    name: 'nanny_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});
db.child.hasMany(db.report, {
  foreignKey: 'child_id'
});
db.report.belongsTo(db.child, {
  foreignKey: {
    name: 'child_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});
db.report.belongsTo(db.location, {
  foreignKey: {
    name: 'location_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});
db.report.hasMany(db.milkSession, {
  foreignKey: 'report_id'
});
db.milkSession.belongsTo(db.report, {
  foreignKey: {
    name: 'report_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = db;