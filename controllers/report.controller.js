const db = require("../models");
const Report = db.report;
const User = db.user;
const Guardian = db.guardian;
const Family = db.family;
const Nanny = db.nanny;
const Child = db.child;
const MilkSession = db.milkSession;
const Location = db.location;
const Rating = db.rating;
const Op = db.Sequelize.Op;
const notif_day_of_week = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const notif_month_name = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']


exports.setAbsent = async (req, res) => {
  const id = req.params.id;

  const fieldsAbsent = {
    attendance: 0,
    updated_by: req.user,
    arrival_time: null,
    // is_ready_to_share: 0,
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

exports.sendNotif = async (req, res) => {
  const id = req.params.id;

  Report.findOne({where: {id: id}, include: Child})
    .then(async (data) => {

      const notif_name = data.child.nickname ?? data.child.name
      const notif_date = new Date(data.date).getDate()
      const notif_day = notif_day_of_week[new Date(data.date).getDay()]
      const notif_month = notif_month_name[new Date(data.date).getMonth()]
      const firebase_msg = {
        topic: `kidparent_childid_${data.child_id}`,
        notification: {},
        data: {
          report_id: `${data.id}`
        },
        android: {
          priority: 'high',
          notification: {
            channel_id: 'kidparent_importance_channel'
          }
        },
        apns: {
          headers: {
            'apns-priority': '10'
          }
        }
      };

      if (data.is_ready_to_share == 0) {
        
        const body = {}
        body.is_ready_to_share = 1;
        body.updated_by = req.user;
        await Report.update(body, {
          where: { id: id }
        })
          .then(num => {
            if (num == 1) {
                  
              firebase_msg.notification.title = `Daily Report ${notif_name} siap dibaca~`
              firebase_msg.notification.body = `Yuk lihat bagaimana perkembangan ${notif_name} per hari ${notif_day} tanggal ${notif_date} ${notif_month}.\n\nTerima kasih sudah mempercayakan ${notif_name} di KinderCastle :)`
              firebase_msg.data.status = 'new'  

            } else {
              res.status(404).send({
                message: `Cannot update Report with id=${id}. Maybe Report was not found!`
              });
            }
          })

      } else {
        firebase_msg.notification.title = `Daily Report ${notif_name} (${notif_date} ${notif_month}) diperbarui~`
        firebase_msg.notification.body = `Ada info baru di Daily Report ${notif_name} per tanggal ${notif_date} ${notif_month}.\n\nMohon klik di sini untuk membaca report terbarunya ya. Terima kasih :)`
        firebase_msg.data.status = 'update'
      }

      db.sendMessage(firebase_msg)

      res.send({id: id});
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error retrieving Report with id="+id
      });
    });
}

