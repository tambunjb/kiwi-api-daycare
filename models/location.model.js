module.exports = (sequelize, Sequelize) => {
  const Location = sequelize.define("location", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    address: {
      type: Sequelize.STRING
    },
    desc: {
      type: Sequelize.STRING
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

  return Location;
};
