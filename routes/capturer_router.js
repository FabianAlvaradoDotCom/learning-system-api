const express = require("express");
const router = new express.Router();
const Capturer = require("../models/Capturer_model");

const authMiddleware = require("../middleware/auth-middleware");

router.post("/create-capturer", authMiddleware, async (req, res) => {
  const new_capturer = new Capturer({
    equipment_name: req.body.equipment_name,
    capturer_mac_adress: req.body.mac_address
  });

  const saved_capturer = await new_capturer.save();

  console.log(saved_capturer);
  res.status(200).send(saved_capturer);
});

module.exports = router;
