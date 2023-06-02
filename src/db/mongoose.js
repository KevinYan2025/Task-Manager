const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB')
    // Further code for your application
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error)
  });
