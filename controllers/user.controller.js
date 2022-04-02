const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;
const Nanny = db.nanny;

exports.register = async (req, res) => {

  // phone unique validation
  const oldUser = await User.findOne({where: {phone: req.body.phone}});
  if (oldUser) {
    return res.status(409).send("User Already Exist.");
  }

  //Encrypt user password
  //encryptedPassword = await bcrypt.hash(password, 10);

  // Create token
  const token = await db.userToken({ phone: req.body.phone ?? null });

  const user = {
    phone: req.body.phone ?? null,
    is_admin: req.body.is_admin ?? 0,
    token: token
  };

  User.create(user)
    .then(data => {
      if(data){
        return User.scope('defaultScope', 'auth').findByPk(data.id).then(data => {
          if(data) {
            return res.send(data);
          }
        });
      }
      return res.status(500).send("Some error occurred while creating the User.");
    })
    .catch(err => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

exports.login = async (req, res) => {
  let condition = {
    phone: req.body.phone ?? null
  };

  User.findOne({ where: condition })
    .then(async (data) => {
      if(data) {
        if(data.token != null)
          condition.token = data.token;
        
        const token = await db.userToken(condition);
        return User.update({token: token, last_login: require('moment')().format('YYYY-MM-DD HH:mm:ss')}, {where: { id: data.id }, silent: true})
          .then(num => {
            return User.scope('defaultScope', 'auth').findByPk(data.id).then(data => {
              if(data) {
                return res.send(data);
              }
            });
          });
      }
      return res.status(400).send("Invalid Credentials");
    }).catch(err => {
      return res.status(500).send({
        message:
          err.message || "Some error occurred while logging the User."
      });
    });
};

exports.add = (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const user = {
    username: req.body.username ?? null,
    password: req.body.password ?? null,
    email: req.body.email ?? null,
    phone: req.body.phone ?? null,
    is_admin: req.body.is_admin ?? 0,
    created_by: req.user
  };
  
  User.create(user)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
    if(req.query.username){
      condition.where.username = { [Op.like]: `%${req.query.username}%` }
    }
    if(req.query.email){
      condition.where.email = { [Op.like]: `%${req.query.email}%` }
    }
    if(req.query.phone){
      condition.where.phone = { [Op.like]: `%${req.query.phone}%` }
    }
    if(req.query.is_admin){
      condition.where.is_admin = { [Op.eq]: req.query.is_admin }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  User.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving user."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  User.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find User with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving User with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  User.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating User with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  User.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      User.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete User with id="+id
        });
    });
};