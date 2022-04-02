module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    username: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING,
      validate: { isEmail: true }
    },
    phone: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    token: {
      type: Sequelize.STRING
    },
    is_admin: {
      type: Sequelize.BOOLEAN
    },
    last_login: {
      type: Sequelize.DATE,
      get() {
          return !isNaN(this.getDataValue('last_login'))?require('moment')(this.getDataValue('last_login')).format('YYYY-MM-DD HH:mm:ss'):null;
      }
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
  }, {
    defaultScope: {
      attributes: { exclude: ['deleted_at', 'deleted_by', 'created_at', 'created_by', 'updated_at', 'updated_by'] }
    },
    scopes: {
      auth: {
        attributes: { exclude: ['id', 'username', 'password', 'email', 'last_login'] }
      }
    }
  });

  return User;
};

