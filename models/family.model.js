module.exports = (sequelize, Sequelize) => {
  const Family = sequelize.define("family", {
    deleted_by: {
      type: Sequelize.STRING
    },
    created_at: {
      type: Sequelize.DATE
    },
    created_by: {
      type: Sequelize.STRING
    },
    updated_at: {
      type: Sequelize.DATE
    },
    updated_by: {
      type: Sequelize.STRING
    }
  },{
    defaultScope: {
      attributes: { exclude: ['deleted_at', 'deleted_by', 'created_at', 'created_by', 'updated_at', 'updated_by'] }
    }
  });
  return Family;
};
