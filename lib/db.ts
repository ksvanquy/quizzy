import mongoose from 'mongoose';
// Import all models to ensure they're registered
import './models/User';
import './models/Category';
import './models/Quiz';
import './models/Question';
import './models/Option';
import './models/Ordering';
import './models/Matching';
import './models/FillBlank';
import './models/NumericInput';
import './models/Attempt';
import './models/Bookmark';
import './models/Watchlist';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quizzy_db', opts)
      .then((mongoose) => {
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

declare global {
  var mongoose: any;
}
