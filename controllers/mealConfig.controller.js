const db = require("../models");
const MealConfig = db.mealConfig;
const Location = db.location;
const Op = db.Sequelize.Op;

exports.setByLocation = async (req, res, next) => {
  const location_id = req.params.location_id;
  const meals = req.body;
  // Validate request
  if (!meals || !Array.isArray(meals)) {
    return res.status(400).send({
      message: "Content invalid!"
    });
  }

  // location_id jg perlu di cek ada ga
  if(!(await Location.findOne({ where: {id: location_id} }))) {
    return res.status(400).send({
        message: "Location invalid!"
    });   
  }

  for(const meal of meals) {
      if(meal.category==null || meal.day_of_month==null || meal.type==null || meal.meal==null)
        continue

      let condition = {
        location_id: location_id,
        category: meal.category, 
        type: meal.type, 
        day_of_month: meal.day_of_month
      } 

      await MealConfig.findOne({ where: condition }).then(function(obj) {
        // update
        if(obj){
          MealConfig.update({ meal: meal.meal, updated_by: req.user }, { where: condition })
            .then(num => {})
            .catch(err => {
              return res.status(500).send({
                message: err.message || "Error updating Meal Config"
              });
            });

        } else {
          // insert
          condition.meal = meal.meal
          condition.created_by = req.user
          MealConfig.create(condition)
            .then(data => {
            })
            .catch(err => {
              return res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the Meal Config."
              });
            });
        }
      })
  }

  return res.send({ location_id: location_id });

};

exports.getByLocation = (req, res, next) => {
  const location_id = req.params.location_id;
  const day_of_month = req.params.day_of_month;

  let condition = {};
  condition.location_id = location_id
  if(day_of_month=='all' || parseInt(day_of_month)%1===0) {
    if(day_of_month!='all')
      condition.day_of_month = parseInt(day_of_month)
  }else{
    return res.status(400).send({
      message: "Content invalid!"
    });
  }

  MealConfig.findAll({ where: condition })
    .then(data => {
      if(data)
        res.send(data);
      else res.send({});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving meal config."
      });
    });

}

exports.getByLocationCategory = (req, res, next) => {
  const location_id = req.params.location_id;
  const category = req.params.category;
  const day_of_month = req.params.day_of_month;

  let condition = {};
  condition.location_id = location_id
  condition.category = category
  if(day_of_month=='all' || parseInt(day_of_month)%1===0) {
    if(day_of_month!='all')
      condition.day_of_month = parseInt(day_of_month)
  }else{
    return res.status(400).send({
      message: "Content invalid!"
    });
  }

  MealConfig.findAll({ where: condition })
    .then(data => {
      if(data)
        res.send(data);
      else res.send({});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving meal config."
      });
    });

}

exports.add = (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const mealConfig = {
    location_id: req.body.location_id ?? null,
    day_of_month: req.body.day_of_month ?? null,
    category: req.body.category ?? null,
    type: req.body.type ?? null,
    meal: req.body.meal ?? null,
    created_by: req.user
  };
  
  MealConfig.create(mealConfig)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the MealConfig."
      });
    });
};

exports.index = (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
  	if(req.query.location_id){
  		condition.where.location_id = { [Op.eq]: req.query.location_id }
  	}
    if(req.query.category){
      condition.where.category = { [Op.eq]: req.query.category }
    }
  	if(req.query.day_of_month){
  		condition.where.day_of_month = { [Op.eq]: req.query.day_of_month }
  	}
  	if(req.query.type){
  		condition.where.type = { [Op.eq]: req.query.type }
  	}
    if(req.query.meal){
      condition.where.meal = { [Op.like]:`%${req.query.meal}%` }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  MealConfig.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving mealConfig."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  MealConfig.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find MealConfig with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving MealConfig with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  MealConfig.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update MealConfig with id=${id}. Maybe MealConfig was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating MealConfig with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  MealConfig.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      MealConfig.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete MealConfig with id="+id
        });
    });
};