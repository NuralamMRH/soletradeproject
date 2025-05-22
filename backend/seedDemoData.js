const mongoose = require('mongoose');
const { seedDemoData } = require('./data/demoData');
require('dotenv').config();

// Connect to MongoDB
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connection is ready...');
    seedDemoData().then(() => {
      mongoose.disconnect();
    });
  })
  .catch((err) => {
    console.log(err);
  });