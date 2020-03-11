const express = require("express");
const router = new express.Router();

// Importing main Schema
const Question = require("../models/Question_model");

// Importing the middleware auth
const authMiddleware = require("../middleware/auth-middleware");

// Home router
router.get('/', async (req, res) =>{
  res.sendStatus(200);
});

// Creating the new router
router.post("/create-question", /*authMiddleware,*/ async (req, res) => {
  try {
    let new_question = new Question(req.body);
    let saved_question = await new_question.save();
    res.sendStatus(200);
    
  } catch (err) {
    console.log(err);
    res.status(err);
  }
});

module.exports = router;


