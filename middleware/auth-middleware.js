/*

It is missing:
-The mac address verification in order to make sure that the requests come from a valid terminal
-The application code we will be sending in the header to make sure it is not being sent from some postman

*/
const jwt = require("jsonwebtoken");
const User = require("../models/User_model");
const secret = require("../config").secret;

const auth = async (req, res, next) => {
  try {
    // First we extract the token from the request headers
    const token = req.header("Authorization").replace("Bearer ", "");

    // Then we decode the token and save it as a json object, which contains the user _id
    const decoded = jwt.verify(token, secret);

    // With the user _id, finally we fetch the user from the DB, but it will be returned only if the provided token up above exists in the user tokens array in the DB
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });

    // Sending an error if the user does not exist or is not authenticated
    if (!user) {
      throw new Error(); // An empty error sufices as the error message will be defined down below
      //
    } else {
      // We add the token to the request that will be passed on to the route so this can be used later on on any router, for instance for logging out, as we will need the exact token we need to remove from the tokens array
      req.token = token;

      // Before we finish the middleware actions, we add the fetched user to the request that will be passed on to the route so it can be used later without spending time and processing on it.
      req.user = user;

      console.log(user);

      // We finish the middleware actions by letting the 3rd argument on the route to run
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
