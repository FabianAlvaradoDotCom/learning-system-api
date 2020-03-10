const express = require("express");
const router = new express.Router();
const Host = require("../models/Host_model");

const authMiddleware = require("../middleware/auth-middleware");

router.post("/create-host", authMiddleware, async (req, res) => {
  const new_host = new Host(req.body);

  const saved_host = await new_host.save();

  console.log(saved_host);
  res.status(200).send(saved_host);
});

module.exports = router;