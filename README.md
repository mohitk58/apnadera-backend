# ApnaDera Backend API

A comprehensive Node.js/Express backend API for the ApnaDera property platform.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access
- **Property Management**: CRUD operations for property listings
- **Advanced Search**: Filter properties by price, location, type, and more
- **Favorites System**: Users can save and manage favorite properties
- **Image Upload**: Support for property images and user avatars
- **Admin Panel**: User management and platform administration
- **Security**: Rate limiting, input validation, and security headers

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🔧 Installation

1. **Clone the repository**:

   ```bash
   git clone <your-backend-repo-url>
   cd apnadera-backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Setup**:

   - Copy `config.env.example` to `config.env`
   - Update the values:
     ```env
     PORT=5002
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
     JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
     NODE_ENV=development
     EMAIL_USER=your_email@gmail.com
     EMAIL_PASS=your_app_password
     ```

4. **Start MongoDB**:

   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud)
   ```

5. **Run the server**:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

The API will be available at `http://localhost:5002`

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "buyer"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

### Property Endpoints

#### Get All Properties

```http
GET /properties?page=1&limit=12&minPrice=100000&maxPrice=500000&type=house&city=New York
```

#### Create Property

```http
POST /properties
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beautiful 3-Bedroom House",
  "description": "Spacious family home with modern amenities",
  "type": "house",
  "price": 450000,
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "details": {
    "bedrooms": 3,
    "bathrooms": 2,
    "squareFeet": 1800,
    "yearBuilt": 2010
  },
  "amenities": ["pool", "garage", "fireplace"]
}
```

## 🔐 User Roles

- **buyer**: Can view properties, save favorites, update profile
- **seller**: Can create, update, and delete their own properties
- **agent**: Can manage properties on behalf of clients
- **admin**: Full access to all features and user management

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for Express
- **Role-based Access**: Granular permission system

## 🚀 Deployment

### Environment Variables for Production

```env
PORT=5002
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
```

### Heroku Deployment

1. Create a Heroku app
2. Set environment variables
3. Deploy using Git

```bash
heroku create your-backend-app-name
heroku config:set NODE_ENV=production
git push heroku main
```

### Railway Deployment

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 📝 Scripts

```json
{
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
