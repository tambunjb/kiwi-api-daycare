const db = require("../models");
const Location = db.location;
const Op = db.Sequelize.Op;

exports.add = (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const location = {
    name: req.body.name ?? null,
    address: req.body.address ?? '',
    desc: req.body.desc ?? '',
    is_active: req.body.is_active ?? 1,
    created_by: req.user
  };
  
  Location.create(location)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Location."
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
  	if(req.query.address){
  		condition.where.address = { [Op.like]: `%${req.query.address}%` }
  	}
  	if(req.query.desc){
  		condition.where.desc = { [Op.like]: `%${req.query.desc}%` }
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

  Location.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving location."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Location.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Location with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Location with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Location.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Location with id=${id}. Maybe Location was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Location with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Location.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Location.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Location with id="+id
        });
    });
};