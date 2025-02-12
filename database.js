const mysql = require("mysql2");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

const getUsers = async () => {
  const result = await pool.query("select * from users");
  return result[0];
};

// const users = await getUsers();
// console.log(users[0]);

const getUser = async (email) => {
  const [response] = await pool.query("select * from users where email=?", [
    email,
  ]);
  return response[0];
};

// const user = await getUser(100);
// console.log(user);

const createUser = async (name, email, password, role = "user") => {
  const [response] = await pool.query(
    `insert into users (name,email,password,role) values (?,?,?,?)`,
    [name, email, password, role]
  );
  const id = response.insertId;
  const [response2] = await pool.query("select * from users where id=?", [id]);
  return response2[0];
};

const getTrain = async (id) => {
  const [response] = await pool.query("select * from train where id=?", [id]);
  return response[0];
};

const createTrain = async (
  train_no,
  train_name,
  source,
  destination,
  max_seats,
  available_seats
) => {
  const [response] = await pool.query(
    `insert into train (train_no,train_name,source,destination,max_seats,available_seats) values (?,?,?,?,?,?)`,
    [train_no, train_name, source, destination, max_seats, available_seats]
  );
  const id = response.insertId;
  return getTrain(id);
};

const getTrainAndSeatAvailability = async (source, destination) => {
  const [response] = await pool.query(
    `select * from train where source=? and destination=?`,
    [source, destination]
  );
  return response;
};
// let trainNo;

const bookSeat = async (userId, trainId, numberOfSeats) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the train row
    const [train] = await connection.query(
      "select available_seats from train where id = ? for update",
      [trainId]
    );

    if (train.length === 0) {
      throw new Error("Train not found");
    }

    if (train[0].available_seats < numberOfSeats) {
      throw new Error("Not enough available seats");
    }

    // Update the available seats
    await connection.query(
      "update train set available_seats = available_seats - ? where id = ?",
      [numberOfSeats, trainId]
    );

    // Create a booking record
    const [result] = await connection.query(
      "insert into bookings (userId, trainId, numberOfSeats) values (?, ?, ?)",
      [userId, trainId, numberOfSeats]
    );

    await connection.commit();

    console.log("Seat booking successful!");
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    console.error("Booking failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};

const booking_details = async (bookingId) => {
  const [response] = await pool.query(`select * from bookings where id=?`, [
    bookingId,
  ]);
  return response[0];
};

// (async () => {
//   try {
//     booking = await booking_details(5);
//     console.log(booking);
//   } catch (error) {
//     console.error("Error fetching train:", error);
//   }
// })();

// Example usage
// let
// const trainNo = async (train_no) => {
//   const id = pool.query(`select id from train where train_no=?`, [train_no]);
//   return id;
// };
//  trainNo(11223)
//   .then((res) => console.log(res))
//   .catch((err) => console.log(err));

const availabilityForIntermediateStations = async (
  departure,
  arrival,
  train_name
) => {
  const [depStationId] = await pool.query(
    `select id from stations where station_name=?`,
    [departure]
  );

  const [arrStationId] = await pool.query(
    `select id from stations where station_name=?`,
    [arrival]
  );

  const [train_id] = await pool.query(
    `select id from train where train_name=?`,
    [train_name]
  );
  const [response] = await pool.query(
    `SELECT MIN(available_seats) AS available_seats
FROM route
WHERE train_id =?
  AND station_order >= (
      SELECT station_order FROM route WHERE station_id = ? AND train_id = ?
  )
  AND station_order < (
      SELECT station_order FROM route WHERE station_id = ? AND train_id = ?
  )`,
    [
      train_id[0].id,
      depStationId[0].id,
      train_id[0].id,
      arrStationId[0].id,
      train_id[0].id,
    ]
  );

  return [response];
};

const bookSeatFromIntermediateStation = async (
  userId,
  numberOfSeats,
  departure,
  arrival,
  train_name
) => {
  const [depStationId] = await pool.query(
    `select id from stations where station_name=?`,
    [departure]
  );

  const [arrStationId] = await pool.query(
    `select id from stations where station_name=?`,
    [arrival]
  );

  const [trainId] = await pool.query(
    `select id from train where train_name=?`,
    [train_name]
  );
  console.log(trainId);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the train row
    const [train] = await availabilityForIntermediateStations(
      departure,
      arrival,
      train_name
    );

    if (train.length === 0) {
      throw new Error("Train not found");
    }

    if (train[0].available_seats < numberOfSeats) {
      throw new Error("Not enough available seats");
    }

    // Update the available seats
    await connection.query(
      `UPDATE route
SET available_seats = available_seats - ?
WHERE train_id = ?
  AND station_order >= (
      SELECT MIN(station_order) FROM (SELECT station_order FROM route WHERE station_id = ? AND train_id = ?) AS temp
  )
  AND station_order < (
      SELECT MIN(station_order) FROM (SELECT station_order FROM route WHERE station_id = ? AND train_id = ?) AS temp
  )`,
      [
        numberOfSeats,
        trainId[0].id,
        depStationId[0].id,
        trainId[0].id,
        arrStationId[0].id,
        trainId[0].id,
      ]
    );

    // Create a booking record
    const [result] = await connection.query(
      "insert into bookings (userId, trainId, numberOfSeats) values (?, ?, ?)",
      [userId, trainId[0].id, numberOfSeats]
    );

    await connection.commit();

    console.log("Seat booking successful!");
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    console.error("Booking failed:", error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// bookSeatFromIntermediateStation(2, 69, "Surat", "New Delhi", "Tejas Express")
//   .then(() => {
//     console.log("Booking complete!");
//   })
//   .catch((err) => {
//     console.error("Booking failed:", err.message);
//   });

module.exports = {
  getUsers,
  getUser,
  createUser,
  createTrain,
  getTrain,
  getTrainAndSeatAvailability,
  bookSeat,
  pool,
  booking_details,
  availabilityForIntermediateStations,
  bookSeatFromIntermediateStation,
};
