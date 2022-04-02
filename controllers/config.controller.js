const db = require("../models");
const Config = db.config;
const Op = db.Sequelize.Op;

exports.add = (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const config = {
    name: req.body.name ?? null,
    desc: req.body.desc ?? null,
    value: req.body.value ?? null,
    created_by: req.user
  };
  
  Config.create(config)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Config."
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
    if(req.query.desc){
      condition.where.desc = { [Op.like]: `%${req.query.desc}%` }
    }
  	if(req.query.value){
  		condition.where.value = { [Op.like]: `%${req.query.value}%` }
  	}
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  Config.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving config."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Config.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Config with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Config with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Config.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Config with id=${id}. Maybe Config was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Config with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Config.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Config.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Config with id="+id
        });
    });
};