const { StatusCodes } = require("http-status-codes");
const { NotFoundError, UnauthenticatedError } = require("../errors/index.js");
const { ROLE } = require("../role.js");
const {
  createTrain,
  getTrainAndSeatAvailability,
  bookSeat,
  pool,
  booking_details,
  availabilityForIntermediateStations,
  bookSeatFromIntermediateStation,
} = require("../database.js");

const addTrain = async (req, res) => {
  const {
    train_no,
    train_name,
    source,
    destination,
    max_seats,
    available_seats,
  } = req.body;
  const train = await createTrain(
    train_no,
    train_name,
    source,
    destination,
    max_seats,
    available_seats
  );
  res.status(StatusCodes.CREATED).json({ train });
};

const getAvailability = async (req, res) => {
  const { source, destination } = req.query;
  if (!source || !destination) {
    return res
      .status(400)
      .json({ message: "Source and destination are required" });
  }

  const trains = await getTrainAndSeatAvailability(source, destination);
  if (!trains) {
    throw new NotFoundError("No trains available on this route");
  }
  res.status(StatusCodes.OK).json({ trains });
};

const bookingSeat = async (req, res) => {
  //console.log("in the booking seat");
  userId = req.user.id;
  const { train_no, numberOfSeats } = req.body;
  let [trainId] = await pool.query(`select id from train where train_no=?`, [
    train_no,
  ]);
  trainId = trainId[0].id;
  const booking = await bookSeat(userId, trainId, numberOfSeats);
  console.log(booking);
  if (!booking) {
    throw new NotFoundError("cannot book ticket");
  }
  res
    .status(StatusCodes.OK)
    .send({ message: "ticket boked sucessuflly", bookingId: booking });
};

const booking = async (req, res) => {
  const id = req.params.id;
  const ticket = await booking_details(id);
  if (!booking) {
    throw new NotFoundError("booking not found");
  }
  res.status(StatusCodes.OK).send({ ticket });
};

const availabilityByRoute = async (req, res) => {
  const { departure, arrival, train_name } = req.body;
  if (!departure || !arrival) {
    return res
      .status(400)
      .json({ message: "departure and arrival stations are required" });
  }

  const availability = await availabilityForIntermediateStations(
    departure,
    arrival,
    train_name
  );
  if (!availability) {
    throw new NotFoundError(
      "No seats available on this train for the destination"
    );
  }
  res.status(StatusCodes.OK).json({ availability });
};

const bookingSeatByRoute = async (req, res) => {
  //console.log("in the booking seat");
  userId = req.user.id;
  const { numberOfSeats, departure, arrival, train_name } = req.body;
  // let [trainId] = await pool.query(`select id from train where train_no=?`, [
  //   train_no,
  // ]);
  // trainId = trainId[0].id;
  const booking = await bookSeatFromIntermediateStation(
    userId,
    numberOfSeats,
    departure,
    arrival,
    train_name
  );
  console.log(booking);
  if (!booking) {
    throw new NotFoundError("cannot book ticket");
  }
  res
    .status(StatusCodes.OK)
    .send({ message: "ticket boked sucessuflly", bookingId: booking });
};

module.exports = {
  addTrain,
  getAvailability,
  bookingSeat,
  booking,
  availabilityByRoute,
  bookingSeatByRoute,
};
