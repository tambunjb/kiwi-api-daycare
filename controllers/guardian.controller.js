const db = require("../models");
const Guardian = db.guardian;
const User = db.user;
const Op = db.Sequelize.Op;

exports.register = async (req, res) => {
  // Validate request
  if (!(req.body && (req.body.phone && req.body.name && req.body.role))) {
    return res.status(400).send({
      message: "Field(s) are missing."
    });
  }
  // phone unique validation
  const oldUser = await User.findOne({where: {phone: req.body.phone}});
  if (oldUser) {
    return res.status(409).send({
      message: "Phone Already Registered."});
  }

  const token = await db.userToken({ phone: req.body.phone });
  const user = {
    phone: req.body.phone,
    token: token,
    created_by: req.user
  };

  const guardian = {
    name: req.body.name,
    role: req.body.role,
    created_by: req.user
  };

  return db.sequelize.transaction(function (t) {
    return User.create(user, {transaction: t}).then(function (user) {
      return user.createGuardian(guardian, {transaction: t});
    });
  }).then(function (result) {
    return res.send({id: result.id});
  }).catch(function (err) {
    return res.status(500).send({
        message:
          err.message || "Some error occurred while registering the Guardian."
      });
  });
};

exports.add = (req, res) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const guardian = {
    user_id: req.body.user_id ?? null,
    name: req.body.name ?? null,
    role: req.body.role ?? null,
    is_active: req.body.is_active ?? 1,
    created_by: req.user
  };
  
  Guardian.create(guardian)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Guardian."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
  	if(req.query.user_id){
      condition.where.user_id = { [Op.like]: `%${req.query.user_id}%` }
    }
    if(req.query.name){
  		condition.where.name = { [Op.like]: `%${req.query.name}%` }
  	}
    if(req.query.role){
      condition.where.role = { [Op.like]: `%${req.query.role}%` }
    }
    if(req.query.is_active){
      condition.where.is_active = { [Op.eq]: `%${req.query.is_active}%` }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  Guardian.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving guardian."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Guardian.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Guardian with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Guardian with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Guardian.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Guardian with id=${id}. Maybe Guardian was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Guardian with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Guardian.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Guardian.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Guardian with id="+id
        });
    });
};