const express = require("express");
const { kiosk, recommend } = require("../controllers/aiController");

const router = express.Router();

router.post("/recommend", recommend);
router.post("/kiosk", kiosk);

module.exports = router;
