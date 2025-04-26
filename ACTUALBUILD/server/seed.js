const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/aypa_ecommerce')
  .then(() => console.log('MongoDB connected for seeding'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@aypa.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    phone: '123-456-7890'
  },
];

const products = [
  
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    console.log('Previous data cleared');

    // Insert users with hashed passwords
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users created`);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 