module.exports = (sequelize, Sequelize) => {
  const Child = sequelize.define("child", {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    nickname: {
      type: Sequelize.STRING
    },
    location_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    gender: {
      type: Sequelize.STRING,
      allowNull: false
    },
    date_of_birth: {
      type: Sequelize.DATEONLY
    },
    is_active: {
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
  return Child;
};
