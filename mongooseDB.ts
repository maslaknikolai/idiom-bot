import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

mongoose.connection.on('connected', () => {
  console.log('Mongoose connection open to ' + mongoURI);
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection disconnected');
});

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  return mongoose.connect(mongoURI);
};

export default mongoose;
