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
db.mapping = require("./mapping.model.js")(db.sequelize, db.Sequelize);
db.guardian = require("./guardian.model.js")(db.sequelize, db.Sequelize);
db.family = require("./family.model.js")(db.sequelize, db.Sequelize);
db.rating = require("./rating.model.js")(db.sequelize, db.Sequelize);

// rating
db.guardian.hasMany(db.rating, {
  foreignKey: 'guardian_id'
});
db.report.hasMany(db.rating, {
  foreignKey: 'report_id'
});
db.rating.belongsTo(db.guardian, {
  foreignKey: {
    name: 'guardian_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});
db.rating.belongsTo(db.report, {
  foreignKey: {
    name: 'report_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});

// user - guardian
db.user.hasOne(db.guardian, {
  foreignKey: 'user_id'
});
db.guardian.belongsTo(db.user, {
  foreignKey: {
    name: 'user_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});

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

// family
db.guardian.hasMany(db.family, {
  foreignKey: 'guardian_id'
});
db.child.hasMany(db.family, {
  foreignKey: 'child_id'
});
db.family.belongsTo(db.guardian, {
  foreignKey: {
    name: 'guardian_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});
db.family.belongsTo(db.child, {
  foreignKey: {
    name: 'child_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});

// mapping
db.nanny.hasMany(db.mapping, {
  foreignKey: 'nanny_id'
});
db.child.hasMany(db.mapping, {
  foreignKey: 'child_id'
});
db.mapping.belongsTo(db.nanny, {
  foreignKey: {
    name: 'nanny_id',
    type: db.Sequelize.INTEGER,
    allowNull: false
  }
});
db.mapping.belongsTo(db.child, {
  foreignKey: {
    name: 'child_id',
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