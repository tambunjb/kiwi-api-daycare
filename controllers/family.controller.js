const db = require("../models");
const Family = db.family;
const Parent = db.parent;
const Child = db.child;
const Op = db.Sequelize.Op;


exports.add = (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const family = {
    parent_id: req.body.parent_id ?? null,
    child_id: req.body.child_id ?? null,
    created_by: req.user
  };
  
  Family.create(family)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Family."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
  	if(req.query.parent_id){
  		condition.where.parent_id = { [Op.eq]: req.query.parent_id }
  	}
  	if(req.query.child_id){
      condition.where.child_id = { [Op.eq]: req.query.child_id }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  Family.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving family."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Family.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Family with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Family with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Family.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Family with id=${id}. Maybe Family was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Family with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Family.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Family.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Family with id="+id
        });
    });
};