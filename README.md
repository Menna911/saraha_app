# 💬 Saraha – Anonymous Messaging Platform

Saraha is an anonymous messaging platform that allows users to receive messages from others without revealing the sender's identity.

The project focuses on building a secure and scalable backend using Node.js, Express.js, and MongoDB, with additional security mechanisms and backend technologies.

## 🚀 Features

- **User Authentication:** Secure user registration and login.
- **JWT Authentication:** Token-based authentication and authorization.
- **Email Verification:** OTP-based email confirmation.
- **Password Security:** Password hashing to protect user credentials.
- **Data Encryption:** Sensitive user information is encrypted before storage.
- **Anonymous Messaging:** Users can receive messages without knowing the sender's identity.
- **Rate Limiting:** Redis-based rate limiting to protect APIs against excessive requests.
- **Cloud Image Uploads:** Cloudinary integration for handling image uploads.
- **Input Validation:** Request validation using Joi.
- **Role-Based Authorization:** Access control based on user roles.

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- JavaScript (ES Modules)

### Database & Storage
- MongoDB
- Mongoose
- Redis

### Authentication & Security
- JSON Web Tokens (JWT)
- Password Hashing
- Data Encryption
- Role-Based Access Control
- Rate Limiting

### Validation & File Management
- Joi
- Cloudinary

## 📂 Project Structure

```text
Saraha_final/
│
├── src/
│   ├── DB/
│   ├── modules/
│   ├── middleware/
│   ├── utils/
│   ├── services/
│   └── main.js
│
├── package.json
├── package-lock.json
└── .env
```

*Note: The structure above is a simplified overview of the project.*

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the project directory

```bash
cd Saraha_final
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory and configure the required credentials:

```env
PORT=
MONGO_URI=
JWT_SECRET=
REDIS_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASSWORD=
```

Make sure to configure all required environment variables according to your project configuration.

### 5. Run the application

```bash
npx cross-env NODE_ENV=development node --watch-path=. ./src/main.js
```

The server will start in development mode.

## 🔐 Security Considerations

Security is an important part of this project. Several mechanisms are implemented to improve application security:

- JWT-based authentication.
- Password hashing.
- Encryption of sensitive information.
- Email OTP verification.
- Redis-based API rate limiting.
- Input validation using Joi.
- Role-based access control.

## 🎯 Project Goals

This project was developed to practice and apply backend development concepts, including:

- RESTful API development.
- Authentication and authorization.
- Database modeling and management.
- Secure handling of user data.
- Caching and rate limiting with Redis.
- Third-party service integration.
- Backend application architecture.

