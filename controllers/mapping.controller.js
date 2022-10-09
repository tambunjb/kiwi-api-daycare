const db = require("../models");
const Mapping = db.mapping;
const User = db.user;
const Nanny = db.nanny;
const Child = db.child;
const Op = db.Sequelize.Op;


exports.addBulk = async (req, res, next) => {
  const mappings = req.body;
  // Validate request
  if (!mappings || !Array.isArray(mappings)) {
    return res.status(400).send({
      message: "Content invalid!"
    });
  }

  for(const mapping of mappings) {
    if(mapping.nanny_id==null || mapping.child_id==null)
        continue

    const nanny = await Nanny.findOne({ where: {id: mapping.nanny_id} })
    const child = await Child.findOne({ where: {id: mapping.child_id} })

    if(nanny==null) {
      return res.status(400).send({
        message: `Nanny id=${mapping.nanny_id} is invalid!`
      });
    }
    if(child==null) {
      return res.status(400).send({
        message: `Child id=${mapping.child_id} is invalid!`
      });
    }
    if(nanny.location_id != child.location_id) {
      return res.status(400).send({
        message: `Child id=${mapping.child_id} has different location with Nanny id=${mapping.nanny_id}!`
      });
    }

    let condition = {
      nanny_id: nanny.id, 
      child_id: child.id
    }

    await Mapping.findOne({ where: condition }).then(function(obj) {
      if(!obj){
        condition.created_by = req.user
        Mapping.create(condition)
          .then(data => {
          })
          .catch(err => {
            return res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Mapping."
            });
          });
      }
    })
  }

  return res.send({ message: 'Success!' });
}

exports.delBulk = async (req, res, next) => {
  const mappings = req.body;
  // Validate request
  if (!mappings || !Array.isArray(mappings)) {
    return res.status(400).send({
      message: "Content invalid!"
    });
  }

  for(const mapping of mappings) {
    if(mapping.nanny_id==null || mapping.child_id==null)
        continue

    const nanny = await Nanny.findOne({ where: {id: mapping.nanny_id} })
    const child = await Child.findOne({ where: {id: mapping.child_id} })

    if(nanny==null) {
      return res.status(400).send({
        message: `Nanny id=${mapping.nanny_id} is invalid!`
      });
    }
    if(child==null) {
      return res.status(400).send({
        message: `Child id=${mapping.child_id} is invalid!`
      });
    }

    let condition = {
      nanny_id: nanny.id, 
      child_id: child.id
    }

    await Mapping.findOne({ where: condition }).then(function(obj) {
      if(obj){
        Mapping.update({deleted_by: req.user}, {where: {id: obj.id}, silent: true})
        .then(num => {
          Mapping.destroy({where: { id: obj.id }})
        }).catch(err => {
          res.status(500).send({
            message: err.message || `Could not delete Mapping Nanny id=${mapping.nanny_id} with Child id=${mapping.child_id}`
            });
        });
      }
    })

  }

  return res.send({ message: 'Success!' });
}

exports.getByLocation = (req, res, next) => {
  const location_id = req.params.location_id;
  const nanny_id = req.params.nanny_id;

  let sub_condition = {};
  sub_condition.location_id = location_id;

  let condition = {};
  if(nanny_id=='all' || parseInt(nanny_id)%1===0) {
    if(nanny_id!='all')
      condition.nanny_id = parseInt(nanny_id)
  }else{
    return res.status(400).send({
      message: "Content invalid!"
    });
  }

  Mapping.findAll({ where: condition,
    include: [ {
        model: Nanny,
        where: sub_condition,
        paranoid: false,
        attributes: ['name']
      }, {
        model: Child,
        where: sub_condition,
        paranoid: false,
        attributes: ['name']
      }
    ]
  }).then(data => {
      if(data) {
        data = data.map((mapping, index) => {
          return {
            id: mapping.id,
            nanny_id: mapping.nanny_id,
            nanny_name: mapping.nanny.name,
            child_id: mapping.child_id,
            child_name: mapping.child.name,
            child_nickname: mapping.child.nickname ?? mapping.child.name
          }
        })
        res.send(data);
      }
      else res.send({});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving mapping."
      });
    });
}

exports.getBySameNannyLocation = async (req, res) => {
  let sub_condition = {};
  const user = await User.findOne({where: {phone: req.user}, include: Nanny});
  if(user.nanny){
    sub_condition.location_id = { [Op.eq]: user.nanny.location_id };
    sub_condition.is_active = { [Op.eq]: 1 };
  }

  let condition = {};
  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }
  condition.include = [ {
      model: Nanny,
      where: sub_condition,
      paranoid: false
    }, {
      model: Child,
      where: sub_condition,
      paranoid: false
    }
  ]

  Mapping.findAndCountAll(condition)
    .then(data => {
      data.rows = data.rows.map((mapping, index) => {
        return {
          id: mapping.id,
          nanny_id: mapping.nanny_id,
          nanny_name: mapping.nanny.name,
          child_id: mapping.child_id,
          child_name: mapping.child.name,
          child_nickname: mapping.child.nickname ?? mapping.child.name,
          child_meal_category: mapping.child.meal_category ?? 0,
          location_id: user.nanny.location_id
        }
      })

      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving report."
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

  const mapping = {
    nanny_id: req.body.nanny_id ?? null,
    child_id: req.body.child_id ?? null,
    created_by: req.user
  };
  
  Mapping.create(mapping)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Mapping."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
  	if(req.query.nanny_id){
  		condition.where.nanny_id = { [Op.eq]: req.query.nanny_id }
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

  Mapping.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving mapping."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  Mapping.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Mapping with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Mapping with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Mapping.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Mapping with id=${id}. Maybe Mapping was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Mapping with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Mapping.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Mapping.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Mapping with id="+id
        });
    });
};