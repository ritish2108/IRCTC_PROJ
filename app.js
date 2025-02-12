const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
require("express-async-errors");

const { getUsers } = require("./database.js");
const errorHandler = require("./middleware/errorHandler");
const {
  getAvailability,
  addTrain,
  bookingSeat,
} = require("./controllers/Trains.js");
const allowedOrigins = ["http://localhost:3000"];

app.use(express.json());

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

app.use(
  cors({
    origin: "*",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   const statusCode = err.statusCode || 500;
//   res.status(statusCode).json({
//     message: err.message || "Something went wrong",
//     error: err.stack,
//   });
// });
//security pactices
app.use(
  rateLimiter({
    window: 2 * 60 * 1000,
    max: 10,
    message: "too many requests,try again after some time",
  })
);
app.use(helmet());
app.use(xss());

// app.get("/", async (req, res) => {
//   try {
//     const user = await getUsers();
//     res.status(200).json({ user });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error adding trains", error: error.message });
//   }
// });

// app.post("/", (req, res) => {
//   const { malscript } = req.body;
//   res.send(`
//     <html>
//       <body>
//         <div>${malscript}</div>
//       </body>
//     </html>
//   `);
// });

//middlewares
const Authentication = require("./middleware/authentication");

//routers
const authRouters = require("./routes/auth");
const trainRouters = require("./routes/train.js");
const bookingrouters = require("./routes/booking.js");
const intermediaterouters = require("./routes/route.js");

app.use("/api/v1/auth", authRouters);
app.use("/api/v1/trains", Authentication, trainRouters);
app.use("/api/v1/booking", Authentication, bookingrouters);
app.use("/api/v1/availabiltyByRoute", Authentication, intermediaterouters);

app.use(errorHandler);

const start = async () => {
  try {
    app.listen(5500, () => {
      console.log("server is listening to port 5500");
    });
  } catch (error) {
    console.log(error);
  }
};

start();
