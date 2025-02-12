const authError = require("../errors/unauthenticated");
const StatusCodes = require("http-status-codes");
const { ROLE } = require("../role");
const roleAuth = async (req, res, next) => {
  console.log("in role auth");
  const role = req.user.role;
  console.log(role);
  console.log(ROLE);
  if (role != ROLE.ADMIN) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ message: "Only admins can access" });
  }
  next();
};

module.exports = roleAuth;