exports.getByGuardian = async (req, res) => {
  let condition = {};

  condition.where = {};
  if(req.query){
    if(req.query.date){
      const d_month = req.query.date.split('-')[1]
      const d_year = req.query.date.split('-')[0]
      const d_first = new Date(d_year, parseInt(d_month)-1, 1);
      const d_end = new Date(d_year, parseInt(d_month), 0);
      
      condition.where = {
        date: { [Op.and]: [
            { [Op.gte]: d_first },
            { [Op.lte]: d_end }
        ] },
        // [Op.or]: [
        //     {
                is_ready_to_share: 1
        //     }, 
        //     {
        //         shared_at: {
        //           [Op.not]: null
        //         }
        //     }
        // ]
      }
    }
  }

  let include_rating = {model: Rating}

  const user = await User.findOne({where: {phone: req.user}, include: Guardian});
  // child condition
  const child_ids = []
  if(user.guardian){
    const guardian = await Guardian.findOne({where: {id: user.guardian.id}, include:  { model: Family, as: 'families' }});
    if(guardian.families){
      guardian.families.map(item => {
        child_ids.push(item.child_id)
      })
      if(child_ids.length > 0)
        condition.where.child_id = { [Op.or]: child_ids };
    }

    include_rating = {
      model: Rating,
      where: {guardian_id: guardian.id},
      required: false
    }
  }
  if(child_ids.length == 0) {
    child_ids.push(-999)
    condition.where.child_id = { [Op.or]: child_ids };
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  condition.include = [
    {model: MilkSession},
    {model: Nanny},
    {model: Child},
    {model: Location},
    include_rating
  ];

  condition.distinct = true
  Report.findAndCountAll(condition)
    .then(data => {
      data.rows.forEach(row => {
        row.setDataValue('nanny_name', row.nanny!=null?row.nanny.name:'');
        row.setDataValue('child_name', row.child.name);
        row.setDataValue('nickname', row.child.nickname ?? row.child.name)
        row.setDataValue('location_name', row.location.name);
        row.setDataValue('is_submit_rating', (row.ratings[0] && row.ratings[0].is_submit) ? row.ratings[0].is_submit : 0);
        row.setDataValue('rating', (row.ratings[0] && row.ratings[0].rating) ? row.ratings[0].rating : 0);
        row.setDataValue('rating_id', (row.ratings[0] && row.ratings[0].id) ? row.ratings[0].id : 0);
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
  } else {
    condition.where.location_id = { [Op.eq]: -999 };
  }

  const { page, size } = req.query;
  const { limit, offset } = db.getPagination(page, size);
  if(offset >= 0){
    condition.limit = limit;
    condition.offset = offset;
  }

  condition.include = [
    {model: MilkSession},
    {model: Nanny},
    {model: Child}
  ];

  condition.distinct = true
  Report.findAndCountAll(condition)
    .then(data => {
      data.rows.forEach(row => {
        row.setDataValue('nanny_name', row.nanny.name);
        row.setDataValue('child_name', row.child.name);
        row.setDataValue('child_nickname', row.child.nickname ?? row.child.name)
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
    is_ready_to_share: req.body.is_ready_to_share ?? 0,
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

      // if(data.is_ready_to_share == 1 || data.shared_at != null) {
      //   Child.findByPk(data.child_id).then(data_child => {
      //     const notif_name = data_child.nickname ?? data_child.name
      //     const notif_date = new Date(data.date).getDate()
      //     const notif_day = notif_day_of_week[new Date(data.date).getDay()]
      //     const notif_month = notif_month_name[new Date(data.date).getMonth()]
      //     const firebase_msg = {
      //       topic: `kidparent_childid_${data_child.id}`,
      //       notification: {
      //         title: `Daily Report ${notif_name} siap dibaca~`,
      //         body: `Yuk lihat bagaimana perkembangan ${notif_name} per hari ${notif_day} tanggal ${notif_date} ${notif_month}.\n\nTerima kasih sudah mempercayakan ${notif_name} di KinderCastle :)`,
      //       },
      //       data: {
      //         // topic: `kidparent_childid_${data_child.id}`,
      //         report_id: `${data.id}`,
      //         status: 'new'
      //         // title: `Daily Report ${notif_name} siap dibaca~`,
      //         // body: `Yuk lihat bagaimana perkembangan ${notif_name} per hari ${notif_day} tanggal ${notif_date} ${notif_month}.\n\nTerima kasih sudah mempercayakan ${notif_name} di KinderCastle :)`
      //       },
      //       android: {
      //         priority: 'high',
      //         notification: {
      //           channel_id: 'kidparent_importance_channel'
      //         }
      //       },
      //       apns: {
      //         headers: {
      //           'apns-priority': '10'
      //         }
      //       }
      //     };

      //     db.sendMessage(firebase_msg)
      //   })
      // }

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

exports.edit = async (req, res) => {
  const id = req.params.id;
  req.body.updated_by = req.user;
  const report_old = await Report.findOne({where: {id: id}})

  Report.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {

        // Report.findOne({where: {id: id}, include: Child}).then(data_report => {

        //   if(data_report.is_ready_to_share == 1 || data_report.shared_at != null) {
            
        //     const notif_name = data_report.child.nickname ?? data_report.child.name
        //     const notif_date = new Date(data_report.date).getDate()
        //     const notif_day = notif_day_of_week[new Date(data_report.date).getDay()]
        //     const notif_month = notif_month_name[new Date(data_report.date).getMonth()]
        //     const firebase_msg = {
        //       topic: `kidparent_childid_${data_report.child_id}`,
        //       notification: {},
        //       data: {
        //         report_id: `${data_report.id}`
        //       },
        //       android: {
        //         priority: 'high',
        //         notification: {
        //           channel_id: 'kidparent_importance_channel'
        //         }
        //       },
        //       apns: {
        //         headers: {
        //           'apns-priority': '10'
        //         }
        //       }
        //     };

        //     if(report_old.is_ready_to_share==0 && data_report.is_ready_to_share==1) {
        //       firebase_msg.notification.title = `Daily Report ${notif_name} siap dibaca~`
        //       firebase_msg.notification.body = `Yuk lihat bagaimana perkembangan ${notif_name} per hari ${notif_day} tanggal ${notif_date} ${notif_month}.\n\nTerima kasih sudah mempercayakan ${notif_name} di KinderCastle :)`
        //       firebase_msg.data.status = 'new'
        //     } else {
        //       firebase_msg.notification.title = `Daily Report ${notif_name} (${notif_date} ${notif_month}) diperbarui~`
        //       firebase_msg.notification.body = `Ada info baru di Daily Report ${notif_name} per tanggal ${notif_date} ${notif_month}.\n\nMohon klik di sini untuk membaca report terbarunya ya. Terima kasih :)`
        //       firebase_msg.data.status = 'update'
        //     }

        //     db.sendMessage(firebase_msg)
        //   }

        // })

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