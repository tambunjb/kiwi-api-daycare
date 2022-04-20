const db = require("../models");
const Config = db.config;
const Op = db.Sequelize.Op;

exports.getVersionUpdate = (req, res) => {
  const appid = req.params.appid;
  const version = req.params.version;
  if (!(version && appid)) {
    return res.status(400).send({
      message: "Invalid params!"
    });
  }

  const forced_key = `${appid}_${version}_update_forced`
  const recommend_key = `${appid}_${version}_update_recommend`

  let condition = {};
  condition.where = { [Op.or]: [
    { name: forced_key },
    { name: recommend_key }
  ]}

  Config.findAll(condition)
    .then(data => {
      let response = {};
      response.forced = data.find(item => item.name === forced_key)?data.find(item => item.name === forced_key).value:'0'
      response.recommend = data.find(item => item.name === recommend_key)?data.find(item => item.name === recommend_key).value:'0'
      res.send(response);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving config."
      });
    });
};

exports.setVersionUpdate = (req, res, next) => {
  const appid = req.body.appid ?? null
  const version = req.body.version ?? null
  const forced = req.body.forced ?? null
  const recommend = req.body.recommend ?? null

  // Validate request
  if (!(appid && version && forced && recommend)) {
    return res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  const forced_key = `${appid}_${version}_update_forced`
  const recommend_key = `${appid}_${version}_update_recommend`

  // forced
  Config.findOne({ where: {name: forced_key} })
    .then(function(obj) {
        // update
        if(obj){
          Config.update({ value: forced }, { where: {name: forced_key} }).then(num => {
              if (!(num == 1)) {
                return res.status(404).send({
                  message: `Cannot update Config with name=${forced_key}. Maybe Config was not found or req.body is empty!`
                });
              }
            })
            .catch(err => {
              return res.status(500).send({
                message: err.message || "Error updating Config with name="+forced_key
              });
            });

        } else {
          // insert
          const config = {
            name: forced_key,
            desc: `Forced update mechanism for App ${appid} - Version ${version}`,
            value: forced,
            created_by: req.user
          };
          Config.create(config)
            .then(data => {
            })
            .catch(err => {
              return res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the Config."
              });
            });
        }
    })

  // recommend
  Config.findOne({ where: {name: recommend_key} })
    .then(function(obj) {
        // update
        if(obj){
          Config.update({ value: recommend }, { where: {name: recommend_key} }).then(num => {
              if (!(num == 1)) {
                return res.status(404).send({
                  message: `Cannot update Config with name=${recommend_key}. Maybe Config was not found or req.body is empty!`
                });
              }
            })
            .catch(err => {
              return res.status(500).send({
                message: err.message || "Error updating Config with name="+recommend_key
              });
            });

        } else {
          // insert
          const config = {
            name: recommend_key,
            desc: `Recommend update mechanism for App ${appid} - Version ${version}`,
            value: recommend,
            created_by: req.user
          };
          Config.create(config)
            .then(data => {
            })
            .catch(err => {
              return res.status(500).send({
                message:
                  err.message || "Some error occurred while creating the Config."
              });
            });
        }
    })

    return res.send({message: 'Success'});
};

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