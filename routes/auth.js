import express from "express";
const router = express.Router();

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Bring in a Sequelize model so we can read/write users in the Database:
import { User } from "../models/User.js";

//Bring in our Joi validator for request body
import { registerValidator, loginValidator } from "../validation.js";

router.post("/register", async (req, res) => {
  //Run body parameters through the validation schema before continuing:
  const { error } = registerValidator(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Search for an existing user with the supplied email - to make sure same email is only used once
  const emailExists = await User.findOne({ where: { email: req.body.email } });
  if (emailExists)
    return res
      .status(400)
      .send("A User account with this email already exists");

  //Hash the password with bcrypt and a generated salt.
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Build the user object to write to a database
  const newUser = {
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  };

  //Save the new user object, using the User model we defined in Sequelize. Return the new user ID in JSON
  User.create(newUser)
    .then((savedUser) => {
      res.status(200).json({ status: "Success", new_user_id: savedUser.id });
    })
    .catch((err) => res.status(500).send(err.message));
});

router.post("/login", async (req, res) => {
  //Run body parameters through the validation schema
  const { error } = loginValidator(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if the email address exists in a database. If not, reject the login
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) return res.status(400).send("Email is not correct");

  //Check if pasword is correct using bcrpyt to compare to the stored hash. If they don't match, reject the login
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  //Create and Assign a JWT token with 10-minute expiry
  const token = jwt.sign(
    {
      id: user.id,
      // exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10-minute expiry
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1-hour expiry
    },
    process.env.TOKEN_SECRET,
  );

  //Return the token in a header called 'auth-token'. Add auth-token to any future requests to protected routes
  res.header("auth-token", token).send(token);
});

export default router;
