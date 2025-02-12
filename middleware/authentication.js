const jwt = require("jsonwebtoken");
const authError = require("../errors/unauthenticated");
const auth = async (req, res, next) => {
  //console.log("in the auth middeleware");
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new authError("Authentication invalid1");
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, name: payload.name, role: payload.role };
    //console.log("before next");
    next();
  } catch (error) {
    throw new authError("Authentication invalid2");
  }
  //next();
};

module.exports = auth;
