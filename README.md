# AYPA E-commerce Platform

AYPA E-commerce is a full-stack web application for selling customized products like T-shirts and ID laces.

## Features

- **User Authentication**: Separate login systems for customers and administrators
- **Product Management**: Browse, search, and filter products
- **Shopping Cart**: Add products to cart and manage quantities
- **Admin Dashboard**: Complete control over inventory, orders, and reports
- **Responsive Design**: Works on desktop and mobile devices

## Stack

- **Frontend**: React, Material UI
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js v14+
- MongoDB (running on localhost:27017)

## Installation

### Clone the repository

```bash 
git clone <repository-url>
cd aypa-ecommerce
```

### Install server dependencies

```bash
cd server
npm install
```

### Install client dependencies

```bash
cd ../client
npm install
```

## Running the Application

### Start MongoDB

Ensure MongoDB is running on your system:

```bash
# On most systems
mongod

# If you're using MongoDB as a service
sudo service mongod start
```

### Seed the Database

From the server directory:

```bash
cd ../server
node seed.js
```

This will populate your database with:
- Admin user (email: admin@aypa.com, password: admin123)
- Customer users
- Sample products

### Start the Backend Server

```bash
cd ../server
npm run dev
```

The server will run on http://localhost:5000

### Start the Frontend Client

```bash
cd ../client
npm start
```

The client will run on http://localhost:3000

## User Roles

### Customer
- Browse products without login
- Login to add products to cart
- Place orders
- View order history

### Admin
- Manage inventory (add, edit, delete products)
- Process and track orders
- Generate reports
- Configure system settings

## Admin Access

Use these credentials to access the admin panel:

- **Email**: admin@aypa.com
- **Password**: admin123

Navigate to `/admin/login` to access the admin login page.

## Development

The project structure follows a client-server architecture:

- `client/`: React frontend
  - `src/`: Source code
    - `components/`: Reusable UI components
    - `pages/`: Main application pages
    - `context/`: React context providers
    - `utils/`: Utility functions
    - `hooks/`: Custom React hooks

- `server/`: Node.js backend
  - `models/`: Mongoose models
  - `routes/`: Express routes
  - `controllers/`: Route controllers
  - `middleware/`: Custom middleware
  - `config/`: Configuration files


## Software Requirements
 - Mongoose / MongoDB Software
 - Vs Code
 - Git 
 - NodeJS

## License

This project is licensed under the MIT License. 