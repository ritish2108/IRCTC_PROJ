const { CustomAPIError } = require("../errors");

const errorHandler = (err, req, res, next) => {
  console.log("at error handler");
  if (err instanceof CustomAPIError) {
    return res.status(err.statusCode).send({ msgg: err.message });
  }

  return res.status(500).send({ message: err.message });
};

module.exports = errorHandler;
