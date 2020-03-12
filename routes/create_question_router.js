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
    if(req.body.origin !== "app"){
      let new_question = new Question(req.body);
      let saved_question = await new_question.save();
    }else{
      let new_question = new Question(
        {
            "subject":"Electron", 
        "question_topic":"some stuff", 
        "question":req.body.question, 
        "answer":"some stuff", 
        "comments":"some stuff", 
        "rows":"some stuff", 
        "answer_type":"some stuff", 
        "place_holder":"some stuff",
        "error_message":"some stuff", 
        "image_url":"some stuff", 
        "reference_url":"some stuff", 
        "reference_time":"some stuff", 
        "reference_url2":"some stuff", 
        "reference_time2":"some stuff", 
        "reference_url3":"some stuff", 
        "reference_time3":"some stuff", 
        "reference_url4":"some stuff", 
        "reference_time4":"some stuff", 
        "reference_url5":"some stuff", 
        "reference_time5":"some stuff", 
        "reference_url6":"some stuff", 
        "reference_time6":"some stuff", 
        "reference_url7":"some stuff", 
        "reference_time7":"some stuff"
        
        });
      let saved_question = await new_question.save();
    }
    res.sendStatus(200);
    
  } catch (err) {
    console.log(err);
    res.status(err);
  }
});


router.get("/get-questions", async (req, res) => {
  let fetched_question = await Question.find();
  console.log(fetched_question)
  res.send({message: fetched_question});
});
module.exports = router;


