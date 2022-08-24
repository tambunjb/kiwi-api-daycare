const db = require("../models");
const Child = db.child;
const User = db.user;
const Nanny = db.nanny;
const Op = db.Sequelize.Op;

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

  Child.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving child."
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

  const child = {
    name: req.body.name ?? null,
    nickname: req.body.nickname ?? null,
    location_id: req.body.location_id ?? null,
    gender: req.body.gender ?? null,
    date_of_birth: req.body.date_of_birth ?? null,
    is_active: req.body.is_active ?? 1,
    created_by: req.user
  };
  
  Child.create(child)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Child."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
  	if(req.query.name){
  		condition.where.name = { [Op.like]: `%${req.query.name}%` }
  	}
    if(req.query.nickname){
      condition.where.nickname = { [Op.like]: `%${req.query.nickname}%` }
    }
    if(req.query.location_id){
      condition.where.location_id = { [Op.eq]: req.query.location_id }
    }
  	if(req.query.gender){
  		condition.where.gender = { [Op.eq]: req.query.gender }
  	}
  	if(req.query.date_of_birth){
  		condition.where.date_of_birth = { [Op.like]: `%${req.query.date_of_birth}%` }
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

  Child.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving child."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Child.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Child with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Child with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Child.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Child with id=${id}. Maybe Child was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Child with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Child.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Child.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Child with id="+id
        });
    });
};