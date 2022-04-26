const db = require("../models");
const Report = db.report;
const User = db.user;
const Nanny = db.nanny;
const MilkSession = db.milkSession;
const Op = db.Sequelize.Op;

exports.setAbsent = async (req, res) => {
  const id = req.params.id;

  const fieldsAbsent = {
    attendance: 0,
    updated_by: req.user,
    arrival_time: null,
    shared_at: null,
    child_feeling: null,
    temperature: null,
    condition: null,
    condition_notes: null,
    weight: null,
    breakfast: null,
    breakfast_qty: null,
    breakfast_notes: null,
    morningsnack: null,
    morningsnack_qty: null,
    morningsnack_notes: null,
    lunch: null,
    lunch_qty: null,
    lunch_notes: null,
    afternoonsnack: null,
    afternoonsnack_qty: null,
    afternoonsnack_notes: null,
    dinner: null,
    dinner_qty: null,
    dinner_notes: null,
    naptime1_start: null,
    naptime1_end: null,
    naptime1_notes: null,
    naptime2_start: null,
    naptime2_end: null,
    naptime2_notes: null,
    naptime3_start: null,
    naptime3_end: null,
    naptime3_notes: null,
    num_of_potty: null,
    potty_notes: null,
    is_morning_bath: null,
    is_afternoon_bath: null,
    medication: null,
    medication_notes: null,
    activities: null,
    things_tobring_tmr: null,
    special_notes: null
  }

  let condition = {};
  condition.where = { report_id: id }

  db.sequelize.transaction(function(t) {
    MilkSession.findAll(condition)
      .then(data => {
        for(let i=0;i<data.length;i++) {
          MilkSession.update({deleted_by: req.user}, {where: {id: data[i].id}, silent: true}, {transaction: t})
            .then(num => {
              MilkSession.destroy({where: { id: data[i].id }}, {transaction: t});
            });
        }

        Report.update(fieldsAbsent, {where: { id: id }}, {transaction: t}).then(num => {
          if(num==1) res.send({id: id})
        })
    });
  }).catch(err => {
    res.status(500).send({
      message: err.message || "Error updating Report"
    });
  });

}

