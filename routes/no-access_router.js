const express = require("express");
const router = express.Router();

// Handling all no allowed addresses
router.get("*", (req, res) => {
  res.status(500).json({ error: "You do not have access" });
  console.log("You do not have access");
});

module.exports = router;
