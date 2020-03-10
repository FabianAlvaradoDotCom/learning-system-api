const mongoose = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const secret = require("../config").secret;

const UserSchema = new mongoose.Schema({
  first_name: {
    type: String,
    trim: true,
    minlength: 3,
    required: true
  },
  last_name: {
    type: String,
    trim: true,
    minlength: 3,
    required: true
  },
  email: {
    type: String,
    unique: true, // This will make our application not to allow duplicate email addresses, but for doing that we need
    //the database to start saving with this property from the begining, so if there are any User documents we need to wipe off the DB
    trim: true,
    lowercase: true,
    required: true,
    validate(value) {
      // 'validate' is a mongoose function
      if (!validator.isEmail(value)) {
        // 'validator' comes from validator library
        throw new Error("Email format is not valid");
      }
    }
  },
  password: {
    type: String,
    trim: true,
    minlength: 8,
    required: true,
    validate(value) {
      if (
        value.toLowerCase().includes("password") ||
        value.toLowerCase().includes("contraseña") ||
        value.toLowerCase().includes("contrasena")
      ) {
        throw new Error(
          "Password cannot contain the word 'password', 'contraseña' or 'contrasena'"
        );
      }
    }
  },
  user_type: {
    type: String,
    trim: true,
    default: "staff"
  },
  tokens: [
    {
      token: {
        type: String,
        required: true
      }
    }
  ]
});

// METHODS (or instance methods) are accessible on the instances
// This function runs only after the credentials of the user have been validated, what we are doing here
// is creating a token so the user can then perform secured actions
UserSchema.methods.generateAuthToken = async function() {
  const user = this;
  // The PAYLOAD will be an object containing the data to be embedded into the token (in thid case just the user _id)
  //... and remember that it is an Object ID so we convert it to a Standar String with .toString()
  // The second argument will be a string, which is the secret
  // The third argument is the expiration object that will be passed into the sign method: { expiresIn: "7 days"}
  const token = jwt.sign({ _id: user._id.toString() }, secret);

  // After a token has been created we concat it to an array of tokens since our user could be authenticated on
  // multiple devices
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// This is an instance method
UserSchema.methods.getPublicProfile = function() {
  const user = this;
  // We will use a mongoose method to convert a mongo document into a flat object
  const flatUserObject = user.toObject();

  delete flatUserObject.password;
  delete flatUserObject.tokens;
  delete flatUserObject._id;
  delete flatUserObject.__v;

  return flatUserObject;
};

// STATIC METHODS (or model methods) are accessible on the MODEL.
// This function is called by the login request and is going to take care of authentication
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }
  // Here we will compare the password sent in the request body vs the hashed password corresponding to
  // this user in the DB
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Password is wrong");
  }

  return user;
};

// Hashing the plain text password before saving.
// To manipulate data pre-processing and post-processing we will use Middleware...
// We use "pre" so the actions are performed before the event, in this case "save" event.
// In addition we use regular anonimous function because we need to bind to this, which does not work
// with arrow functions.
UserSchema.pre("save", async function(next) {
  // By using "this" we reference the current document we are saving...
  const user = this;

  // Before hashing the password we need to identify if it was modified while
  // saving for the first time or just edited with the following Mongoose method
  // (which will be true also when it was first created)
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  // When we run this 'pre' instructions, we need to call next() so the program knows
  // that it is done and should continue to the event it ran before to, in this case 'save'.
  // If we do not call next() it would keep hanging forever
  next();
});

module.exports = User = mongoose.model("User", UserSchema);
