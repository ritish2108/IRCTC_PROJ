const authError = require("../errors/unauthenticated");
const StatusCodes = require("http-status-codes");
const apiKeyAuth = async (req, res, next) => {
  // console.log("in api key authauth");
  const giveKey = req.headers.api_key;
  if (!giveKey || giveKey != process.env.ADMIN_API_KEY) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .send({ message: "Invalid or missing api key" });
  }
  //   const role = req.user.role;
  //   console.log(role);
  //   console.log(ROLE);
  //   if (role != ROLE.ADMIN) {
  //     return res
  //       .status(StatusCodes.FORBIDDEN)
  //       .send({ message: "Only admins can access" });
  //   }
  next();
};

module.exports = apiKeyAuth;
