module.exports = (sequelize, Sequelize) => {
  const Nanny = sequelize.define("nanny", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    location_id: {
      type: Sequelize.INTEGER
    },
    deleted_at: {
      type: Sequelize.DATE
    },
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

  return Nanny;
};
