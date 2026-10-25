const express = require("express");
const router = express.Router();

const ceritaController = require(
  "../controllers/ceritaController"
);

router.get("/", ceritaController.getAll);
router.get("/:id", ceritaController.getById);
router.post("/", ceritaController.create);
router.put("/:id", ceritaController.update);
router.delete("/:id", ceritaController.remove);

module.exports = router;
