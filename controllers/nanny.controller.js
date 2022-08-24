const db = require("../models");
const Nanny = db.nanny;
const User = db.user;
const Op = db.Sequelize.Op;

exports.register = async (req, res) => {
  // Validate request
  if (!(req.body && (req.body.phone && req.body.name && req.body.location_id))) {
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

  const nanny = {
    name: req.body.name,
    location_id: req.body.location_id,
    created_by: req.user
  };

  return db.sequelize.transaction(function (t) {
    return User.create(user, {transaction: t}).then(function (user) {
      return user.createNanny(nanny, {transaction: t});
    });
  }).then(function (result) {
    return res.send({id: result.id});
  }).catch(function (err) {
    return res.status(500).send({
        message:
          err.message || "Some error occurred while registering the Nanny."
      });
  });
};

exports.getBySameLocation = async (req, res) => {
  let condition = {};
  const user = await User.findOne({where: {phone: req.user}, include: Nanny});
  condition.where = {};
  if(user.nanny){
    condition.where.location_id = user.nanny.location_id;
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  Nanny.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving nanny."
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

  const nanny = {
    user_id: req.body.user_id ?? null,
    name: req.body.name ?? null,
    location_id: req.body.location_id ?? null,
    is_active: req.body.is_active ?? 1,
    created_by: req.user
  };
  
  Nanny.create(nanny)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Nanny."
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
  	if(req.query.location_id){
  		condition.where.location_id = { [Op.eq]: req.query.location_id }
  	}
    if(req.query.is_active){
      condition.where.is_active = { [Op.eq]: req.query.is_active }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  Nanny.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving nanny."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Nanny.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Nanny with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Nanny with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Nanny.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Nanny with id=${id}. Maybe Nanny was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Nanny with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Nanny.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Nanny.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Nanny with id="+id
        });
    });
};