exports.getBySameNannyLocation = async (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
    if(req.query.date){
      condition.where.date = { [Op.eq]: req.query.date }
    }
  }
  const user = await User.findOne({where: {phone: req.user}, include: Nanny});
  if(user.nanny){
    condition.where.location_id = { [Op.eq]: user.nanny.location_id };
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  condition.include = [{model: MilkSession}];
  Report.findAndCountAll(condition)
    .then(data => {
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

exports.add = async (req, res, next) => {
  // Validate request
  if (!req.body) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const user = await User.findOne({where: {phone: req.user}, include: Nanny});

  const report = {
    created_by: req.user,
    nanny_id: req.body.nanny_id ?? null,
    child_id: req.body.child_id ?? null,
    location_id: user.nanny.location_id ?? null,
    date: req.body.date ?? null,
    shared_at: req.body.shared_at ?? null,
    attendance: req.body.attendance ?? null,
    arrival_time: req.body.arrival_time ?? null,
    child_feeling: req.body.child_feeling ?? null,
    temperature: req.body.temperature ?? null,
    condition: req.body.condition ?? null,
    condition_notes: req.body.condition_notes ?? null,
    weight: req.body.weight ?? null,
    breakfast: req.body.breakfast ?? null,
    breakfast_qty: req.body.breakfast_qty ?? null,
    breakfast_notes: req.body.breakfast_notes ?? null,
    morningsnack: req.body.morningsnack ?? null,
    morningsnack_qty: req.body.morningsnack_qty ?? null,
    morningsnack_notes: req.body.morningsnack_notes ?? null,
    lunch: req.body.lunch ?? null,
    lunch_qty: req.body.lunch_qty ?? null,
    lunch_notes: req.body.lunch_notes ?? null,
    afternoonsnack: req.body.afternoonsnack ?? null,
    afternoonsnack_qty: req.body.afternoonsnack_qty ?? null,
    afternoonsnack_notes: req.body.afternoonsnack_notes ?? null,
    dinner: req.body.dinner ?? null,
    dinner_qty: req.body.dinner_qty ?? null,
    dinner_notes: req.body.dinner_notes ?? null,
    naptime1_start: req.body.naptime1_start ?? null,
    naptime1_end: req.body.naptime1_end ?? null,
    naptime1_notes: req.body.naptime1_notes ?? null,
    naptime2_start: req.body.naptime2_start ?? null,
    naptime2_end: req.body.naptime2_end ?? null,
    naptime2_notes: req.body.naptime2_notes ?? null,
    naptime3_start: req.body.naptime3_start ?? null,
    naptime3_end: req.body.naptime3_end ?? null,
    naptime3_notes: req.body.naptime3_notes ?? null,
    num_of_potty: req.body.num_of_potty ?? null,
    potty_notes: req.body.potty_notes ?? null,
    is_morning_bath: req.body.is_morning_bath ?? null,
    is_afternoon_bath: req.body.is_afternoon_bath ?? null,
    medication: req.body.medication ?? null,
    medication_notes: req.body.medication_notes ?? null,
    activities: req.body.activities ?? null,
    things_tobring_tmr: req.body.things_tobring_tmr ?? null,
    special_notes: req.body.special_notes ?? null
  };
  
  Report.create(report)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Report."
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
    if(req.query.location_id){
      condition.where.location_id = { [Op.eq]: req.query.location_id }
    }
    if(req.query.date){
      condition.where.date = { [Op.like]: `%${req.query.date}%` }
    }
  	if(req.query.shared_at){
  		condition.where.shared_at = { [Op.like]: `%${req.query.shared_at}%` }
  	}
    if(req.query.attendance){
      condition.where.attendance = { [Op.eq]: req.query.attendance }
    }
    if(req.query.arrival_time){
      condition.where.arrival_time = { [Op.like]: `%${req.query.arrival_time}%` }
    }
    if(req.query.child_feeling){
      condition.where.child_feeling = { [Op.eq]: req.query.child_feeling }
    }
    if(req.query.temperature){
      condition.where.temperature = { [Op.like]: `%${req.query.temperature}%` }
    }
    if(req.query.condition){
      condition.where.condition = { [Op.like]: `%${req.query.condition}%` }
    }
    if(req.query.condition_notes){
      condition.where.condition_notes = { [Op.like]: `%${req.query.condition_notes}%` }
    }
    if(req.query.weight){
      condition.where.weight = { [Op.like]: `%${req.query.weight}%` }
    }
    if(req.query.breakfast){
      condition.where.breakfast = { [Op.like]: `%${req.query.breakfast}%` }
    }
    if(req.query.breakfast_qty){
      condition.where.breakfast_qty = { [Op.like]: `%${req.query.breakfast_qty}%` }
    }
    if(req.query.breakfast_notes){
      condition.where.breakfast_notes = { [Op.like]: `%${req.query.breakfast_notes}%` }
    }
    if(req.query.morningsnack){
      condition.where.morningsnack = { [Op.like]: `%${req.query.morningsnack}%` }
    }
    if(req.query.morningsnack_qty){
      condition.where.morningsnack_qty = { [Op.like]: `%${req.query.morningsnack_qty}%` }
    }
    if(req.query.morningsnack_notes){
      condition.where.morningsnack_notes = { [Op.like]: `%${req.query.morningsnack_notes}%` }
    }
    if(req.query.lunch){
      condition.where.lunch = { [Op.like]: `%${req.query.lunch}%` }
    }
    if(req.query.lunch_qty){
      condition.where.lunch_qty = { [Op.like]: `%${req.query.lunch_qty}%` }
    }
    if(req.query.lunch_notes){
      condition.where.lunch_notes = { [Op.like]: `%${req.query.lunch_notes}%` }
    }
    if(req.query.afternoonsnack){
      condition.where.afternoonsnack = { [Op.like]: `%${req.query.afternoonsnack}%` }
    }
    if(req.query.afternoonsnack_qty){
      condition.where.afternoonsnack_qty = { [Op.like]: `%${req.query.afternoonsnack_qty}%` }
    }
    if(req.query.afternoonsnack_notes){
      condition.where.afternoonsnack_notes = { [Op.like]: `%${req.query.afternoonsnack_notes}%` }
    }
    if(req.query.dinner){
      condition.where.dinner = { [Op.like]: `%${req.query.dinner}%` }
    }
    if(req.query.dinner_qty){
      condition.where.dinner_qty = { [Op.like]: `%${req.query.dinner_qty}%` }
    }
    if(req.query.dinner_notes){
      condition.where.dinner_notes = { [Op.like]: `%${req.query.dinner_notes}%` }
    }
    if(req.query.naptime1_start){
      condition.where.naptime1_start = { [Op.like]: `%${req.query.naptime1_start}%` }
    }
    if(req.query.naptime1_end){
      condition.where.naptime1_end = { [Op.like]: `%${req.query.naptime1_end}%` }
    }
    if(req.query.naptime1_notes){
      condition.where.naptime1_notes = { [Op.like]: `%${req.query.naptime1_notes}%` }
    }
    if(req.query.naptime2_start){
      condition.where.naptime2_start = { [Op.like]: `%${req.query.naptime2_start}%` }
    }
    if(req.query.naptime2_end){
      condition.where.naptime2_end = { [Op.like]: `%${req.query.naptime2_end}%` }
    }
    if(req.query.naptime2_notes){
      condition.where.naptime2_notes = { [Op.like]: `%${req.query.naptime2_notes}%` }
    }
    if(req.query.naptime3_start){
      condition.where.naptime3_start = { [Op.like]: `%${req.query.naptime3_start}%` }
    }
    if(req.query.naptime3_end){
      condition.where.naptime3_end = { [Op.like]: `%${req.query.naptime3_end}%` }
    }
    if(req.query.naptime3_notes){
      condition.where.naptime3_notes = { [Op.like]: `%${req.query.naptime3_notes}%` }
    }
    if(req.query.num_of_potty){
      condition.where.num_of_potty = { [Op.like]: `%${req.query.num_of_potty}%` }
    }
    if(req.query.potty_notes){
      condition.where.potty_notes = { [Op.like]: `%${req.query.potty_notes}%` }
    }
    if(req.query.is_morning_bath){
      condition.where.is_morning_bath = { [Op.eq]: req.query.is_morning_bath }
    }
    if(req.query.is_afternoon_bath){
      condition.where.is_afternoon_bath = { [Op.eq]: req.query.is_afternoon_bath }
    }
    if(req.query.medication){
      condition.where.medication = { [Op.eq]: req.query.medication }
    }
    if(req.query.medication_notes){
      condition.where.medication_notes = { [Op.like]: `%${req.query.medication_notes}%` }
    }
    if(req.query.activities){
      condition.where.activities = { [Op.like]: `%${req.query.activities}%` }
    }
    if(req.query.things_tobring_tmr){
      condition.where.things_tobring_tmr = { [Op.like]: `%${req.query.things_tobring_tmr}%` }
    }
    if(req.query.special_notes){
      condition.where.special_notes = { [Op.like]: `%${req.query.special_notes}%` }
    }
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  Report.findAndCountAll(condition)
    .then(data => {
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

exports.view = (req, res) => {
  const id = req.params.id;
  Report.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Report with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Report with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  Report.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update Report with id=${id}. Maybe Report was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating Report with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  Report.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      Report.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete Report with id="+id
        });
    });
};