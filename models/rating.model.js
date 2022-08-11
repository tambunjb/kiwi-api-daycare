module.exports = (sequelize, Sequelize) => {
  const Rating = sequelize.define("rating", {
    date: {
      type: Sequelize.DATEONLY
    },
    rating: {
      type: Sequelize.INTEGER
    },
    items: {
      type: Sequelize.STRING
    },
    review: {
      type: Sequelize.STRING
    },
    is_submit: {
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

  return Rating;
};
