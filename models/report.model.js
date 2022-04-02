module.exports = (sequelize, Sequelize) => {
  const Report = sequelize.define("report", {
    date: {
      type: Sequelize.DATEONLY
    },
    shared_at: {
      type: Sequelize.DATE,
      get() {
          return !isNaN(this.getDataValue('shared_at'))?require('moment')(this.getDataValue('shared_at')).format('YYYY-MM-DD HH:mm:ss'):null;
      }
    },
    attendance: {
      type: Sequelize.INTEGER
    },
    arrival_time: {
      type: Sequelize.TIME
    },
    child_feeling: {
      type: Sequelize.STRING
    },
    temperature: {
      type: Sequelize.DECIMAL
    },
    condition: {
      type: Sequelize.STRING
    },
    condition_notes: {
      type: Sequelize.STRING
    },
    weight: {
      type: Sequelize.DECIMAL
    },
    breakfast: {
      type: Sequelize.STRING
    },
    breakfast_qty: {
      type: Sequelize.STRING
    },
    breakfast_notes: {
      type: Sequelize.STRING
    },
    morningsnack: {
      type: Sequelize.STRING
    },
    morningsnack_qty: {
      type: Sequelize.STRING
    },
    morningsnack_notes: {
      type: Sequelize.STRING
    },
    lunch: {
      type: Sequelize.STRING
    },
    lunch_qty: {
      type: Sequelize.STRING
    },
    lunch_notes: {
      type: Sequelize.STRING
    },
    naptime1_start: {
      type: Sequelize.TIME
    },
    naptime1_end: {
      type: Sequelize.TIME
    },
    naptime1_notes: {
      type: Sequelize.STRING
    },
    naptime2_start: {
      type: Sequelize.TIME
    },
    naptime2_end: {
      type: Sequelize.TIME
    },
    naptime2_notes: {
      type: Sequelize.STRING
    },
    naptime3_start: {
      type: Sequelize.TIME
    },
    naptime3_end: {
      type: Sequelize.TIME
    },
    naptime3_notes: {
      type: Sequelize.STRING
    },
    num_of_potty: {
      type: Sequelize.INTEGER
    },
    potty_notes: {
      type: Sequelize.STRING
    },
    is_morning_bath: {
      type: Sequelize.INTEGER
    },
    is_afternoon_bath: {
      type: Sequelize.INTEGER
    },
    medication: {
      type: Sequelize.INTEGER
    },
    medication_notes: {
      type: Sequelize.STRING
    },
    activities: {
      type: Sequelize.STRING
    },
    things_tobring_tmr: {
      type: Sequelize.STRING
    },
    special_notes: {
      type: Sequelize.STRING
    },
    deleted_at: {
      type: Sequelize.DATE
    },
    deleted_by: {
      type: Sequelize.STRING
    },
    created_at: {
      type: Sequelize.DATE
    },
    created_by: {
      type: Sequelize.STRING
    },
    updated_at: {
      type: Sequelize.DATE
    },
    updated_by: {
      type: Sequelize.STRING
    }
  },{
    defaultScope: {
      attributes: { exclude: ['deleted_at', 'deleted_by', 'created_at', 'created_by', 'updated_at', 'updated_by'] }
    }
  });

  return Report;
};
