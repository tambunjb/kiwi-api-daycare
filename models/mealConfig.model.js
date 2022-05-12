module.exports = (sequelize, Sequelize) => {
  const MealConfig = sequelize.define("meal_config", {
    day_of_month: {
      type: Sequelize.INTEGER
    },
    type: {
      type: Sequelize.STRING
    },
    meal: {
      type: Sequelize.STRING
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
  return MealConfig;
};
