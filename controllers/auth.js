const { StatusCodes } = require("http-status-codes");
const badRequest = require("../errors/bad-request");
const authError = require("../errors/unauthenticated");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUser, createUser } = require("../database.js");

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const salt = await bycrypt.genSalt(10);
  const pass = await bycrypt.hash(password, salt);
  //const tempUser = { name, email, password: pass };

  const user = await createUser(name, email, pass, role);
  const token = jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
  // const token = await user.createToken();
  //console.log(token);
  res.status(StatusCodes.CREATED).json({ name: user.name, token });
};

const login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    throw new badRequest("please provide valid email and password");
  }
  const user = await getUser(email);
  if (!user) {
    throw new authError("no such user found");
  }
  //compare password
  const isMatching = await bycrypt.compare(password, user.password);
  if (!isMatching) {
    throw new authError("invalid credentials");
  }
  console.log(user.role);
  const token = await jwt.sign(
    { id: user.id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  //status(StatusCodes.OK).send({ user: { name: user.name }, token })
  res.status(StatusCodes.OK).send({ name: user.name, token });
};

module.exports = {
  register,
  login,
};
