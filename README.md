# IRCTC_API

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Environment Management**: dotenv

---

## Prerequisites

1. Node.js installed on system.
2. MySQL server running locally or remotely.
3. A `.env` file configured with the following details.

## Setup Instructions

### 1. Clone the Repository

To get started, clone the repository to your local machine:
```bash
git clone https://github.com/ritish2108/IRCTC_ASSIGNMENT.git
cd IRCTC_API
```


### 2. Install Dependencies

Install the required dependencies using `npm`:

```bash
npm install
```

### 3. Create Environment File

Create a `.env` file in the root directory of the project and add your MySQL database credentials:

```
MYSQL_HOST='host'
MYSQL_USER='name'
MYSQL_PASSWORD='pass'
MYSQL_DATABASE='irctc-table'
JWT_SECRET='ritish'
ADMIN_API_KEY=ritish
```

### 4. Start the Server

Run the application using the following command:

```bash
npm start
```

The server will start on port 5500 (or the port can be specified in the `.env` file).



---


## Database Setup

To get started, create the database and required tables by running the following SQL commands in your MySQL client:

```sql
CREATE DATABASE irctc;

USE irctc;

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    trainId INT NOT NULL,
    numberOfSeats INT NOT NULL,
    bookingTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (trainId) REFERENCES train(id)
);

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user'
);

CREATE TABLE train (
    id INT PRIMARY KEY AUTO_INCREMENT,
    train_no INT NOT NULL,
    train_name VARCHAR(200) NOT NULL,
    source VARCHAR(200) NOT NULL,
    destination VARCHAR(200) NOT NULL,
    max_seats INT NOT NULL,
    available_seats INT NOT NULL
);

SELECT * FROM users;
SELECT * FROM train;
SELECT * FROM bookings;
```

---
### API Endpoints

- The `bookSeat` API is protected by the Authorization Token, which must be provided during booking.
- Admin operations like adding a train require an API Key to ensure only authorized users can perform such actions.
- This project handles race conditions during seat booking using a transactional approach.

## More things I can add later

- **Book Seats Across Intersecting Stations**: Currently, users can book seats only between a direct source and destination. I plan to enhance the system to allow bookings across intersecting stations. This will be particularly useful for travelers from Jammu and similar regions who need to book tickets through multiple intermediate stops. For example, a user traveling from Jammu to Delhi via multiple intersecting stations (e.g., Jammu -> Ludhiana -> Ambala -> Delhi) will be able to book seamlessly across different segments.

- **Check Seat Availability for Intersecting Stations**: A future API will allow users to check seat availability across intersecting stations between their journey points. This feature will help passengers find the best routes with available seats and make more informed booking decisions. It will be especially useful for travelers needing flexible travel options in regions with multiple route variations.

