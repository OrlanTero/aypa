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

## Quick Start (Windows)

For Windows users, we've created convenient batch files to simplify setup and launching:

1. **Install All Dependencies**: 
   - Run `install-dependencies.bat` to install both client and server dependencies at once

2. **Seed the Database**:
   - Ensure MongoDB is running
   - Run `server/seed-database.bat` to populate the database with initial data

3. **Start the Application**:
   - Run `start-application.bat` to launch both the server and client

## Manual Installation

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

## Running the Application Manually

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
cd server
node seed.js
```

This will populate your database with:
- Admin user (email: admin@aypa.com, password: admin123)
- Customer users
- Sample products

### Start the Backend Server

```bash
cd server
npm start  # For production
npm run dev  # For development with auto-reload
```

The server will run on http://localhost:5000

### Start the Frontend Client

```bash
cd client
npm start
```

The client will run on http://localhost:3000

## Batch Files (Windows)

The project includes several Windows batch files (.bat) to simplify common operations:

### Root Directory
- `install-dependencies.bat`: Installs all dependencies for both client and server
- `start-application.bat`: Starts both the server and client simultaneously

### Server Directory
- `run-server.bat`: Starts only the backend server
- `seed-database.bat`: Seeds the database with initial data (requires confirmation)

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

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Errors**:
   - Ensure MongoDB is running on localhost:27017
   - Check for any firewall restrictions

2. **Port Conflicts**:
   - The server uses port 5005 by default
   - The client uses port 3000 by default
   - If these ports are in use, you may need to modify the configurations

3. **Dependencies Installation Errors**:
   - Make sure you have the latest Node.js LTS version
   - Try clearing npm cache: `npm cache clean --force`
   - Delete node_modules folder and run npm install again

## Software Requirements
 - Mongoose / MongoDB Software
 - VS Code (recommended) or any code editor
 - Git 
 - Node.js v14 or higher

## License

This project is licensed under the MIT License. 