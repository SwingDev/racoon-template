const bcrypt = require('bcrypt');
const Promise = require('bluebird');
const Sequelize = require('sequelize');

Promise.promisifyAll(bcrypt);


module.exports = (config, providers) => {
  const User = providers.sequelize.define('user', {
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
        len: [1,255]
      }
    },
    password_digest: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: Sequelize.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    password_confirmation: {
      type: Sequelize.VIRTUAL
    }
  }, {
    freezeTableName: true,
    indexes: [{ unique: true, fields: ['email'] }],
    instanceMethods: {
      authenticate: function(value) {
        return bcrypt.compare(value, this.password_digest)
          .then(isCorrect => isCorrect ? this : null);
      }
    }
  });

  function updateUserPassword(user, options) {
    return Promise.resolve(user)
      .tap((user) => {
        if (user.password !== user.password_confirmation) {
          throw new Error("Password confirmation doesn't match Password");
        }
      })
      .then(user => {
        return bcrypt.hashAsync(user.get('password'), 10)
          .then((hash) => {
            user.set('password_digest', hash);
          });
      });
  };

  User.beforeCreate((user, options) => {
    return Promise.resolve(user)
      .then(user => {
        user.email = user.email.toLowerCase();

        if (!user.password) { return null; }

        return updateUserPassword(user);
      });
  });
  User.beforeUpdate((user, options) => {
    return Promise.resolve(user)
      .then(user => {
        user.email = user.email.toLowerCase();

        if (!user.password) { return null; }

        return updateUserPassword(user);
      });
  })

  return { User };
};
