const db = require("../models");
const MilkSession = db.milkSession;
const Op = db.Sequelize.Op;

exports.add = (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const milkSession = {
    report_id: req.body.report_id ?? null,
    time: req.body.time ?? null,
    volume: req.body.volume ?? null,
    notes: req.body.notes ?? null,
    created_by: req.user
  };
  
  MilkSession.create(milkSession)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the MilkSession."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
  	if(req.query.report_id){
  		condition.where.report_id = { [Op.eq]: req.query.report_id }
  	}
  	if(req.query.time){
  		condition.where.time = { [Op.like]:`%${req.query.time}%` }
  	}
  	if(req.query.volume){
  		condition.where.volume = { [Op.eq]: req.query.volume }
  	}
    if(req.query.notes){
      condition.where.notes = { [Op.like]:`%${req.query.notes}%` }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  MilkSession.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving milkSession."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  MilkSession.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find MilkSession with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving MilkSession with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  MilkSession.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update MilkSession with id=${id}. Maybe MilkSession was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating MilkSession with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  MilkSession.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      MilkSession.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete MilkSession with id="+id
        });
    });
};