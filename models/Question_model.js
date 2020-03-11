const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    question_topic: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: false
    },
    answer: {
        type: String,
        required: false
    },
    comments: {
        type: String,
        required: false
    },
    rows: {
        type: String,
        required: false
    },
    answer_type: {
        type: String,
        required: false
    },
    place_holder: {
        type: String,
        required: false
    },
    error_message: {
        type: String,
        required: false
    },
    image_url: {
        type: String,
        required: false
    },
    reference_url: {
        type: String,
        required: false
    },
    reference_time: {
        type: String,
        required: false
    },
    reference_url2: {
        type: String,
        required: false
    },
    reference_time2: {
        type: String,
        required: false
    }, reference_url3: {
        type: String,
        required: false
    },
    reference_time3: {
        type: String,
        required: false
    },
    reference_url4: {
        type: String,
        required: false
    },
    reference_time4: {
        type: String,
        required: false
    },
    reference_url5: {
        type: String,
        required: false
    }, 
    reference_time5: {
        type: String,
        required: false
    },
    reference_url6: {
        type: String,
        required: false
    },
    reference_time6: {
        type: String,
        required: false
    },
    reference_url7: {
        type: String,
        required: false
    },
    reference_time7: {
        type: String,
        required: false
    }/*,
    owner: {
        type: mongoose.Schema.Types.ObjectId, // By setting this type to this field, we are letting this know
        // that this is linked to another model
        ref: "User", // By using this reference we can pull owner data with populate().execPopulate() method
        required: true
    }*/
});

module.exports = Question = mongoose.model("Question", QuestionSchema);



