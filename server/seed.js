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
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    phone: '123-456-7890'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    address: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      zipCode: '67890',
      country: 'USA'
    },
    phone: '098-765-4321'
  }
];

const products = [
  {
    name: 'Basic White T-Shirt',
    description: 'A comfortable white t-shirt made from premium cotton. Perfect for everyday wear, this t-shirt offers both comfort and style.',
    price: 29.99,
    category: 'TShirt',
    imageUrls: ['https://source.unsplash.com/random?tshirt,white'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White'],
    brand: 'AYPA',
    stock: 150,
    featured: true
  },
  {
    name: 'Custom Red T-Shirt',
    description: 'Vibrant red t-shirt perfect for customizing with your design.',
    price: 34.99,
    category: 'TShirt',
    imageUrls: ['https://source.unsplash.com/random?tshirt,red'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Red'],
    brand: 'AYPA',
    stock: 75,
    featured: false
  },
  {
    name: 'Blue ID Lace',
    description: 'Durable blue ID lace with customizable clip.',
    price: 12.99,
    category: 'IDLaces',
    imageUrls: ['https://source.unsplash.com/random?lanyard,blue'],
    sizes: ['One Size'],
    colors: ['Blue'],
    brand: 'AYPA',
    stock: 200,
    featured: true
  },
  {
    name: 'Black ID Lace',
    description: 'Professional black ID lace suitable for office use.',
    price: 12.99,
    category: 'IDLaces',
    imageUrls: ['https://source.unsplash.com/random?lanyard,black'],
    sizes: ['One Size'],
    colors: ['Black'],
    brand: 'AYPA',
    stock: 180,
    featured: false
  },
  {
    name: 'Premium Hoodie',
    description: 'Warm, comfortable hoodie available in multiple colors.',
    price: 49.99,
    category: 'TShirt',
    imageUrls: ['https://source.unsplash.com/random?hoodie'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Navy'],
    brand: 'AYPA Premium',
    stock: 60,
    featured: true
  }
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

    // Insert products
    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created`);

    // Create a sample order
    const customer = createdUsers.find(user => user.role === 'customer');
    const productOne = createdProducts[0];
    const productTwo = createdProducts[2];

    const order = new Order({
      user: customer._id,
      items: [
        {
          product: productOne._id,
          quantity: 1,
          price: productOne.price,
          size: 'M',
          color: 'White'
        },
        {
          product: productTwo._id,
          quantity: 2,
          price: productTwo.price,
          size: 'One Size',
          color: 'Blue'
        }
      ],
      totalAmount: productOne.price + (productTwo.price * 2),
      shippingAddress: {
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.zipCode,
        country: customer.address.country
      },
      paymentMethod: 'credit_card',
      paymentStatus: 'completed',
      orderStatus: 'delivered'
    });

    await order.save();
    console.log('Sample order created');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 