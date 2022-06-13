const auth = require("../middleware/auth");

module.exports = app => {
  
  var router = require("express").Router();

  const user = require("../controllers/user.controller.js");
  const nanny = require("../controllers/nanny.controller.js");
  const child = require("../controllers/child.controller.js");
  const location = require("../controllers/location.controller.js");
  const report = require("../controllers/report.controller.js");
  const milkSession = require("../controllers/milkSession.controller.js");
  const mealConfig = require("../controllers/mealConfig.controller.js");
  const mapping = require("../controllers/mapping.controller.js");
  const config = require("../controllers/config.controller.js");

  function postTrimmer(req, res, next) {
      if (req.method === 'POST') {
          for (const [key, value] of Object.entries(req.body)) {
              if (typeof(value) === 'string')
                  req.body[key] = value.trim();
          }
      }
      next();
  }
  app.use(postTrimmer);

  //app.use('/api', router);
  app.use('/', router);

  router.get("/token", function (req, res, next) {
      res.send(require('crypto').randomBytes(64).toString('hex'));
  });
  router.post("/register", user.register);
  router.post("/login", user.login);

  router.use('/nanny', auth);
  router.post("/nanny/register", nanny.register);
  router.get("/nanny/get-by-same-location", nanny.getBySameLocation);

  router.use('/child', auth);
  router.get("/child/get-by-same-location", child.getBySameLocation);

  router.use('/report', auth);
  router.get("/report/get-by-same-nanny-location", report.getBySameNannyLocation);
  router.post("/report/set-absent/:id", report.setAbsent);

  router.use('/meal-config', auth);
  router.post("/meal-config/set-by-location/:location_id", mealConfig.setByLocation);
  router.get("/meal-config/get-by-location/:location_id/:day_of_month", mealConfig.getByLocation);

  router.use('/mapping', auth);
  router.post("/mapping/add-bulk/", mapping.addBulk);
  router.post("/mapping/del-bulk/", mapping.delBulk);
  router.get("/mapping/get-by-location/:location_id/:nanny_id", mapping.getByLocation);
  router.get("/mapping/get-by-same-nanny-location", mapping.getBySameNannyLocation);

  router.use('/config', auth);
  router.get("/config/get-version-update", config.getVersionUpdate);
  router.post("/config/set-version-update", config.setVersionUpdate);
  router.get("/config/get-report-required-fields", config.getReportRequiredFields);
  router.post("/config/set-report-required-fields", config.setReportRequiredFields);

  router.use('/user', auth);
  router.post("/user/add", user.add);
  router.get("/user", user.index);
  router.get("/user/view/:id", user.view);
  router.post("/user/edit/:id", user.edit);
  router.post("/user/del/:id", user.del);

  //router.post("/nanny/add", nanny.add);
  router.get("/nanny", nanny.index);
  router.get("/nanny/view/:id", nanny.view);
  router.post("/nanny/edit/:id", nanny.edit);
  router.post("/nanny/del/:id", nanny.del);

  router.post("/child/add", child.add);
  router.get("/child", child.index);
  router.get("/child/view/:id", child.view);
  router.post("/child/edit/:id", child.edit);
  router.post("/child/del/:id", child.del);

  router.use('/location', auth);
  router.post("/location/add", location.add);
  router.get("/location", location.index);
  router.get("/location/view/:id", location.view);
  router.post("/location/edit/:id", location.edit);
  router.post("/location/del/:id", location.del);

  router.post("/report/add", report.add);
  router.get("/report", report.index);
  router.get("/report/view/:id", report.view);
  router.post("/report/edit/:id", report.edit);
  router.post("/report/del/:id", report.del);

  router.use('/milk-session', auth);
  router.post("/milk-session/add", milkSession.add);
  router.get("/milk-session", milkSession.index);
  router.get("/milk-session/view/:id", milkSession.view);
  router.post("/milk-session/edit/:id", milkSession.edit);
  router.post("/milk-session/del/:id", milkSession.del);

  router.post("/meal-config/add", mealConfig.add);
  router.get("/meal-config", mealConfig.index);
  router.get("/meal-config/view/:id", mealConfig.view);
  router.post("/meal-config/edit/:id", mealConfig.edit);
  router.post("/meal-config/del/:id", mealConfig.del);

  router.post("/mapping/add", mapping.add);
  router.get("/mapping", mapping.index);
  router.get("/mapping/view/:id", mapping.view);
  router.post("/mapping/edit/:id", mapping.edit);
  router.post("/mapping/del/:id", mapping.del);

  router.post("/config/add", config.add);
  router.get("/config", config.index);
  router.get("/config/view/:id", config.view);
  router.post("/config/edit/:id", config.edit);
  router.post("/config/del/:id", config.del);

};