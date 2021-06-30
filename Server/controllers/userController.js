const mongoose = require("mongoose");
const User = mongoose.model("User");
const sha256 = require("js-sha256");
const jwt = require("jwt-then");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /\S+@\S+\.\S+/;

  if (!emailRegex.test(email)) throw "PLease provide the correct email format.";
  if (password.length < 6) throw "Password must be atleast 6 characters long.";

  const userExists = await User.findOne({
    email,
  });

  if (userExists) throw "User with same email already exits. Try again!";

  const user = new User({
    name,
    email,
    password: sha256(password + process.env.SALT), //hashing and salting the password
  });

  await user.save();

  res.json({
    message: "User [" + name + "] registered successfully!",
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });

  if (!user) throw "Incorrect email and/or password provided. Try again!";

  const token = await jwt.sign({ id: user.id }, process.env.SECRET);

  res.json({
    message: "User logged in successfully!",
    token,
  });
};