module.exports = (sequelize, Sequelize) => {
  const MilkSession = sequelize.define("milk_session", {
    time: {
      type: Sequelize.TIME,
      allowNull: false
    },
    volume: {
      type: Sequelize.INTEGER
    },
    notes: {
      type: Sequelize.STRING
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
  return MilkSession;
};
