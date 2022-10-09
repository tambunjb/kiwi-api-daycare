const db = require("../models");
const NapTime = db.napTime;
const Report = db.report;
const Op = db.Sequelize.Op;

exports.migrate = async (req, res, next) => {
  Report.findAndCountAll()
    .then(data => {
      data.rows.forEach(async (row) => {
        let condition = {};
        
        if(!((row.naptime1_start==null && row.naptime1_end==null) || (row.naptime1_start=='00:00:00' && row.naptime1_end=='00:00:00'))) {
          // first
          condition.where = {
            report_id: row.id,
            start: row.naptime1_start,
            end: row.naptime1_end
          };
          const first = await NapTime.findOne(condition);
          if(!first) {
            const napTime = {
              report_id: row.id,
              start: row.naptime1_start,
              end: row.naptime1_end,
              notes: row.naptime1_notes,
              created_by: req.user
            };

            NapTime.create(napTime)
              .then(data => {
                
              })
              .catch(err => {
                res.status(500).send({
                  message:
                    err.message || "Some error occurred while creating the NapTime."
                });
              });
          }  
        }

        if(!((row.naptime2_start==null && row.naptime2_end==null) || (row.naptime2_start=='00:00:00' && row.naptime2_end=='00:00:00'))) {
          // second
          condition.where = {
            report_id: row.id,
            start: row.naptime2_start,
            end: row.naptime2_end
          };
          const second = await NapTime.findOne(condition);
          if(!second) {
            const napTime = {
              report_id: row.id,
              start: row.naptime2_start,
              end: row.naptime2_end,
              notes: row.naptime2_notes,
              created_by: req.user
            };

            NapTime.create(napTime)
              .then(data => {
                
              })
              .catch(err => {
                res.status(500).send({
                  message:
                    err.message || "Some error occurred while creating the NapTime."
                });
              });
          }
        }

        if(!((row.naptime3_start==null && row.naptime3_end==null) || (row.naptime3_start=='00:00:00' && row.naptime3_end=='00:00:00'))) {
          // third
          condition.where = {
            report_id: row.id,
            start: row.naptime3_start,
            end: row.naptime3_end
          };
          const third = await NapTime.findOne(condition);
          if(!third) {
            const napTime = {
              report_id: row.id,
              start: row.naptime3_start,
              end: row.naptime3_end,
              notes: row.naptime3_notes,
              created_by: req.user
            };

            NapTime.create(napTime)
              .then(data => {
                
              })
              .catch(err => {
                res.status(500).send({
                  message:
                    err.message || "Some error occurred while creating the NapTime."
                });
              });
          }
        }

      })
      
      res.status(200).send();
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

  const napTime = {
    report_id: req.body.report_id ?? null,
    start: req.body.start ?? null,
    end: req.body.end ?? null,
    notes: req.body.notes ?? null,
    created_by: req.user
  };
  
  NapTime.create(napTime)
    .then(data => {
      res.send({id: data.id});
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the NapTime."
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
  	if(req.query.start){
  		condition.where.start = { [Op.like]:`%${req.query.start}%` }
  	}
  	if(req.query.end){
  		condition.where.end = { [Op.eq]: req.query.end }
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

  NapTime.findAndCountAll(condition)
    .then(data => {
      const response = db.getPagingData(data, page, limit);
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving napTime."
      });
    });
};

exports.view = (req, res) => {
  const id = req.params.id;
  NapTime.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find NapTime with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving NapTime with id="+id
      });
    });
};

exports.edit = (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  NapTime.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({id: id});
      } else {
        res.status(404).send({
          message: `Cannot update NapTime with id=${id}. Maybe NapTime was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error updating NapTime with id="+id
      });
    });
};

exports.del = (req, res) => {
  const id = req.params.id;

  NapTime.update({deleted_by: req.user}, {where: {id: id}, silent: true})
    .then(num => {
      NapTime.destroy({where: { id: id }})
        .then(function(){
          res.send({ id: id });
      });
    }).catch(err => {
      res.status(500).send({
        message: err.message || "Could not delete NapTime with id="+id
        });
    });
};