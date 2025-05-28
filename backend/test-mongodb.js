const mongoose = require('mongoose');
require('dotenv').config();

// Ganti dengan connection string Anda
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://moviemate:dzZ3KTPHIn0TdJu2@movie-mate.fe5xhdd.mongodb.net/?retryWrites=true&w=majority&appName=movie-mate';

async function testMongoDB() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    console.log('📍 Connecting to:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', TestSchema);
    
    // Create test document
    const testDoc = new TestModel({ name: 'TMDB API Test' });
    await testDoc.save();
    console.log('✅ Test document created:', testDoc._id);
    
    // Read test document
    const foundDoc = await TestModel.findById(testDoc._id);
    console.log('✅ Test document found:', foundDoc.name);
    
    // Clean up test document
    await TestModel.findByIdAndDelete(testDoc._id);
    console.log('✅ Test document cleaned up');
    
    // Test collections info
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    console.log('\n🎉 All MongoDB tests passed!');
    
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

testMongoDB();