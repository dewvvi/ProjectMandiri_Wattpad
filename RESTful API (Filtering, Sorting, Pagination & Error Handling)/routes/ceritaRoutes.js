const express = require("express");
const controller = require("../controllers/ceritaController");

const router = express.Router();

router.route("/")
  .get(controller.getAll)
  .post(controller.create);

router.route("/:id")
  .get(controller.getById)
  .put(controller.update)
  .delete(controller.remove);

module.exports = router;
