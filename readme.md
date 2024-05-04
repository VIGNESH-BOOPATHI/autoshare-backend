# AutoShare Backend

AutoShare is a backend application designed to manage rental vehicle operations, authentication, and role-based access control. This project uses Node.js, Express.js, MongoDB, and JWT-based authentication. It includes features for user registration, OTP-based login, vehicle CRUD operations, and role-based permissions.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Endpoints](#endpoints)
- [Role-Based Access Control](#role-based-access-control)

## Features
- User registration with hashed passwords (Bcrypt)
- OTP-based login (email-based OTP verification with Nodemailer)
- JWT-based authentication
- Role-based access control (user and host roles)
- Vehicle CRUD operations (restricted to hosts)
- Vehicle booking and cancellation (restricted to users)
- AWS S3 integration for vehicle image storage
- MongoDB with Mongoose for data management

## Technologies Used
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [Nodemailer](https://nodemailer.com/)
- [AWS S3](https://aws.amazon.com/s3/)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [Morgan](https://github.com/expressjs/morgan)
- [CORS](https://github.com/expressjs/cors)

## Setup Instructions
To set up and run the backend application, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone <YOUR_REPOSITORY_URL>

2. **Install Dependencies**

Navigate to the backend folder and install the required packages.

- cd autoShare-backend
- npm install

3. **Set Up Environment Variables**

Create a .env file in the project root and add the required environment variables. Refer to the Environment Variables section for details.

4. **Start the Server**
Start the Express.js server.
- npm start

## Environment Variables

Ensure you have the following environment variables set in your '.env' file:

1. **MongoDB connection**
- MONGODB_URI=mongodb://localhost:27017/autoshare

2. **JWT secret key**
- JWT_SECRET=your-jwt-secret

3. **AWS S3 credentials**
- AWS_ACCESS_KEY_ID=your-aws-access-key-id
- AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
- AWS_REGION=your-aws-region
- AWS_S3_BUCKET=your-aws-s3-bucket

4. **Email credentials for OTP**
- EMAIL_USER=your-email-address
- EMAIL_PASS=your-email-password-or-app-specific-password

## Endpoints
Here's an overview of the main endpoints provided by the backend application:

- **Authentication and OTP**
- POST /auth/register: Register a new user.
- POST /auth/login: Login with email and password, and request an OTP.
- POST /auth/verify-otp: Verify the OTP to complete the login process.
- **Vehicle Management (Host Only)**
- POST /vehicles: Add a new vehicle (host role required).
- PUT /vehicles/:id: Update a vehicle (host role and ownership required).
- DELETE /vehicles/:id: Delete a vehicle (host role and ownership required).
- **Vehicle Booking (User Only)**
- POST /vehicles/book/:id: Book a vehicle (user role required).
- DELETE /vehicles/cancel/:id: Cancel a booking (user role required).

## Role-Based Access Control
The backend uses role-based access control to restrict certain operations to specific roles. Here's a breakdown:

- **User Role**
- Can book and cancel vehicle bookings.
- **Host Role**
- Can add, update, and delete vehicles.
- Can only update or delete vehicles they added.

Role-based access control is enforced through custom middleware (checkRole) and ownership checks (checkOwnership), ensuring users can only perform operations allowed for their roles.