const db = require("../models");
const Rating = db.rating;
const Guardian = db.guardian;
const Report = db.report;
const User = db.user;
const Op = db.Sequelize.Op;

exports.add = async (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const user = await User.findOne({where: {phone: req.user}, include: Guardian});

  const rating = {
    guardian_id: req.body.guardian_id ?? (user.guardian.id ?? null),
    report_id: req.body.report_id ?? null,
    date: req.body.date ?? null,
    rating: req.body.rating ?? null,
    items: req.body.items ?? null,
    review: req.body.review ?? null,
    created_by: req.user
  };
  
  Rating.create(rating)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Rating."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
  	if(req.query.guardian_id){
  		condition.where.guardian_id = { [Op.eq]: req.query.guardian_id }
  	}
  	if(req.query.report_id){
      condition.where.report_id = { [Op.eq]: req.query.report_id }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  Rating.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving rating."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Rating.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Rating with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Rating with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Rating.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Rating with id=${id}. Maybe Rating was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Rating with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Rating.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Rating.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Rating with id="+id
        });
    });
};